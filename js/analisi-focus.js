/* =========================================================
   POESIA FOCUS + ANALISI IA (OPERATIVO) eliminare
========================================================= */

(async () => {

/* ---------- SUPABASE SAFE ---------- */
async function waitForSupabase(retries = 20) {
  return new Promise((resolve, reject) => {
    const check = () => {
      if (window.supabaseClient) resolve(window.supabaseClient);
      else if (retries <= 0) reject("SUPABASE_NOT_READY");
      else setTimeout(() => check(--retries), 100);
    };
    check();
  });
}

const supabase = await waitForSupabase();

/* ---------- DOM ---------- */
const titleEl = document.getElementById("poem-title");
const authorEl = document.getElementById("poem-author");
const contentEl = document.getElementById("poem-content");
const terminal = document.getElementById("gpt-terminal");
const runBtn = document.getElementById("run-analysis");
const statusEl = document.getElementById("terminal-status");

/* ---------- UTILS ---------- */
const sleep = ms => new Promise(r => setTimeout(r, ms));
const print = async (text, delay = 300) => {
  terminal.textContent += text;
  terminal.scrollTop = terminal.scrollHeight;
  await sleep(delay);
};

/* ---------- LOAD POEM ---------- */
async function loadPoem() {
  const params = new URLSearchParams(window.location.search);
  const poemId = params.get("id");
  if (!poemId) return;

  const { data, error } = await supabase
    .from("poesie")
    .select("title, author_name, content")
    .eq("id", poemId)
    .single();

  if (error) return console.error(error);

  titleEl.textContent = data.title;
  authorEl.textContent = `di ${data.author_name}`;
  contentEl.textContent = data.content;
}

/* ---------- ANALISI IA (FAKE, MA STRUTTURATA) ---------- */
async function runAnalysis() {
  terminal.textContent = "";
  statusEl.textContent = "🧠 In Analisi";

  await print("$ tip analyze poem --profile\n");
  await print("[ OK ] Profilo utente caricato\n");
  await print("[ OK ] Storico affinità analizzato\n");
  await print("[ OK ] Parsing semantico poesia\n\n");

  await print("→ Temi dominanti rilevati:\n");
  await print("  • Identità (alto)\n");
  await print("  • Memoria (alto)\n");
  await print("  • Dissoluzione (medio)\n\n");

  await print("→ Perché questa poesia è affine a te:\n");
  await print("  • Coincide con il tuo storico di lettura\n");
  await print("  • Rispecchia la tensione emotiva dei testi apprezzati\n\n");

  await print("→ Lettura guidata:\n");
  await print("  Questa poesia risuona con il tuo modo di leggere\n");
  await print("  perché costruisce senso attraverso sottrazione,\n");
  await print("  lasciando spazio all'identificazione personale.\n\n");

  await print("[ COMPLETATO ]\n");
  statusEl.textContent = "✅ Analisi completata";
}

/* ---------- INIT ---------- */
runBtn.addEventListener("click", runAnalysis);
document.addEventListener("DOMContentLoaded", loadPoem);

})();