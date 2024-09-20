import { sql } from 'drizzle-orm';
import { users } from '@/lib/drizzle/schema';

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from 'pg';

import { config } from 'dotenv';
config({ path: '../../../.env.local' })

const connectionString = process.env.DB_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const pool = new Pool({ connectionString });
const db = drizzle(pool);

const main = async () => {
  try {
    console.log("Seeding started");
    await pool.connect();

    await Promise.all([
      db.execute(sql`DELETE FROM blogs`),
      db.execute(sql`DELETE FROM tags`),
      db.execute(sql`DELETE FROM users`)
    ])

    await Promise.all([
      db.insert(users).values({
        username: "silentFellow",
        password: "silentFellow",
        role: "admin"
      }),

      db.insert(users).values({
        username: "gca_admin",
        password: "pwd",
        role: "admin"
      })
    ])

    console.log("Seeding Completed");
  } catch(error: any) {
    console.log(`Error seeding data: ${error.message}`)
  } finally {
    process.exit(0);
  }
}

main();
