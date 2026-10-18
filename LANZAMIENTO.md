# Lanzamiento — despliegue en Dokploy

Rama `lanzamiento` = `fix/auditoria-seguridad` + `admin-eliminar-cuentas` + `rediseno-editorial`. Incluye `main` local, así que `main` avanza sin conflictos.

Datos de producción (comprobados en este servidor el 18/10/2026):

| Qué | Valor |
|---|---|
| BD | contenedor `contactos-db` (postgres 16), usuario y BD `contactos` |
| App | servicio swarm `contactos-contactos-7wllrc`, imagen `contactos-contactos-7wllrc:latest` |
| Fotos | volumen `contactos-uploads` → `/app/public/uploads` |
| Dokploy | construye la rama `main` de GitHub con el `Dockerfile` (Node 18.19.1) |

Todos los comandos se lanzan en el servidor, desde `/root/contactos` con la rama `lanzamiento` en el checkout (`git checkout lanzamiento`), porque usan `scripts/*.sql`.

## 0. Antes de empezar

- Hazlo en una hora de poco tráfico. El despliegue no cierra la sesión de nadie.
- La purga diaria **queda desactivada** con este código: solo corre con `PURGA_ACTIVA=1`. Sin la variable, o con cualquier otro valor, el log de arranque muestra `[purga] Desactivada (PURGA_ACTIVA no es 1).` No hace falta configurar nada para que esté apagada, pero conviene dejarlo explícito:
  - en Dokploy → app contactos → **Environment**, añade `PURGA_ACTIVA=0`.

## 1. Copia de seguridad de la BD (obligatoria)

```bash
mkdir -p ~/backups
STAMP=$(date +%F-%H%M)
docker exec contactos-db pg_dump -U contactos -d contactos -Fc > ~/backups/contactos-$STAMP.dump
ls -lh ~/backups/contactos-$STAMP.dump
# Comprueba que el volcado se puede leer (lista el índice, no restaura nada):
docker exec -i contactos-db pg_restore -l < ~/backups/contactos-$STAMP.dump | head
```

Si el archivo pesa 0 bytes o `pg_restore -l` da error, **para aquí**.

## 2. Copia de las fotos y de la imagen actual

```bash
docker run --rm -v contactos-uploads:/datos:ro -v ~/backups:/b alpine \
  tar czf /b/uploads-$STAMP.tgz -C /datos .
ls -lh ~/backups/uploads-$STAMP.tgz

# Guarda la imagen que está en marcha: Dokploy sobrescribe :latest al construir.
docker tag contactos-contactos-7wllrc:latest contactos-contactos-7wllrc:antes-lanzamiento
```

## 3. Comprobar los nombres de las FK (solo lectura)

```bash
docker exec contactos-db psql -U contactos -d contactos -c \
  "SELECT conname FROM pg_constraint WHERE conrelid IN ('reports'::regclass,'groq_usage'::regclass) AND contype='f'"
```

Deben salir `reports_reporter_id_fkey`, `reports_reported_id_fkey` y `groq_usage_user_id_fkey`. Si sale otro nombre, para: la migración dejaría la FK antigua en su sitio.

## 4. Migración de esquema

```bash
docker exec -i contactos-db psql -U contactos -d contactos -v ON_ERROR_STOP=1 < scripts/add-suspended-at.sql
```

Solo añade columnas, cambia FK y crea `admin_log`; no mueve datos. El código que está en producción sigue funcionando con este esquema.

## 5. ⛔ BLOQUEANTE — clasificación de las cuentas con `deleted_at`

**No sigas al paso 8 (`migrar-suspensiones.sql`) hasta haber hecho y revisado esto.**

Hasta ahora suspender y auto-eliminarse escribían lo mismo (`deleted_at`). `migrar-suspensiones.sql` las separa con una heurística: es **auto-eliminación** solo si `|last_active − deleted_at| ≤ 2 min` y no tiene denuncias; lo demás pasa a **suspensión**.

5.1. Ejecuta la consulta (solo lectura) y guarda la salida:

```bash
docker exec -i contactos-db psql -U contactos -d contactos -P pager=off > ~/backups/clasificacion-$STAMP.txt <<'SQL'
SELECT u.id, u.nick, u.email, u.deleted_at, u.last_active,
       round(extract(epoch FROM (u.last_active - u.deleted_at)))::int AS segundos,
       (SELECT count(*) FROM reports r WHERE r.reported_id = u.id) AS denuncias,
       CASE WHEN u.last_active IS NOT NULL
             AND abs(extract(epoch FROM (u.last_active - u.deleted_at))) <= 120
             AND NOT EXISTS (SELECT 1 FROM reports r WHERE r.reported_id = u.id)
            THEN 'auto-eliminación' ELSE 'suspensión' END AS clasificacion
  FROM users u
 WHERE u.deleted_at IS NOT NULL
 ORDER BY clasificacion, u.deleted_at;
SQL
cat ~/backups/clasificacion-$STAMP.txt
```

5.2. Revísala fila a fila:
- Cada `suspensión` debe ser una cuenta que suspendiste tú.
- Cada `auto-eliminación` debe ser alguien que borró su cuenta. **Estas son las que la purga borrará para siempre a los 30 días.**
- Ante la duda, trátala como suspensión: no se purga y la puedes eliminar a mano desde el panel.

