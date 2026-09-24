(function () {
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
