import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "https://djikypgmchywybjxbwar.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqaWt5cGdtY2h5d3lianhid2FyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyMTMyOTIsImV4cCI6MjA2ODc4OTI5Mn0.dXqWkg47xTg2YtfLhBLrFd5AIB838KdsmR9qsMPkk8Q";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/* ======================================================
   UTILS
====================================================== */

async function isLogged() {
  const { data } = await supabase.auth.getSession();
  return !!data.session;
}

async function trackInteraction(poemId, interaction) {
  const logged = await isLogged();
  if (!logged) return;

  try {
    await supabase.functions.invoke("track-interaction", {
      body: {
        poem_id: Number(poemId),
        interaction,
      },
    });
  } catch (err) {
    console.warn("[TRACK ERROR]", err);
  }
}

/* ======================================================
   VIEW → apertura poesia
====================================================== */

export function registerView(poemId) {
  trackInteraction(poemId, "view");
}

/* ======================================================
   READ → tempo di lettura reale
====================================================== */

const readTimers = new Map();

export function startReading(poemId) {
  if (readTimers.has(poemId)) return;

  const timer = setTimeout(() => {
    trackInteraction(poemId, "read");
    readTimers.delete(poemId);
  }, 8000); // 8 secondi = lettura reale

  readTimers.set(poemId, timer);
}

export function stopReading(poemId) {
  if (readTimers.has(poemId)) {
    clearTimeout(readTimers.get(poemId));
    readTimers.delete(poemId);
  }
}

/* ======================================================
   VOTE → aggancio automatico
====================================================== */

export function registerVote(poemId) {
  trackInteraction(poemId, "vote");
}
