/* =========================================================
   ANALISI FOCUS – TERMINALE IA (STABILE)
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

  if (!runBtn || !terminal) return;

  /* ---------- UTILS ---------- */
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const print = async (text, delay = 250) => {
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

  /* ---------- ANALISI IA (SIMULATA, MA PRONTA PER GPT) ---------- */
  async function runAnalysis() {
    terminal.textContent = "";
    statusEl.textContent = "🧠 In analisi";

    await print("$ tip analyze poem --profile\n");
    await print("[ OK ] Profilo utente caricato\n");
    await print("[ OK ] Storico interazioni analizzato\n");
    await print("[ OK ] Parsing semantico poesia\n\n");

    await print("→ Temi dominanti:\n");
    await print("  • Identità (alto)\n");
    await print("  • Memoria (alto)\n");
    await print("  • Dissoluzione (medio)\n\n");

    await print("→ Affinità con il tuo profilo:\n");
    await print("  • Pattern emotivi ricorrenti\n");
    await print("  • Linguaggio affine ai testi apprezzati\n\n");

    await print("→ Lettura guidata:\n");
    await print("  Questa poesia funziona per sottrazione,\n");
    await print("  lasciando spazio alla tua interpretazione.\n\n");

    await print("[ COMPLETATO ]\n");
    statusEl.textContent = "✅ Analisi completata";
  }

  runBtn.addEventListener("click", runAnalysis);
  document.addEventListener("DOMContentLoaded", loadPoem);

})();