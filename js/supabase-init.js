import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://djikypgmchywybjxbwar.supabase.co';
const SUPABASE_ANON_KEY = 'TUO_ANON_KEY';

export const supabaseClient = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

// 🔥 rende globale per TUTTO il sito
window.supabaseClient = supabaseClient;

console.log('[SUPABASE INIT] OK');
