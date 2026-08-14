BEGIN;

CREATE TABLE IF NOT EXISTS clubs (
  id serial PRIMARY KEY,
  nombre text NOT NULL,
  slug text NOT NULL UNIQUE,
  isla island_enum NOT NULL,
  descripcion text,
  direccion text,
  horario text,
  telefono text,
  email text,
  web text,
  foto1 text,
  foto2 text,
  foto3 text,
  activo boolean NOT NULL DEFAULT true,
  destacado boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS club_eventos (
  id serial PRIMARY KEY,
  club_id integer NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  titulo text NOT NULL,
  descripcion text,
  fecha_evento timestamptz NOT NULL,
  aforo integer,
  precio text,
  foto text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- No estaba en el encargo original, pero hace falta para el botón
-- "APUNTARME" de la Tarea 3 (evento_asistentes no sirve: su FK apunta
-- a eventos, no a club_eventos). Toggle simple, un único estado.
CREATE TABLE IF NOT EXISTS club_evento_asistentes (
  club_evento_id integer NOT NULL REFERENCES club_eventos(id) ON DELETE CASCADE,
  user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (club_evento_id, user_id)
);

-- Insertar 9 clubs
INSERT INTO clubs (nombre, slug, isla, descripcion, direccion, horario, telefono, email, web, foto1, foto2, foto3, destacado) VALUES

('Club Ébano', 'club-ebano', 'gran_canaria',
'El club liberal más exclusivo de Las Palmas. Ambiente elegante y discreto para parejas y personas del ambiente liberal. Conocido por su decoración de lujo y su clientela seleccionada.',
'C/ Mayor de Triana 45, Las Palmas de Gran Canaria',
'Viernes y sábados de 22:00 a 04:00',
'+34 928 000 001',
'info@clubebano.es',
'www.clubebano.es',
'/images/clubs/club1.jpeg',
'/images/clubs/club2.jpeg',
'/images/clubs/club3.jpeg',
true),

('La Cueva del León', 'la-cueva-del-leon', 'tenerife',
'Referente del ambiente liberal en Tenerife desde hace más de 10 años. Ambiente íntimo y acogedor con diferentes espacios temáticos.',
'Avda. de Anaga 12, Santa Cruz de Tenerife',
'Jueves a sábados de 22:00 a 04:00',
'+34 922 000 002',
'info@lacuevadelleon.es',
NULL, NULL, NULL, NULL, false),

('Oasis Liberal', 'oasis-liberal', 'lanzarote',
'El único club liberal de Lanzarote con piscina privada y jardín. Ambiente relajado y naturista los domingos.',
'Urb. Puerto del Carmen, Lanzarote',
'Viernes y sábados de 21:00 a 03:00',
'+34 928 000 003',
'info@oasisliberal.es',
NULL, NULL, NULL, NULL, false),

('Venus Club', 'venus-club', 'fuerteventura',
'Club liberal en el corazón de Corralejo. Ambiente joven y dinámico con fiestas temáticas cada fin de semana.',
'C/ Corralejo 8, Corralejo, Fuerteventura',
'Viernes y sábados de 22:00 a 05:00',
'+34 928 000 004',
'info@venusclub.es',
NULL, NULL, NULL, NULL, false),

('El Refugio', 'el-refugio', 'gran_canaria',
'Club liberal en el sur de Gran Canaria. Ambiente tranquilo y familiar para parejas con experiencia en el lifestyle.',
'Avda. de Mogán 23, Playa del Inglés',
'Sábados de 22:00 a 04:00',
'+34 928 000 005',
'info@elrefugio.es',
NULL, NULL, NULL, NULL, false),

('Enigma Club', 'enigma-club', 'tenerife',
'Club temático en el sur de Tenerife con noches especiales de BDSM y ambiente liberal. El más versátil de las islas.',
'C/ Las Américas 34, Adeje, Tenerife',
'Viernes y sábados de 22:00 a 05:00',
'+34 922 000 006',
'info@enigmaclub.es',
NULL, NULL, NULL, NULL, false),

('La Palma Liberal', 'la-palma-liberal', 'la_palma',
'El único espacio liberal de La Palma. Ambiente íntimo y muy selectivo. Solo para parejas verificadas.',
'C/ O''Daly 5, Santa Cruz de La Palma',
'Sábados de 21:00 a 03:00',
'+34 922 000 007',
'info@lapalmaliberal.es',
NULL, NULL, NULL, NULL, false),

('Club Medina', 'club-medina', 'gran_canaria',
'Club liberal con ambiente mediterráneo en Las Palmas. Terraza exterior y piscina privada en verano.',
'C/ León y Castillo 89, Las Palmas de Gran Canaria',
'Viernes y sábados de 22:00 a 04:00',
'+34 928 000 008',
'info@clubmedina.es',
NULL, NULL, NULL, NULL, false),

('Noche de Islas', 'noche-de-islas', 'tenerife',
'El club más grande de Canarias con capacidad para 200 personas. Fiestas mensuales multitudinarias y ambiente muy activo.',
'Polígono Industrial, La Laguna, Tenerife',
'Un sábado al mes de 22:00 a 06:00',
'+34 922 000 009',
'info@nochedeislas.es',
NULL, NULL, NULL, NULL, false)

ON CONFLICT (slug) DO NOTHING;

-- Eventos del Club Ébano (club destacado). Subquery por slug en vez de
-- id=1 hardcodeado: más seguro si la tabla ya existía de un intento
-- anterior y los ids no arrancan en 1.
INSERT INTO club_eventos (club_id, titulo, descripcion, fecha_evento, aforo, precio, foto) VALUES
((SELECT id FROM clubs WHERE slug = 'club-ebano'), 'Noche Elegante — Dress Code Negro',
'Una noche especial con dress code negro obligatorio. Ambiente exclusivo para parejas y personas del lifestyle. Champán de bienvenida incluido.',
now() + interval '7 days',
30, '20€ por persona / 30€ pareja',
'/images/clubs/club2.jpeg'),

((SELECT id FROM clubs WHERE slug = 'club-ebano'), 'Fiesta de Verano Liberal',
'La gran fiesta del verano en Club Ébano. Piscina privada disponible, música en directo y ambiente inmejorable. Aforo muy limitado.',
now() + interval '21 days',
50, '15€ por persona / 25€ pareja',
'/images/clubs/club3.jpeg');

COMMIT;
