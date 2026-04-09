/* ═══════════════════════════════════════════════
   BHASHKAR · main.js
   Features:
   1. Volatility cursor trail (time-series shock aesthetic)
   2. Typing animation on hero tagline
   3. Scroll-reveal (fade-in-up)
   4. Parallax hero texture
   5. Navbar scroll state
   6. Abstract toggles
   7. Mobile menu
═══════════════════════════════════════════════ */

(function () {
  "use strict";

  /* ── 1. VOLATILITY CURSOR TRAIL ────────────────
     Sinusoidal particle trail that mimics a
     financial time-series / volatility cluster.
     Particles: burst of small dots that fade and
     oscillate perpendicular to mouse direction.
  ─────────────────────────────────────────────── */
  const canvas = document.getElementById("cursorCanvas");
  const ctx    = canvas.getContext("2d");

  let W = window.innerWidth;
  let H = window.innerHeight;
  canvas.width  = W;
  canvas.height = H;

  window.addEventListener("resize", () => {
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width  = W;
    canvas.height = H;
  });

  // Mouse position
  let mx = W / 2, my = H / 2;
  let prevMx = mx, prevMy = my;
  let speed = 0;

  window.addEventListener("mousemove", (e) => {
    prevMx = mx; prevMy = my;
    mx = e.clientX; my = e.clientY;
    const dx = mx - prevMx, dy = my - prevMy;
    speed = Math.sqrt(dx * dx + dy * dy);
  });

  // Particle pool
  const particles = [];

  class Particle {
    constructor(x, y, vx, vy, speed) {
      this.x    = x;
      this.y    = y;
      this.vx   = vx + (Math.random() - 0.5) * 1.5;
      this.vy   = vy + (Math.random() - 0.5) * 1.5;

      // Phase offset for sinusoidal perpendicular drift
      this.phase    = Math.random() * Math.PI * 2;
      this.amp      = (0.4 + Math.random() * 0.8) * Math.min(speed * 0.18, 6);
      this.freq     = 0.09 + Math.random() * 0.08;

      // Visual
      const t = Math.random();
      // Interpolate burgundy → gold
      this.r    = Math.round(107 + t * (201 - 107));
      this.g    = Math.round(30  + t * (150 - 30));
      this.b    = Math.round(46  + t * (58  - 46));

      this.alpha  = 0.55 + Math.random() * 0.35;
      this.size   = 1.5 + Math.random() * 2.5;
      this.decay  = 0.025 + Math.random() * 0.025;
      this.life   = 1;

      // Perpendicular axis (normal to velocity)
      const len = Math.sqrt(vx * vx + vy * vy) || 1;
      this.nx = -vy / len;
      this.ny =  vx / len;

      this.tick = 0;
    }

    update() {
      this.tick++;
      this.phase += this.freq;

      // Sinusoidal drift perpendicular to original direction
      const osc   = Math.sin(this.phase) * this.amp;
      const decay = Math.exp(-this.tick * 0.04); // amplitude decays over time

      this.x += this.vx * 0.7 + this.nx * osc * decay;
      this.y += this.vy * 0.7 + this.ny * osc * decay;

      this.life  -= this.decay;
      this.alpha *= 0.96;
      this.vx    *= 0.92;
      this.vy    *= 0.92;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * this.life, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.r},${this.g},${this.b},${this.alpha * this.life})`;
      ctx.fill();
    }

    isDead() { return this.life <= 0.01; }
  }

  // Spawn particles on mouse move
  let lastSpawn = 0;
  window.addEventListener("mousemove", (e) => {
    const now = performance.now();
    if (now - lastSpawn < 18) return; // throttle ~55fps
    lastSpawn = now;

    const dx = mx - prevMx, dy = my - prevMy;
    const count = Math.min(2 + Math.floor(speed * 0.25), 7);

    for (let i = 0; i < count; i++) {
      particles.push(new Particle(e.clientX, e.clientY, dx * 0.3, dy * 0.3, speed));
    }
  });

  // Dot cursor
  function drawCursor() {
    ctx.beginPath();
    ctx.arc(mx, my, 4, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(107,30,46,0.85)";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(mx, my, 10, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(107,30,46,0.25)";
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  function animateCursor() {
    ctx.clearRect(0, 0, W, H);

    for (let i = particles.length - 1; i >= 0; i--) {
      particles[i].update();
      particles[i].draw();
      if (particles[i].isDead()) particles.splice(i, 1);
    }

    drawCursor();
    requestAnimationFrame(animateCursor);
  }
  animateCursor();


  /* ── 2. TYPING ANIMATION ────────────────────────
     Cycles through research themes in italic.
  ─────────────────────────────────────────────── */
  const phrases = [
    "monetary transmission mechanisms",
    "financial frictions in emerging markets",
    "central bank communication & markets",
    "DSGE models with credit constraints",
    "fiscal-monetary policy interactions",
  ];

  const typedEl   = document.getElementById("typedText");
  let   pIdx      = 0;
  let   cIdx      = 0;
  let   deleting  = false;
  let   paused    = false;

  function typeLoop() {
    if (!typedEl) return;
    const current = phrases[pIdx];

    if (paused) {
      setTimeout(typeLoop, 1800);
      paused = false;
      return;
    }

    if (!deleting) {
      typedEl.textContent = current.slice(0, ++cIdx);
      if (cIdx === current.length) {
        paused    = true;
        deleting  = true;
        setTimeout(typeLoop, 1800);
        return;
      }
      setTimeout(typeLoop, 48);
    } else {
      typedEl.textContent = current.slice(0, --cIdx);
      if (cIdx === 0) {
        deleting = false;
        pIdx = (pIdx + 1) % phrases.length;
        setTimeout(typeLoop, 400);
        return;
      }
      setTimeout(typeLoop, 28);
    }
  }
  setTimeout(typeLoop, 1200);


  /* ── 3. SCROLL REVEAL ───────────────────────────
     IntersectionObserver adds .visible class.
  ─────────────────────────────────────────────── */
  const revealEls = document.querySelectorAll(".reveal, .fade-in-up");

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -48px 0px" }
  );

  revealEls.forEach((el) => revealObserver.observe(el));

  // Stagger sibling reveals inside sections
  document.querySelectorAll(".paper-list, .teaching-grid").forEach((parent) => {
    const children = parent.querySelectorAll(".reveal");
    children.forEach((child, i) => {
      child.style.transitionDelay = `${i * 0.1}s`;
    });
  });


  /* ── 4. PARALLAX HERO ───────────────────────────
     Gentle vertical shift on the texture overlay.
  ─────────────────────────────────────────────── */
  const heroTexture = document.querySelector(".hero-texture");

  window.addEventListener("scroll", () => {
    if (!heroTexture) return;
    const scrollY = window.scrollY;
    heroTexture.style.transform = `translateY(${scrollY * 0.25}px)`;
  }, { passive: true });


  /* ── 5. NAVBAR SCROLL STATE ─────────────────────
  ─────────────────────────────────────────────── */
  const navbar = document.getElementById("navbar");

  window.addEventListener("scroll", () => {
    navbar.classList.toggle("scrolled", window.scrollY > 60);
  }, { passive: true });


  /* ── 6. ABSTRACT TOGGLES ────────────────────────
  ─────────────────────────────────────────────── */
  document.querySelectorAll(".abstract-toggle").forEach((btn) => {
    btn.addEventListener("click", () => {
      const expanded = btn.getAttribute("aria-expanded") === "true";
      const body     = btn.nextElementSibling;

      btn.setAttribute("aria-expanded", String(!expanded));

      if (expanded) {
        body.hidden = true;
      } else {
        body.hidden = false;
      }
    });
  });


  /* ── 7. MOBILE MENU ─────────────────────────────
  ─────────────────────────────────────────────── */
  const navToggle  = document.getElementById("navToggle");
  const mobileMenu = document.getElementById("mobileMenu");

  navToggle.addEventListener("click", () => {
    const open = mobileMenu.classList.toggle("open");
    navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    // animate hamburger → X
    const spans = navToggle.querySelectorAll("span");
    if (open) {
      spans[0].style.transform = "translateY(6.5px) rotate(45deg)";
      spans[1].style.opacity   = "0";
      spans[2].style.transform = "translateY(-6.5px) rotate(-45deg)";
    } else {
      spans[0].style.transform = "";
      spans[1].style.opacity   = "";
      spans[2].style.transform = "";
    }
  });

  // Close mobile menu on link click
  document.querySelectorAll(".mob-link").forEach((link) => {
    link.addEventListener("click", () => {
      mobileMenu.classList.remove("open");
      const spans = navToggle.querySelectorAll("span");
      spans[0].style.transform = "";
      spans[1].style.opacity   = "";
      spans[2].style.transform = "";
    });
  });

  // Close on outside click
  document.addEventListener("click", (e) => {
    if (!mobileMenu.contains(e.target) && !navToggle.contains(e.target)) {
      mobileMenu.classList.remove("open");
    }
  });


  /* ── 8. ACTIVE NAV LINK ON SCROLL ──────────────
  ─────────────────────────────────────────────── */
  const sections = document.querySelectorAll("section[id], footer[id]");
  const navLinks = document.querySelectorAll(".nav-link");

  const activeObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach((link) => {
            link.classList.toggle(
              "active",
              link.getAttribute("href") === `#${id}`
            );
          });
        }
      });
    },
    { threshold: 0.4 }
  );

  sections.forEach((s) => activeObserver.observe(s));

})();
