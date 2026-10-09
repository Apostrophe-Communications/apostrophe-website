/* ==========================================================================
   Projects page: filterable grid + client index
   ========================================================================== */
window.APOS_PAGE = () => {
  const { $, $$, esc, logo, hive } = window.APOS_UI;
  const D = window.APOS;

  // filters
  const count = (id) => D.projects.filter((p) => id === "all" || p.category === id).length;
  $("#filters").innerHTML = [{ id: "all", name: "All" }, ...D.categories]
    .map((c, i) => `<button class="${i ? "" : "on"}" data-f="${c.id}" aria-pressed="${!i}">${esc(c.name)}<sup>${count(c.id)}</sup></button>`).join("");

  const grid = hive($("#pgrid"), D.projects);

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
    grid.filter((cat) => f === "all" || cat === f);
  });
};
