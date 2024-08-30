import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from 'pg'

let isConnectted = false;
const connectionString: string | undefined = process.env.DB_URL;

if (connectionString === undefined) { throw new Error("DATABASE_URL is not set"); }

const pool = new Pool({ connectionString: connectionString });
let db: NodePgDatabase;

const connectToDb = async (): Promise<NodePgDatabase> => {
  if(!isConnectted) {
    try {
      db = drizzle(pool);
      await pool.connect();
      isConnectted = true;
      console.log("Connected to database");
    } catch(error: any) {
      console.error(`Error connecting to database: ${error.message}`);
    }
  }

  return db
}

export default connectToDb;
