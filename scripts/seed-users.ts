import "dotenv/config";
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { users } from '../shared/schema.js';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';

const sql = neon(process.env.DATABASE_URL as string);
const db = drizzle(sql);

async function seed() {
  const superAdminEmail = 'joacoastudillo71@gmail.com';
  const superAdminPassword = 'Cofinancia2026!';
  
  console.log(`[SEED] Buscando usuario Super Admin existente (${superAdminEmail})...`);
  const existingUser = await db.select().from(users).where(eq(users.email, superAdminEmail)).limit(1);
  
  if (existingUser.length > 0) {
    console.log('[SEED] El usuario Super Admin ya existe. Forzando actualización de la contraseña...');
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(superAdminPassword, saltRounds);

    await db.update(users)
      .set({ passwordHash, role: 'SUPER_ADMIN' })
      .where(eq(users.email, superAdminEmail));

    console.log('[SEED] Contraseña y rol de Super Admin actualizados exitosamente.');
  } else {
    console.log('[SEED] Creando nuevo usuario Super Admin...');
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(superAdminPassword, saltRounds);
    
    await db.insert(users).values({
      email: superAdminEmail,
      passwordHash: passwordHash,
      role: 'SUPER_ADMIN',
    });
    console.log('[SEED] Usuario Super Admin creado exitosamente.');
  }
}

seed().catch(err => {
  console.error('[SEED] Error crítico durante la inicialización:', err);
  process.exit(1);
}).finally(() => {
  console.log('[SEED] Proceso de inicialización finalizado.');
  process.exit(0);
});
