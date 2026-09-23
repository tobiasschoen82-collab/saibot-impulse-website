(function () {
  const intro = document.getElementById("intro");
  const video = document.getElementById("intro-video");
  const skipBtn = document.getElementById("intro-skip");
  const main = document.getElementById("main");
  const header = document.querySelector(".site-header");
  const navToggle = document.getElementById("nav-toggle");
  const siteNavMobile = document.getElementById("site-nav-mobile");
  const yearEl = document.getElementById("year");
  const placeholderLinks = document.querySelectorAll("[data-placeholder-link]");
  const hero = document.getElementById("hero");
  const heroParallax = document.getElementById("hero-parallax");
  let scrollRevealReady = false;

  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  function finishIntro() {
    if (!intro || intro.classList.contains("is-done")) return;
    intro.classList.add("is-done");
    intro.setAttribute("aria-hidden", "true");
    header?.classList.remove("is-intro");
    if (main) {
      main.hidden = false;
    }
    if (video) {
      video.pause();
    }
    document.body.style.overflow = "";
    window.requestAnimationFrame(() => {
      document.querySelectorAll(".hero .reveal, .hero .reveal-text").forEach((el) => {
        el.classList.add("is-visible", "is-lit");
      });
      ensureScrollReveal();
    });
  }

  function startIntroFlow() {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reducedMotion || !video) {
      header?.classList.remove("is-intro");
      finishIntro();
      return;
    }

    document.body.style.overflow = "hidden";
    header?.classList.add("is-intro");

    video.addEventListener("ended", finishIntro);
    video.addEventListener("error", finishIntro);

    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(finishIntro);
    }

    window.setTimeout(finishIntro, 12000);
  }

  if (skipBtn) {
    skipBtn.addEventListener("click", finishIntro);
  }

  startIntroFlow();

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

  window.addEventListener("scroll", () => {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 24);
  });

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

  function ensureScrollReveal() {
    if (scrollRevealReady) return;
    scrollRevealReady = true;
    initScrollReveal();
  }

  function initScrollReveal() {
    const revealBlocks = document.querySelectorAll(".reveal:not(.hero__content)");
    if (!revealBlocks.length) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      revealBlocks.forEach((block) => {
        block.classList.add("is-visible");
        block.querySelectorAll(".reveal-text").forEach((t) => t.classList.add("is-lit"));
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const block = entry.target;
          block.classList.add("is-visible");
          block.querySelectorAll(".reveal-text").forEach((textEl) => {
            textEl.classList.add("is-lit");
          });
          observer.unobserve(block);
        });
      },
      { root: null, threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
    );

    revealBlocks.forEach((block) => {
      observer.observe(block);
    });

    document.querySelectorAll(".reveal-text").forEach((textEl) => {
      if (!textEl.closest(".reveal")) {
        const soloObserver = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                entry.target.classList.add("is-lit");
                soloObserver.unobserve(entry.target);
              }
            });
          },
          { threshold: 0.35 }
        );
        soloObserver.observe(textEl);
      }
    });
  }

  initHeroParallax();
})();
