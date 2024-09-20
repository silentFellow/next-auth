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
    console.log("Cleanup of db started...");
    await pool.connect();

    await Promise.all([
      db.execute(sql`DROP TABLE blogs`),
      db.execute(sql`DROP TABLE tags`),
      db.execute(sql`DROP TABLE users`)
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

    console.log("Successfully cleaned up");
  } catch(error: any) {
    console.log(`Error seeding data: ${error.message}`)
  } finally {
    process.exit(0);
  }
}

main();
