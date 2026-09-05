import { neon, neonConfig } from "@neondatabase/serverless";

neonConfig.fetchConnectionCache = true;

export const sql = neon(process.env.DATABASE_URL ?? "");

export async function initSchema() {
  // Users table
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      access_key TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  // Links table
  await sql`
    CREATE TABLE IF NOT EXISTS links (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id),
      target_handle TEXT NOT NULL,
      mask_label TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      expires_at TIMESTAMP NOT NULL,
      exploded BOOLEAN DEFAULT FALSE,
      clicks INTEGER DEFAULT 0,
      successful_follows INTEGER DEFAULT 0
    )
  `;

  // Click events
  await sql`
    CREATE TABLE IF NOT EXISTS click_events (
      id SERIAL PRIMARY KEY,
      link_id TEXT REFERENCES links(id),
      ip TEXT,
      user_agent TEXT,
      referer TEXT,
      followed BOOLEAN DEFAULT FALSE,
      timestamp TIMESTAMP DEFAULT NOW()
    )
  `;

  // Index for efficient expiry queries on non-exploded links
  await sql`
    CREATE INDEX IF NOT EXISTS idx_links_expires ON links(expires_at) WHERE exploded = FALSE
  `;
}
