import { neon } from '@neondatabase/serverless';
const sql = neon("postgresql://neondb_owner:npg_XnFkG2Tm8CNS@ep-steep-moon-aip2qx06-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require");
async function run() {
  const projects = await sql`SELECT id FROM projects WHERE slug = 'cadore'`;
  if(!projects.length) return console.log('cadore not found in db');
  const assets = await sql`SELECT r2_url, category FROM assets WHERE project_id = ${projects[0].id} AND category ILIKE '%Capa Interactiva%'`;
  for (const a of assets) {
    console.log('Testing URL: ' + a.r2_url);
    const res = await fetch(a.r2_url);
    if(res.status === 200) {
       console.log("=== CADORE SVG FOUND ===");
       const text = await res.text();
       console.log(text.substring(0, 1000));
       console.log("========================");
       break;
    }
  }
}
run().catch(console.error);
