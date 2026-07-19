/* Shri Radhe Krishan Mehandi — interactions */
(function () {
  "use strict";

  var body = document.body;
  var loader = document.getElementById("loader");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ── Loader: hand finishes drawing (~4.8s), then reveal site.
     Subpages have no loader — they reveal immediately. ── */
  function finishLoader() {
    if (body.classList.contains("loaded")) return;
    if (loader) loader.classList.add("done");
    body.classList.remove("locked");
    body.classList.add("loaded");
  }

  if (loader) {
    body.classList.add("locked");
    var loaderTimer = setTimeout(finishLoader, reduceMotion ? 300 : 5300);
    document.getElementById("loaderSkip").addEventListener("click", function () {
      clearTimeout(loaderTimer);
      finishLoader();
    });
  } else {
    body.classList.add("loaded");
  }

  /* ── Nav: scrolled state + mobile menu ── */
  var nav = document.getElementById("nav");
  var navLinks = document.getElementById("navLinks");
  var navToggle = document.getElementById("navToggle");

  window.addEventListener("scroll", function () {
    nav.classList.toggle("scrolled", window.scrollY > 40);
  }, { passive: true });

  navToggle.addEventListener("click", function () {
    navToggle.classList.toggle("open");
    navLinks.classList.toggle("open");
  });
  navLinks.addEventListener("click", function (e) {
    if (e.target.tagName === "A") {
      navToggle.classList.remove("open");
      navLinks.classList.remove("open");
    }
  });

  /* ── Scroll reveals (staggered per section) ── */
  var revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("in");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

  // stagger siblings that reveal together
  var groups = {};
  document.querySelectorAll(".reveal").forEach(function (el) {
    var parent = el.parentElement;
    var key = parent ? parent.className : "";
    groups[key] = (groups[key] || 0) + 1;
    el.style.setProperty("--r", ((groups[key] - 1) % 6) * 0.12 + "s");
    revealObserver.observe(el);
  });

  /* ── Draw-on-scroll SVG ornaments ── */
  var drawObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("in");
        drawObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.35 });
  document.querySelectorAll(".draw-on-scroll").forEach(function (el) {
    drawObserver.observe(el);
  });

  /* ── Animated counters ── */
  function formatCount(el, value) {
    return el.hasAttribute("data-plain") ? String(value) : value.toLocaleString("en-US");
  }
  function animateCount(el) {
    var target = parseInt(el.getAttribute("data-count"), 10);
    var duration = 1900;
    var start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 4);
      el.textContent = formatCount(el, Math.round(target * eased));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var countObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        countObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.6 });
  document.querySelectorAll(".count").forEach(function (el) {
    if (reduceMotion) {
      el.textContent = formatCount(el, parseInt(el.getAttribute("data-count"), 10));
    } else {
      countObserver.observe(el);
    }
  });

  /* ── 3D tilt on service cards ── */
  if (!reduceMotion && window.matchMedia("(hover: hover)").matches) {
    document.querySelectorAll(".tilt").forEach(function (card) {
      card.addEventListener("mousemove", function (e) {
        var r = card.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform =
          "perspective(800px) rotateY(" + (x * 7) + "deg) rotateX(" + (-y * 7) + "deg) translateY(-4px)";
      });
      card.addEventListener("mouseleave", function () {
        card.style.transform = "";
      });
    });
  }

  /* ── Henna-dot cursor ── */
  if (!reduceMotion && window.matchMedia("(hover: hover)").matches) {
    var dot = document.getElementById("cursorDot");
    var cx = -100, cy = -100, tx = -100, ty = -100;
    window.addEventListener("mousemove", function (e) {
      tx = e.clientX; ty = e.clientY;
      body.classList.add("has-cursor");
    }, { passive: true });
    (function loop() {
      cx += (tx - cx) * 0.18;
      cy += (ty - cy) * 0.18;
      dot.style.left = cx + "px";
      dot.style.top = cy + "px";
      requestAnimationFrame(loop);
    })();
    document.querySelectorAll("a, button, .g-tile").forEach(function (el) {
      el.addEventListener("mouseenter", function () { dot.classList.add("grow"); });
      el.addEventListener("mouseleave", function () { dot.classList.remove("grow"); });
    });
  }

  /* ── Gentle parallax on hero mandala & motifs ── */
  var mandala = document.querySelector(".hero-mandala");
  var motifs = document.querySelector(".hero-motifs");
  if (!reduceMotion && mandala && motifs) {
    window.addEventListener("scroll", function () {
      var y = window.scrollY;
      if (y < window.innerHeight) {
        mandala.style.transform = "translateY(" + y * 0.18 + "px)";
        motifs.style.transform = "translateY(" + y * 0.1 + "px)";
      }
    }, { passive: true });
  }

  /* ── Gallery filters + lightbox (gallery page) ── */
  var filterBtns = document.querySelectorAll(".g-filter");
  var galleryItems = document.querySelectorAll(".gx-item");
  filterBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      filterBtns.forEach(function (b) { b.classList.remove("active"); });
      btn.classList.add("active");
      var cat = btn.getAttribute("data-filter");
      galleryItems.forEach(function (item) {
        var show = cat === "all" || item.getAttribute("data-cat") === cat;
        item.classList.toggle("hidden", !show);
      });
    });
  });

  var lightbox = document.getElementById("lightbox");
  if (lightbox) {
    var lbContent = lightbox.querySelector(".lb-content");
    var openLightbox = function (item) {
      lbContent.innerHTML = "";
      var vid = item.querySelector("video");
      if (vid) {
        var v = document.createElement("video");
        v.src = vid.querySelector("source").src;
        v.controls = true; v.autoplay = true; v.playsInline = true;
        lbContent.appendChild(v);
      } else {
        var img = item.querySelector("img");
        var big = document.createElement("img");
        big.src = img.src; big.alt = img.alt;
        lbContent.appendChild(big);
      }
      var cap = item.getAttribute("data-label");
      if (cap) {
        var p = document.createElement("p");
        p.textContent = cap;
        lbContent.appendChild(p);
      }
      lightbox.classList.add("open");
      body.classList.add("locked");
    };
    var closeLightbox = function () {
      lightbox.classList.remove("open");
      body.classList.remove("locked");
      lbContent.innerHTML = "";
    };
    galleryItems.forEach(function (item) {
      item.addEventListener("click", function () { openLightbox(item); });
    });
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox || e.target.classList.contains("lb-close")) closeLightbox();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeLightbox();
    });
  }

  /* ── Admission form → WhatsApp ── */
  var admForm = document.getElementById("admissionForm");
  if (admForm) {
    admForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = document.getElementById("admName").value.trim();
      var phone = document.getElementById("admPhone").value.trim();
      var errEl = document.getElementById("admError");
      var sentEl = document.getElementById("admSent");
      if (!name || !phone) {
        errEl.hidden = false;
        sentEl.hidden = true;
        return;
      }
      errEl.hidden = true;
      var course = document.getElementById("admCourse").value;
      var batch = document.getElementById("admBatch").value;
      var msg = document.getElementById("admMsg").value.trim();
      var text =
        "Namaste! 🙏 New admission enquiry from the website:\n\n" +
        "👤 Name: " + name + "\n" +
        "📱 WhatsApp: " + phone + "\n" +
        "📚 Course: " + course + "\n" +
        "🕐 Preferred batch: " + batch +
        (msg ? "\n📝 Note: " + msg : "");
      sentEl.hidden = false;
      window.open("https://wa.me/9779845516077?text=" + encodeURIComponent(text), "_blank", "noopener");
    });
  }

  /* ── FAQ: one open at a time ── */
  var faqItems = document.querySelectorAll(".faq-item");
  faqItems.forEach(function (item) {
    item.addEventListener("toggle", function () {
      if (item.open) {
        faqItems.forEach(function (other) {
          if (other !== item) other.open = false;
        });
      }
    });
  });

  /* ── Footer year ── */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
