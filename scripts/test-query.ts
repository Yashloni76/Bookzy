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

import { createClient } from '@supabase/supabase-js';

async function run() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  const client = createClient(supabaseUrl, supabaseAnonKey);
  const admin = createClient(supabaseUrl, serviceRoleKey);

  // We will sign in as the user ee852a16-0a56-4d33-8cd4-213db9bb72da (yashloni37@gmail.com)
  const userId = 'ee852a16-0a56-4d33-8cd4-213db9bb72da';
  console.log('Querying for user:', userId);

  // 1. Check with admin client
  console.log('\n--- Admin Client Select ---');
  const { data: adminData, error: adminErr } = await admin
    .from('businesses')
    .select('id, slug, business_name, owner_id')
    .eq('owner_id', userId)
    .maybeSingle();

  console.log('Admin Data:', adminData);
  console.log('Admin Error:', adminErr);

  // 2. We can simulate the user session on the client by setting the auth header or using signIn
  // Since we have the service role client, we can generate a session token or do it directly.
  // Actually, let's see what happens if we simulate RLS by setting a JWT in the client!
  console.log('\n--- User Client Select (Unauthenticated) ---');
  const { data: anonData, error: anonErr } = await client
    .from('businesses')
    .select('id, slug, business_name, owner_id')
    .eq('owner_id', userId)
    .maybeSingle();

  console.log('Anon Data:', anonData);
  console.log('Anon Error:', anonErr);

  // Let's create a custom client and set the access token for this user
  // To get an access token for this user, we can call adminClient.auth.admin.getUserById
  console.log('\n--- Simulating Authenticated RLS ---');
  const { data: { user }, error: userErr } = await admin.auth.admin.getUserById(userId);
  if (userErr || !user) {
    console.error('Failed to get user:', userErr);
    return;
  }

  // Generate a custom JWT or use a dummy session.
  // Since we can't easily sign a JWT without the secret, let's look at the database policies!
  // Wait, in Supabase local, can we check RLS? Yes!
}

run();
