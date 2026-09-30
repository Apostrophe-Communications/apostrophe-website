/* ==========================================================================
   Home page
   ========================================================================== */
window.APOS_PAGE = () => {
  const { $, $$, RM, FINE, esc, media, split, ARROW } = window.APOS_UI;
  const D = window.APOS;
  const W = () => innerWidth, H = () => innerHeight;
  const mobile = () => innerWidth < 900;

  /* ---------------- render ---------------- */
  $("#stats").innerHTML = D.stats.map((s, i) =>
    `<div data-reveal data-delay="${i * 0.08}"><span class="stat__n" data-count="${s.value}"><span data-num>${s.value}</span><sup>${s.suffix}</sup></span><span class="stat__l">${s.label}</span></div>`).join("");

  $("#wheelList").innerHTML = D.services.map((s) => `<li class="wheel__item">${esc(s)}</li>`).join("");
  $(".services__count em").textContent = `/ ${String(D.services.length).padStart(2, "0")}`;

  const featured = D.featured.map((slug) => D.projects.find((p) => p.slug === slug)).filter(Boolean);
  $("#workTrack").innerHTML = featured.map((p, i) => `
    <a class="wcard" href="project.html?p=${p.slug}" data-cursor="View">
      <div class="wcard__media">${media(p)}</div>
      <div class="wcard__meta">
        <div><div class="wcard__title">${esc(p.title)}</div><div class="wcard__sub">${esc(p.subtitle)}</div></div>
        <span class="wcard__n">${String(i + 1).padStart(2, "0")}</span>
      </div>
    </a>`).join("") +
    `<div class="wcard wcard--end"><a href="projects.html"><span class="circle">${ARROW}</span>All projects</a></div>`;

  const brands = D.clientIndex.slice(0, 4).flatMap((c) => c.brands.slice(0, 7));
  const set = `<div class="marquee__set">${brands.map((b) => `<span>${esc(b)}</span><i></i>`).join("")}</div>`;
  $("#marqueeTrack").innerHTML = set + set.replace('class="marquee__set"', 'class="marquee__set" aria-hidden="true"');

  $("#recogList").innerHTML = D.awards.map((g) => `
    <div class="recog__grid recog__group">
      <div class="recog__gname">${esc(g.group)}</div>
      <div>${g.items.map((a) => `
        <div class="recog__row"><div><h3>${esc(a.title)}</h3><p>${esc(a.org)}</p></div><span class="yr">${esc(a.year)}</span></div>`).join("")}
      </div>
    </div>`).join("");

  const tcard = (t) => `
    <article class="tcard">
      <div><div class="tcard__q">“</div><blockquote>${esc(t.quote)}</blockquote></div>
      <div class="tcard__who"><span class="tcard__av">${esc(t.name.split(" ").map((w) => w[0]).join("").slice(0, 2))}</span><div><b>${esc(t.name)}</b><small>${esc(t.role)}</small></div></div>
    </article>`;
  const tHTML = D.testimonials.map(tcard).join("");
  $("#sliderTrack").innerHTML = tHTML + tHTML + tHTML;
  $("#dots").innerHTML = D.testimonials.map(() => "<i></i>").join("");

  // statement: words for the reading reveal
  const st = $("#statement");
  st.innerHTML = st.textContent.trim().split(/\s+/).map((w) => `<span class="sw">${w}</span>`).join(" ");

  /* ---------------- sections ---------------- */
  hero();
  statement();
  services();
  work();
  marquee();
  recognitions();
  slider();

  /* ---------------- hero intro ---------------- */
  function hero() {
    const sig = $("#sig");
    const P = { L: $(".p-left", sig), R: $(".p-right", sig), D: $(".p-dot", sig) };
    const hdr = $("#hdr");

    // pointer glow (desktop) / ambient drift (touch)
    const glow = $("#glow");
    if (!RM) {
      if (FINE) {
        const gx = gsap.quickTo(glow, "x", { duration: 1.6, ease: "power3" });
        const gy = gsap.quickTo(glow, "y", { duration: 1.6, ease: "power3" });
        gsap.set(glow, { x: W() / 2, y: H() / 2 });
        $("#hero").addEventListener("pointermove", (e) => { gx(e.clientX); gy(e.clientY); });
      } else {
        gsap.set(glow, { x: W() * 0.3, y: H() * 0.35 });
        gsap.to(glow, { x: W() * 0.7, y: H() * 0.6, duration: 9, ease: "sine.inOut", yoyo: true, repeat: -1 });
      }
    }

    if (RM) { signature(); return; }

    gsap.set(hdr, { autoAlpha: 0 });

    // The logo builds itself: the dot drops in, the two strokes swing
    // around it, then the name and the call to action follow.
    const tl = gsap.timeline({ delay: document.documentElement.classList.contains("arrived") ? 0.6 : 0.2, onComplete: done });
    tl.fromTo(P.D, { opacity: 1, y: () => -H() * 0.18, scale: 0 }, { y: 0, scale: 1, duration: 1.1, ease: "back.out(2.2)" })
      .fromTo(P.L, { opacity: 0, x: () => -W() * 0.22, y: () => H() * 0.2, rotation: -24 }, { opacity: 1, x: 0, y: 0, rotation: 0, duration: 1.5, ease: "expo.out" }, "-=0.45")
      .fromTo(P.R, { opacity: 0, x: () => W() * 0.22, y: () => H() * 0.26, rotation: 30 }, { opacity: 1, x: 0, y: 0, rotation: 0, duration: 1.5, ease: "expo.out" }, "<0.08")
      .to(".hero__wordmark", { clipPath: "inset(0 0% 0 0)", duration: 1.3, ease: "expo.inOut" }, "-=1.1")
      .fromTo(".hero__cta", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 1, ease: "expo.out" }, "-=0.55")
      .to([hdr, ".hero__scroll"], { autoAlpha: 1, duration: 1 }, "<");

    // Overall pace of the opening (1 = original, higher = faster).
    tl.timeScale(1.3);

    // The page stays put while the opening plays, so nothing can fall out of
    // sync. Any scroll, tap or key press fast-forwards it to the end.
    const lenis = window.APOS_UI.lenis;
    const lock = (on) => {
      document.documentElement.style.overflow = on ? "hidden" : "";
      if (lenis) on ? lenis.stop() : lenis.start();
    };
    scrollTo(0, 0);
    lock(true);
    const safety = setTimeout(() => tl.progress(1), 9000);
    const skip = () => { tl.timeScale(6); off(); };
    const off = () => ["wheel", "touchstart", "touchmove", "keydown", "pointerdown"].forEach((e) => removeEventListener(e, skip));
    ["wheel", "touchstart", "touchmove", "keydown", "pointerdown"].forEach((e) => addEventListener(e, skip, { passive: true }));

    function done() {
      off();
      clearTimeout(safety);
      lock(false);
      signature();
      // hero content lifts away as you scroll
      gsap.to("#heroBrand", { yPercent: -30, opacity: 0, ease: "none", scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom 20%", scrub: true } });
      gsap.to(".hero__scroll", { opacity: 0, ease: "none", scrollTrigger: { trigger: "#hero", start: "top top", end: "20% top", scrub: true } });
    }
  }

  /* ---------------- signature choreography ----------------
     The three pieces of the A leave the hero, frame the About section
     like two figures, then the dot travels on to become the services
     marker before bowing out.                                           */
  function signature() {
    if (RM) return;
    const sig = $("#sig");
    const L = $(".p-left", sig), R = $(".p-right", sig), Dt = $(".p-dot", sig);
    const k = () => (mobile() ? 1.55 : 2.3);
    const stone = "#dcd5c4";

    // dot → services marker (services is pinned, so this spot is fixed on screen)
    const toMarker = () => {
      const sr = sig.getBoundingClientRect();
      const home = { x: sr.left + 0.597 * sr.width, y: sr.top + 0.503 * sr.height, d: (280 / 800) * sr.width };
      const m = $("#wheelMarker").getBoundingClientRect();
      const sec = $("#services").getBoundingClientRect();
      return { x: m.left + m.width / 2 - home.x, y: m.top - sec.top + m.height / 2 - home.y, scale: m.width / home.d };
    };

    const seg = (trigger, start, end, to) => {
      const tl = gsap.timeline({ scrollTrigger: { trigger, start, end, scrub: 1, invalidateOnRefresh: true } });
      to(tl);
      return tl;
    };

    // 1 · hero → about: pieces part and frame the page
    seg("#intro", "top bottom", "top 15%", (tl) => tl
      .to(L, { x: () => -W() * (mobile() ? 0.42 : 0.4), y: () => H() * 0.12, rotation: -6, scale: k, ease: "power2.inOut" }, 0)
      .to(R, { x: () => W() * (mobile() ? 0.4 : 0.39), y: () => H() * 0.2, rotation: 9, scale: k, ease: "power2.inOut" }, 0)
      .to(Dt, { x: () => W() * (mobile() ? 0.34 : 0.3), y: () => -H() * 0.26, scale: 0.2, ease: "power2.inOut" }, 0)
      .to(sig, { color: stone, ease: "none" }, 0));

    // 2 · drift while reading About, like figures turning to watch
    seg("#intro", "top 15%", "bottom top", (tl) => tl
      .to(L, { y: () => -H() * 0.14, rotation: 5, ease: "none" }, 0)
      .to(R, { y: () => -H() * 0.24, rotation: -5, ease: "none" }, 0)
      .to(Dt, { y: () => H() * 0.02, ease: "none" }, 0));

    // 3 · into services: strokes leave, the dot becomes the marker
    seg("#services", "top bottom", "top top", (tl) => tl
      .to(L, { x: () => -W() * 0.95, rotation: -24, opacity: 0, ease: "power2.in" }, 0)
      .to(R, { x: () => W() * 0.95, rotation: 24, opacity: 0, ease: "power2.in" }, 0)
      .to(Dt, { x: () => toMarker().x, y: () => toMarker().y, scale: () => toMarker().scale, ease: "power3.inOut" }, 0));

    // 4 · after services: the dot bows out
    seg("#work", "top bottom", "top 40%", (tl) => tl
      .to(Dt, { y: () => toMarker().y - H() * 0.5, scale: 0, ease: "power2.in" }, 0));

    ScrollTrigger.sort();
    ScrollTrigger.refresh();
  }

  /* ---------------- statement reading reveal ---------------- */
  function statement() {
    if (RM) return;
    gsap.to($$(".sw", st), { opacity: 1, stagger: 0.1, ease: "none", scrollTrigger: { trigger: st, start: "top 82%", end: "bottom 42%", scrub: true } });
  }

  /* ---------------- services wheel ---------------- */
  function services() {
    const items = $$(".wheel__item");
    const n = items.length;
    const num = $("#svcNum");
    const setState = (f) => {
      items.forEach((it, i) => {
        const d = Math.abs(i - f);
        it.style.opacity = Math.max(0.12, 1 - d * 0.62);
        it.style.transform = `scale(${1 - Math.min(d, 1.5) * 0.1})`;
        it.classList.toggle("is-on", Math.round(f) === i);
      });
      num.textContent = String(Math.round(f) + 1).padStart(2, "0");
    };
    if (RM) { setState(0); items.forEach((it) => { it.style.opacity = 1; it.style.transform = "none"; }); return; }
    const h = () => items[0].offsetHeight;
    gsap.set("#wheelList", { y: () => -h() / 2 });
    setState(0);
    gsap.to("#wheelList", {
      y: () => -(n - 0.5) * h(),
      ease: "none",
      scrollTrigger: {
        trigger: "#services", start: "top top", end: () => `+=${(n - 1) * H() * 0.55}`,
        pin: true, scrub: 0.6, anticipatePin: 1, invalidateOnRefresh: true,
        snap: { snapTo: 1 / (n - 1), duration: { min: 0.25, max: 0.6 }, delay: 0.08, ease: "power2.inOut" },
        onUpdate: (self) => setState(self.progress * (n - 1)),
      },
    });
  }

  /* ---------------- work carousel ---------------- */
  function work() {
    const track = $("#workTrack");
    const cards = $$(".wcard", track);
    const mm = gsap.matchMedia();
    mm.add("(min-width: 900px) and (prefers-reduced-motion: no-preference)", () => {
      const dist = () => track.scrollWidth - innerWidth;
      const fx = () => {
        const mid = innerWidth / 2;
        cards.forEach((c) => {
          const r = c.getBoundingClientRect();
          const d = (r.left + r.width / 2 - mid) / innerWidth; // -1..1
          const m = c.querySelector(".wcard__media > *");
          c.style.transform = `translateY(${Math.abs(d) * 40}px) scale(${1 - Math.min(Math.abs(d), 1) * 0.1})`;
          if (m) m.style.transform = `translateX(${d * -6}%)`;
        });
      };
      gsap.to(track, {
        x: () => -dist(), ease: "none",
        scrollTrigger: { trigger: "#workPin", start: "top top", end: () => `+=${dist()}`, pin: true, scrub: 0.8, anticipatePin: 1, invalidateOnRefresh: true, onUpdate: fx, onRefresh: fx },
      });
      return () => cards.forEach((c) => { c.style.transform = ""; const m = c.querySelector(".wcard__media > *"); if (m) m.style.transform = ""; });
    });
    // mobile: native swipe, cards ease in as they arrive
    mm.add("(max-width: 899px) and (prefers-reduced-motion: no-preference)", () => {
      gsap.from(cards, { opacity: 0, x: 60, duration: 1.1, ease: "expo.out", stagger: 0.08, scrollTrigger: { trigger: track, start: "top 85%", once: true } });
    });
  }

  /* ---------------- brand marquee (reacts to scroll speed) ---------------- */
  function marquee() {
    if (RM) return;
    const loop = gsap.to("#marqueeTrack", { xPercent: -50, duration: 50, ease: "none", repeat: -1 });
    let dir = 1;
    ScrollTrigger.create({
      trigger: "#marquee", start: "top bottom", end: "bottom top",
      onUpdate: (self) => {
        dir = self.direction;
        const boost = Math.min(Math.abs(self.getVelocity()) / 250, 6);
        gsap.to(loop, { timeScale: dir * (1 + boost), duration: 0.3, overwrite: true });
        gsap.to(loop, { timeScale: dir, duration: 1.2, delay: 0.3, ease: "power2.out" });
      },
    });
  }

  /* ---------------- recognitions ---------------- */
  function recognitions() {
    $$(".recog__row").forEach((row, i) => {
      if (RM) { row.style.setProperty("--line", 1); return; }
      gsap.fromTo(row, { "--line": 0 }, { "--line": 1, duration: 1.4, ease: "expo.inOut", scrollTrigger: { trigger: row, start: "top 90%", once: true } });
      gsap.from(row.children, { y: 30, opacity: 0, duration: 1.1, ease: "expo.out", stagger: 0.08, scrollTrigger: { trigger: row, start: "top 90%", once: true } });
    });
  }

  /* ---------------- testimonials slideshow (right → left) ---------------- */
  function slider() {
    const wrap = $("#slider"), track = $("#sliderTrack");
    const cards = $$(".tcard", track);
    const dots = $$("#dots i");
    const n = D.testimonials.length;
    let idx = n, timer, inView = false, hover = false;

    const xFor = (i) => wrap.clientWidth / 2 - (cards[i].offsetLeft + cards[i].offsetWidth / 2);
    const mark = () => {
      cards.forEach((c, i) => c.classList.toggle("is-active", i === idx));
      dots.forEach((d, i) => d.classList.toggle("on", i === idx % n));
    };
    const normalize = () => {
      if (idx >= 2 * n) idx -= n;
      if (idx < n) idx += n;
      gsap.set(track, { x: xFor(idx) });
      cards.forEach((c, i) => c.style.transition = "none");
      mark();
      requestAnimationFrame(() => cards.forEach((c) => (c.style.transition = "")));
    };
    const go = (i) => {
      idx = i; mark();
      gsap.to(track, { x: xFor(idx), duration: RM ? 0 : 1.1, ease: "expo.inOut", overwrite: true, onComplete: normalize });
    };
    const play = () => { clearInterval(timer); if (inView && !hover && !RM) timer = setInterval(() => go(idx + 1), 4800); };

    gsap.set(track, { x: xFor(idx) });
    mark();
    $("#next").addEventListener("click", () => { go(idx + 1); play(); });
    $("#prev").addEventListener("click", () => { go(idx - 1); play(); });
    dots.forEach((d, i) => d.addEventListener("click", () => { go(n + i); play(); }));
    wrap.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") { hover = true; clearInterval(timer); } });
    wrap.addEventListener("pointerleave", () => { hover = false; play(); });
    ScrollTrigger.create({ trigger: wrap, start: "top bottom", end: "bottom top", onToggle: (s) => { inView = s.isActive; play(); } });
    document.addEventListener("visibilitychange", () => (document.hidden ? clearInterval(timer) : play()));
    addEventListener("resize", () => gsap.set(track, { x: xFor(idx) }));

    // drag / swipe
    let sx = 0, sy = 0, base = 0, dragging = false, moved = false;
    track.addEventListener("pointerdown", (e) => {
      dragging = true; moved = false; sx = e.clientX; sy = e.clientY; base = gsap.getProperty(track, "x");
      gsap.killTweensOf(track); clearInterval(timer);
    });
    addEventListener("pointermove", (e) => {
      if (!dragging) return;
      const dx = e.clientX - sx;
      if (!moved && Math.abs(e.clientY - sy) > Math.abs(dx)) { dragging = false; go(idx); return; }
      moved = true;
      gsap.set(track, { x: base + dx });
    });
    addEventListener("pointerup", (e) => {
      if (!dragging) return;
      dragging = false;
      const dx = e.clientX - sx;
      go(Math.abs(dx) > 60 ? idx + (dx < 0 ? 1 : -1) : idx);
      play();
    });
  }
};
