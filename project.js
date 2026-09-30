/* ==========================================================================
   Project detail — built from APOS.projects using ?p=<slug>
   ========================================================================== */
window.APOS_PAGE = () => {
  const { $, esc, media } = window.APOS_UI;
  const D = window.APOS;
  const slug = new URLSearchParams(location.search).get("p");
  const i = Math.max(0, D.projects.findIndex((p) => p.slug === slug));
  const p = D.projects[i];
  const next = D.projects[(i + 1) % D.projects.length];
  const cat = D.categories.find((c) => c.id === p.category)?.name || "";
  document.title = `${p.title} — Apostrophe Communications`;

  const blocks = (list) => list.map((b) => {
    if (b.t === "h") return `<h3>${esc(b.v)}</h3>`;
    if (b.t === "label") return `<div class="lbl">${esc(b.v)}</div>`;
    if (b.t === "list") return `${b.label ? `<div class="lbl">${esc(b.label)}</div>` : ""}<ul>${b.v.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>`;
    return `<p>${esc(b.v)}</p>`;
  }).join("");

  const SECS = [["background", "Background"], ["objective", "Objective"], ["solution", "Solution"], ["impact", "Impact"]];

  $("#cs").innerHTML = `
    <section class="s t-dark cs-hero grain" data-theme="dark">
      <div class="wrap">
        <div class="cs-hero__meta" data-reveal><span class="pill">${esc(cat)}</span>${p.tags.map((t) => `<span class="pill">${esc(t)}</span>`).join("")}</div>
        <h1 data-split>${esc(p.title)}</h1>
        <p class="cs-hero__sub" data-reveal>${esc(p.subtitle)}</p>
      </div>
      <div class="cs-hero__media"><div data-parallax="8" style="position:absolute;inset:-10% 0;">${media(p, "Project image placeholder")}</div></div>
    </section>

    ${p.highlights.length ? `
    <section class="s t-light" data-theme="light">
      <div class="wrap cs-stats">
        ${p.highlights.map((h) => `
          <div data-reveal><span class="stat__n" data-count="${h.value}">${h.prefix ? `<sup style="margin:0 .04em 0 0">${esc(h.prefix)}</sup>` : ""}<span data-num>${h.value}</span>${h.suffix ? `<sup>${esc(h.suffix)}</sup>` : ""}</span><span class="stat__l">${esc(h.label)}</span></div>`).join("")}
      </div>
    </section>` : ""}

    <section class="s t-light cs-body" data-theme="light">
      <div class="wrap">
        ${p.placeholder ? `<p class="cs-note">Placeholder copy — the case study for ${esc(p.title)} will be added soon.</p>` : ""}
        ${SECS.filter(([k]) => p.sections[k]).map(([k, label], n) => `
          <div class="cs-sec">
            <div class="cs-sec__label"><span>${String(n + 1).padStart(2, "0")}</span><h2 data-split>${label}</h2></div>
            <div class="cs-sec__text" data-reveal>${blocks(p.sections[k])}</div>
          </div>`).join("")}
      </div>
    </section>

    <a class="s t-dark cs-next grain" data-theme="dark" href="project.html?p=${next.slug}" data-cursor="Next">
      <div class="wrap"><small>Next project</small><h2>${esc(next.title)}</h2></div>
    </a>`;
};
