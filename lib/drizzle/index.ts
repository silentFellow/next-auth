import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from 'pg';
import * as schema from "./schema";

const connectionString = process.env.DB_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const pool = new Pool({ connectionString });
const db = drizzle(pool, { schema });

let isConnected = false;

const connectToDb = async () => {
  if (!isConnected) {
    try {
      await pool.connect();
      isConnected = true;
      console.log("Connected to database");
    } catch (error: any) {
      console.error(`Error connecting to database: ${error.message}`);
    }
  }

  return db;
};

export default connectToDb;
