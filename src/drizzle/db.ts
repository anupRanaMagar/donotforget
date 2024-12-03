import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

const DATABASE_URL = process.env.AUTH_DRIZZLE_URL ?? "";

const sql = neon(DATABASE_URL);

const db = drizzle(sql, { schema });

export default db;
