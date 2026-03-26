import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './shared/schema';
import { eq } from 'drizzle-orm';
import * as dotenv from 'dotenv';
dotenv.config();

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

async function main() {
  try {
    const projectList = await db.query.projects.findMany({ where: eq(schema.projects.slug, 'cadore') });
    if (!projectList.length) return console.log('Project cadore not found');
    const project = projectList[0];
    
    const assetList = await db.query.assets.findMany({ where: eq(schema.assets.projectId, project.id) });
    const svg = assetList.find(a => a.category.includes('Capa Interactiva'));
    if (svg) {
        console.log('FOUND_URL=' + svg.r2Url);
        const res = await fetch(svg.r2Url);
        const text = await res.text();
        require('fs').writeFileSync('C:\\Users\\joaco\\OneDrive\\Desktop\\Cofinanciame-v2.0\\cadore-raw.svg', text);
        console.log('Saved to cadore-raw.svg');
    } else {
        console.log('SVG not found for cadore');
    }
  } catch (e) { console.error(e); }
  process.exit(0);
}
main();
