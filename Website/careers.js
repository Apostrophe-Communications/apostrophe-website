/* ==========================================================================
   Careers page
   Applications go to a Google Form (responses land in a Google Sheet, CVs in
   Drive). The form is hosted by Google because only Google Forms can take a
   file upload; until APOS.careers.form is set the button opens an email.
   ========================================================================== */
window.APOS_PAGE = () => {
  const { $, esc } = window.APOS_UI;
  const C = window.APOS.careers || {};

  $("#roles").innerHTML = (C.roles || []).map((r) => `<li data-reveal>${esc(r)}</li>`).join("");

  if (C.form) {
    $("#applyBtn").href = C.form;
  } else {
    $("#applyNote").textContent = "Email us your CV with your name, age, location, years of experience and the roles you are interested in.";
  }
};
