import { drizzle } from "drizzle-orm/neon-http"
import { neon } from "@neondatabase/serverless"

const pg = neon(process.env.DATABASE_URL!)
export const db = drizzle(pg)
