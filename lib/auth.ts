import { cookies } from "next/headers";
import { nanoid } from "nanoid";
import { sql, initSchema } from "./neon";

export const ACCESS_KEY = process.env.ACCESS_KEY ?? "Akpoge";

type UserRow = {
  id: string;
  username: string;
  access_key: string;
  created_at: string;
};

export async function loginWithKey(key: string): Promise<UserRow | null> {
  if (key !== ACCESS_KEY) return null;

  await initSchema();

  const existing = await sql`SELECT * FROM users WHERE access_key = ${key}`;
  if (existing.length > 0) {
    const user: UserRow = existing[0];
    // Set cookie
    try {
      cookies().set({ name: "user_id", value: user.id, httpOnly: true, maxAge: 60 * 60 * 24 * 30, path: "/" });
    } catch (e) {
      // cookies() may not be writable in all contexts; consumers should set the cookie in the route handler if needed
    }
    return user;
  }

  const id = nanoid(12);
  const username = `agent_${nanoid(6)}`;
  const created = await sql`
    INSERT INTO users (id, username, access_key) VALUES (${id}, ${username}, ${key}) RETURNING *
  `;
  const user: UserRow = created[0];
  try {
    cookies().set({ name: "user_id", value: user.id, httpOnly: true, maxAge: 60 * 60 * 24 * 30, path: "/" });
  } catch (e) {
    // ignore
  }
  return user;
}

export async function getCurrentUser(): Promise<UserRow | null> {
  const cookie = cookies().get("user_id");
  const userId = cookie?.value;
  if (!userId) return null;
  const res = await sql`SELECT * FROM users WHERE id = ${userId}`;
  if (res.length === 0) return null;
  return res[0] as UserRow;
}

export async function requireUser(): Promise<UserRow> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}
