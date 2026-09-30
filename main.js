/* ==========================================================================
   Apostrophe: shared behaviour
   Smooth scroll, header, menu, cursor, page transitions and scroll reveals.
   Only transform + opacity are animated so motion stays smooth on phones.
   ========================================================================== */
(() => {
  const D = window.APOS;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const FINE = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const page = document.body.dataset.page;
  if (RM) document.documentElement.classList.add("rm");

  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });

  const ARROW = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M3 13 13 3M5 3h8v8"/></svg>';
  const MARK = (cls = "") => `<svg class="${cls}" viewBox="350 380 800 768" aria-hidden="true"><path fill="currentColor" d="M728 387H878C852 397 826 427 807 460L563 1040C541 1092 500 1141 418 1141H357L643 460C662 416 690 388 728 387Z"/><path fill="currentColor" d="M808 728H962L1143 1141H1083C1003 1141 962 1094 940 1044L808 728Z"/><circle fill="#E4A524" cx="827.5" cy="766" r="140"/></svg>`;
  const IG = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8" fill="currentColor"/></svg>';
  const LI = '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.75h4v11H3v-11Zm6.5 0h3.8v1.5h.06c.53-1 1.83-2.06 3.77-2.06 4.03 0 4.77 2.65 4.77 6.1v5.46h-4v-4.84c0-1.16-.02-2.64-1.61-2.64-1.61 0-1.86 1.26-1.86 2.56v4.92h-4v-11Z"/></svg>';

  const NAV = [
    ["Home", "index.html", "home"],
    ["Projects", "projects.html", "projects"],
    ["About", "about.html", "about"],
    ["Contact", "contact.html", "contact"],
  ];

  /* ---------- helpers exposed to page scripts ---------- */
  const esc = (s) => String(s).replace(/[&<>"]/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[m]));

  function initials(t) {
    return t.split(/\s+/).filter((w) => /^\p{L}/u.test(w)).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
  }
  function media(p, label = "Image placeholder") {
    if (p.image) return `<div class="media"><img src="${esc(p.image)}" alt="${esc(p.title)}" loading="lazy" decoding="async"></div>`;
    return `<div class="ph tone-${p.tone ?? 0}" aria-hidden="true"><span class="ph__mono">${esc(initials(p.title))}</span><span class="ph__tag">${label}</span></div>`;
  }

  /* A brand logo drawn as a mask so it takes the text colour of whatever it sits on.
     Sized by area (not height) so wide wordmarks and tall badges feel equally heavy. */
  function logo(b) {
    if (!b.logo) return `<span class="lg lg--txt">${esc(b.name)}</span>`;
    const ar = b.w / b.h;
    const w = Math.min(Math.sqrt(ar) * 1.0, 3.4), h = w / ar;
    return `<span class="lg" role="img" aria-label="${esc(b.name)}" style="--lw:${w.toFixed(3)};--lh:${h.toFixed(3)};--src:url('${esc(b.logo)}')"></span>`;
  }

  /* Split an element's text into masked words (and optionally chars). */
  function split(el, chars = false) {
    if (el.dataset.splitDone) return $$(chars ? ".c" : ".w > span", el);
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) return frag.appendChild(document.createTextNode(" "));
            const w = document.createElement("span");
            w.className = "w";
            const inner = document.createElement("span");
            if (chars) inner.innerHTML = [...part].map((c) => `<span class="c">${c}</span>`).join("");
            else inner.textContent = part;
            w.appendChild(inner);
            frag.appendChild(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && !n.classList.contains("w")) walk(n);
      });
    };
    walk(el);
    el.dataset.splitDone = 1;
    return $$(chars ? ".c" : ".w > span", el);
  }

  /* ---------- shared chrome ---------- */
  function buildChrome() {
    const c = D.contact;
    document.body.insertAdjacentHTML(
      "afterbegin",
      `<a class="skip" href="#main">Skip to content</a>
      <header class="hdr" id="hdr">
        <a class="hdr__logo" href="index.html" aria-label="Apostrophe Communications home page">${MARK()}</a>
        <a class="hdr__name" href="index.html">Apostrophe Communications</a>
        <button class="hdr__toggle" id="menuBtn" aria-label="Open menu" aria-expanded="false" aria-controls="menu"><em class="hdr__label" aria-hidden="true">Menu</em><span aria-hidden="true">’</span></button>
      </header>
      <nav class="menu" id="menu" aria-label="Main">
        <div class="menu__nav"><ul>${NAV.map(([t, h, id]) => `<li><a href="${h}" class="${id === page ? "is-current" : ""}"><span>${t}</span></a></li>`).join("")}</ul></div>
        <div class="menu__foot">
          <div class="menu__social"><a class="link-u" href="${c.instagram}">Instagram</a><a class="link-u" href="${c.linkedin}">LinkedIn</a></div>
          <div class="menu__offices"><em>Partner offices</em>${D.offices.map((o) => `<span>${o}</span>`).join("")}</div>
        </div>
      </nav>
      <div class="cursor" id="cursor"><span>View</span></div>
      <div class="pt" id="pt"><div class="pt__dot"></div></div>`
    );

    const foot = $("#footer");
    if (foot) {
      foot.innerHTML = `
      <section class="s t-stone foot-cta" data-theme="light">
        <div class="wrap">
          <small data-reveal>Have a project in mind?</small>
          <h2 data-split>Let’s work together</h2>
          <a class="btn" href="contact.html" data-reveal>Get in touch <span class="arr">${ARROW}</span></a>
        </div>
      </section>
      <footer class="s t-dark foot-bar" data-theme="dark">
        <div class="wrap">
          <div class="foot-bar__top">
            <div><img class="foot-bar__logo" src="logo-full-white.png?v=20260930150635" alt="Apostrophe Communications" width="150" height="102" loading="lazy"></div>
            <div><h4>Explore</h4><ul>${NAV.map(([t, h]) => `<li><a class="link-u" href="${h}">${t}</a></li>`).join("")}</ul></div>
            <div><h4>Say hello</h4><ul><li><a class="link-u" href="mailto:${c.email}">${c.email}</a></li><li>${c.phone}</li><li>${c.address}</li></ul></div>
            <div><h4>Follow</h4><ul><li><a class="link-u" href="${c.instagram}">Instagram</a></li><li><a class="link-u" href="${c.linkedin}">LinkedIn</a></li></ul></div>
          </div>
          <div class="foot-bar__bottom"><span>© ${new Date().getFullYear()} Apostrophe Communications</span><span>Partner offices: ${D.offices.join(" · ")}</span></div>
        </div>
      </footer>`;
    }
  }

  /* ---------- smooth scroll ---------- */
  let lenis = null;
  function initScroll() {
    if (RM || typeof Lenis === "undefined") return;
    lenis = new Lenis({
      lerp: 0.1, wheelMultiplier: 1, smoothWheel: true, syncTouch: false,
      // sideways swipes over a horizontal gallery belong to the gallery, not the page
      virtualScroll: ({ event, deltaX, deltaY }) =>
        !(event.target.closest && event.target.closest(".work__track") && Math.abs(deltaX) > Math.abs(deltaY)),
    });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  /* ---------- header: theme follows the section underneath ---------- */
  function initHeader() {
    const hdr = $("#hdr");
    $$("[data-theme]").forEach((sec) => {
      ScrollTrigger.create({
        trigger: sec,
        start: () => `top ${hdr.offsetHeight / 2}`,
        end: () => `bottom ${hdr.offsetHeight / 2}`,
        onToggle: (self) => self.isActive && hdr.classList.toggle("on-light", sec.dataset.theme === "light"),
      });
    });
    // hide on scroll down, show on scroll up
    let last = 0;
    ScrollTrigger.create({
      start: 0, end: "max",
      onUpdate: (self) => {
        const y = self.scroll();
        if (document.body.classList.contains("menu-open")) return;
        if (y > 200 && y > last + 4) hdr.classList.add("is-hidden");
        else if (y < last - 4 || y < 200) hdr.classList.remove("is-hidden");
        last = y;
      },
    });
  }

  /* ---------- menu ---------- */
  function initMenu() {
    const btn = $("#menuBtn"), menu = $("#menu");
    const links = $$(".menu__nav a > span", menu);
    const foot = $(".menu__foot", menu);
    let open = false;
    // circle grows out of the apostrophe button
    const origin = () => {
      const r = btn.getBoundingClientRect();
      return `${Math.round(r.left + r.width / 2)}px ${Math.round(r.top + r.height / 2)}px`;
    };
    let tl;
    const toggle = (state = !open) => {
      open = state;
      document.body.classList.toggle("menu-open", open);
      btn.setAttribute("aria-expanded", open);
      btn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      btn.querySelector(".hdr__label").textContent = open ? "Close" : "Menu";
      tl?.kill();
      const o = origin(), R = Math.hypot(innerWidth, innerHeight);
      const k = RM ? 0.01 : 1;
      if (open) {
        lenis?.stop();
        tl = gsap.timeline({ defaults: { ease: "expo.inOut" } })
          .set(menu, { visibility: "visible" })
          .fromTo(menu, { clipPath: `circle(0px at ${o})` }, { clipPath: `circle(${R}px at ${o})`, duration: 1.1 * k })
          .fromTo(links, { yPercent: 110 }, { yPercent: 0, duration: 0.9 * k, stagger: 0.06 * k, ease: "expo.out" }, 0.45 * k)
          .fromTo(foot, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.8 * k, ease: "power3.out" }, 0.7 * k);
      } else {
        lenis?.start();
        tl = gsap.timeline({ defaults: { ease: "expo.inOut" } })
          .to(links, { yPercent: -110, duration: 0.5 * k, stagger: 0.03 * k, ease: "power3.in" })
          .to(foot, { opacity: 0, duration: 0.3 * k }, 0)
          .to(menu, { clipPath: `circle(0px at ${o})`, duration: 0.8 * k }, 0.15 * k)
          .set(menu, { visibility: "hidden" });
      }
    };
    btn.addEventListener("click", () => toggle());
    addEventListener("keydown", (e) => e.key === "Escape" && open && toggle(false));
    $$("a", menu).forEach((a) => a.addEventListener("click", () => open && a.classList.contains("is-current") && toggle(false)));
  }

  /* ---------- cursor: the olive dot ---------- */
  function initCursor() {
    if (!FINE || RM) return;
    const cur = $("#cursor");
    // The dot is the only pointer, so it tracks tightly (no floaty lag).
    const xTo = gsap.quickTo(cur, "x", { duration: 0.12, ease: "power2" });
    const yTo = gsap.quickTo(cur, "y", { duration: 0.12, ease: "power2" });
    document.documentElement.classList.add("dot-cursor");
    let shown = false;
    addEventListener("pointermove", (e) => {
      if (!shown) { gsap.set(cur, { x: e.clientX, y: e.clientY }); gsap.to(cur, { opacity: 1, duration: 0.3 }); shown = true; }
      xTo(e.clientX); yTo(e.clientY);
    }, { passive: true });
    document.addEventListener("mouseleave", () => { gsap.to(cur, { opacity: 0, duration: 0.3 }); shown = false; });
    addEventListener("pointerdown", () => gsap.to(cur, { scale: "*=0.8", duration: 0.15, yoyo: true, repeat: 1, ease: "power2.out" }));
    const state = (s) => gsap.to(cur, { scale: s, duration: 0.45, ease: "expo.out", overwrite: "auto" });
    document.addEventListener("pointerover", (e) => {
      const t = e.target;
      const view = t.closest("[data-cursor]");
      const link = t.closest("a, button, label, [role=button]");
      const field = t.closest("input, textarea, select");
      // on yellow backgrounds the dot turns ink so it never disappears
      cur.classList.toggle("on-yellow", !!t.closest(".t-yellow, .btn--yellow, .hero__cta"));
      cur.classList.toggle("is-link", !!(link || view));
      if (link || view) { cur.classList.remove("has-label"); state(0.26); }
      else if (field) { cur.classList.remove("has-label"); state(0.09); }
      else { cur.classList.remove("has-label"); state(0.14); }
    });
  }

  /* ---------- page transitions ---------- */
  function initTransitions() {
    const pt = $("#pt");
    // Arriving from another page: lift the curtain.
    if (sessionStorage.getItem("apos-pt")) {
      sessionStorage.removeItem("apos-pt");
      pt.classList.add("is-cover");
      gsap.to(pt, { yPercent: -101, duration: 1, ease: "expo.inOut", delay: 0.1, onComplete: () => { pt.classList.remove("is-cover"); gsap.set(pt, { yPercent: 101 }); } });
      document.documentElement.classList.add("arrived");
    } else gsap.set(pt, { yPercent: 101 });

    document.addEventListener("click", (e) => {
      const a = e.target.closest("a");
      if (!a || RM || e.metaKey || e.ctrlKey || e.shiftKey || a.target === "_blank") return;
      const href = a.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:") || /^https?:/.test(href)) return;
      const url = new URL(href, location.href);
      if (url.pathname === location.pathname && url.search === location.search) { e.preventDefault(); return; }
      e.preventDefault();
      sessionStorage.setItem("apos-pt", 1);
      gsap.fromTo(pt, { yPercent: 101 }, { yPercent: 0, duration: 0.8, ease: "expo.inOut", onComplete: () => (location.href = url.href) });
    });
    // Back/forward cache: never show a stuck curtain.
    addEventListener("pageshow", (e) => e.persisted && gsap.set(pt, { yPercent: 101 }));
  }

  /* ---------- generic scroll reveals ---------- */
  function initReveals(scope = document) {
    if (RM) return;
    $$("[data-split]", scope).forEach((el) => {
      if (el.dataset.manual !== undefined) return;
      const words = split(el);
      gsap.to(words, {
        yPercent: 0, y: 0, duration: 1.2, ease: "expo.out", stagger: 0.045,
        startAt: { yPercent: 110 },
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
      });
    });
    $$("[data-reveal]", scope).forEach((el) => {
      gsap.to(el, { opacity: 1, y: 0, duration: 1.1, ease: "expo.out", delay: +(el.dataset.delay || 0), scrollTrigger: { trigger: el, start: "top 92%", once: true } });
    });
    $$("[data-parallax]", scope).forEach((el) => {
      const amt = +el.dataset.parallax || 12;
      gsap.fromTo(el, { yPercent: -amt }, { yPercent: amt, ease: "none", scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: true } });
    });
    $$("[data-count]", scope).forEach(countUp);
  }

  function countUp(el) {
    const end = parseFloat(el.dataset.count);
    const dec = (el.dataset.count.split(".")[1] || "").length;
    const out = el.querySelector("[data-num]") || el;
    if (RM) { out.textContent = end.toFixed(dec); return; }
    const o = { v: 0 };
    out.textContent = (0).toFixed(dec);
    gsap.to(o, {
      v: end, duration: 2, ease: "power3.out",
      onUpdate: () => (out.textContent = o.v.toFixed(dec)),
      scrollTrigger: { trigger: el, start: "top 88%", once: true },
    });
  }

  /* ---------- the glow: one soft orb that lives under the cursor ----------
     It stays with the pointer across the whole page; only its colour changes
     with the background underneath (crossfading between four layers).
     Touch devices: it floats gently near the middle of the screen.        */
  const GLOW_FOR = { dark: "blue", stone: "espresso", light: "honey", yellow: "butter" };
  function initGlow() {
    const g = document.createElement("div");
    g.className = "cglow";
    g.setAttribute("aria-hidden", "true");
    g.innerHTML = Object.values(GLOW_FOR).map((c) => `<i class="cglow--${c}"></i>`).join("");
    document.body.prepend(g);
    const layers = Object.fromEntries(Object.values(GLOW_FOR).map((c) => [c, g.querySelector(`.cglow--${c}`)]));

    let px = innerWidth * 0.5, py = innerHeight * 0.45, current = "";
    const tone = () => {
      g.style.visibility = "hidden";                       // look *through* the glow
      const el = document.elementFromPoint(Math.min(Math.max(px, 1), innerWidth - 1), Math.min(Math.max(py, 1), innerHeight - 1));
      g.style.visibility = "";
      const host = el && el.closest(".menu, .t-dark, .t-stone, .t-yellow, .t-light");
      const key = !host ? "light" : host.matches(".menu, .t-dark") ? "dark" : host.matches(".t-stone") ? "stone" : host.matches(".t-yellow") ? "yellow" : "light";
      const c = GLOW_FOR[key];
      if (c !== current) { current = c; for (const k in layers) layers[k].classList.toggle("on", k === c); }
    };
    let queued = false;
    const retone = () => { if (!queued) { queued = true; requestAnimationFrame(() => { queued = false; tone(); }); } };

    gsap.set(g, { x: px, y: py });
    if (!RM) gsap.fromTo(g, { scale: 0.92 }, { scale: 1.1, duration: 3.2, ease: "sine.inOut", yoyo: true, repeat: -1 });

    if (FINE && !RM) {
      const gx = gsap.quickTo(g, "x", { duration: 0.5, ease: "power3" });
      const gy = gsap.quickTo(g, "y", { duration: 0.5, ease: "power3" });
      addEventListener("pointermove", (e) => { px = e.clientX; py = e.clientY; gx(px); gy(py); retone(); }, { passive: true });
    } else if (!RM) {
      const o = { t: 0 };
      gsap.to(o, { t: 1, duration: 10, ease: "sine.inOut", yoyo: true, repeat: -1, onUpdate: () => {
        px = innerWidth * (0.3 + 0.4 * o.t); py = innerHeight * (0.35 + 0.25 * o.t);
        gsap.set(g, { x: px, y: py });
      } });
    }
    addEventListener("scroll", retone, { passive: true });
    lenis?.on("scroll", retone);
    document.addEventListener("click", () => setTimeout(retone, 50));     // e.g. menu opening
    setInterval(retone, 700);                                              // cheap safety for menu/page changes
    tone();
  }

  /* ---------- boot ---------- */
  buildChrome();
  initScroll();
  initMenu();
  initCursor();
  initTransitions();

  window.APOS_UI = { $, $$, RM, FINE, esc, media, logo, split, initReveals, countUp, ARROW, MARK, get lenis() { return lenis; } };

  // Page scripts register themselves on APOS_PAGE; run once fonts are ready so splits measure correctly.
  const ready = document.fonts ? document.fonts.ready : Promise.resolve();
  Promise.race([ready, new Promise((r) => setTimeout(r, 1500))]).then(() => {
    window.APOS_PAGE && window.APOS_PAGE();
    document.documentElement.classList.add("motion-ok");
    initGlow();
    initReveals();
    initHeader();
    ScrollTrigger.sort();
    ScrollTrigger.refresh();
  });
  addEventListener("load", () => ScrollTrigger.refresh());
})();
