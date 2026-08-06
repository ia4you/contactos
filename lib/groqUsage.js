import { query } from "./db";

export async function registrarUsoGroq(userId, endpoint, tokensUsed) {
  await query(
    `INSERT INTO groq_usage (user_id, endpoint, tokens_used) VALUES ($1, $2, $3)`,
    [userId, endpoint, tokensUsed ?? null]
  ).catch(() => {});
}
