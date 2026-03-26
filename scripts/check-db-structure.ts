
import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import * as fs from 'fs';

async function checkStructure() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL no encontrada en .env');
    return;
  }

  const sql = neon(databaseUrl);
  
  try {
    const columns = await sql(`
      SELECT column_name, data_type, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'units';
    `);
    
    fs.writeFileSync('db-structure.json', JSON.stringify(columns, null, 2));
    console.log('✅ Estructura guardada en db-structure.json');
  } catch (error) {
    console.error('❌ Error en SQL:', error);
  }
}

checkStructure();
