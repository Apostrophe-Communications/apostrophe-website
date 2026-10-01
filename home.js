/* ==========================================================================
   Home page
   ========================================================================== */
window.APOS_PAGE = () => {
  const { $, $$, RM, FINE, esc, media, split, ARROW, logo, hive } = window.APOS_UI;
  const D = window.APOS;
  const W = () => innerWidth, H = () => innerHeight;
  const mobile = () => innerWidth < 900;

  /* ---------------- render ---------------- */
  $("#stats").innerHTML = D.stats.map((s, i) =>
    `<div data-reveal data-delay="${i * 0.08}"><span class="stat__n" data-count="${s.value}"><span data-num>${s.value}</span><sup>${s.suffix}</sup></span><span class="stat__l">${s.label}</span></div>`).join("");

  $("#wheelList").innerHTML = D.services.map((s) => `<li class="wheel__item">${esc(s)}</li>`).join("");
  $(".services__count em").textContent = `/ ${String(D.services.length).padStart(2, "0")}`;

  const featured = D.featured.map((slug) => D.projects.find((p) => p.slug === slug)).filter(Boolean);
  // the showcase projects first, then more from every category to fill out the honeycomb
  const more = ["omega-ethos", "governor-house", "abraham-thakore", "glass-sutra", "chopard-jwc", "saundh", "copper-chimney", "mrunalini-rao", "tag-heuer", "stonex"]
    .map((slug) => D.projects.find((p) => p.slug === slug)).filter(Boolean);
  hive($("#homeHive"), [...featured, ...more], {
    max: 112, per: 9.5,
    centre: `<h2 class="work__title">Selected work</h2><a class="btn btn--ghost" href="projects.html">View all projects</a>`,
  });

  const bandSet = `<div class="band__set">${(D.topBrands || []).map((b) => `<span>${logo(b)}</span><i></i>`).join("")}</div>`;
  $("#bandTrack").innerHTML = bandSet + bandSet.replace('class="band__set"', 'class="band__set" aria-hidden="true"');

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
  marquee("#bandTrack", "#band", 60);
  recognitions();
  slider();

  /* ---------------- hero intro ---------------- */
  function hero() {
    const sig = $("#sig");
    const P = { L: $(".p-left", sig), R: $(".p-right", sig), D: $(".p-dot", sig) };
    const hdr = $("#hdr");

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
    // touch devices scroll natively, so block swipes as well while locked
    const noSwipe = (e) => e.cancelable && e.preventDefault();
    const lock = (on) => {
      document.documentElement.style.overflow = document.body.style.overflow = on ? "hidden" : "";
      if (on) addEventListener("touchmove", noSwipe, { passive: false });
      else removeEventListener("touchmove", noSwipe);
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
    }
  }

  /* ---------------- zoom through the dot ----------------
     Scrolling past the opening holds the hero while the whole A pushes
     towards the camera, centred on its dot. The strokes sweep off screen,
     the dot fills it and warms from honey to butter, and the About section
     (also butter) rises straight out of it. Fully scrubbed, so it reverses. */
  function signature() {
    if (RM) return;
    const sig = $("#sig");
    const pieces = [$(".p-left", sig), $(".p-right", sig), $(".p-dot", sig)];
    const dot = $(".p-dot circle", sig);
    const ORIGIN = "59.7% 50.3%";               // the dot's centre inside the mark's box

    // how far to move and how much to grow so the dot covers the whole viewport
    const zoom = () => {
      const r = sig.getBoundingClientRect();
      const cx = r.left + r.width * 0.597, cy = r.top + r.height * 0.503;
      const radius = r.width * 0.175;
      return { x: innerWidth / 2 - cx, y: innerHeight / 2 - cy, scale: (Math.hypot(innerWidth, innerHeight) / 2 / radius) * 1.08 };
    };

    gsap.set(pieces, { transformOrigin: ORIGIN });
    const tl = gsap.timeline({
      defaults: { ease: "none" },
      // refreshPriority: this pin sits above everything else, so it must be measured first
      scrollTrigger: { id: "zoom", trigger: "#hero", start: "top top", end: () => `+=${H() * 1.3}`, pin: true, scrub: 0.6, invalidateOnRefresh: true, refreshPriority: 1 },
    });
    tl.to("#heroBrand", { yPercent: -18, opacity: 0, duration: 0.28 }, 0)
      .to(".hero__scroll", { opacity: 0, duration: 0.12 }, 0)
      .fromTo(pieces, { x: 0, y: 0, scale: 1 }, { x: () => zoom().x, y: () => zoom().y, scale: () => zoom().scale, duration: 1, ease: "power2.in" }, 0)
      .fromTo(dot, { fill: "#E4A524" }, { fill: "#fdf9cc", duration: 0.25 }, 0.75);

    // once About has risen into place the giant dot is invisible behind it, so retire it
    ScrollTrigger.create({
      trigger: "#intro", start: "top 5%",
      onEnter: () => gsap.set(sig, { autoAlpha: 0 }),
      onLeaveBack: () => gsap.set(sig, { autoAlpha: 1 }),
    });

    // This pin is created after the opening plays, i.e. after every section below it
    // was already measured. Re-sort and re-measure so they all account for the space it adds.
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
        id: "services-pin", trigger: "#services", start: "top top", end: () => `+=${(n - 1) * H() * 0.26}`,
        pin: true, scrub: 0.35, anticipatePin: 1, invalidateOnRefresh: true,
        onUpdate: (self) => setState(self.progress * (n - 1)),
      },
    });
    // keep the cursor glow *behind* the text while this section is pinned
    const svc = $("#services"), spacer = svc.parentElement;
    if (spacer.classList.contains("pin-spacer")) {
      spacer.style.background = "var(--ink)";
      svc.style.background = "transparent";
      svc.style.zIndex = 2;
    }
  }

  /* ---------------- brand marquee (reacts to scroll speed) ---------------- */
  function marquee(trackSel, sectionSel, duration) {
    if (RM) return;
    const loop = gsap.to(trackSel, { xPercent: -50, duration, ease: "none", repeat: -1 });
    let dir = 1, target = 1, active = false;
    ScrollTrigger.create({
      trigger: sectionSel, start: "top bottom", end: "bottom top",
      onToggle: (self) => { active = self.isActive; active ? loop.play() : loop.pause(); },
      onUpdate: (self) => {
        dir = self.direction;
        target = dir * (1 + Math.min(Math.abs(self.getVelocity()) / 250, 6));
      },
    });
    gsap.ticker.add(() => {
      if (!active) return;
      target += (dir - target) * 0.04;            // settle back to cruising speed
      const ts = loop.timeScale();
      loop.timeScale(ts + (target - ts) * 0.12);  // ease towards the target
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
