// Crea los 5 perfiles de prueba del Sprint 2C directamente en BD (sin pasar
// por /registro), con avatar aprobado y entre 5 y 8 gustos aleatorios cada
// uno. Pensado para ejecutarse una vez, manualmente:
//   node scripts/seed-test-profiles.js
const path = require("node:path");
const fs = require("node:fs/promises");
const bcrypt = require("bcryptjs");
const { Pool } = require("pg");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const PERFILES = [
  {
    nick: "LauraGC",
    profile_type: "chica",
    island: "gran_canaria",
    orientacion: ["Bisexual"],
    genero: ["Mujer"],
    rol: ["Sumisión"],
    looking_for: ["parejas", "chicas"],
    her_birthdate: "1990-05-15",
    his_birthdate: null,
    email: "laura@test.com",
  },
  {
    nick: "ParejasTfe",
    profile_type: "pareja",
    island: "tenerife",
    orientacion: ["Heterosexual"],
    genero: ["Pareja heterosexual"],
    rol: ["Switch"],
    looking_for: ["parejas", "chicas"],
    her_birthdate: "1988-03-20",
    his_birthdate: "1985-07-10",
    email: "parejas@test.com",
  },
  {
    nick: "CarlosLZ",
    profile_type: "chico",
    island: "lanzarote",
    orientacion: ["Heteroflexible"],
    genero: ["Hombre"],
    rol: ["Dominación"],
    looking_for: ["parejas", "chicas", "chicos"],
    her_birthdate: "1992-11-08",
    his_birthdate: null,
    email: "carlos@test.com",
  },
  {
    nick: "SofiaFTV",
    profile_type: "chica",
    island: "fuerteventura",
    orientacion: ["Bisexual"],
    genero: ["Mujer"],
    rol: ["Switch"],
    looking_for: ["parejas", "chicos"],
    her_birthdate: "1995-02-28",
    his_birthdate: null,
    email: "sofia@test.com",
  },
  {
    nick: "ParejasGC2",
    profile_type: "pareja",
    island: "gran_canaria",
    orientacion: ["Bisexual"],
    genero: ["Pareja bisexual"],
    rol: ["Exhibicionista"],
    looking_for: ["parejas", "chicas", "chicos"],
    her_birthdate: "1987-09-12",
    his_birthdate: "1984-04-25",
    email: "parejas2@test.com",
  },
];

const AVATAR_POR_TIPO = {
  chica: "avatar-chica.png",
  chico: "avatar-chico.png",
  pareja: "avatar-pareja.png",
};

function elegirAlAzar(lista, cantidad) {
  const copia = [...lista];
  const elegidos = [];
  for (let i = 0; i < cantidad && copia.length > 0; i++) {
    const idx = Math.floor(Math.random() * copia.length);
    elegidos.push(copia.splice(idx, 1)[0]);
  }
  return elegidos;
}

async function main() {
  const passwordHash = await bcrypt.hash("Test1234!", 12);

  const { rows: fetiches } = await pool.query("SELECT id FROM fetiches");
  const feticheIds = fetiches.map((f) => f.id);

  for (const p of PERFILES) {
    const { rows } = await pool.query(
      `INSERT INTO users
         (email, password_hash, nick, profile_type, island, her_birthdate, his_birthdate,
          looking_for, genero, orientacion, rol, email_verified_at, gdpr_consent_at, deleted_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11, now(), now(), NULL)
       RETURNING id`,
      [
        p.email,
        passwordHash,
        p.nick,
        p.profile_type,
        p.island,
        p.her_birthdate,
        p.his_birthdate,
        p.looking_for,
        p.genero,
        p.orientacion,
        p.rol,
      ]
    );
    const userId = rows[0].id;

    const filename = AVATAR_POR_TIPO[p.profile_type];
    const origen = path.join(process.cwd(), "public", "images", filename);
    const destinoDir = path.join(process.cwd(), "public", "uploads", String(userId));
    await fs.mkdir(destinoDir, { recursive: true });
    await fs.copyFile(origen, path.join(destinoDir, filename));

    await pool.query(
      `INSERT INTO photos (user_id, filename, is_avatar, is_private, status)
       VALUES ($1, $2, true, false, 'approved')`,
      [userId, filename]
    );

    const cantidad = 5 + Math.floor(Math.random() * 4); // 5..8
    const elegidos = elegirAlAzar(feticheIds, cantidad);
    for (const feticheId of elegidos) {
      await pool.query(
        `INSERT INTO user_fetiches (user_id, fetiche_id) VALUES ($1, $2)`,
        [userId, feticheId]
      );
    }

    console.log(`Creado: ${p.nick} (id=${userId}), avatar=${filename}, gustos=${elegidos.length}`);
  }

  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
