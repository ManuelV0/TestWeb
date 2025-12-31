import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://djikypgmchywybjxbwar.supabase.co';
const SUPABASE_ANON_KEY = 'LA_TUA_ANON_KEY';

export const supabaseClient = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

// 🔥 UNA SOLA ISTANZA
window.supabaseClient = supabaseClient;

console.log('[SUPABASE INIT] OK');