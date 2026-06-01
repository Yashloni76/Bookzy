import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.local
const envPath = path.join(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || '';
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      }
      process.env[key] = value.trim();
    }
  });
}

async function run() {
  const { createSupabaseAdminClient } = await import('../lib/supabase/admin');
  const admin = createSupabaseAdminClient();
  
  console.log('=== USERS ===');
  const { data: { users }, error: uErr } = await admin.auth.admin.listUsers();
  if (uErr) console.error(uErr);
  else console.log(users.map(u => ({ id: u.id, email: u.email })));

  console.log('\n=== BUSINESSES ===');
  const { data: bus, error: bErr } = await admin.from('businesses').select('*');
  if (bErr) console.error(bErr);
  else console.log(bus);

  console.log('\n=== SERVICES ===');
  const { data: ser, error: sErr } = await admin.from('services').select('*');
  if (sErr) console.error(sErr);
  else console.log(ser);

  console.log('\n=== WORKING HOURS ===');
  const { data: hrs, error: hErr } = await admin.from('business_hours').select('*');
  if (hErr) console.error(hErr);
  else console.log(hrs);
}

run();
