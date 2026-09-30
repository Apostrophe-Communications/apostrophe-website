/* ==========================================================================
   Contact page
   If APOS.contact.formEndpoint is set (Formspree / Web3Forms URL) the form
   posts there; otherwise it opens the visitor's email app, pre-filled.
   ========================================================================== */
window.APOS_PAGE = () => {
  const { $, esc } = window.APOS_UI;
  const c = window.APOS.contact;
  const offices = window.APOS.offices;

  $("#contactInfo").innerHTML = `
    <div data-reveal><h2>Let’s connect</h2><a class="link-u" href="mailto:${c.email}">${esc(c.email)}</a></div>
    <div data-reveal><h2>Call</h2><p>${esc(c.phone)}</p></div>
    <div data-reveal><h2>Studio</h2><p>${esc(c.address)}</p></div>
    <div data-reveal><h2>Partner offices</h2><p class="small">${offices.map(esc).join(" · ")}</p></div>
    <div data-reveal><h2>Follow</h2><p><a class="link-u" href="${c.instagram}">Instagram</a> &nbsp; <a class="link-u" href="${c.linkedin}">LinkedIn</a></p></div>`;

  const form = $("#form"), status = $("#formStatus");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const bad = [...form.querySelectorAll("[required]")].find((f) => !f.value.trim() || (f.type === "email" && !/^\S+@\S+\.\S+$/.test(f.value)));
    if (bad) {
      status.textContent = "Please fill in the highlighted field.";
      bad.focus();
      gsap.fromTo(bad.parentElement, { x: -8 }, { x: 0, duration: 0.6, ease: "elastic.out(1, 0.3)" });
      return;
    }
    const data = Object.fromEntries(new FormData(form));
    if (c.formEndpoint) {
      status.textContent = "Sending…";
      try {
        const r = await fetch(c.formEndpoint, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(data) });
        if (!r.ok) throw new Error();
        form.reset();
        status.textContent = "Thank you, we’ll be in touch shortly.";
      } catch {
        status.textContent = `Something went wrong. Please email us at ${c.email}.`;
      }
    } else {
      const body = `Name: ${data.name}\nEmail: ${data.email}\nPhone: ${data.phone || "-"}\n\n${data.message}`;
      location.href = `mailto:${c.email}?subject=${encodeURIComponent(data.subject)}&body=${encodeURIComponent(body)}`;
      status.textContent = "Opening your email app…";
    }
  });
};
