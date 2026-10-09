/* ==========================================================================
   Contact page
   Enquiries go to a Google Form (whose responses land in a Google Sheet) when
   APOS.contact.googleForm.action is set; otherwise the form opens the visitor's
   email app, pre-filled.
   Spam: a hidden trap field, a minimum time on the page, and a short cooldown
   between sends. Every value is trimmed, length-capped and stripped of control
   characters, and anything that could run as a spreadsheet formula is neutralised.
   ========================================================================== */
window.APOS_PAGE = () => {
  const { $, esc } = window.APOS_UI;
  const c = window.APOS.contact;
  const offices = window.APOS.offices;

  $("#contactInfo").innerHTML = `
    <div data-reveal><h2>Let’s Connect</h2><a class="link-u mail" href="mailto:${esc(c.email)}">${esc(c.email).replace("@", "@<wbr>")}</a></div>
    <div data-reveal><h2>Studio</h2><p>${esc(c.address)}</p></div>
    <div data-reveal><h2>Partner Offices</h2><p class="small">${offices.map(esc).join(" · ")}</p></div>
    <div data-reveal><h2>Follow</h2><p><a class="link-u" href="${esc(c.instagram)}">Instagram</a> &nbsp; <a class="link-u" href="${esc(c.linkedin)}">LinkedIn</a></p></div>`;

  const form = $("#form"), status = $("#formStatus"), btn = form.querySelector('button[type="submit"]');
  const gf = c.googleForm || {};
  const LIMIT = { brand: 100, email: 254, phone: 20, instagram: 100 };
  const opened = Date.now();
  const COOLDOWN = 60 * 1000;
  let sending = false;

  // "@brand", "brand" or a profile link all become instagram.com/brand
  const handle = (v) => {
    const m = String(v || "").trim().match(/^(?:https?:\/\/)?(?:www\.)?(?:instagram\.com\/)?@?([A-Za-z0-9._]{1,30})\/?(?:\?.*)?$/i);
    return m ? m[1] : null;
  };
  // trim, cap length, drop control characters
  const clean = (k, v) => {
    let s = String(v || "").replace(/[\u0000-\u001F\u007F]/g, "").trim().slice(0, LIMIT[k]);
    if (k === "instagram" && s) s = `instagram.com/${handle(s)}`;
    // a value starting with = + - @ could run as a formula in the Sheet, so make it plain text
    if (/^[=+\-@]/.test(s) && !(k === "phone" && /^\+[\d\s()-]+$/.test(s))) s = "'" + s;
    return s;
  };
  const valid = {
    email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v),
    phone: (v) => /^\+?[\d\s()-]{6,20}$/.test(v) && v.replace(/\D/g, "").length >= 7,
    instagram: (v) => !v || !!handle(v),
  };
  const lastSent = () => { try { return +localStorage.getItem("apos-sent") || 0; } catch (e) { return 0; } };
  const markSent = () => { try { localStorage.setItem("apos-sent", Date.now()); } catch (e) {} };

  const nudge = (el, msg) => {
    status.textContent = msg;
    el.focus();
    gsap.fromTo(el.parentElement, { x: -8 }, { x: 0, duration: 0.6, ease: "elastic.out(1, 0.3)" });
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (sending) return;

    const bad = [...form.querySelectorAll("[required]")].find((f) => !f.value.trim());
    if (bad) return nudge(bad, "Please fill in the highlighted field.");
    if (!valid.email(form.elements.email.value.trim())) return nudge(form.elements.email, "Please enter a valid email address.");
    if (!valid.phone(form.elements.phone.value.trim())) return nudge(form.elements.phone, "Please enter a valid phone number.");
    if (!valid.instagram(form.elements.instagram.value)) return nudge(form.elements.instagram, "Please enter the Instagram handle, like @yourbrand, or leave it blank.");

    // bots: filled the hidden field, or submitted within 3 seconds of the page opening.
    // They get the normal thank-you so they don't learn anything, but nothing is sent.
    if (form.elements.website.value || Date.now() - opened < 3000) {
      form.reset();
      status.textContent = "Thank you, we’ll be in touch shortly.";
      return;
    }
    const wait = COOLDOWN - (Date.now() - lastSent());
    if (wait > 0) {
      status.textContent = `Thanks, we’ve just received a message from you. Please wait ${Math.ceil(wait / 1000)} seconds before sending another.`;
      return;
    }

    const data = {};
    for (const k of Object.keys(LIMIT)) data[k] = clean(k, form.elements[k].value);

    if (gf.action && gf.fields) {
      sending = true;
      btn.disabled = true;
      status.textContent = "Sending…";
      const body = new URLSearchParams();
      for (const [k, entry] of Object.entries(gf.fields)) if (entry) body.append(entry, data[k] || "");
      try {
        // Google Forms doesn't allow reading its reply from another site ("no-cors"),
        // so a send that reaches Google counts as delivered; only network failures land in catch
        await fetch(gf.action, { method: "POST", mode: "no-cors", body });
        markSent();
        form.reset();
        status.textContent = "Thank you, we’ll be in touch shortly.";
      } catch {
        status.textContent = `Something went wrong. Please email us at ${c.email}.`;
      } finally {
        sending = false;
        btn.disabled = false;
      }
    } else {
      const body = `Brand: ${data.brand}\nEmail: ${data.email}\nPhone: ${data.phone}\nInstagram: ${data.instagram || "-"}`;
      location.href = `mailto:${c.email}?subject=${encodeURIComponent(`Enquiry from ${data.brand}`)}&body=${encodeURIComponent(body)}`;
      status.textContent = "Opening your email app…";
    }
  });
};
