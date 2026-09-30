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

  const bandSet = `<div class="band__set">${(D.topBrands || []).map((b) => `<span>${esc(b)}</span><i></i>`).join("")}</div>`;
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
  work();
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
      // hero content lifts away as you scroll
      gsap.to("#heroBrand", { yPercent: -30, opacity: 0, ease: "none", scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom 20%", scrub: true } });
      gsap.to(".hero__scroll", { opacity: 0, ease: "none", scrollTrigger: { trigger: "#hero", start: "top top", end: "20% top", scrub: true } });
    }
  }

  /* ---------------- signature choreography ----------------
     The three pieces of the A leave the hero and frame the About section
     like figures (the dot stays large so it never reads as the cursor),
     then all three drift off before Services.                            */
  function signature() {
    if (RM) return;
    const sig = $("#sig");
    const L = $(".p-left", sig), R = $(".p-right", sig), Dt = $(".p-dot", sig);
    const stone = "#c8dbfc", ivory = "#fdf9cc"; // dusty blue framing, butter logo
    let master;

    // One scrubbed timeline for the whole journey. Every stage goes from an
    // explicit state to an explicit state, so fast flicks, jumps or resizes
    // can never leave the pieces stranded between stages.
    // Timeline time = scroll pixels, rebuilt whenever the layout is measured.
    const build = () => {
      const keep = master ? master.scrollTrigger.progress : 0;
      if (master) { master.scrollTrigger.kill(); master.kill(); }
      const w = innerWidth, h = innerHeight, m = w < 900;
      const k = m ? 1.55 : 2.3;

      const intro = $("#intro");
      const svcST = ScrollTrigger.getById("services-pin");
      const introTop = intro.offsetTop, introBottom = introTop + intro.offsetHeight;
      const svcTop = svcST ? svcST.start : $("#services").offsetTop;

      const S = {
        logo:   { L: { x: 0, y: 0, rotation: 0, scale: 1, opacity: 1 }, R: { x: 0, y: 0, rotation: 0, scale: 1, opacity: 1 }, D: { x: 0, y: 0, scale: 1, opacity: 1 } },
        frame:  { L: { x: -w * (m ? 0.42 : 0.4), y: h * 0.12, rotation: -6, scale: k, opacity: 1 }, R: { x: w * (m ? 0.4 : 0.39), y: h * 0.2, rotation: 9, scale: k, opacity: 1 }, D: { x: w * (m ? 0.36 : 0.33), y: -h * 0.24, scale: 1.3, opacity: 1 } },
        drift:  { L: { x: -w * (m ? 0.42 : 0.4), y: -h * 0.14, rotation: 5, scale: k, opacity: 1 }, R: { x: w * (m ? 0.4 : 0.39), y: -h * 0.24, rotation: -5, scale: k, opacity: 1 }, D: { x: w * (m ? 0.36 : 0.33), y: h * 0.06, scale: 1.5, opacity: 1 } },
        svc:    { L: { x: -w * 0.95, y: -h * 0.14, rotation: -24, scale: k, opacity: 0 }, R: { x: w * 0.95, y: -h * 0.24, rotation: 24, scale: k, opacity: 0 }, D: { x: w * 0.75, y: -h * 0.3, scale: 1.6, opacity: 0 } },
      };

      const a = Math.max(0, introTop - h), b = Math.max(a + 1, introTop - h * 0.15);
      const c = Math.max(b + 1, introBottom);
      const d0 = Math.max(c, svcTop - h), d1 = Math.max(d0 + 1, svcTop);

      const tl = gsap.timeline({ paused: true, defaults: { immediateRender: false, ease: "none" } });
      const stage = (from, to, t0, t1, ease) => {
        const dur = t1 - t0;
        ["L", "R", "D"].forEach((key) => {
          if (!to[key]) return;
          const el = { L, R, D: Dt }[key];
          tl.fromTo(el, { ...from[key] }, { ...to[key], duration: dur, ease }, t0);
        });
      };
      stage(S.logo, S.frame, a, b, "power2.inOut");
      tl.fromTo(sig, { color: ivory }, { color: stone, duration: b - a }, a);
      stage(S.frame, S.drift, b, c, "none");
      stage(S.drift, S.svc, d0, d1, "power3.inOut");
      tl.set({}, {}, d1);

      master = tl;
      ScrollTrigger.create({ id: "signature", animation: tl, start: 0, end: d1, scrub: 1 });
      tl.progress(keep || ScrollTrigger.getById("signature").progress);
    };

    build();
    ScrollTrigger.addEventListener("refresh", build);
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
        id: "services-pin", trigger: "#services", start: "top top", end: () => `+=${(n - 1) * H() * 0.55}`,
        pin: true, scrub: 0.6, anticipatePin: 1, invalidateOnRefresh: true,
        snap: { snapTo: 1 / (n - 1), duration: { min: 0.25, max: 0.6 }, delay: 0.08, ease: "power2.inOut" },
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

  /* ---------------- work carousel ---------------- */
  function work() {
    // A sideways gallery: vertical scrolling always moves on down the page;
    // the cards move with a sideways trackpad swipe, a mouse drag or the arrows.
    const track = $("#workTrack");
    const cards = $$(".wcard", track);
    const medias = cards.map((c) => c.querySelector(".wcard__media > *"));
    const step = () => (cards[1] ? cards[1].offsetLeft - cards[0].offsetLeft : track.clientWidth * 0.8);

    // centre card sits forward; others ease back (maths only, no layout reads per frame)
    let centres = [];
    const measure = () => { centres = cards.map((c) => c.offsetLeft + c.offsetWidth / 2); };
    let ticking = false;
    const fx = () => {
      ticking = false;
      if (RM) return;
      const mid = track.scrollLeft + track.clientWidth / 2, W0 = track.clientWidth;
      cards.forEach((c, i) => {
        const d = (centres[i] - mid) / W0;
        const a = Math.min(Math.abs(d), 1);
        c.style.transform = innerWidth >= 900 ? `translate3d(0,${a * 36}px,0) scale(${1 - a * 0.08})` : "";
        if (medias[i]) medias[i].style.transform = `translate3d(${d * -6}%,0,0)`;
      });
    };
    const queue = () => { if (!ticking) { ticking = true; requestAnimationFrame(fx); } };
    measure(); fx();
    track.addEventListener("scroll", queue, { passive: true });
    addEventListener("resize", () => { measure(); queue(); });

    // arrows
    const go = (dir) => track.scrollBy({ left: dir * step(), behavior: RM ? "auto" : "smooth" });
    $("#workPrev").addEventListener("click", () => go(-1));
    $("#workNext").addEventListener("click", () => go(1));

    // click-and-drag with a mouse
    let down = false, moved = false, sx = 0, sl = 0;
    track.addEventListener("pointerdown", (e) => {
      if (e.pointerType !== "mouse") return;
      down = true; moved = false; sx = e.clientX; sl = track.scrollLeft;
      track.classList.add("is-dragging");
    });
    addEventListener("pointermove", (e) => {
      if (!down) return;
      const dx = e.clientX - sx;
      if (Math.abs(dx) > 4) moved = true;
      track.scrollLeft = sl - dx;
    });
    addEventListener("pointerup", () => {
      if (!down) return;
      down = false;
      track.classList.remove("is-dragging");
      // settle on the nearest card
      const i = Math.round(track.scrollLeft / step());
      track.scrollTo({ left: i * step(), behavior: "smooth" });
    });
    track.addEventListener("click", (e) => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
    track.addEventListener("dragstart", (e) => e.preventDefault());

    if (!RM) gsap.from(cards, { opacity: 0, x: 80, duration: 1.2, ease: "expo.out", stagger: 0.08, scrollTrigger: { trigger: track, start: "top 85%", once: true } });
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
