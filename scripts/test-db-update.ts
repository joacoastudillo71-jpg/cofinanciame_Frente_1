
import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

async function testUpdate() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL no encontrada en .env');
    return;
  }

  const sql = neon(databaseUrl);
  
  console.log('--- Probando Actualización Directa de label y type ---');
  try {
    // Intentamos actualizar la unidad con ID 85 (que vimos en los logs del usuario)
    const result = await sql(\`
      UPDATE units 
      SET label = 'Lobby Test', type = 'common' 
      WHERE id = 85 
      RETURNING id, label, type;
    \`);
    
    console.log('✅ Resultado de la actualización:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('❌ Error en SQL:', error);
  }
}

testUpdate();
