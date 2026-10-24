/* ==========================================================================
   Projects page: filterable grid + client index
   ========================================================================== */
window.APOS_PAGE = () => {
  const { $, $$, esc, logo, marquee } = window.APOS_UI;
  const D = window.APOS;

  // every brand in a category: its projects first (their logo links to the case study),
  // then the rest of the brands listed under that category
  const first = {};
  D.clientIndex.forEach((c) => c.brands.forEach((b) => { if (b.slug && !first[b.slug]) first[b.slug] = b; }));
  const brandsIn = (cat) => {
    const name = D.categories.find((c) => c.id === cat).name;
    const projects = D.projects.filter((p) => p.category === cat).map((p) => first[p.slug] || { name: p.title, slug: p.slug });
    const others = (D.clientIndex.find((c) => c.name === name)?.brands || []).filter((b) => !(b.slug && first[b.slug] === b));
    return [...projects, ...others];
  };
  const brandLink = (b) => b.slug
    ? `<a class="index__b has-page" href="project.html?p=${b.slug}" title="${esc(b.name)}: view project">${logo(b)}</a>`
    : `<span class="index__b" title="${esc(b.name)}">${logo(b)}</span>`;

  // filters: Marquee Projects (the brands with a case study) and one tab per category
  const tabs = [{ id: "all", name: "Marquee Projects", n: D.projects.length }, ...D.categories.map((c) => ({ ...c, n: brandsIn(c.id).length }))];
  $("#filters").innerHTML = tabs
    .map((c, i) => `<button class="${i ? "" : "on"}" data-f="${c.id}" aria-pressed="${!i}">${esc(c.name)}<sup>${c.n}</sup></button>`).join("");

  marquee($("#pgrid"), D.projects);
  $("#pgrid").classList.add("mq--compact");
  const pgrid = $("#pgrid"), wall = $("#pwall");

  // client index
  $("#clientIndex").innerHTML = D.clientIndex.map((c) => ({ ...c, brands: c.brands.filter((b) => !b.slug) })).filter((c) => c.brands.length).map((c) => `
    <div class="index__cat" data-reveal>
      <h3>${esc(c.name)}</h3>
      <div class="index__logos">${c.brands.map((b) => b.slug
        ? `<a class="index__b has-page" href="project.html?p=${b.slug}" title="${esc(b.name)}: view project">${logo(b)}</a>`
        : `<span class="index__b" title="${esc(b.name)}">${logo(b)}</span>`).join("")}</div>
    </div>`).join("");

  $("#filters").addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    $$("#filters button").forEach((x) => { x.classList.toggle("on", x === b); x.setAttribute("aria-pressed", x === b); });
    const f = b.dataset.f;
    if (f === "all") {
      wall.hidden = true; pgrid.hidden = false;
      gsap.fromTo(pgrid, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: "power2.out" });
    } else {
      pgrid.hidden = true; wall.hidden = false;
      wall.innerHTML = `<div class="index__logos">${brandsIn(f).map(brandLink).join("")}</div>`;
      gsap.fromTo(wall.querySelectorAll(".index__b"), { opacity: 0, y: 8 }, { opacity: (i, el) => el.classList.contains("has-page") ? 1 : 0.72, y: 0, duration: 0.4, ease: "power2.out", stagger: 0.015, clearProps: "transform" });
    }
    ScrollTrigger.refresh();
  });
};
