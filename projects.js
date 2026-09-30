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

  // grid
  $("#pgrid").innerHTML = D.projects.map((p) => `
    <a class="pcard ptile" href="project.html?p=${p.slug}" data-cat="${p.category}" aria-label="${esc(p.title)}: ${esc(p.subtitle)}">
      <span class="ptile__logo">${logo({ name: p.title, logo: p.logo, w: p.lw, h: p.lh })}</span>
      <span class="ptile__cap"><b>${esc(p.title)}</b><em>${esc(catName[p.category])}</em></span>
    </a>`).join("");

  // client index
  $("#clientIndex").innerHTML = D.clientIndex.map((c) => ({ ...c, brands: c.brands.filter((b) => !b.slug) })).filter((c) => c.brands.length).map((c) => `
    <div class="index__cat" data-reveal>
      <h3>${esc(c.name)}</h3>
      <div class="index__logos">${c.brands.map((b) => b.slug
        ? `<a class="index__b has-page" href="project.html?p=${b.slug}" title="${esc(b.name)}: view project">${logo(b)}</a>`
        : `<span class="index__b" title="${esc(b.name)}">${logo(b)}</span>`).join("")}</div>
    </div>`).join("");

  const cards = $$(".pcard");

  // on a mouse, the logo leans toward the cursor inside its tile
  if (!RM && FINE) cards.forEach((c) => {
    const l = c.querySelector(".ptile__logo");
    const x = gsap.quickTo(l, "x", { duration: 0.6, ease: "power3" }), y = gsap.quickTo(l, "y", { duration: 0.6, ease: "power3" });
    c.addEventListener("pointermove", (e) => {
      const r = c.getBoundingClientRect();
      x(((e.clientX - r.left) / r.width - 0.5) * 18); y(((e.clientY - r.top) / r.height - 0.5) * 18);
    });
    c.addEventListener("pointerleave", () => { x(0); y(0); });
  });

  // cards rise in as they enter
  if (!RM) {
    ScrollTrigger.batch(cards, {
      start: "top 92%",
      once: true,
      onEnter: (els) => gsap.fromTo(els, { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 1.2, ease: "expo.out", stagger: 0.1 }),
    });
    gsap.set(cards, { opacity: 0 });
  }

  // filtering with FLIP so cards glide to their new places
  $("#filters").addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    $$("#filters button").forEach((x) => { x.classList.toggle("on", x === b); x.setAttribute("aria-pressed", x === b); });
    const f = b.dataset.f;
    const state = !RM && window.Flip ? Flip.getState(cards) : null;
    cards.forEach((c) => c.classList.toggle("is-hidden", f !== "all" && c.dataset.cat !== f));
    gsap.set(cards, { opacity: 1, y: 0 });
    if (state) {
      Flip.from(state, {
        duration: 0.9, ease: "expo.inOut", absolute: true, scale: false,
        onEnter: (els) => gsap.fromTo(els, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.9, ease: "expo.out", delay: 0.2 }),
        onLeave: (els) => gsap.to(els, { opacity: 0, duration: 0.4 }),
        onComplete: () => ScrollTrigger.refresh(),
      });
    } else ScrollTrigger.refresh();
  });
  if (window.Flip) gsap.registerPlugin(Flip);
};
