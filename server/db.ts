import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schemaDef from '../shared/schema';

// Instanciar Drizzle localmente
const sql = neon(process.env.DATABASE_URL as string);
export const db = drizzle(sql as never, { schema: schemaDef });
