(function () {
  const headerVideo = document.getElementById("header-logo-video");
  if (headerVideo) {
    headerVideo.muted = true;
    const playPromise = headerVideo.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {});
    }
  }

  const navToggle = document.getElementById("nav-toggle");
  const siteNavMobile = document.getElementById("site-nav-mobile");

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
})();
