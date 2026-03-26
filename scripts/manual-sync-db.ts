
import { db } from '../server/routes';
import { sql } from 'drizzle-orm';

async function sync() {
  console.log('--- Iniciando Sincronización Manual de Tipos ---');
  try {
    await db.execute(sql`ALTER TABLE units ALTER COLUMN area TYPE REAL;`);
    console.log('✅ Columna area cambiada a REAL');
    
    await db.execute(sql`ALTER TABLE units ALTER COLUMN bathrooms TYPE REAL;`);
    console.log('✅ Columna bathrooms cambiada a REAL');
    
    await db.execute(sql`ALTER TABLE units ALTER COLUMN price TYPE REAL;`);
    console.log('✅ Columna price cambiada a REAL');
  } catch (error) {
    console.error('❌ Error sincronizando:', error);
  }
  process.exit(0);
}

sync();
