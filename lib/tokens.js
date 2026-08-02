import { v4 as uuidv4 } from "uuid";
import { query } from "./db";

const VERIFY_EMAIL_TTL_MS = 24 * 60 * 60 * 1000;
const RESET_PASSWORD_TTL_MS = 60 * 60 * 1000;

export async function crearTokenVerificacionEmail(userId) {
  const token = uuidv4();
  const expiresAt = new Date(Date.now() + VERIFY_EMAIL_TTL_MS);
  await query(
    `INSERT INTO email_tokens (token, user_id, purpose, expires_at) VALUES ($1, $2, 'verify_email', $3)`,
    [token, userId, expiresAt]
  );
  return token;
}

export async function crearTokenResetPassword(userId) {
  const token = uuidv4();
  const expiresAt = new Date(Date.now() + RESET_PASSWORD_TTL_MS);
  await query(
    `INSERT INTO email_tokens (token, user_id, purpose, expires_at) VALUES ($1, $2, 'reset_password', $3)`,
    [token, userId, expiresAt]
  );
  return token;
}
