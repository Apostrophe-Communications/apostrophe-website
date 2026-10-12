/* ==========================================================================
   Project detail: built from APOS.projects using ?p=<slug>
   ========================================================================== */
window.APOS_PAGE = () => {
  const { $, esc, media, srcset } = window.APOS_UI;
  const D = window.APOS;
  const slug = new URLSearchParams(location.search).get("p");
  const i = Math.max(0, D.projects.findIndex((p) => p.slug === slug || (p.aliases || []).includes(slug)));
  const p = D.projects[i];
  const cat = D.categories.find((c) => c.id === p.category)?.name || "";
  document.title = `${p.title} | Apostrophe Communications`;

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
        ${p.titleLogo
          ? `<h1 class="cs-hero__logo" data-reveal><img src="${esc(p.titleLogo.src)}" alt="${esc(p.title)}" width="${p.titleLogo.w}" height="${p.titleLogo.h}" fetchpriority="high" decoding="async"></h1>`
          : `<h1 data-split>${esc(p.title)}</h1>`}
        <p class="cs-hero__sub" data-reveal>${esc(p.subtitle)}</p>
      </div>
      <div class="cs-hero__media"><div data-parallax="8" style="position:absolute;inset:-10% 0;">${media(p, "Project image placeholder", true)}</div></div>
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
        ${p.placeholder ? `<p class="cs-note">Placeholder copy. The case study for ${esc(p.title)} will be added soon.</p>` : ""}
        ${SECS.filter(([k]) => p.sections[k]).map(([k, label], n) => `
          <div class="cs-sec">
            <div class="cs-sec__label"><span>${String(n + 1).padStart(2, "0")}</span><h2 data-split>${label}</h2></div>
            <div class="cs-sec__text" data-reveal>${blocks(p.sections[k])}</div>
          </div>`).join("")}
      </div>
    </section>

    ${p.slider ? `
    <section class="s t-light cs-reel" data-theme="light" aria-label="${esc(p.slider.title)}">
      <div class="wrap cs-reel__head">
        <h2 data-split>${esc(p.slider.title)}</h2>
        <div class="slider__nav cs-reel__nav">
          <button id="reelPrev" aria-label="Previous photos"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M14 8H2M7 3 2 8l5 5"/></svg></button>
          <button id="reelNext" aria-label="Next photos"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M2 8h12M9 3l5 5-5 5"/></svg></button>
        </div>
      </div>
      <div class="cs-reel__track" id="reel" tabindex="0" role="group" aria-label="${esc(p.slider.title)}: scroll sideways for more">
        ${p.slider.items.map((it) => `<figure class="cs-reel__item"><img src="${esc(it.src)}" srcset="${esc(it.src.replace(/\.webp$/, "-sm.webp"))} 640w, ${esc(it.src)} 1080w" sizes="(max-width: 760px) 72vw, 26vw" alt="${esc(it.alt)}" width="1080" height="1350" loading="lazy" decoding="async" draggable="false"></figure>`).join("")}
      </div>
    </section>` : ""}

    ${(p.gallery || []).length ? `
    <section class="s t-light cs-gallery" data-theme="light">
      <div class="wrap cs-gallery__grid">
        ${p.gallery.map((src, n) => `<figure class="cs-gallery__item" data-reveal><img src="${esc(src)}" srcset="${srcset(src)}" sizes="(max-width: 760px) 100vw, 33vw" alt="${esc(p.title)}, image ${n + 2}" loading="lazy" decoding="async"></figure>`).join("")}
      </div>
    </section>` : ""}`;

  /* The sideways slider scrolls natively (swipe, trackpad, arrow keys) and snaps to each photo.
     The arrows move one photo at a time; with a mouse you can also drag it. */
  const reel = $("#reel");
  if (reel) {
    const prev = $("#reelPrev"), next = $("#reelNext");
    const stepSize = () => { const f = reel.querySelector(".cs-reel__item"); return f ? f.getBoundingClientRect().width + parseFloat(getComputedStyle(reel).columnGap || 0) : reel.clientWidth; };
    const go = (dir) => reel.scrollBy({ left: dir * stepSize(), behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    prev.addEventListener("click", () => go(-1));
    next.addEventListener("click", () => go(1));
    const sync = () => {
      prev.disabled = reel.scrollLeft <= 2;
      next.disabled = reel.scrollLeft >= reel.scrollWidth - reel.clientWidth - 2;
    };
    reel.addEventListener("scroll", sync, { passive: true });
    addEventListener("resize", sync);
    sync();

    let drag = null;
    reel.addEventListener("pointerdown", (e) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      drag = { x: e.clientX, left: reel.scrollLeft, moved: false };
    });
    addEventListener("pointermove", (e) => {
      if (!drag) return;
      const dx = e.clientX - drag.x;
      if (!drag.moved && Math.abs(dx) > 4) { drag.moved = true; reel.classList.add("is-drag"); }
      if (drag.moved) reel.scrollLeft = drag.left - dx;
    });
    const end = () => { if (!drag) return; reel.classList.remove("is-drag"); drag = null; };
    addEventListener("pointerup", end);
    addEventListener("pointercancel", end);
  }
};
