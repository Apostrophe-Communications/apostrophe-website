/* ==========================================================================
   About page
   ========================================================================== */
window.APOS_PAGE = () => {
  const { $, $$, RM, esc, media, logo, MARK } = window.APOS_UI;
  const D = window.APOS;

  $("#founderMark").innerHTML = MARK();
  $("#founderPhoto").innerHTML = media({ title: "Kritika Lalchandani", image: "team/kritika-lalchandani.jpg" });
  $("#team").innerHTML = D.team.map((t) => `
    <figure class="team__card" data-reveal>
      <div class="team__photo"><img src="${esc(t.photo)}" alt="${esc(t.name)}" loading="lazy" decoding="async"></div>
      <figcaption><h3>${esc(t.name)}</h3><p>${esc(t.role)}</p></figcaption>
    </figure>`).join("");
  $("#logos").innerHTML = D.press.map((b) => `<div data-reveal>${logo(b)}</div>`).join("");

  if (RM) return;

  // the apostrophe mark slowly turns behind the founder as you scroll
  gsap.fromTo("#founderMark svg", { rotation: -10, yPercent: 8 }, { rotation: 6, yPercent: -8, ease: "none", scrollTrigger: { trigger: ".founder", start: "top bottom", end: "bottom top", scrub: true } });
  gsap.from("#founderPhoto", { clipPath: "inset(100% 0 0 0)", duration: 1.6, ease: "expo.inOut", scrollTrigger: { trigger: ".founder", start: "top 70%", once: true } });
  gsap.from("#founderPhoto > *", { scale: 1.25, duration: 2, ease: "expo.out", scrollTrigger: { trigger: ".founder", start: "top 70%", once: true } });
  gsap.from("#founderRule", { scaleX: 0, duration: 1.2, ease: "expo.inOut", scrollTrigger: { trigger: ".founder", start: "top 70%", once: true } });

  // partner tiles ripple in
  ScrollTrigger.batch($$("#logos > div"), {
    start: "top 92%", once: true,
    onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 1, ease: "expo.out", stagger: 0.05, overwrite: true }),
  });
  $$("#logos > div").forEach((el) => el.removeAttribute("data-reveal"));
  gsap.set("#logos > div", { opacity: 0, y: 28 });
};
