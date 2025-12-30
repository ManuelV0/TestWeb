import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://djikypgmchywybjxbwar.supabase.co';
const SUPABASE_ANON_KEY = 'TUO_ANON_KEY';

const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 🔥 UNA SOLA ISTANZA, GLOBALE
window.supabaseClient = supabaseClient;

console.log('[SUPABASE INIT] OK');
