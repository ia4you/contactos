ALTER TABLE publicaciones ADD COLUMN IF NOT EXISTS visible_en_feed boolean NOT NULL DEFAULT true;
