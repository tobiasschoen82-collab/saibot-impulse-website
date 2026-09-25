(function () {
  const intro = document.getElementById("intro");
  const video = document.getElementById("intro-video");
  const headerVideo = document.getElementById("header-logo-video");
  const skipBtn = document.getElementById("intro-skip");
  const introPlayBtn = document.getElementById("intro-play");
  const introSoundBtn = document.getElementById("intro-sound");
  let introTimeoutId = 0;
  const main = document.getElementById("main");
  const header = document.querySelector(".site-header");
  const navToggle = document.getElementById("nav-toggle");
  const siteNavMobile = document.getElementById("site-nav-mobile");
  const yearEl = document.getElementById("year");
  const placeholderLinks = document.querySelectorAll("[data-placeholder-link]");
  const hero = document.getElementById("hero");
  const heroParallax = document.getElementById("hero-parallax");
  const scrollProgressFill = document.getElementById("scroll-progress-fill");
  const scrollKeywordEl = document.getElementById("scroll-progress-keyword");
  const evolutionScroll = document.getElementById("evolution-scroll");
  const evolutionVideo = document.getElementById("evolution-video");
  const evolutionCaption = document.getElementById("evolution-caption");
  const evolutionEra = document.getElementById("evolution-era");
  let evolutionVideoDuration = 0;
  let evolutionScrubRaf = 0;
  let evolutionInView = false;
  let evolutionScrollStartY = 0;
  let evolutionScrollRange = 1;
  let evolutionLastSeekFrame = -1;
  const EVOLUTION_FPS = 24;
  /** Scroll am Ende: letztes Bild bleibt stehen, bevor die nächste Sektion kommt */
  const EVOLUTION_SCROLL_END_HOLD = 0.15;
  const heroStoryScroll = document.getElementById("hero-story-scroll");
  const heroStoryMega = document.getElementById("hero-story-mega");
  const heroStorySub = document.getElementById("hero-story-sub");
  const klarheitScroll = document.getElementById("klarheit-scroll");
  const klarheitEarth = document.getElementById("klarheit-earth");
  const klarheitEarthVideo = document.getElementById("klarheit-earth-video");
  const philosophyScroll = document.getElementById("philosophy-scroll");
  const philosophyVideoLayer = document.getElementById("philosophy-video-layer");
  const philosophyScrollVideo = document.getElementById("philosophy-scroll-video");
  const philosophyStage = document.getElementById("philosophy-stage");
  const contactForm = document.getElementById("contact-form");
  const contactModal = document.getElementById("contact-modal");
  let scrollRevealReady = false;
  let activeScrollKeyword = "";
  let activeSectionKeyword = "";
  const SCROLL_BRAND_THRESHOLD = 36;
  const SCROLL_KEYWORD_WELCOME = "Herzlich willkommen";

  const HERO_STORY_BEATS = [
    { until: 0.1, mega: "", sub: "" },
    { until: 0.22, mega: "KI · verständlich.", sub: "" },
    { until: 0.42, mega: "KI · verständlich.", sub: "für KMU" },
    { until: 0.5, mega: "Haltung", sub: "" },
    {
      until: 0.6,
      mega: "Haltung",
      sub: "KI begeistert mich — Nähe entsteht im Team, am Tisch, nicht am Autopiloten.",
    },
    { until: 0.68, mega: "Digitalisierung", sub: "" },
    {
      until: 0.76,
      mega: "Digitalisierung",
      sub: "Damit das persönliche Miteinander wieder in den Mittelpunkt rückt.",
    },
    { until: 0.84, mega: "Der Mensch entscheidet", sub: "" },
    {
      until: 0.92,
      mega: "Der Mensch entscheidet",
      sub: "Technik unterstützt — sie ersetzt kein Gespräch nebeneinander.",
    },
    { until: 0.96, mega: "Impulse", sub: "" },
    {
      until: 1.01,
      mega: "Impulse",
      sub: "Passgenaue Programme — und Zeit für echte Begegnungen.",
    },
  ];

  const EVOLUTION_ERAS = [
    {
      label: "Daumenkino",
      text: "Einzelbilder werden zur Bewegung — wie Ideen, die Schritt für Schritt reifen.",
    },
    {
      label: "Filmrolle",
      text: "Die Filmrolle speichert Geschichten — Technik wird greifbar und teilbar.",
    },
    {
      label: "Computer",
      text: "Computer strukturieren Wissen — Programme übernehmen wiederholbare Arbeit.",
    },
    {
      label: "Künstliche Intelligenz",
      text: "Künstliche Intelligenz wird Partner: passgenaue Software für Ihr Unternehmen.",
    },
  ];

  /** Scroll-Fortschritt 0–1 → sichtbare Epoche (längere Phasen für Daumenkino & Computer) */
  const EVOLUTION_TEXT_BANDS = [
    { start: 0, end: 0.3, eraIndex: 0 },
    { start: 0.3, end: 0.44, eraIndex: 1 },
    { start: 0.44, end: 0.84, eraIndex: 2 },
    { start: 0.84, end: 1.001, eraIndex: 3 },
  ];

  /** Handy: KI-Phase kürzer, danach schneller weiter scrollen */
  const EVOLUTION_TEXT_BANDS_MOBILE = [
    { start: 0, end: 0.3, eraIndex: 0 },
    { start: 0.3, end: 0.44, eraIndex: 1 },
    { start: 0.44, end: 0.84, eraIndex: 2 },
    { start: 0.84, end: 0.91, eraIndex: 3 },
  ];

  function isEvolutionMobileLayout() {
    return window.matchMedia("(max-width: 960px)").matches;
  }

  function getEvolutionTextBands() {
    return isEvolutionMobileLayout() ? EVOLUTION_TEXT_BANDS_MOBILE : EVOLUTION_TEXT_BANDS;
  }

  function getEvolutionScrollEndHold() {
    return isEvolutionMobileLayout() ? 0.02 : EVOLUTION_SCROLL_END_HOLD;
  }


  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  function playHeaderVideo() {
    if (!headerVideo) return;
    headerVideo.muted = true;
    if (headerVideo.paused && headerVideo.currentTime > 0.2) {
      headerVideo.currentTime = 0;
    }
    const playPromise = headerVideo.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {});
    }
  }

  function shouldSkipIntroFromLegalReturn() {
    const params = new URLSearchParams(window.location.search);
    if (params.get("skipIntro") === "1") return true;
    try {
      const ref = document.referrer || "";
      if (/impressum\.html|datenschutz\.html/i.test(ref)) return true;
    } catch {
      /* ignore */
    }
    return false;
  }

  function finishIntro() {
    if (!intro || intro.classList.contains("is-done")) return;
    window.clearTimeout(introTimeoutId);
    intro.classList.add("is-done");
    intro.setAttribute("aria-hidden", "true");
    header?.classList.remove("is-intro");
    if (main) {
      main.hidden = false;
    }
    if (video) {
      video.pause();
    }
    playHeaderVideo();
    document.body.style.overflow = "";
    window.requestAnimationFrame(() => {
      document
        .querySelectorAll(".hero__panel--opening .reveal, .hero__panel--opening .reveal-text")
        .forEach((el) => {
          el.classList.add("is-visible", "is-lit");
        });
      ensureScrollReveal();
      setScrollKeyword(SCROLL_KEYWORD_WELCOME);
      document.querySelector(".scroll-progress")?.classList.add("is-active");
      measureEvolutionScroll();
      updateScrollUi();
    });
  }

  function scheduleIntroFallback() {
    window.clearTimeout(introTimeoutId);
    introTimeoutId = window.setTimeout(finishIntro, 14000);
  }

  function showIntroPlayButton() {
    if (!introPlayBtn) return;
    introPlayBtn.hidden = false;
  }

  async function playIntroVideo() {
    if (!video) return false;
    video.muted = !(introSoundBtn && introSoundBtn.getAttribute("aria-pressed") === "true");
    try {
      await video.play();
      if (introPlayBtn) introPlayBtn.hidden = true;
      scheduleIntroFallback();
      return true;
    } catch {
      showIntroPlayButton();
      return false;
    }
  }

  function startIntroFlow() {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (headerVideo) {
      headerVideo.pause();
    }

    if (shouldSkipIntroFromLegalReturn()) {
      header?.classList.remove("is-intro");
      finishIntro();
      return;
    }

    if (reducedMotion || !video) {
      header?.classList.remove("is-intro");
      finishIntro();
      if (hero) {
        hero.style.setProperty("--hero-story-darken", "0");
      }
      return;
    }

    document.body.style.overflow = "hidden";
    header?.classList.add("is-intro");

    video.addEventListener("ended", () => {
      window.clearTimeout(introTimeoutId);
      finishIntro();
    });

    video.addEventListener("error", () => {
      showIntroPlayButton();
    });

    void playIntroVideo();
  }

  if (skipBtn) {
    skipBtn.addEventListener("click", finishIntro);
  }

  if (introPlayBtn) {
    introPlayBtn.addEventListener("click", () => {
      void playIntroVideo();
    });
  }

  if (introSoundBtn && video) {
    introSoundBtn.addEventListener("click", () => {
      const on = introSoundBtn.getAttribute("aria-pressed") !== "true";
      introSoundBtn.setAttribute("aria-pressed", on ? "true" : "false");
      introSoundBtn.textContent = on ? "Ton aus" : "Ton an";
      video.muted = !on;
      if (video.paused) {
        void playIntroVideo();
      }
    });
  }

  startIntroFlow();

  function initKlarheitEarthVideo() {
    if (!klarheitEarthVideo) return;

    const playTarget =
      document.querySelector(".klarheit-sticky") || document.getElementById("klarheit");
    klarheitEarthVideo.muted = true;
    klarheitEarthVideo.defaultMuted = true;
    klarheitEarthVideo.setAttribute("playsinline", "");
    klarheitEarthVideo.setAttribute("webkit-playsinline", "");

    function isEarthInView() {
      if (!playTarget) return true;
      const rect = playTarget.getBoundingClientRect();
      return rect.bottom > 0 && rect.top < window.innerHeight * 1.02;
    }

    function tryPlayEarth() {
      if (!isEarthInView()) return;
      if (klarheitEarthVideo.readyState >= 2) {
        const playPromise = klarheitEarthVideo.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(() => {});
        }
      } else {
        klarheitEarthVideo.addEventListener(
          "canplay",
          () => {
            klarheitEarthVideo.play().catch(() => {});
          },
          { once: true }
        );
        klarheitEarthVideo.load();
      }
    }

    function pauseEarthIfHidden() {
      if (!isEarthInView() && !klarheitEarthVideo.paused) {
        klarheitEarthVideo.pause();
      }
    }

    const unlockPlay = () => {
      tryPlayEarth();
    };
    document.addEventListener("touchstart", unlockPlay, { once: true, passive: true });
    document.addEventListener("wheel", unlockPlay, { once: true, passive: true });

    if (!playTarget || !("IntersectionObserver" in window)) {
      tryPlayEarth();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            tryPlayEarth();
          } else {
            klarheitEarthVideo.pause();
          }
        });
      },
      { threshold: [0, 0.04, 0.12], rootMargin: "60px 0px 60px 0px" }
    );

    observer.observe(playTarget);

    window.addEventListener(
      "scroll",
      () => {
        if (isEarthInView()) {
          tryPlayEarth();
        } else {
          pauseEarthIfHidden();
        }
      },
      { passive: true }
    );
  }

  const brandHome = document.querySelector(".brand--center");
  if (brandHome) {
    brandHome.addEventListener("click", (event) => {
      event.preventDefault();
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
      if (window.history.replaceState) {
        window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
      }
    });
  }

  if (navToggle && siteNavMobile) {
    navToggle.addEventListener("click", () => {
      const open = siteNavMobile.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    siteNavMobile.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        siteNavMobile.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  function setScrollKeyword(text) {
    activeScrollKeyword = text || "";
    if (!scrollKeywordEl) return;
    if (!activeScrollKeyword) {
      scrollKeywordEl.textContent = "";
      scrollKeywordEl.classList.remove("is-visible", "scroll-progress__keyword--welcome");
      return;
    }
    if (scrollKeywordEl.textContent !== activeScrollKeyword) {
      scrollKeywordEl.textContent = activeScrollKeyword;
    }
    scrollKeywordEl.classList.toggle(
      "scroll-progress__keyword--welcome",
      activeScrollKeyword === SCROLL_KEYWORD_WELCOME
    );
    scrollKeywordEl.classList.add("is-visible");
  }

  function getHeroStoryProgress() {
    if (!heroStoryScroll) return null;

    const rect = heroStoryScroll.getBoundingClientRect();
    if (rect.bottom < window.innerHeight * 0.2) return null;

    const scrollable = heroStoryScroll.offsetHeight - window.innerHeight;
    if (scrollable <= 0) return null;

    const traveled = Math.min(Math.max(-rect.top, 0), scrollable);
    if (rect.top > window.innerHeight * 0.92 && traveled <= 0) return null;

    return traveled / scrollable;
  }

  function resolveHeroStoryBeat(progress) {
    let beat = HERO_STORY_BEATS[HERO_STORY_BEATS.length - 1];
    for (let i = 0; i < HERO_STORY_BEATS.length; i += 1) {
      if (progress <= HERO_STORY_BEATS[i].until) {
        beat = HERO_STORY_BEATS[i];
        break;
      }
    }
    return beat;
  }

  function keywordFromStoryBeat(beat) {
    if (!beat) return "";
    if (beat.sub === "für KMU") return "für KMU";
    if (beat.mega) return beat.mega.replace(/\.$/, "").trim();
    return "";
  }

  function updateScrollKeywordLabel() {
    if (main && main.hidden) return;

    const storyProgress = getHeroStoryProgress();
    const openingPanel = document.querySelector(".hero__panel--opening");
    const openingVisible =
      openingPanel &&
      openingPanel.getBoundingClientRect().bottom > window.innerHeight * 0.45;

    if (openingVisible && window.scrollY < 220) {
      setScrollKeyword(SCROLL_KEYWORD_WELCOME);
      return;
    }

    if (storyProgress !== null) {
      const beat = resolveHeroStoryBeat(storyProgress);
      const storyKeyword = keywordFromStoryBeat(beat);
      if (storyKeyword) {
        setScrollKeyword(storyKeyword);
        return;
      }
      if (storyProgress < 0.12) {
        setScrollKeyword(SCROLL_KEYWORD_WELCOME);
        return;
      }
    }

    if (activeSectionKeyword) {
      setScrollKeyword(activeSectionKeyword);
      return;
    }

    if (window.scrollY < 80) {
      setScrollKeyword(SCROLL_KEYWORD_WELCOME);
    }
  }

  function measureEvolutionScroll() {
    if (!evolutionScroll) return;
    evolutionScrollStartY = evolutionScroll.getBoundingClientRect().top + window.scrollY;
    evolutionScrollRange = Math.max(1, evolutionScroll.offsetHeight - window.innerHeight);
  }

  function getEvolutionProgress() {
    if (!evolutionScroll || evolutionScrollRange <= 0) return 0;
    const traveled = window.scrollY - evolutionScrollStartY;
    return Math.min(1, Math.max(0, traveled / evolutionScrollRange));
  }

  function scrollProgressToVideoProgress(scrollProgress) {
    const p = Math.min(1, Math.max(0, scrollProgress));
    const hold = getEvolutionScrollEndHold();
    const motionEnd = 1 - hold;
    if (p >= motionEnd) return 1;
    return p / motionEnd;
  }

  function snapToEvolutionFrame(timeSeconds) {
    const maxFrame = Math.max(0, Math.round(evolutionVideoDuration * EVOLUTION_FPS) - 1);
    const frame = Math.min(maxFrame, Math.max(0, Math.round(timeSeconds * EVOLUTION_FPS)));
    return frame / EVOLUTION_FPS;
  }

  function seekEvolutionToVideoProgress(videoProgress) {
    if (!evolutionVideo || evolutionVideoDuration <= 0) return;
    const time = snapToEvolutionFrame(videoProgress * evolutionVideoDuration);
    const frameIndex = Math.round(time * EVOLUTION_FPS);
    if (frameIndex === evolutionLastSeekFrame) return;
    evolutionLastSeekFrame = frameIndex;
    try {
      evolutionVideo.currentTime = time;
    } catch {
      evolutionLastSeekFrame = -1;
    }
  }

  function getEvolutionEraIndex(scrollProgress) {
    const p = Math.min(1, Math.max(0, scrollProgress));
    const bands = getEvolutionTextBands();
    for (let i = 0; i < bands.length; i += 1) {
      const band = bands[i];
      if (p >= band.start && p < band.end) {
        return band.eraIndex;
      }
    }
    return EVOLUTION_ERAS.length - 1;
  }

  function updateEvolutionCopy(progress) {
    const clamped = Math.min(1, Math.max(0, progress));
    const era = EVOLUTION_ERAS[getEvolutionEraIndex(clamped)];

    if (evolutionEra && evolutionEra.textContent !== era.label) {
      evolutionEra.textContent = era.label;
    }
    if (evolutionCaption && evolutionCaption.textContent !== era.text) {
      evolutionCaption.textContent = era.text;
    }
  }

  function tickEvolutionScrub() {
    if (!evolutionInView) {
      evolutionScrubRaf = 0;
      return;
    }

    const scrollProgress = getEvolutionProgress();
    if (evolutionVideoDuration > 0) {
      seekEvolutionToVideoProgress(scrollProgressToVideoProgress(scrollProgress));
    }
    updateEvolutionCopy(scrollProgress);

    evolutionScrubRaf = window.requestAnimationFrame(tickEvolutionScrub);
  }

  function startEvolutionScrub() {
    if (!evolutionScrubRaf) {
      evolutionScrubRaf = window.requestAnimationFrame(tickEvolutionScrub);
    }
  }

  function stopEvolutionScrub() {
    if (evolutionScrubRaf) {
      window.cancelAnimationFrame(evolutionScrubRaf);
      evolutionScrubRaf = 0;
    }
  }

  function setEvolutionInView(inView) {
    evolutionInView = inView;
    if (inView) {
      measureEvolutionScroll();
      startEvolutionScrub();
    } else {
      stopEvolutionScrub();
    }
  }

  function initEvolutionVideo() {
    if (!evolutionVideo) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      evolutionVideo.pause();
      evolutionLastSeekFrame = -1;
      seekEvolutionToVideoProgress(0);
      updateEvolutionCopy(0);
      return;
    }

    evolutionVideo.pause();
    evolutionVideo.playsInline = true;
    evolutionVideo.removeAttribute("controls");
    evolutionVideo.setAttribute("preload", "auto");

    const onReady = () => {
      if (Number.isFinite(evolutionVideo.duration) && evolutionVideo.duration > 0) {
        evolutionVideoDuration = evolutionVideo.duration;
        evolutionLastSeekFrame = -1;
        measureEvolutionScroll();
        const scrollProgress = getEvolutionProgress();
        seekEvolutionToVideoProgress(scrollProgressToVideoProgress(scrollProgress));
        updateEvolutionCopy(scrollProgress);
      }
    };

    evolutionVideo.addEventListener("loadedmetadata", onReady);
    if (evolutionVideo.readyState >= 1) {
      onReady();
    }

    window.addEventListener("resize", measureEvolutionScroll, { passive: true });
    measureEvolutionScroll();

    if (evolutionScroll && "IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            setEvolutionInView(entry.isIntersecting);
          });
        },
        { threshold: 0 }
      );
      observer.observe(evolutionScroll);
    } else {
      setEvolutionInView(true);
    }

    window.addEventListener("beforeunload", () => {
      stopEvolutionScrub();
    });
  }

  function updateScrollUi() {
    const atTop = window.scrollY <= SCROLL_BRAND_THRESHOLD;
    if (header) {
      header.classList.toggle("is-scrolled", !atTop);
    }

    if (headerVideo) {
      if (atTop) {
        playHeaderVideo();
      } else {
        headerVideo.pause();
      }
    }

    if (scrollProgressFill) {
      const root = document.documentElement;
      const max = root.scrollHeight - root.clientHeight;
      const progress = max > 0 ? (window.scrollY / max) * 100 : 0;
      scrollProgressFill.style.height = `${Math.min(100, Math.max(0, progress))}%`;
      const track = scrollProgressFill.closest(".scroll-progress");
      if (track && main && !main.hidden) {
        track.classList.add("is-active");
      }
      if (scrollKeywordEl) {
        scrollKeywordEl.style.setProperty("--keyword-top", `${Math.min(96, Math.max(4, progress))}%`);
      }
    }

    updateHeroStoryScroll();
    updateKlarheitEarthScroll();
    updatePhilosophyScroll();
    updateHeroStageVisibility();
    updateScrollKeywordLabel();
  }

  function updateHeroStageVisibility() {
    if (!hero) return;
    const rect = hero.getBoundingClientRect();
    const isMobile = window.matchMedia("(max-width: 960px)").matches;
    const cutoff = isMobile ? 0.28 : 0.12;
    hero.classList.toggle("hero--past-stage", rect.bottom <= window.innerHeight * cutoff);
  }

  function updateHeroStoryScroll() {
    if (!heroStoryScroll || !heroStoryMega || !heroStorySub) return;

    const rect = heroStoryScroll.getBoundingClientRect();
    const scrollable = heroStoryScroll.offsetHeight - window.innerHeight;
    if (scrollable <= 0) return;

    const traveled = Math.min(Math.max(-rect.top, 0), scrollable);
    const progress = traveled / scrollable;

    if (hero) {
      const darken = Math.min(1, Math.max(0, progress * 1.15));
      hero.style.setProperty("--hero-story-darken", darken.toFixed(3));
      hero.classList.toggle("hero--story-dark", progress > 0.04);
    }

    const beat = resolveHeroStoryBeat(progress);
    let megaChangedThisTick = false;

    if (heroStoryMega.dataset.line !== beat.mega) {
      megaChangedThisTick = true;
      heroStoryMega.dataset.line = beat.mega;
      heroStoryMega.classList.remove("is-lit");
      heroStoryMega.textContent = beat.mega;
      if (beat.mega) {
        window.requestAnimationFrame(() => heroStoryMega.classList.add("is-lit"));
      }
    }

    if (heroStorySub.dataset.line !== beat.sub) {
      heroStorySub.dataset.line = beat.sub;
      heroStorySub.classList.remove("is-lit");
      heroStorySub.textContent = beat.sub;
      if (beat.sub) {
        const subDelayMs = megaChangedThisTick ? 520 : 80;
        window.setTimeout(() => {
          if (heroStorySub.dataset.line === beat.sub) {
            heroStorySub.classList.add("is-lit");
          }
        }, subDelayMs);
      }
    }
  }

  function updateKlarheitEarthScroll() {
    if (!klarheitScroll || !klarheitEarth) return;

    const rect = klarheitScroll.getBoundingClientRect();
    const inView = rect.bottom > 0 && rect.top < window.innerHeight;

    if (klarheitEarthVideo && inView && klarheitEarthVideo.paused) {
      klarheitEarthVideo.play().catch(() => {});
    }

    const scrollable = klarheitScroll.offsetHeight - window.innerHeight;
    const isMobile = window.matchMedia("(max-width: 960px)").matches;
    let scale = isMobile ? 0.42 : 0.22;
    let opacity = 0.3;

    if (scrollable <= 0) {
      klarheitEarth.style.setProperty("--earth-scale", String(scale));
      klarheitEarth.style.setProperty("--earth-opacity", String(opacity));
      return;
    }

    const traveled = Math.min(Math.max(-rect.top, 0), scrollable);
    const progress = traveled / scrollable;

    if (isMobile) {
      if (progress < 0.35) {
        scale = 0.38 + progress * 0.35;
        opacity = 0.32 + progress * 0.22;
      } else {
        const grow = (progress - 0.35) / 0.65;
        scale = 0.5 + grow * 0.45;
        opacity = 0.4 + grow * 0.28;
      }
    } else if (progress < 0.2) {
      scale = 0.18 + progress * 0.55;
      opacity = 0.26 + progress * 0.3;
    } else if (progress < 0.55) {
      scale = 0.28;
      opacity = 0.38;
    } else {
      const grow = (progress - 0.55) / 0.45;
      scale = 0.28 + grow * 1.02;
      opacity = 0.38 + grow * 0.32;
    }

    klarheitEarth.style.setProperty("--earth-scale", String(scale));
    klarheitEarth.style.setProperty("--earth-opacity", String(opacity));
  }

  function updatePhilosophyScroll() {
    if (!philosophyScroll || !philosophyVideoLayer) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      philosophyVideoLayer.hidden = true;
      if (philosophyStage) {
        philosophyStage.style.setProperty("--philosophy-content-opacity", "1");
        philosophyStage.classList.add("is-scroll-ready");
      }
      return;
    }

    philosophyVideoLayer.hidden = false;

    const rect = philosophyScroll.getBoundingClientRect();
    const inView = rect.bottom > 0 && rect.top < window.innerHeight;

    if (philosophyScrollVideo && inView && philosophyScrollVideo.paused) {
      philosophyScrollVideo.play().catch(() => {});
    }

    const scrollable = philosophyScroll.offsetHeight - window.innerHeight;
    const isMobile = window.matchMedia("(max-width: 960px)").matches;
    const scaleEnd = isMobile ? 0.38 : 0.24;
    const videoOpacityEnd = isMobile ? 0.34 : 0.26;

    if (scrollable <= 0) {
      philosophyVideoLayer.style.setProperty("--philosophy-video-scale", String(scaleEnd));
      philosophyVideoLayer.style.setProperty("--philosophy-video-opacity", String(videoOpacityEnd));
      philosophyVideoLayer.style.setProperty("--philosophy-video-z", "0");
      if (philosophyStage) {
        philosophyStage.style.setProperty("--philosophy-content-opacity", "1");
        philosophyStage.classList.add("is-scroll-ready");
      }
      return;
    }

    const traveled = Math.min(Math.max(-rect.top, 0), scrollable);
    const progress = traveled / scrollable;

    let scale;
    let videoOpacity;
    let contentOpacity;
    let videoY = 0;
    let shrinkPhase;

    if (isMobile) {
      const shrinkStart = 0.22;
      const shrinkEnd = 0.78;
      videoY = 0;

      if (progress < shrinkStart) {
        scale = 1;
        shrinkPhase = 0;
      } else if (progress < shrinkEnd) {
        const shrinkT = (progress - shrinkStart) / (shrinkEnd - shrinkStart);
        scale = 1 + (scaleEnd - 1) * shrinkT;
        shrinkPhase = shrinkT;
      } else {
        scale = scaleEnd;
        shrinkPhase = 1;
      }

      videoOpacity = 1 + (videoOpacityEnd - 1) * shrinkPhase;
      contentOpacity = Math.min(1, Math.max(0, (progress - 0.5) / 0.38));
    } else {
      shrinkPhase = Math.min(1, progress / 0.68);
      scale = 1 + (scaleEnd - 1) * shrinkPhase;
      videoOpacity = 1 + (videoOpacityEnd - 1) * shrinkPhase;
      contentOpacity = Math.min(1, Math.max(0, (progress - 0.08) / 0.58));
      videoY = 0;
    }

    philosophyVideoLayer.style.setProperty("--philosophy-video-scale", scale.toFixed(3));
    philosophyVideoLayer.style.setProperty("--philosophy-video-opacity", videoOpacity.toFixed(3));
    philosophyVideoLayer.style.setProperty("--philosophy-video-y", `${videoY}px`);
    philosophyVideoLayer.style.setProperty("--philosophy-video-z", shrinkPhase > 0.78 ? "0" : "3");

    if (philosophyStage) {
      philosophyStage.style.setProperty("--philosophy-content-opacity", contentOpacity.toFixed(3));
      philosophyStage.classList.toggle("is-scroll-ready", contentOpacity > 0.55);
    }
  }

  window.addEventListener("scroll", updateScrollUi, { passive: true });
  updateScrollUi();

  placeholderLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      if (link.getAttribute("href") === "#") {
        event.preventDefault();
        window.alert(
          "Hier tragen Sie die URL Ihrer Kundenreferenz ein — z. B. in index.html bei „Projekt Alpha“."
        );
      }
    });
  });

  function initHeroParallax() {
    if (!hero || !heroParallax) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) return;

    const maxShift = 36;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let rafId = 0;

    function tick() {
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;
      heroParallax.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
      rafId = window.requestAnimationFrame(tick);
    }

    rafId = window.requestAnimationFrame(tick);

    hero.addEventListener("mousemove", (event) => {
      const rect = hero.getBoundingClientRect();
      const relX = (event.clientX - rect.left) / rect.width - 0.5;
      const relY = (event.clientY - rect.top) / rect.height - 0.5;
      targetX = -relX * maxShift;
      targetY = -relY * maxShift;
    });

    hero.addEventListener("mouseleave", () => {
      targetX = 0;
      targetY = 0;
    });

    window.addEventListener("beforeunload", () => {
      window.cancelAnimationFrame(rafId);
    });
  }

  function initScrollKeywordsAndFocus() {
    const sections = document.querySelectorAll("[data-scroll-keyword]");
    if (!sections.length) return;

    const sectionRatios = new Map();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          sectionRatios.set(entry.target, entry.isIntersecting ? entry.intersectionRatio : 0);
        });

        let bestSection = null;
        let bestRatio = 0;
        sections.forEach((section) => {
          const ratio = sectionRatios.get(section) || 0;
          if (ratio > bestRatio) {
            bestRatio = ratio;
            bestSection = section;
          }
        });

        sections.forEach((section) => {
          section.classList.toggle("is-in-focus", section === bestSection && bestRatio > 0.22);
        });

        if (bestSection && bestRatio > 0.18) {
          activeSectionKeyword = bestSection.getAttribute("data-scroll-keyword") || "";
        } else {
          activeSectionKeyword = "";
        }
        updateScrollKeywordLabel();
      },
      { threshold: [0, 0.12, 0.22, 0.35, 0.5, 0.65] }
    );

    sections.forEach((section) => observer.observe(section));
  }

  function initAiSparklesTouch() {
    const container = document.getElementById("ai-sparkles");
    if (!container) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion || !window.matchMedia("(max-width: 960px)").matches) return;

    container.classList.add("ai-sparkles--touch");

    const sparkleSvg =
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#9ee8ff" d="M12 2.5l1.65 5.7L19 10l-5.35 1.8L12 17.5l-1.65-5.7L5 10l5.35-1.8L12 2.5z"/></svg>';

    let lastBurstAt = 0;

    function spawnBurst(clientX, clientY) {
      const now = performance.now();
      if (now - lastBurstAt < 48) return;
      lastBurstAt = now;

      const count = 3 + Math.floor(Math.random() * 2);
      for (let i = 0; i < count; i += 1) {
        const el = document.createElement("span");
        el.className =
          i % 2 === 0 ? "ai-sparkle ai-sparkle--touch-burst" : "ai-sparkle ai-sparkle--dim ai-sparkle--touch-burst";
        el.innerHTML = sparkleSvg;
        const spread = 10 + i * 7;
        el.style.left = `${clientX + (Math.random() - 0.5) * spread}px`;
        el.style.top = `${clientY + (Math.random() - 0.5) * spread}px`;
        container.appendChild(el);
        window.setTimeout(() => el.remove(), 700);
      }
    }

    function onTouch(event) {
      Array.from(event.changedTouches).forEach((touch) => {
        spawnBurst(touch.clientX, touch.clientY);
      });
    }

    document.addEventListener("touchstart", onTouch, { passive: true });
    document.addEventListener("touchmove", onTouch, { passive: true });
  }

  function initAiSparkles() {
    const container = document.getElementById("ai-sparkles");
    if (!container) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) return;

    if (window.matchMedia("(max-width: 960px)").matches) {
      initAiSparklesTouch();
      return;
    }

    const sparkleSvg =
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#9ee8ff" d="M12 2.5l1.65 5.7L19 10l-5.35 1.8L12 17.5l-1.65-5.7L5 10l5.35-1.8L12 2.5z"/></svg>';

    const count = 7;
    const particles = [];

    for (let i = 0; i < count; i += 1) {
      const el = document.createElement("span");
      el.className = i % 2 === 0 ? "ai-sparkle" : "ai-sparkle ai-sparkle--dim";
      el.innerHTML = sparkleSvg;
      container.appendChild(el);
      particles.push({
        el,
        x: window.innerWidth * 0.5,
        y: window.innerHeight * 0.5,
        lag: 0.06 + i * 0.018,
        wobble: i * 0.7,
      });
    }

    let targetX = window.innerWidth * 0.5;
    let targetY = window.innerHeight * 0.5;
    let rafId = 0;
    let t = 0;

    document.addEventListener(
      "mousemove",
      (event) => {
        targetX = event.clientX;
        targetY = event.clientY;
      },
      { passive: true }
    );

    function tick() {
      t += 0.016;
      particles.forEach((particle, index) => {
        const wobbleX = Math.sin(t * 2 + particle.wobble) * (8 + index);
        const wobbleY = Math.cos(t * 1.6 + particle.wobble) * (6 + index);
        particle.x += (targetX + wobbleX - particle.x) * particle.lag;
        particle.y += (targetY + wobbleY - particle.y) * particle.lag;
        particle.el.style.transform = `translate3d(${particle.x}px, ${particle.y}px, 0)`;
      });
      rafId = window.requestAnimationFrame(tick);
    }

    rafId = window.requestAnimationFrame(tick);

    window.addEventListener("beforeunload", () => {
      window.cancelAnimationFrame(rafId);
    });
  }

  function ensureScrollReveal() {
    if (scrollRevealReady) return;
    scrollRevealReady = true;
    initScrollReveal();
    initScrollKeywordsAndFocus();
  }

  function setRevealState(block, visible) {
    block.classList.toggle("is-visible", visible);
    block.querySelectorAll(".reveal-text").forEach((textEl) => {
      textEl.classList.toggle("is-lit", visible);
    });
  }

  function initScrollReveal() {
    const revealBlocks = document.querySelectorAll(".reveal:not(.hero__content)");
    if (!revealBlocks.length) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      revealBlocks.forEach((block) => setRevealState(block, true));
      return;
    }

    const blockObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setRevealState(entry.target, entry.isIntersecting);
        });
      },
      { root: null, threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );

    revealBlocks.forEach((block) => {
      blockObserver.observe(block);
    });

    document.querySelectorAll(".reveal-text").forEach((textEl) => {
      if (!textEl.closest(".reveal")) {
        const soloObserver = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              entry.target.classList.toggle("is-lit", entry.isIntersecting);
            });
          },
          { threshold: 0.2, rootMargin: "0px 0px -8% 0px" }
        );
        soloObserver.observe(textEl);
      }
    });
  }

  function openContactModal() {
    if (!contactModal) return;
    contactModal.hidden = false;
    contactModal.setAttribute("aria-hidden", "false");
    window.requestAnimationFrame(() => {
      contactModal.classList.add("is-open");
    });
    document.body.style.overflow = "hidden";
    siteNavMobile?.classList.remove("is-open");
    navToggle?.setAttribute("aria-expanded", "false");
    const firstField = contactForm?.querySelector("#contact-name");
    window.setTimeout(() => firstField?.focus(), 120);
  }

  function closeContactModal() {
    if (!contactModal) return;
    contactModal.classList.remove("is-open");
    contactModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    window.setTimeout(() => {
      contactModal.hidden = true;
    }, 360);
  }

  function initContactModal() {
    document.querySelectorAll("[data-contact-open]").forEach((trigger) => {
      trigger.addEventListener("click", (event) => {
        event.preventDefault();
        openContactModal();
      });
    });

    contactModal?.querySelectorAll("[data-contact-close]").forEach((el) => {
      el.addEventListener("click", closeContactModal);
    });

    window.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && contactModal && !contactModal.hidden) {
        closeContactModal();
      }
    });
  }

  function initContactForm() {
    if (!contactForm) return;

    contactForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const name = contactForm.querySelector("#contact-name")?.value.trim() || "";
      const email = contactForm.querySelector("#contact-email")?.value.trim() || "";
      const message = contactForm.querySelector("#contact-message")?.value.trim() || "";
      const interests = [...contactForm.querySelectorAll('input[name="interest"]:checked')].map(
        (input) => input.value
      );
      const appointment =
        contactForm.querySelector("#contact-appointment")?.value.trim() || "";

      if (!name || !email || !message) {
        contactForm.classList.add("contact-form--shake");
        window.setTimeout(() => contactForm.classList.remove("contact-form--shake"), 450);
        return;
      }

      const subject = encodeURIComponent(`Anfrage über saibot-impulse.de — ${name}`);
      const bodyLines = [
        `Name: ${name}`,
        `E-Mail: ${email}`,
        "",
        interests.length ? `Interesse: ${interests.join(", ")}` : "Interesse: (nicht angegeben)",
        appointment ? `Wunschtermin: ${appointment}` : "",
        "",
        message,
        "",
        "— Gesendet über das Kontaktformular auf saibot-impulse.de",
      ];
      const body = encodeURIComponent(bodyLines.join("\n"));
      window.location.href = `mailto:kontakt@saibot-impulse.de?subject=${subject}&body=${body}`;
    });
  }

  function initKiVisualStack() {
    const stack = document.getElementById("ki-visual-stack");
    const caption = document.getElementById("ki-stack-caption");
    if (!stack) return;

    const cards = Array.from(stack.querySelectorAll(".ki-stack__card"));
    if (!cards.length) return;

    let order = cards.map((_, index) => index);
    let timerId = 0;
    let resumeTimerId = 0;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const AUTO_MS = 2800;
    const RESUME_AFTER_CLICK_MS = 3200;

    function applyOrder() {
      order.forEach((cardIndex, slot) => {
        cards[cardIndex].dataset.slot = String(slot);
      });
      if (caption) {
        const front = cards[order[0]];
        caption.textContent = front?.dataset.caption || "";
      }
    }

    function pulseFlip() {
      stack.classList.remove("ki-stack--flip");
      void stack.offsetWidth;
      stack.classList.add("ki-stack--flip");
      window.setTimeout(() => stack.classList.remove("ki-stack--flip"), 480);
    }

    function rotateStack(fromUser) {
      order.push(order.shift());
      applyOrder();
      if (!reducedMotion) {
        pulseFlip();
      }
      if (fromUser) {
        stopRotation();
        window.clearTimeout(resumeTimerId);
        resumeTimerId = window.setTimeout(startRotation, RESUME_AFTER_CLICK_MS);
      }
    }

    function startRotation() {
      if (reducedMotion || timerId) return;
      timerId = window.setInterval(() => rotateStack(false), AUTO_MS);
    }

    function stopRotation() {
      if (!timerId) return;
      window.clearInterval(timerId);
      timerId = 0;
    }

    function onUserActivate(event) {
      event.preventDefault();
      rotateStack(true);
    }

    applyOrder();
    startRotation();

    stack.addEventListener("click", onUserActivate);
    stack.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        onUserActivate(event);
      }
    });

    stack.addEventListener("mouseenter", stopRotation);
    stack.addEventListener("mouseleave", () => {
      window.clearTimeout(resumeTimerId);
      startRotation();
    });

    const section = document.getElementById("ki-impuls");
    if (section && "IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) startRotation();
            else stopRotation();
          });
        },
        { threshold: 0.15 }
      );
      observer.observe(section);
    }
  }

  function initSurfaceCards() {
    const cards = document.querySelectorAll(".surface-card");
    if (!cards.length) return;

    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    cards.forEach((card) => {
      card.addEventListener("pointerenter", () => card.classList.add("is-hovered"));
      card.addEventListener("pointerleave", () => {
        card.classList.remove("is-hovered");
        card.style.removeProperty("--surface-glow-x");
        card.style.removeProperty("--surface-glow-y");
      });

      if (card.hasAttribute("data-expand")) {
        card.setAttribute("role", "button");
        card.setAttribute("tabindex", "0");
        card.setAttribute("aria-expanded", "false");

        const toggleExpand = () => {
          const expanded = card.classList.toggle("is-expanded");
          card.setAttribute("aria-expanded", expanded ? "true" : "false");
        };

        card.addEventListener("click", (event) => {
          if (event.target.closest("a, button")) return;
          toggleExpand();
        });
        card.addEventListener("keydown", (event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            toggleExpand();
          }
        });
      }

      if (!finePointer) return;

      card.addEventListener("pointermove", (event) => {
        const rect = card.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 100;
        const y = ((event.clientY - rect.top) / rect.height) * 100;
        card.style.setProperty("--surface-glow-x", `${x}%`);
        card.style.setProperty("--surface-glow-y", `${y}%`);
      });
    });
  }

  function initPhilosophySteps() {
    const section = document.getElementById("philosophie");
    const stepsRoot = document.getElementById("philosophy-steps");
    if (!section || !stepsRoot) return;

    const stepCards = Array.from(stepsRoot.querySelectorAll(".surface-card--step"));
    if (!stepCards.length || !("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle(
            "is-step-lit",
            entry.isIntersecting && entry.intersectionRatio >= 0.42
          );
        });
      },
      { threshold: [0, 0.25, 0.42, 0.65], rootMargin: "-8% 0px -8% 0px" }
    );

    stepCards.forEach((card) => observer.observe(card));
  }

  initEvolutionVideo();
  initHeroParallax();
  initAiSparkles();
  initKiVisualStack();
  initSurfaceCards();
  initPhilosophySteps();
  initKlarheitEarthVideo();
  initContactModal();
  initContactForm();
})();
