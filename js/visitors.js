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

  async function fetchJson(url) {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 9000);
    try {
      const res = await fetch(url, {
        method: "GET",
        cache: "no-store",
        signal: controller.signal,
        mode: "cors",
      });
      if (!res.ok) throw new Error("count fetch failed");
      return res.json();
    } finally {
      window.clearTimeout(timeoutId);
    }
  }

  function parseCountValue(data) {
    const raw = data?.value ?? data?.count;
    if (typeof raw === "number" && Number.isFinite(raw)) return raw;
    if (typeof raw === "string" && raw.trim() !== "") {
      const n = Number(raw);
      if (Number.isFinite(n)) return n;
    }
    return null;
  }

  async function runCountApiV2() {
    const base = "https://countapi.mileshilliard.com/api/v1";
    const key = encodeURIComponent(cfg.key);
    const sessionKey = `saibot-visit-hit-${cfg.key}`;

    if (!sessionStorage.getItem(sessionKey)) {
      await fetchJson(`${base}/hit/${key}`);
      sessionStorage.setItem(sessionKey, "1");
    }

    const data = await fetchJson(`${base}/get/${key}`);
    const value = parseCountValue(data);
    if (value !== null) {
      setDisplay(
        formatCount(value),
        "Geschätzte Seitenaufrufe (öffentlicher Zähler-Dienst — ein Plus pro Browser-Tab/Sitzung, auch für Sie beim ersten Besuch)"
      );
      return;
    }
    throw new Error("invalid count payload");
  }

  /** @deprecated countapi.xyz — oft offline */
  async function runCountApiLegacy() {
    const base = "https://api.countapi.xyz";
    const ns = encodeURIComponent(cfg.namespace);
    const key = encodeURIComponent(cfg.key);
    const sessionKey = `saibot-visit-hit-${cfg.namespace}-${cfg.key}`;

    if (!sessionStorage.getItem(sessionKey)) {
      await fetchJson(`${base}/hit/${ns}/${key}`);
      sessionStorage.setItem(sessionKey, "1");
    }

    const data = await fetchJson(`${base}/get/${ns}/${key}`);
    const value = parseCountValue(data);
    if (value !== null) {
      setDisplay(formatCount(value), "Geschätzte Seitenaufrufe (CountAPI legacy)");
      return;
    }
    throw new Error("invalid count payload");
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
      if (cfg.provider === "countapi-v2" && cfg.key) {
        await runCountApiV2();
        return;
      }
      if (cfg.provider === "countapi" && cfg.namespace && cfg.key) {
        await runCountApiLegacy();
        return;
      }
      setDisplay("—", "Zähler nicht konfiguriert");
    } catch {
      setDisplay(
        "—",
        "Zähler nicht erreichbar (CountAPI blockiert, offline oder Adblocker). Details in der Datenschutzerklärung."
      );
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
