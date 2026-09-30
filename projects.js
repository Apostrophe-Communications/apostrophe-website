/* ==========================================================================
   Projects page: filterable grid + client index
   ========================================================================== */
window.APOS_PAGE = () => {
  const { $, $$, RM, FINE, esc, logo } = window.APOS_UI;
  const D = window.APOS;
  const catName = Object.fromEntries(D.categories.map((c) => [c.id, c.name]));

  // filters
  const count = (id) => D.projects.filter((p) => id === "all" || p.category === id).length;
  $("#filters").innerHTML = [{ id: "all", name: "All" }, ...D.categories]
    .map((c, i) => `<button class="${i ? "" : "on"}" data-f="${c.id}" aria-pressed="${!i}">${esc(c.name)}<sup>${count(c.id)}</sup></button>`).join("");

  // Selected work: logo stickers in a honeycomb that magnifies under the cursor (like the Apple Watch app grid)
  const hive = $("#pgrid");
  hive.classList.add("hive");
  hive.innerHTML = D.projects.map((p, i) => `
    <a class="sticker" href="project.html?p=${p.slug}" data-cat="${p.category}" data-i="${i}" aria-label="${esc(p.title)}: ${esc(p.subtitle)}">
      <span class="sticker__disc" style="--bg:${p.sbg || "#fff"};--r:${(((i * 37) % 13) - 6)}deg">${p.sticker
        ? `<img src="${esc(p.sticker)}" alt="" style="--ar:${(p.sw / p.sh).toFixed(3)}" decoding="async">`
        : `<span class="sticker__txt">${esc(p.title)}</span>`}</span>
    </a>`).join("") + `<div class="hive__label" aria-hidden="true"><b></b><em></em></div>`;

  // client index
  $("#clientIndex").innerHTML = D.clientIndex.map((c) => ({ ...c, brands: c.brands.filter((b) => !b.slug) })).filter((c) => c.brands.length).map((c) => `
    <div class="index__cat" data-reveal>
      <h3>${esc(c.name)}</h3>
      <div class="index__logos">${c.brands.map((b) => b.slug
        ? `<a class="index__b has-page" href="project.html?p=${b.slug}" title="${esc(b.name)}: view project">${logo(b)}</a>`
        : `<span class="index__b" title="${esc(b.name)}">${logo(b)}</span>`).join("")}</div>
    </div>`).join("");

  const stickers = $$(".sticker", hive);
  const label = $(".hive__label", hive);
  let items = [], D0 = 100, step = 120, hovering = false;

  const qx = stickers.map((el) => gsap.quickTo(el, "x", { duration: 0.55, ease: "power3" }));
  const qy = stickers.map((el) => gsap.quickTo(el, "y", { duration: 0.55, ease: "power3" }));
  const qs = stickers.map((el) => gsap.quickTo(el, "scale", { duration: 0.55, ease: "power3" }));

  // hex-pack the visible stickers: rows alternate between n and n-1, centred
  function layout(animate) {
    const W = hive.clientWidth;
    D0 = Math.round(Math.min(132, Math.max(76, W / 8.2)));
    const gap = Math.round(D0 * 0.2);
    step = D0 + gap;
    const n = Math.max(3, Math.floor((W - D0 * 0.4 + gap) / step));
    const rowH = step * 0.87;
    const vis = stickers.filter((el) => !el.classList.contains("is-hidden"));
    items = [];
    let i = 0, row = 0;
    while (i < vis.length) {
      const k = Math.min(row % 2 ? n - 1 : n, vis.length - i);
      const rowW = k * step - gap;
      for (let c = 0; c < k; c++, i++) {
        const el = vis[i];
        items.push({ el, idx: +el.dataset.i, bx: (W - rowW) / 2 + c * step, by: D0 * 0.35 + row * rowH });
      }
      row++;
    }
    hive.style.setProperty("--d", D0 + "px");
    hive.style.height = Math.ceil(D0 * 0.7 + (row - 1) * rowH + D0) + "px";
    items.forEach((it) => {
      const props = { x: it.bx, y: it.by, scale: 1, autoAlpha: 1 };
      animate && !RM ? gsap.to(it.el, { ...props, duration: 0.9, ease: "expo.inOut" }) : gsap.set(it.el, props);
    });
    stickers.filter((el) => el.classList.contains("is-hidden")).forEach((el) =>
      animate && !RM ? gsap.to(el, { scale: 0, autoAlpha: 0, duration: 0.4, ease: "power2.in" }) : gsap.set(el, { scale: 0, autoAlpha: 0 }));
  }

  function magnify(px, py) {
    const R = step * 2.1;
    let near = null, nd = Infinity;
    items.forEach((it) => {
      const cx = it.bx + D0 / 2, cy = it.by + D0 / 2;
      const dx = cx - px, dy = cy - py, d = Math.hypot(dx, dy) || 1;
      const t = Math.max(0, 1 - d / R);
      const sc = 1 + 0.72 * t * t * t + (d < D0 * 0.55 ? 0.12 : 0);
      const push = Math.sin(Math.PI * t) * step * 0.22;
      qx[it.idx](it.bx + (dx / d) * push); qy[it.idx](it.by + (dy / d) * push); qs[it.idx](sc);
      it.el.style.zIndex = Math.round(t * 100);
      if (d < nd) { nd = d; near = it; }
    });
    stickers.forEach((el) => el.classList.toggle("is-near", near && nd < D0 * 0.62 && el === near.el));
    if (near && nd < D0 * 0.62) {
      const p = D.projects[near.idx];
      label.querySelector("b").textContent = p.title;
      label.querySelector("em").textContent = catName[p.category];
      gsap.to(label, { x: near.bx + D0 / 2, y: near.by + D0 * 1.42, autoAlpha: 1, duration: 0.45, ease: "power3" });
    } else gsap.to(label, { autoAlpha: 0, duration: 0.3 });
  }
  function rest() {
    items.forEach((it) => { qx[it.idx](it.bx); qy[it.idx](it.by); qs[it.idx](1); });
    stickers.forEach((el) => el.classList.remove("is-near"));
    gsap.to(label, { autoAlpha: 0, duration: 0.3 });
  }

  layout(false);
  gsap.set(label, { autoAlpha: 0, xPercent: -50 });
  let rw = hive.clientWidth;
  addEventListener("resize", () => { if (hive.clientWidth !== rw) { rw = hive.clientWidth; layout(false); ScrollTrigger.refresh(); } });

  if (FINE && !RM) {
    hive.addEventListener("pointermove", (e) => { const r = hive.getBoundingClientRect(); hovering = true; magnify(e.clientX - r.left, e.clientY - r.top); });
    hive.addEventListener("pointerleave", () => { hovering = false; rest(); });
  }

  // stickers get slapped on as the section arrives
  if (!RM) {
    gsap.set(stickers, { scale: 0, autoAlpha: 0 });
    ScrollTrigger.create({
      trigger: hive, start: "top 85%", once: true,
      onEnter: () => gsap.to(items.map((it) => it.el), { scale: 1, autoAlpha: 1, duration: 0.9, ease: "back.out(2.2)", stagger: { each: 0.03, from: "random" } }),
    });
  }

  $("#filters").addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    $$("#filters button").forEach((x) => { x.classList.toggle("on", x === b); x.setAttribute("aria-pressed", x === b); });
    const f = b.dataset.f;
    stickers.forEach((c) => c.classList.toggle("is-hidden", f !== "all" && c.dataset.cat !== f));
    rest();
    layout(true);
    setTimeout(() => ScrollTrigger.refresh(), 950);
  });
};
