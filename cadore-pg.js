const { Client } = require('pg');
const fs = require('fs');

async function main() {
  const client = new Client({
    connectionString: "postgresql://neondb_owner:npg_XnFkG2Tm8CNS@ep-steep-moon-aip2qx06-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require"
  });
  await client.connect();
  
  const { rows: projects } = await client.query("SELECT id FROM projects WHERE slug = 'cadore'");
  if (!projects.length) { console.log('no cadore project'); return; }
  
  const projectId = projects[0].id;
  const { rows: assets } = await client.query("SELECT * FROM assets WHERE project_id = $1", [projectId]);
  
  const svg = assets.find(a => a.category.includes('Capa Interactiva') || (a.r2_url && a.r2_url.endsWith('.svg')));
  if (svg && svg.r2_url) {
    console.log('CADORE_URL=' + svg.r2_url);
    const text = await fetch(svg.r2_url).then(r=>r.text());
    fs.writeFileSync('cadore-raw.svg', text);
    console.log('SAVED cadore-raw.svg');
  } else {
    console.log('not found');
  }
  await client.end();
}
main().catch(console.error);
