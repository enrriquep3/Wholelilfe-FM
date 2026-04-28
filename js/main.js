(function () {
  const body = document.body;
  const header = document.getElementById("siteHeader");
  const mobileNav = document.getElementById("mobileNav");
  const navToggle = document.querySelector("[data-nav-toggle]");
  const contactModal = document.getElementById("contactModal");
  const form = document.getElementById("contactForm");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ===== Page loaded state =====
  window.addEventListener("load", function () {
    body.classList.add("is-loaded");
  });

  // ===== Header scroll state =====
  function onScroll() {
    if (!header) return;
    if (window.scrollY > 20) header.classList.add("scrolled");
    else header.classList.remove("scrolled");
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // ===== Mobile nav =====
  function setMobileOpen(open) {
    if (!mobileNav || !navToggle) return;
    mobileNav.hidden = !open;
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.classList.toggle("open", open);
    body.classList.toggle("menu-open", open);
  }

  if (navToggle) {
    navToggle.addEventListener("click", function () {
      const open = navToggle.getAttribute("aria-expanded") !== "true";
      setMobileOpen(open);
    });
  }

  if (mobileNav) {
    mobileNav.addEventListener("click", function (e) {
      const t = e.target;
      if (t && t.matches && t.matches("a")) setMobileOpen(false);
    });
  }

  // ===== Contact modal =====
  const openBtns = document.querySelectorAll("[data-open-contact]");
  const closeBtns = document.querySelectorAll("[data-close-contact]");

  function openModal() {
    if (!contactModal) return;
    contactModal.hidden = false;
    body.style.overflow = "hidden";

    const firstInput = contactModal.querySelector("input, select, textarea, button");
    if (firstInput) firstInput.focus();
  }

  function closeModal() {
    if (!contactModal) return;
    contactModal.hidden = true;
    body.style.overflow = "";

    const wrap = document.getElementById("contactFormWrap");
    const success = document.getElementById("contactSuccess");

    if (form) form.reset();
    if (wrap) wrap.hidden = false;
    if (success) success.hidden = true;

    clearErrors();
  }

  openBtns.forEach((btn) => btn.addEventListener("click", openModal));
  closeBtns.forEach((btn) => btn.addEventListener("click", closeModal));

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      closeModal();
      setMobileOpen(false);
    }
  });

  // ===== Form validation =====
  function setError(field, msg) {
    const el = document.querySelector('[data-error-for="' + field + '"]');
    if (el) el.textContent = msg || "";
  }

  function clearErrors() {
    ["name", "email", "service", "message"].forEach((k) => setError(k, ""));
  }

  function isEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || "").trim());
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      clearErrors();

      const fd = new FormData(form);
      const name = String(fd.get("name") || "").trim();
      const email = String(fd.get("email") || "").trim();
      const service = String(fd.get("service") || "").trim();
      const message = String(fd.get("message") || "").trim();

      let ok = true;

      if (!name) {
        setError("name", "Name is required");
        ok = false;
      }

      if (!email) {
        setError("email", "Email is required");
        ok = false;
      } else if (!isEmail(email)) {
        setError("email", "Please enter a valid email");
        ok = false;
      }

      if (!service) {
        setError("service", "Please select a service");
        ok = false;
      }

      if (!message) {
        setError("message", "Message is required");
        ok = false;
      }

      if (!ok) {
        e.preventDefault();
        return;
      }

      // Let Web3Forms submit normally when valid.
      // If you later want AJAX submit + in-modal success state, that can be added.
    });
  }

  // ===== Accordion =====
  document.querySelectorAll("[data-accordion]").forEach((acc) => {
    const buttons = acc.querySelectorAll(".accordion-item");

    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const expanded = btn.getAttribute("aria-expanded") === "true";

        buttons.forEach((b) => {
          b.setAttribute("aria-expanded", "false");
          const panel = b.nextElementSibling;
          if (panel && panel.classList.contains("accordion-panel")) {
            panel.hidden = true;
          }
        });

        if (!expanded) {
          btn.setAttribute("aria-expanded", "true");
          const panel = btn.nextElementSibling;
          if (panel && panel.classList.contains("accordion-panel")) {
            panel.hidden = false;
          }
        }
      });
    });
  });

  // ===== Resources filter =====
  const filterWrap = document.querySelector("[data-resource-filters]");
  const resourceGrid = document.getElementById("resourceGrid");

  if (filterWrap && resourceGrid) {
    filterWrap.addEventListener("click", (e) => {
      const t = e.target;
      if (!t || !t.matches || !t.matches("[data-filter]")) return;

      const cat = t.getAttribute("data-filter");

      filterWrap.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
      t.classList.add("active");

      resourceGrid.querySelectorAll("[data-category]").forEach((card) => {
        const c = card.getAttribute("data-category");
        const show = cat === "All" || c === cat;
        card.style.display = show ? "" : "none";
      });
    });
  }

  // ===== Reveal on scroll =====
  const revealItems = document.querySelectorAll(".reveal");

  revealItems.forEach((item, index) => {
    if (item.classList.contains("stagger-item")) {
      item.style.setProperty("--delay", `${Math.min(index % 6, 5) * 90}ms`);
    } else {
      item.style.setProperty("--delay", "0ms");
    }
  });

  if (prefersReducedMotion) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  } else if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -60px 0px",
      }
    );

    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }
})();