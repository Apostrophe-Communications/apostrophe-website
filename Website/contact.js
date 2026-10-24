/* ==========================================================================
   Contact page
   Three tabs: Brands and Creators each send to their own Google Form (whose
   responses land in a Google Sheet) once its action is set in APOS.contact;
   until then the form opens the visitor's email app, pre-filled. Careers links
   to the careers form, which Google hosts because only it can take a CV upload.
   Spam: a hidden trap field, a minimum time on the page, and a short cooldown
   between sends. Every value is trimmed, length-capped and stripped of control
   characters, and anything that could run as a spreadsheet formula is neutralised.
   ========================================================================== */
window.APOS_PAGE = () => {
  const { $, $$, esc } = window.APOS_UI;
  const D = window.APOS;
  const c = D.contact;

  $("#contactInfo").innerHTML = `
    <div data-reveal><h2>Let’s Connect</h2><a class="link-u mail" href="mailto:${esc(c.email)}">${esc(c.email).replace("@", "@<wbr>")}</a></div>
    <div data-reveal><h2>Studio</h2><p><a class="link-u" href="${esc(c.maps)}" target="_blank" rel="noopener">${esc(c.address)}</a></p></div>
    <div data-reveal><h2>Partner Offices</h2><p class="small">${D.offices.map(esc).join(" · ")}</p></div>
    <div data-reveal><h2>Follow</h2><p><a class="link-u" href="${esc(c.instagram)}">Instagram</a> &nbsp; <a class="link-u" href="${esc(c.linkedin)}">LinkedIn</a></p></div>`;

  /* ---------- tabs (contact.html#creators or #careers opens that tab) ---------- */
  const tabs = $$('[role="tab"]');
  const show = (id) => {
    tabs.forEach((t) => {
      const on = t.id === `tab-${id}`;
      t.classList.toggle("on", on);
      t.setAttribute("aria-selected", on);
      $(`#${t.getAttribute("aria-controls")}`).hidden = !on;
    });
    window.ScrollTrigger && ScrollTrigger.refresh();
  };
  tabs.forEach((t) => t.addEventListener("click", () => {
    const id = t.id.replace("tab-", "");
    show(id);
    history.replaceState(null, "", id === "brands" ? location.pathname : `#${id}`);
  }));
  const fromHash = () => {
    const id = location.hash.slice(1) || "brands";
    if (!["brands", "creators", "careers"].includes(id)) return false;
    show(id);
    return true;
  };
  if (location.hash) fromHash();
  // the footer's Sign Up links change the hash while already on this page
  addEventListener("hashchange", () => {
    if (!fromHash()) return;
    const el = $(".contact__forms"), lenis = window.APOS_UI.lenis;
    lenis ? lenis.scrollTo(el, { offset: -120 }) : el.scrollIntoView({ block: "start" });
  });
  if (D.careers && D.careers.form) {
    const a = $("#careersApply");
    a.href = D.careers.form;
    a.target = "_blank";
    a.rel = "noopener";
  }

  /* ---------- shared form handling ---------- */
  // "@name", "name" or a profile link all become instagram.com/name
  const handle = (v) => {
    const m = String(v || "").trim().match(/^(?:https?:\/\/)?(?:www\.)?(?:instagram\.com\/)?@?([A-Za-z0-9._]{1,30})\/?(?:\?.*)?$/i);
    return m ? m[1] : null;
  };
  const valid = {
    email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v),
    phone: (v) => /^\+?[\d\s()-]{6,20}$/.test(v) && v.replace(/\D/g, "").length >= 7,
    instagram: (v) => !v.trim() || !!handle(v),
    age: (v) => /^\d{1,3}$/.test(v) && +v >= 13 && +v <= 100,
  };
  const MSG = {
    email: "Please enter a valid email address.",
    phone: "Please enter a valid phone number.",
    instagram: "Please enter the Instagram handle, like @yourname.",
    age: "Please enter your age in years.",
  };
  const opened = Date.now();
  const COOLDOWN = 60 * 1000;

  const KINDS = {
    brand: {
      cfg: c.googleForm,
      limits: { brand: 100, email: 254, phone: 20, instagram: 100 },
      thanks: "Thank you, we’ll be in touch shortly.",
      mail: (d) => [`Enquiry from ${d.brand}`, `Brand: ${d.brand}\nEmail: ${d.email}\nPhone: ${d.phone}\nInstagram: ${d.instagram || "-"}`],
    },
    creator: {
      cfg: c.creatorForm,
      limits: { name: 100, age: 3, gender: 40, instagram: 100, niche: 40, followers: 40, email: 254, phone: 20, collabs: 200 },
      thanks: "Thank you, you’re on our creator list. We’ll reach out when a brand fits.",
      mail: (d) => [`Creator: ${d.name}`, `Name: ${d.name}\nAge: ${d.age}\nGender: ${d.gender}\nInstagram: ${d.instagram}\nNiche: ${d.niche}\nFollowers: ${d.followers}\nEmail: ${d.email}\nPhone: ${d.phone}\nTop 3 brand collabs: ${d.collabs || "-"}`],
    },
  };

  $$("form[data-kind]").forEach((form) => {
    const kind = KINDS[form.dataset.kind];
    const status = $(".form__status", form), btn = $('button[type="submit"]', form);
    const gf = kind.cfg || {};
    const key = `apos-sent-${form.dataset.kind}`;
    let sending = false;

    // trim, cap length, drop control characters
    const clean = (k, v) => {
      let s = String(v || "").replace(/[\u0000-\u001F\u007F]/g, "").trim().slice(0, kind.limits[k]);
      if (k === "instagram" && s) s = `instagram.com/${handle(s)}`;
      // a value starting with = + - @ could run as a formula in the Sheet, so make it plain text
      if (/^[=+\-@]/.test(s) && !(k === "phone" && /^\+[\d\s()-]+$/.test(s))) s = "'" + s;
      return s;
    };
    const lastSent = () => { try { return +localStorage.getItem(key) || 0; } catch (e) { return 0; } };
    const markSent = () => { try { localStorage.setItem(key, Date.now()); } catch (e) {} };
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
      for (const k of ["email", "phone", "instagram", "age"]) {
        const f = form.elements[k];
        if (f && !valid[k](f.value.trim())) return nudge(f, MSG[k]);
      }

      // bots: filled the hidden field, or submitted within 3 seconds of the page opening.
      // They get the normal thank-you so they don't learn anything, but nothing is sent.
      if (form.elements.website.value || Date.now() - opened < 3000) {
        form.reset();
        status.textContent = kind.thanks;
        return;
      }
      const wait = COOLDOWN - (Date.now() - lastSent());
      if (wait > 0) {
        status.textContent = `Thanks, we’ve just received this from you. Please wait ${Math.ceil(wait / 1000)} seconds before sending again.`;
        return;
      }

      const data = {};
      for (const k of Object.keys(kind.limits)) data[k] = clean(k, form.elements[k].value);

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
          status.textContent = kind.thanks;
        } catch {
          status.textContent = `Something went wrong. Please email us at ${c.email}.`;
        } finally {
          sending = false;
          btn.disabled = false;
        }
      } else {
        const [subject, body] = kind.mail(data);
        location.href = `mailto:${c.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        status.textContent = "Opening your email app…";
      }
    });
  });
};
