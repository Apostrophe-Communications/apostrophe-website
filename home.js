/* ==========================================================================
   Home page
   ========================================================================== */
window.APOS_PAGE = () => {
  const { $, $$, RM, FINE, esc, media, split, ARROW, logo } = window.APOS_UI;
  const D = window.APOS;
  const W = () => innerWidth, H = () => innerHeight;
  const mobile = () => innerWidth < 900;

  /* ---------------- render ---------------- */
  $("#stats").innerHTML = D.stats.map((s, i) =>
    `<div data-reveal data-delay="${i * 0.08}"><span class="stat__n" data-count="${s.value}"><span data-num>${s.value}</span><sup>${s.suffix}</sup></span><span class="stat__l">${s.label}</span></div>`).join("");

  $("#wheelList").innerHTML = D.services.map((s) => `<li class="wheel__item">${esc(s)}</li>`).join("");

  const featured = D.featured.map((slug) => D.projects.find((p) => p.slug === slug)).filter(Boolean);
  // the showcase projects plus more from every category
  const more = ["omega-ethos", "abraham-thakore", "chopard-jwc", "saundh", "copper-chimney", "mrunalini-rao", "stonex", "fcml", "sameer-madan", "bally", "paul-smith", "truebrowns", "forever-new", "superdry", "beeyoung", "tres", "lopera"]
    .map((slug) => D.projects.find((p) => p.slug === slug)).filter(Boolean);
  // Marquee Projects: free-standing logos in even rows, clubbed under their niche
  const all = [...featured, ...more, ...(D.homeBrands || [])];
  // each logo gets a box sized by area, so long wordmarks and compact marks weigh the same
  // ...and by ink density (sd = share of the logo's box that is ink), so a heavy
  // block wordmark and a fine-line mark read as equally strong
  const fit = (p) => {
    const ar = p.sw / p.sh;
    const weight = Math.min(1.35, Math.max(0.72, Math.sqrt(0.3 / (p.sd || 0.3))));
    const area = (p.badge ? 0.26 : 0.17) * weight;
    let w = Math.sqrt(area * ar), h = w / ar;
    if (w > 0.98) { w = 0.98; h = w / ar; }              // long wordmarks may use the full cell width
    if (h > 0.46) { h = 0.46; w = h * ar; }
    return `--fw:${w.toFixed(3)};--fh:${h.toFixed(3)}`;
  };
  const tile = (p) => {
    const inner = p.sticker ? `<img src="${esc(p.sticker)}" alt="" style="${fit(p)}" loading="lazy" decoding="async">` : `<span class="mq__txt">${esc(p.title)}</span>`;
    const cls = `mq__item${p.slug ? "" : " mq__item--brand"}`;
    return p.slug
      ? `<a class="${cls}" href="project.html?p=${p.slug}" aria-label="${esc(p.title)}" title="${esc(p.title)}">${inner}</a>`
      : `<div class="${cls}" role="img" aria-label="${esc(p.title)}" title="${esc(p.title)}">${inner}</div>`;
  };
  $("#marquee").innerHTML = D.categories.map((c) => {
    const items = all.filter((p) => p.category === c.id);
    return items.length ? `
      <div class="mq__group">
        <h3 class="mq__label" data-reveal>${esc(c.name)}</h3>
        <div class="mq__logos">${items.map(tile).join("")}</div>
      </div>` : "";
  }).join("");

  const bandSet = `<div class="band__set">${(D.topBrands || []).map((b) => `<span>${logo(b)}</span><i></i>`).join("")}</div>`;
  $("#bandTrack").innerHTML = bandSet + bandSet.replace('class="band__set"', 'class="band__set" aria-hidden="true"');

  // every award logo together in one strip under the title, the list below stays text only
  const awardLogos = D.awards.flatMap((g) => g.items).filter((a) => a.logo);
  $("#recogList").insertAdjacentHTML("beforebegin", `<div class="recog__logos">${awardLogos.map((a) =>
    `<figure class="recog__plate" title="${esc(a.title)}, ${esc(a.org)}" data-reveal><img src="${esc(a.logo)}" alt="${esc(a.org)}" loading="lazy" decoding="async"></figure>`).join("")}</div>`);
  $("#recogList").innerHTML = D.awards.map((g) => `
    <div class="recog__grid recog__group">
      <div class="recog__gname">${esc(g.group)}</div>
      <div>${g.items.map((a) => `
        <div class="recog__row"><div><h3>${esc(a.title)}</h3><p>${esc(a.org)}</p></div><span class="yr">${esc(a.year)}</span><i class="recog__line" aria-hidden="true"></i></div>`).join("")}
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
    tl.fromTo(P.D, { opacity: 0, y: () => -H() * 0.18, scale: 0.6 }, { opacity: 1, y: 0, scale: 1, duration: 1.1, ease: "back.out(1.2)" })
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
    const skip = () => { tl.timeScale(6); off(); };
    const off = () => ["wheel", "touchstart", "touchmove", "keydown", "pointerdown"].forEach((e) => removeEventListener(e, skip));
    let safety;

    // The full opening plays once per visit; coming back to Home later in the
    // same session just fades the finished logo in, with no scroll lock.
    let seen = false;
    try { seen = !!sessionStorage.getItem("apos-intro"); sessionStorage.setItem("apos-intro", 1); } catch (e) {}
    if (seen) {
      tl.progress(1);
      gsap.from(["#sig", "#heroBrand"], { opacity: 0, y: 12, duration: 0.6, ease: "power3.out" });
      return;
    }

    scrollTo(0, 0);
    lock(true);
    safety = setTimeout(() => tl.progress(1), 9000);
    ["wheel", "touchstart", "touchmove", "keydown", "pointerdown"].forEach((e) => addEventListener(e, skip, { passive: true }));

    function done() {
      off();
      clearTimeout(safety);
      lock(false);
      signature();
    }
  }

  /* ---------------- through the dot ----------------
     Scrolling past the opening holds the hero briefly: the two strokes drift
     apart and fade, while the dot grows to fill the screen and turns white, so
     the About section (also white) rises straight out of it.
     Performance: the growing dot is a plain circle element scaled on the GPU
     (drawn once at full size, so it stays crisp), never a giant redrawn SVG. */
  function signature() {
    if (RM) return;
    const sig = $("#sig");
    const L = $(".p-left", sig), R = $(".p-right", sig), pdot = $(".p-dot", sig);
    const circle = $(".p-dot circle", sig);

    const z = document.createElement("div");
    z.className = "zoomdot";
    z.innerHTML = "<i></i>";
    document.body.appendChild(z);

    // geometry: the logo dot's position/size now, and the radius that covers the viewport
    const geo = () => {
      const r = circle.getBoundingClientRect();
      return { cx: r.left + r.width / 2, cy: r.top + r.height / 2, r: r.width / 2, R: Math.hypot(innerWidth, innerHeight) / 2 + 4 };
    };
    const size = () => { const g = geo(); z.style.width = z.style.height = `${g.R * 2}px`; };
    size();
    ScrollTrigger.addEventListener("refreshInit", size);

    // hand the dot over to the circle (it sits exactly on top of it)
    gsap.set(pdot, { opacity: 0 });

    const tl = gsap.timeline({
      defaults: { ease: "none" },
      // refreshPriority: this pin sits above everything else, so it must be measured first
      scrollTrigger: { id: "zoom", trigger: "#hero", start: "top top", end: () => `+=${H() * 0.9}`, pin: true, scrub: 1, invalidateOnRefresh: true, refreshPriority: 1 },
    });
    tl.to("#heroBrand", { y: -30, opacity: 0, duration: 0.3 }, 0)
      .to(".hero__scroll", { opacity: 0, duration: 0.1 }, 0)
      .fromTo(L, { x: 0, y: 0, opacity: 1 }, { x: () => -W() * 0.14, y: () => H() * 0.05, opacity: 0, duration: 0.55, ease: "sine.inOut" }, 0.05)
      .fromTo(R, { x: 0, y: 0, opacity: 1 }, { x: () => W() * 0.14, y: () => H() * 0.05, opacity: 0, duration: 0.55, ease: "sine.inOut" }, 0.05)
      .fromTo(z,
        { x: () => { const g = geo(); return g.cx - g.R; }, y: () => { const g = geo(); return g.cy - g.R; }, scale: () => { const g = geo(); return g.r / g.R; } },
        { x: () => W() / 2 - geo().R, y: () => H() / 2 - geo().R, scale: 1, duration: 1, ease: "power2.inOut" }, 0)
      .fromTo(z.firstChild, { opacity: 0 }, { opacity: 1, duration: 0.3 }, 0.68);

    // once About has risen into place the full-screen dot is invisible behind it, so retire it
    ScrollTrigger.create({
      trigger: "#intro", start: "top 5%",
      onEnter: () => gsap.set([sig, z], { autoAlpha: 0 }),
      onLeaveBack: () => gsap.set([sig, z], { autoAlpha: 1 }),
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
    const setState = (f) => {
      items.forEach((it, i) => {
        const d = Math.abs(i - f);
        it.style.opacity = Math.max(0.16, 1 - d * 0.22);
        it.style.transform = `scale(${1 - Math.min(d, 3) * 0.035})`;
        it.classList.toggle("is-on", Math.round(f) === i);
      });
    };
    if (RM) { setState(0); items.forEach((it) => { it.style.opacity = 1; it.style.transform = "none"; }); return; }
    const h = () => items[0].offsetHeight;
    gsap.set("#wheelList", { y: () => -h() / 2 });
    setState(0);
    gsap.to("#wheelList", {
      y: () => -(n - 0.5) * h(),
      ease: "none",
      scrollTrigger: {
        id: "services-pin", trigger: "#services", start: "top top", end: () => `+=${(n - 1) * H() * 0.12}`,
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
      if (RM) return;
      // the divider draws itself: a real element scaled on the GPU (no CSS-variable recalc)
      gsap.from(row.querySelector(".recog__line"), { scaleX: 0, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: row, start: "top 90%", once: true } });
      gsap.from([...row.children].filter((c) => !c.matches(".recog__line")), { y: 30, opacity: 0, duration: 1.1, ease: "expo.out", stagger: 0.08, scrollTrigger: { trigger: row, start: "top 90%", once: true } });
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
      gsap.to(track, { x: xFor(idx), duration: RM ? 0 : 0.6, ease: "power4.inOut", overwrite: true, onComplete: normalize });
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
