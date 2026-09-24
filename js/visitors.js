(function () {
  const cfg = window.SAIBOT_SITE?.visitorCounter;
  const displayEl = document.getElementById("visitor-count");
  if (!cfg?.enabled || !displayEl) return;

  function formatCount(n) {
    return new Intl.NumberFormat("de-DE").format(n);
  }

  function setDisplay(value, title) {
    displayEl.textContent = value;
    if (title) displayEl.setAttribute("title", title);
  }

  async function fetchCountOnly(url) {
    const res = await fetch(url, { method: "GET", cache: "no-store" });
    if (!res.ok) throw new Error("count fetch failed");
    const data = await res.json();
    return typeof data.value === "number" ? data.value : null;
  }

  async function runCountApi() {
    const base = `https://api.countapi.xyz`;
    const ns = encodeURIComponent(cfg.namespace);
    const key = encodeURIComponent(cfg.key);
    const sessionKey = `saibot-visit-hit-${cfg.namespace}-${cfg.key}`;

    if (!sessionStorage.getItem(sessionKey)) {
      await fetch(`${base}/hit/${ns}/${key}`, { method: "GET", cache: "no-store" });
      sessionStorage.setItem(sessionKey, "1");
    }

    const value = await fetchCountOnly(`${base}/get/${ns}/${key}`);
    if (value !== null) {
      setDisplay(formatCount(value), "Geschätzte Seitenaufrufe (CountAPI, eine Zählung pro Browser-Sitzung)");
    }
  }

  async function runCustomEndpoint() {
    const res = await fetch(cfg.endpoint, { cache: "no-store" });
    if (!res.ok) throw new Error("custom endpoint failed");
    const data = await res.json();
    const total = data.total ?? data.count ?? data.visits;
    if (typeof total === "number") {
      setDisplay(formatCount(total), "Besucher gemäß Ihrem Backend");
    }
  }

  async function init() {
    setDisplay("…", "Zähler wird geladen");
    try {
      if (cfg.endpoint) {
        await runCustomEndpoint();
        return;
      }
      if (cfg.provider === "countapi") {
        await runCountApi();
        return;
      }
      setDisplay("—", "Zähler nicht konfiguriert");
    } catch {
      setDisplay("—", "Zähler vorübergehend nicht erreichbar");
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
