ALTER TABLE users ADD COLUMN IF NOT EXISTS badge_especial text;

UPDATE users SET badge_especial = 'CEO' WHERE id = 2;
