
import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

async function sync() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL no encontrada en .env');
    return;
  }

  const sql = neon(databaseUrl);
  
  console.log('--- Iniciando Sincronización Directa de Tipos (Neon) ---');
  try {
    // Usamos sql.raw o similar si es necesario, pero neondatabase suele aceptar strings directos
    await sql('ALTER TABLE units ALTER COLUMN area TYPE REAL;');
    console.log('✅ area -> REAL');
    
    await sql('ALTER TABLE units ALTER COLUMN bathrooms TYPE REAL;');
    console.log('✅ bathrooms -> REAL');
    
    await sql('ALTER TABLE units ALTER COLUMN price TYPE REAL;');
    console.log('✅ price -> REAL');
    
    // También por seguridad cambiamos las nuevas columnas de la Fase 4
    await sql('ALTER TABLE units ALTER COLUMN habitable_area TYPE REAL;');
    await sql('ALTER TABLE units ALTER COLUMN terrace_area TYPE REAL;');
    await sql('ALTER TABLE units ALTER COLUMN parking_area TYPE REAL;');
    console.log('✅ Columnas adicionales -> REAL');

    console.log('🚀 Sincronización exitosa.');
  } catch (error) {
    console.error('❌ Error en SQL:', error);
  }
}

sync();
