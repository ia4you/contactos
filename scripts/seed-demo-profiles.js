// Crea los 6 perfiles de demostración del Sprint DEMO directamente en BD
// (sin pasar por /registro), con is_demo=true y su foto de avatar ya
// preparada en public/images/demos/. A diferencia de los perfiles de
// prueba (scripts/seed-test-profiles.js), estas fotos NO se copian a
// public/uploads/{userId}/: se guardan en `photos.filename` como ruta
// absoluta (/images/demos/demo-x.png) porque se sirven directamente como
// estáticas, no a través del route handler de /uploads/.
//   node scripts/seed-demo-profiles.js
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const PERFILES = [
  {
    nick: "Luna_GC",
    profile_type: "chica",
    island: "gran_canaria",
    orientacion: ["Bisexual"],
    genero: ["Mujer"],
    rol: ["Switch"],
    looking_for: ["parejas", "chicas", "chicos"],
    her_birthdate: "1994-04-12",
    his_birthdate: null,
    bio: "Canaria de toda la vida, amante de la naturaleza y las conexiones sinceras. Busco personas con las que compartir experiencias sin prejuicios en un ambiente de total discreción.",
    her_bio: null,
    his_bio: null,
    email: "demo.luna@turel.es",
    foto: "/images/demos/demo-luna.png",
  },
  {
    nick: "Marco_TF",
    profile_type: "chico",
    island: "tenerife",
    orientacion: ["Heteroflexible"],
    genero: ["Hombre"],
    rol: ["Dominación"],
    looking_for: ["parejas", "chicas"],
    her_birthdate: null,
    his_birthdate: "1990-09-03",
    bio: "Tinerfeño, deportista, discreto. Me gusta conocer gente nueva con mentalidad abierta. La comunicación y el respeto son lo primero para mí.",
    her_bio: null,
    his_bio: null,
    email: "demo.marco@turel.es",
    foto: "/images/demos/demo-marco.png",
  },
  {
    nick: "LosLuna",
    profile_type: "pareja",
    island: "gran_canaria",
    orientacion: ["Heterosexual"],
    genero: ["Pareja heterosexual"],
    rol: ["Switch"],
    looking_for: ["parejas", "chicas", "chicos"],
    her_birthdate: "1993-06-22",
    his_birthdate: "1991-01-17",
    bio: null,
    her_bio: "Ella: extrovertida, curiosa y con muchas ganas de conocer gente afín.",
    his_bio: "Él: tranquilo, respetuoso y con las ideas muy claras.",
    email: "demo.losluna@turel.es",
    foto: "/images/demos/demo-losluna.png",
  },
  {
    nick: "Nayra_LZ",
    profile_type: "chica",
    island: "lanzarote",
    orientacion: ["Bisexual"],
    genero: ["Mujer"],
    rol: ["Sumisión"],
    looking_for: ["parejas", "chicas", "chicos"],
    her_birthdate: "1997-11-30",
    his_birthdate: null,
    bio: "Lanzaroteña, artista, muy curiosa. Me gusta explorar sin etiquetas y conocer personas interesantes.",
    her_bio: null,
    his_bio: null,
    email: "demo.nayra@turel.es",
    foto: "/images/demos/demo-nayra.png",
  },
  {
    nick: "IslasParejas",
    profile_type: "pareja",
    island: "tenerife",
    orientacion: ["Bisexual"],
    genero: ["Pareja bisexual"],
    rol: ["Switch"],
    looking_for: ["parejas", "chicas", "chicos"],
    her_birthdate: "1990-02-14",
    his_birthdate: "1989-08-05",
    bio: null,
    her_bio: "Ella: bisexual, muy activa en el ambiente desde hace años.",
    his_bio: "Él: abierto de mente, respetuoso y con mucha experiencia.",
    email: "demo.islasparejas@turel.es",
    foto: "/images/demos/demo-islasparejas.png",
  },
  {
    nick: "Carlos_FTV",
    profile_type: "chico",
    island: "fuerteventura",
    orientacion: ["Heterosexual"],
    genero: ["Hombre"],
    rol: ["Dominación"],
    looking_for: ["parejas", "chicas"],
    her_birthdate: null,
    his_birthdate: "1988-12-19",
    bio: "Majorero tranquilo y directo. Me gusta el ambiente liberal sin complicaciones. La discreción ante todo.",
    her_bio: null,
    his_bio: null,
    email: "demo.carlos@turel.es",
    foto: "/images/demos/demo-carlos.png",
  },
];

async function main() {
  // Contraseña inutilizable a propósito: los perfiles demo no necesitan
  // iniciar sesión, solo existir como perfiles visibles y responder por IA.
  const passwordHash = await bcrypt.hash(require("crypto").randomBytes(32).toString("hex"), 12);

  for (const p of PERFILES) {
    const { rows } = await pool.query(
      `INSERT INTO users
         (email, password_hash, nick, profile_type, island, her_birthdate, his_birthdate,
          looking_for, genero, orientacion, rol, bio, her_bio, his_bio,
          email_verified_at, gdpr_consent_at, is_demo)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14, now(), now(), true)
       ON CONFLICT (email) DO NOTHING
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
        p.bio,
        p.her_bio,
        p.his_bio,
      ]
    );

    if (!rows[0]) {
      console.log(`Omitido (ya existe): ${p.nick}`);
      continue;
    }
    const userId = rows[0].id;

    await pool.query(
      `INSERT INTO photos (user_id, filename, is_avatar, is_private, status)
       VALUES ($1, $2, true, false, 'approved')`,
      [userId, p.foto]
    );

    console.log(`Creado: ${p.nick} (id=${userId}), foto=${p.foto}`);
  }

  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
