BEGIN;

CREATE TABLE IF NOT EXISTS groq_usage (
  id serial PRIMARY KEY,
  user_id integer REFERENCES users(id),
  endpoint text NOT NULL,
  tokens_used integer,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_groq_usage_created_at ON groq_usage(created_at);

COMMIT;