5.3. Si alguna fila está mal, no uses el archivo del paso 8. Anota los `id` y aplica tu propio UPDATE en el paso 8.

## 6. Publicar el código

```bash
git checkout main
git merge --ff-only lanzamiento
git push origin main
```

## 7. Desplegar en Dokploy

- Dokploy → app contactos → **Deploy**.
- Sigue el log de construcción hasta que acabe sin errores.
- Comprueba el arranque:
  ```bash
  docker service logs --since 5m contactos-contactos-7wllrc 2>&1 | tail -30
  ```
  Debe aparecer `Ready` y `[purga] Desactivada (PURGA_ACTIVA no es 1).`
- Abre https://contactos.turel.es: landing con el estilo nuevo, inicia sesión, abre el feed y /admin.

## 8. Paso de datos: `migrar-suspensiones.sql`

Solo si la revisión del paso 5 es correcta:

```bash
docker exec -i contactos-db psql -U contactos -d contactos -v ON_ERROR_STOP=1 < scripts/migrar-suspensiones.sql
```

Si en el paso 5 encontraste filas mal clasificadas, en lugar del archivo aplica a mano solo los `id` que son suspensiones:

```bash
docker exec contactos-db psql -U contactos -d contactos -v ON_ERROR_STOP=1 -c "
  UPDATE users
     SET suspended_at = deleted_at,
         suspended_reason = 'Suspensión anterior a la separación suspensión/borrado',
         deleted_at = NULL,
         session_version = session_version + 1
   WHERE id IN (/* ids */) AND suspended_at IS NULL"
```

Con la purga apagada no hay prisa por hacer este paso justo después del despliegue. Mientras tanto, las suspensiones antiguas salen en el panel como «Pendientes de borrado» y siguen sin poder entrar.

## 9. Verificar

- /admin → Usuarios: «Suspendidas» y «Pendientes de borrado» coinciden con `clasificacion-$STAMP.txt`.
- Con una cuenta de prueba: suspender → su sesión abierta va a /login en menos de un minuto, y el login muestra el mensaje de cuenta suspendida. Luego Reactivar.
- Denuncias: el panel carga y «Ver perfil denunciado» funciona.
- Móvil: la landing, la puerta de edad y el feed se ven bien.

## 10. Activar la purga (solo cuando confirmes la clasificación)

1. Dokploy → Environment → `PURGA_ACTIVA=1` → **Deploy**.
2. El primer pase es **1 hora después de arrancar**, y luego uno cada 24 h. En el log saldrá `[purga] N cuenta(s) ...` solo si había auto-eliminaciones de más de 30 días.

Para apagarla otra vez: `PURGA_ACTIVA=0` y desplegar.

---

## Volver atrás

Elige según hasta dónde llegaste.

### A. Falla el build o la app no arranca (antes o después del paso 8)

Vuelve a poner la imagen anterior, sin esperar a Dokploy:

```bash
docker service update --image contactos-contactos-7wllrc:antes-lanzamiento contactos-contactos-7wllrc
```

Después deja `main` como estaba, para que el próximo Deploy no vuelva a meter el lanzamiento:

```bash
git checkout main
git reset --hard 004da5b    # el commit que hay hoy en origin/main; compruébalo con git log origin/main -1 ANTES del paso 6
git push --force-with-lease origin main
```

`--force-with-lease` reescribe `main` en GitHub. Si prefieres no reescribir, usa `git revert -m 1` sobre los commits de merge.

El esquema del paso 4 es compatible con el código anterior, así que no hace falta tocar la BD **si no ejecutaste el paso 8**.

### B. Ya ejecutaste el paso 8 y vuelves al código anterior

El código anterior solo entiende `deleted_at`. Si no se deshace el paso 8, las cuentas suspendidas **volverían a verse y a poder entrar**. Antes de cambiar la imagen (o justo después, cuanto antes):

```bash
docker exec contactos-db psql -U contactos -d contactos -v ON_ERROR_STOP=1 -c "
  UPDATE users SET deleted_at = suspended_at, suspended_at = NULL
   WHERE suspended_at IS NOT NULL AND deleted_at IS NULL"
```

Después, lo mismo que en A.

### C. Datos dañados: restaurar la copia completa

Se pierde todo lo escrito en la BD desde el paso 1 (mensajes, registros, likes…). Úsalo solo si A/B no bastan.

```bash
# 1) Para la app para que nadie escriba mientras restauras
docker service scale contactos-contactos-7wllrc=0
# 2) Restaura
docker exec -i contactos-db pg_restore -U contactos -d contactos --clean --if-exists --no-owner < ~/backups/contactos-$STAMP.dump
# 3) Imagen anterior y arranque
docker service update --image contactos-contactos-7wllrc:antes-lanzamiento contactos-contactos-7wllrc
docker service scale contactos-contactos-7wllrc=1
```

Fotos (si se borró algo del volumen, p. ej. por una eliminación definitiva errónea):

```bash
docker run --rm -v contactos-uploads:/datos -v ~/backups:/b alpine \
  tar xzf /b/uploads-$STAMP.tgz -C /datos
```

`$STAMP` solo existe en la terminal donde lo definiste. Si abriste otra, pon la fecha a mano (`ls ~/backups`).
