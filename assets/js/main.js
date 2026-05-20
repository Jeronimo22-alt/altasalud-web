/* =============================================================
   ALTA SALUD — Medicina Laboral
   main.js v20260519
   IIFE pattern — no ES modules, no imports/exports
   Funciona en file://, FTP, Hostinger y cualquier hosting
   ============================================================= */
(function () {
  "use strict";

  /* ─── Helpers ─────────────────────────────────────────────── */
  var $ = function (sel, scope) { return (scope || document).querySelector(sel); };
  var $$ = function (sel, scope) { return Array.from((scope || document).querySelectorAll(sel)); };

  var reduced  = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fineHover = matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* Safe wrapper: una init fallida no rompe las demás */
  function safe(fn, name) {
    try { fn(); } catch (e) { console.warn("[AltaSalud:" + name + "]", e); }
  }

  /* ─── 1. SPLASH LOADER ────────────────────────────────────── */
  function initSplash() {
    var splash = $("[data-splash]");
    if (!splash) return;

    function hideSplash() {
      if (splash.classList.contains("is-out")) return;
      splash.classList.add("is-out");
      /* Tras la transición, lanzar animaciones de entrada del hero */
      setTimeout(initHeroEntrance, 300);
      /* Mostrar WhatsApp con delay */
      setTimeout(showWhatsApp, 2500);
    }

    /* Ocultar al load o a los 3.8s */
    if (document.readyState === "complete") {
      setTimeout(hideSplash, 800);
    } else {
      window.addEventListener("load", function () { setTimeout(hideSplash, 600); });
    }
    /* Safety JS: forzar a los 5.5s */
    setTimeout(hideSplash, 5500);
  }

  /* ─── 2. ANIMACIÓN DE ENTRADA DEL HERO ───────────────────── */
  function initHeroEntrance() {
    /* Eyebrow */
    var eyebrow = $(".hero-eyebrow");
    if (eyebrow) eyebrow.classList.add("is-visible");

    /* Subtitle */
    var sub = $(".hero-sub");
    if (sub) sub.classList.add("is-visible");

    /* Botones */
    var actions = $(".hero-actions");
    if (actions) actions.classList.add("is-visible");

    /* Word reveal en el H1 del hero */
    var h1 = $(".hero-title");
    if (h1) {
      var words = h1.querySelectorAll(".word-inner");
      words.forEach(function (w, i) {
        setTimeout(function () {
          w.style.transition = "transform 0.75s cubic-bezier(0.16,1,0.3,1), opacity 0.6s ease";
          w.style.transform  = "translateY(0)";
          w.style.opacity    = "1";
        }, 100 + i * 80);
      });
    }
  }

  /* ─── 3. SCROLL PROGRESS BAR ──────────────────────────────── */
  function initScrollBar() {
    var bar = $("#scroll-bar");
    if (!bar) return;
    window.addEventListener("scroll", function () {
      var pct = scrollY / (document.body.scrollHeight - innerHeight) * 100;
      bar.style.width = Math.min(pct, 100) + "%";
    }, { passive: true });
  }

  /* ─── 4. NAVBAR ───────────────────────────────────────────── */
  function initNav() {
    var nav     = $("#navbar");
    var ham     = $(".nav-hamburger");
    var mobile  = $("#nav-mobile");
    if (!nav) return;

    /* Solidificar al scroll */
    function onScroll() {
      if (scrollY > 80) {
        nav.classList.add("nav-scrolled");
      } else {
        nav.classList.remove("nav-scrolled");
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    /* Hamburger → abrir/cerrar móvil */
    if (ham && mobile) {
      ham.addEventListener("click", function () {
        var isOpen = ham.classList.toggle("is-open");
        ham.setAttribute("aria-expanded", isOpen);
        if (isOpen) {
          mobile.removeAttribute("hidden");
        } else {
          mobile.setAttribute("hidden", "");
        }
      });

      /* Cerrar al clickear un link del menú móvil */
      $$(".nav-mobile-link").forEach(function (link) {
        link.addEventListener("click", function () {
          ham.classList.remove("is-open");
          ham.setAttribute("aria-expanded", "false");
          mobile.setAttribute("hidden", "");
        });
      });
    }
  }

  /* ─── 5. CURSOR PERSONALIZADO ─────────────────────────────── */
  function initCursor() {
    if (!fineHover) return;
    var dot  = $(".cursor-dot");
    var ring = $(".cursor-ring");
    if (!dot || !ring) return;

    var rx = 0, ry = 0, firstMove = false;
    var rafId;

    function animateRing() {
      ring.style.left = rx + "px";
      ring.style.top  = ry + "px";
      rafId = requestAnimationFrame(animateRing);
    }

    window.addEventListener("mousemove", function (e) {
      dot.style.left = e.clientX + "px";
      dot.style.top  = e.clientY + "px";

      /* Lerp de ring hacia cursor */
      rx += (e.clientX - rx) * 0.15;
      ry += (e.clientY - ry) * 0.15;

      if (!firstMove) {
        firstMove = true;
        rx = e.clientX; ry = e.clientY;
        dot.classList.add("is-ready");
        ring.classList.add("is-ready");
        animateRing();
      }
    });

    /* Hover en elementos interactivos */
    var HOVERABLES = "a, button, .service-card, .prestacion-item, .testimonial-card, .pilar-item, input, textarea, select";
    document.addEventListener("mouseover", function (e) {
      if (e.target.closest(HOVERABLES)) ring.classList.add("is-hover");
    });
    document.addEventListener("mouseout", function (e) {
      if (e.target.closest(HOVERABLES)) ring.classList.remove("is-hover");
    });
  }

  /* ─── 6. WORD REVEAL para H2 (los H1 se manejan en heroEntrance) ── */
  function initWordReveal() {
    $$("h2").forEach(function (el) {
      if ("noReveal" in el.dataset || el.querySelector(".word-inner")) return;

      /* Wrap cada palabra */
      var html = el.innerHTML.split(/(\s+)/).map(function (chunk) {
        if (/^\s+$/.test(chunk)) return chunk;
        if (chunk.trim() === "") return "";
        return '<span class="word" style="display:inline-block;overflow:hidden;">' +
               '<span class="word-inner" style="display:inline-block;transform:translateY(70px);opacity:0;">' +
               chunk + '</span></span>';
      }).join("");
      el.innerHTML = html;

      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          el.querySelectorAll(".word-inner").forEach(function (w, i) {
            w.style.transition = "transform 0.75s cubic-bezier(0.16,1,0.3,1) " + (i * 0.08) + "s, opacity 0.6s ease " + (i * 0.08) + "s";
            w.style.transform  = "translateY(0)";
            w.style.opacity    = "1";
          });
          io.disconnect();
        });
      }, { threshold: 0.05 });
      io.observe(el);
    });

    /* También el H1 del hero: splitear palabras para animación de entrada */
    var heroH1 = $(".hero-title");
    if (heroH1 && !heroH1.querySelector(".word-inner")) {
      heroH1.innerHTML = heroH1.innerHTML.split(/(\s+)/).map(function (chunk) {
        if (/^\s+$/.test(chunk) || chunk === "<br>") return chunk;
        if (chunk.trim() === "") return "";
        return '<span class="word" style="display:inline-block;overflow:hidden;">' +
               '<span class="word-inner">' + chunk + '</span></span>';
      }).join("");
    }
  }

  /* ─── 7. CARD STAGGER ENTRANCE ────────────────────────────── */
  function initCardEntrance() {
    var cards = $$(".service-card, .prestacion-item");
    cards.forEach(function (card, i) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          var delay = (i % 4) * 80;
          setTimeout(function () {
            card.style.transition = "opacity 0.6s ease, transform 0.6s cubic-bezier(0.16,1,0.3,1), border-color 0.3s, box-shadow 0.3s";
            card.style.opacity    = "1";
            card.style.transform  = "translateY(0)";
          }, delay);
          io.disconnect();
        });
      }, { threshold: 0.05 });
      io.observe(card);
    });
  }

  /* ─── 8. COUNT-UP CON GSAP ────────────────────────────────── */
  function initCountUp() {
    var counters = $$(".stat-count[data-count]");
    counters.forEach(function (el) {
      var target = parseFloat(el.dataset.count);
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          if (window.gsap) {
            var obj = { val: 0 };
            gsap.to(obj, {
              val: target, duration: 2, ease: "power2.out",
              snap: { val: 1 },
              onUpdate: function () {
                el.textContent = Math.round(obj.val);
              }
            });
          } else {
            /* Fallback sin GSAP */
            var start = 0, dur = 1800;
            var startTime = null;
            function step(ts) {
              if (!startTime) startTime = ts;
              var prog = Math.min((ts - startTime) / dur, 1);
              el.textContent = Math.round(prog * target);
              if (prog < 1) requestAnimationFrame(step);
            }
            requestAnimationFrame(step);
          }
          io.disconnect();
        });
      }, { threshold: 0.1 });
      io.observe(el);
    });
  }

  /* ─── 9. CLIP-PATH REVEAL (Quiénes Somos imagen) ─────────── */
  function initClipReveal() {
    $$("[data-clip-reveal]").forEach(function (el) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          el.classList.add("is-revealed");
          io.disconnect();
        });
      }, { threshold: 0.05 });
      io.observe(el);
    });
  }

  /* ─── 10. SCROLL NATIVO (Lenis desactivado — delay en Windows) ── */
  function initLenis() {
    document.documentElement.style.scrollBehavior = "smooth";
    if (window.gsap && window.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
    }
    document.addEventListener("click", function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute("href");
      if (!id || id === "#") return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--nav-h")) || 130;
      window.scrollTo({
        top: target.getBoundingClientRect().top + scrollY - navH,
        behavior: "smooth"
      });
    });
  }

  /* ─── 11. CARRUSEL DE TESTIMONIOS ────────────────────────── */
  function initCarousel() {
    var carousel  = $("#testimonios-carousel");
    var dotsWrap  = $("#carousel-dots");
    var prevBtn   = $("#carousel-prev");
    var nextBtn   = $("#carousel-next");
    if (!carousel) return;

    var cards     = $$(".testimonial-card", carousel);
    var total     = cards.length;
    var current   = 0;
    var autoTimer = null;
    var isDesktop = window.innerWidth >= 960;

    function isMobileView() { return window.innerWidth < 960; }

    /* Crear dots */
    if (dotsWrap) {
      cards.forEach(function (_, i) {
        var dot = document.createElement("button");
        dot.className = "carousel-dot" + (i === 0 ? " is-active" : "");
        dot.setAttribute("aria-label", "Testimonio " + (i + 1));
        dot.setAttribute("role", "tab");
        dot.addEventListener("click", function () { goTo(i); });
        dotsWrap.appendChild(dot);
      });
    }

    function updateDots() {
      $$(".carousel-dot", dotsWrap).forEach(function (d, i) {
        d.classList.toggle("is-active", i === current);
      });
    }

    function showCard(idx) {
      if (!isMobileView()) {
        /* Desktop: todos visibles en grid */
        cards.forEach(function (c) { c.removeAttribute("style"); c.style.display = ""; });
        return;
      }
      /* Mobile/tablet: mostrar solo el activo */
      cards.forEach(function (c, i) {
        c.classList.toggle("is-active", i === idx);
      });
    }

    function goTo(idx) {
      current = (idx + total) % total;
      showCard(current);
      updateDots();
    }

    function autoPlay() {
      clearInterval(autoTimer);
      autoTimer = setInterval(function () { goTo(current + 1); }, 4500);
    }

    showCard(0);
    updateDots();
    autoPlay();

    if (prevBtn) prevBtn.addEventListener("click", function () { goTo(current - 1); autoPlay(); });
    if (nextBtn) nextBtn.addEventListener("click", function () { goTo(current + 1); autoPlay(); });

    /* Pausar en hover */
    carousel.addEventListener("mouseenter", function () { clearInterval(autoTimer); });
    carousel.addEventListener("mouseleave", autoPlay);

    /* Touch swipe */
    var startX = 0;
    carousel.addEventListener("touchstart", function (e) { startX = e.touches[0].clientX; }, { passive: true });
    carousel.addEventListener("touchend", function (e) {
      var dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 50) { goTo(current + (dx < 0 ? 1 : -1)); autoPlay(); }
    }, { passive: true });

    /* Ajustar en resize */
    window.addEventListener("resize", function () {
      showCard(current);
    }, { passive: true });
  }

  /* ─── 12. FORMULARIO DE CONTACTO ─────────────────────────── */
  function initForm() {
    var form    = $("#contact-form");
    var btn     = $("#form-submit-btn");
    var success = $("#form-success");
    if (!form) return;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;

      /* Estado enviando */
      btn.disabled = true;
      btn.textContent = "ENVIANDO…";

      /* Simular envío (el cliente conectará su backend / Formspree / etc.) */
      setTimeout(function () {
        btn.style.display = "none";
        if (success) {
          success.removeAttribute("hidden");
          success.style.display = "flex";
        }
        form.reset();
      }, 1400);
    });
  }

  /* ─── 13. WHATSAPP FAB ────────────────────────────────────── */
  function showWhatsApp() {
    var fab = $("#whatsapp-fab");
    if (fab) fab.classList.add("is-visible");
  }

  /* ─── 14. SCROLL TO TOP ───────────────────────────────────── */
  function initScrollTop() {
    var btn = $("#scroll-top");
    if (!btn) return;

    window.addEventListener("scroll", function () {
      var vis = scrollY > 400;
      if (vis) {
        btn.removeAttribute("hidden");
        requestAnimationFrame(function () { btn.classList.add("is-visible"); });
      } else {
        btn.classList.remove("is-visible");
        setTimeout(function () { if (scrollY <= 400) btn.setAttribute("hidden", ""); }, 300);
      }
    }, { passive: true });

    btn.addEventListener("click", function () {
      if (window.__lenis) {
        window.__lenis.scrollTo(0, { duration: 1.2 });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  }

  /* ─── 15. SAFETY NET 6s — revela cualquier elemento oculto ── */
  function initSafetyNet() {
    setTimeout(function () {
      $$(".word-inner, .service-card, .prestacion-item, [data-clip-reveal], .hero-eyebrow, .hero-sub, .hero-actions").forEach(function (el) {
        el.style.opacity    = "1";
        el.style.transform  = "none";
        el.style.clipPath   = "none";
        el.style.transition = "none";
      });
      /* Forzar clip-reveal */
      $$("[data-clip-reveal]").forEach(function (el) {
        el.classList.add("is-revealed");
      });
    }, 6000);
  }

  /* ─── BOOT ────────────────────────────────────────────────── */
  function boot() {
    /* Efectos que no dependen de GSAP */
    safe(initWordReveal,  "initWordReveal");   /* ← antes que splash para tener words en DOM */
    safe(initSplash,      "initSplash");
    safe(initScrollBar,   "initScrollBar");
    safe(initNav,         "initNav");
    /* initCursor desactivado */
    safe(initCardEntrance,"initCardEntrance");
    safe(initClipReveal,  "initClipReveal");
    safe(initCarousel,    "initCarousel");
    safe(initForm,        "initForm");
    safe(initScrollTop,   "initScrollTop");
    safe(initSafetyNet,   "initSafetyNet");

    /* Efectos GSAP-dependientes */
    if (window.gsap) {
      safe(initCountUp, "initCountUp");
    } else {
      /* Fallback count-up sin GSAP */
      safe(initCountUp, "initCountUp-fallback");
    }

    /* Lenis siempre en try/catch propio */
    safe(initLenis, "initLenis");

    document.documentElement.classList.add("is-ready");
  }

  /* Esperar a que el DOM esté listo */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

})();
