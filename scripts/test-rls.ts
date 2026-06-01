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

  const email = 'test@gmail.com';
  console.log('Generating link for:', email);

  const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
    type: 'magiclink',
    email,
  });

  if (linkErr || !linkData) {
    console.error('Link generation failed:', linkErr);
    return;
  }

  const hash = new URL(linkData.properties.action_link).hash.substring(1);
  const params = new URLSearchParams(hash);
  const accessToken = params.get('access_token')!;
  const refreshToken = params.get('refresh_token')!;

  console.log('Simulating client session token...');
  const { data: sessionData, error: sessionErr } = await client.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  if (sessionErr) {
    console.error('Set session failed:', sessionErr);
    return;
  }

  const user = sessionData.user!;
  console.log('Authenticated successfully. User ID:', user.id);

  console.log('\n--- Querying via Anon Client (with Session/RLS) ---');
  const { data: business, error: bizErr } = await client
    .from('businesses')
    .select('id, slug, business_name')
    .eq('owner_id', user.id)
    .maybeSingle();

  console.log('Business:', business);
  console.log('Error:', bizErr);
}

run();
