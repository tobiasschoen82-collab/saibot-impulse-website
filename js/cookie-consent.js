(function () {
  const STORAGE_KEY = "saibot-cookie-consent-v1";
  const CONSENT_VERSION = 1;
  const FONTS_HREF =
    "https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Syne:wght@500;600;700&display=swap";

  function readStored() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (data?.version !== CONSENT_VERSION) return null;
      return data;
    } catch {
      return null;
    }
  }

  function writeStored(consent) {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: CONSENT_VERSION,
        necessary: true,
        statistics: !!consent.statistics,
        external: !!consent.external,
        timestamp: new Date().toISOString(),
      })
    );
  }

  function publishConsent(consent) {
    window.SAIBOT_CONSENT = {
      necessary: true,
      statistics: !!consent.statistics,
      external: !!consent.external,
    };
    window.SAIBOT_HAS_CONSENT_CHOICE = true;
    window.dispatchEvent(
      new CustomEvent("saibot-consent-changed", { detail: window.SAIBOT_CONSENT })
    );
  }

  function loadGoogleFonts() {
    if (document.getElementById("saibot-google-fonts")) return;
    const pre1 = document.createElement("link");
    pre1.rel = "preconnect";
    pre1.href = "https://fonts.googleapis.com";
    const pre2 = document.createElement("link");
    pre2.rel = "preconnect";
    pre2.href = "https://fonts.gstatic.com";
    pre2.crossOrigin = "anonymous";
    const link = document.createElement("link");
    link.id = "saibot-google-fonts";
    link.rel = "stylesheet";
    link.href = FONTS_HREF;
    document.head.appendChild(pre1);
    document.head.appendChild(pre2);
    document.head.appendChild(link);
    document.documentElement.classList.add("fonts-external");
  }

  function applyConsent(consent, hideBanner) {
    writeStored(consent);
    publishConsent(consent);
    if (consent.external) loadGoogleFonts();
    if (hideBanner) hideBannerUi();
  }

  let bannerEl = null;

  function hideBannerUi() {
    if (!bannerEl) return;
    bannerEl.hidden = true;
    bannerEl.setAttribute("aria-hidden", "true");
    document.body.classList.remove("cookie-banner-open");
  }

  function showBannerUi() {
    if (!bannerEl) return;
    bannerEl.hidden = false;
    bannerEl.setAttribute("aria-hidden", "false");
    document.body.classList.add("cookie-banner-open");
    const focusTarget = bannerEl.querySelector("[data-cookie-reject]") || bannerEl.querySelector("button");
    focusTarget?.focus();
  }

  function bindBanner() {
    bannerEl = document.getElementById("cookie-banner");
    if (!bannerEl) return;

    bannerEl.querySelector("[data-cookie-accept-all]")?.addEventListener("click", () => {
      applyConsent({ statistics: true, external: true }, true);
    });

    bannerEl.querySelector("[data-cookie-reject]")?.addEventListener("click", () => {
      applyConsent({ statistics: false, external: false }, true);
    });

    document.querySelectorAll("[data-cookie-settings]").forEach((btn) => {
      btn.addEventListener("click", () => showBannerUi());
    });
  }

  const stored = readStored();
  if (stored) {
    publishConsent(stored);
    if (stored.external) loadGoogleFonts();
    window.SAIBOT_HAS_CONSENT_CHOICE = true;
  } else {
    window.SAIBOT_CONSENT = { necessary: true, statistics: false, external: false };
    window.SAIBOT_HAS_CONSENT_CHOICE = false;
  }

  function initUi() {
    bindBanner();
    if (!window.SAIBOT_HAS_CONSENT_CHOICE) showBannerUi();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initUi);
  } else {
    initUi();
  }
})();
