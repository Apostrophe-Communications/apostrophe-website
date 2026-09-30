/* ==========================================================================
   Projects page — filterable grid + client index
   ========================================================================== */
window.APOS_PAGE = () => {
  const { $, $$, RM, esc, media } = window.APOS_UI;
  const D = window.APOS;
  const catName = Object.fromEntries(D.categories.map((c) => [c.id, c.name]));

  // filters
  const count = (id) => D.projects.filter((p) => id === "all" || p.category === id).length;
  $("#filters").innerHTML = [{ id: "all", name: "All" }, ...D.categories]
    .map((c, i) => `<button class="${i ? "" : "on"}" data-f="${c.id}" aria-pressed="${!i}">${esc(c.name)}<sup>${count(c.id)}</sup></button>`).join("");

  // grid
  $("#pgrid").innerHTML = D.projects.map((p) => `
    <a class="pcard" href="project.html?p=${p.slug}" data-cat="${p.category}" data-cursor="View">
      <div class="pcard__media">${media(p)}</div>
      <div class="pcard__meta"><span>${esc(catName[p.category])}</span><span class="pill">${esc(p.tags[0])}</span></div>
      <h2 class="pcard__title">${esc(p.title)}</h2>
      <p class="pcard__sub">${esc(p.subtitle)}</p>
    </a>`).join("");

  // client index
  $("#clientIndex").innerHTML = D.clientIndex.map((c) => `
    <div class="index__cat" data-reveal>
      <h3>${esc(c.name)}</h3>
      <p class="index__brands">${c.brands.map((b) => `<span>${esc(b)}</span>`).join("<i></i>")}</p>
    </div>`).join("");

  const cards = $$(".pcard");

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
