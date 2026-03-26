import 'dotenv/config';
import { db } from '../server/routes';
import { projects, units, assets } from '../shared/schema';
import { eq } from 'drizzle-orm';

import { avianoConfig } from '../client/src/data/projects/aviano';
import { sienaConfig } from '../client/src/data/projects/siena';
import { lArcaConfig } from '../client/src/data/projects/larca';

// Helper to parse area string like "192,54 m²" or "N/A" to integer
function parseArea(areaStr?: string): number | null {
    if (!areaStr || areaStr === "N/A" || areaStr.includes("Comunal")) return null;
    const match = areaStr.match(/(\d+)(?:[.,]\d+)?/);
    return match ? parseInt(match[1], 10) : null;
}

// Helper to map status
function mapStatus(status?: string): string {
    switch (status) {
        case 'available': return 'Disponible';
        case 'sold': return 'Vendido';
        case 'reserved': return 'Reservado';
        default: return 'Disponible';
    }
}

async function seed() {
    console.log('🚀 Iniciando script de migración masiva a Neon DB...');

    try {
        // 1. Limpieza Previa (Idempotencia)
        console.log('🧹 Vaciando tablas para evitar duplicados (Idempotencia)...');
        await db.delete(assets);
        await db.delete(units);
        await db.delete(projects);
        console.log('✅ Tablas limpias.');

        // Colección de proyectos estáticos a migrar
        const staticProjects = [avianoConfig, sienaConfig, lArcaConfig];

        for (const proj of staticProjects) {
            console.log(`\n📦 Migrando proyecto: ${proj.name}...`);

            // 2. Inyección de Proyecto
            const [newProject] = await db.insert(projects).values({
                tenantId: 'default-tenant', // Tenant por defecto para la migración
                slug: proj.id,
                name: proj.name,
                description: proj.description || '',
            }).returning();

            console.log(`✅ Proyecto '${newProject.name}' insertado con ID relacional: ${newProject.id}`);

            // 3. Inyección de Unidades (Mapeo con projectId)
            // Extraemos todas las unidades de todos los pisos
            const allUnits = proj.assets.floors?.flatMap((f: any) => f.units || []) || [];

            if (allUnits.length > 0) {
                const unitsToInsert = allUnits.map((u: any) => ({
                    projectId: newProject.id, // Respetando integridad relacional
                    identifier: u.id,
                    status: mapStatus(u.status),
                    area: parseArea(u.stats?.areaTotal),
                    bathrooms: u.stats?.bathrooms ? Math.floor(u.stats.bathrooms) : null,
                    price: u.stats?.price || null,
                }));

                await db.insert(units).values(unitsToInsert);
                console.log(`✅ ${unitsToInsert.length} unidades insertadas.`);
            } else {
                console.log('⚠️ No se encontraron unidades para migrar en este proyecto.');
            }

            // 4. Inyección de Assets (Mapeo con projectId)
            // Extraemos los renders
            let projectAssets: any[] = [];
            if (proj.assets?.renders?.categories) {
                proj.assets.renders.categories.forEach((cat: any) => {
                    if (cat.images) {
                        cat.images.forEach((img: any) => {
                            projectAssets.push({
                                category: cat.id || 'RenderCategory',
                                r2Url: img.url || img,
                                type: 'image/webp',
                            });
                        });
                    }
                });
            }

            // También agregamos imágenes de pisos
            if (proj.assets?.floors) {
                proj.assets.floors.forEach((f: any) => {
                    if (f.image) {
                        projectAssets.push({
                            category: 'floor-plan',
                            r2Url: f.image,
                            type: 'image/webp',
                        });
                    }
                });
            }

            if (projectAssets.length > 0) {
                const assetsToInsert = projectAssets.map((a: any) => ({
                    projectId: newProject.id, // Respetando integridad relacional
                    category: a.category,
                    r2Url: a.r2Url,
                    type: a.type,
                }));

                await db.insert(assets).values(assetsToInsert);
                console.log(`✅ ${assetsToInsert.length} assets (R2 URLs) insertados.`);
            } else {
                console.log('⚠️ No se encontraron assets para migrar en este proyecto.');
            }
        }

        console.log('\n🎉 ¡Migración de datos completada exitosamente!');
        process.exit(0);

    } catch (error) {
        console.error('\n❌ Error catastrófico durante la migración:', error);
        process.exit(1);
    }
}

seed();
