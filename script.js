/* Leadscogen — shared site behaviour
   Injects header/footer/lead-form modal, handles nav + multi-step form. */

/* ---------------------------------------------------------------------
   CONFIGURE THIS: paste your deployed Google Apps Script web app URL
   (see apps-script.gs + README.md). Leave blank to fall back to a
   mailto link so the form still works before the script is deployed.
--------------------------------------------------------------------- */
const LEAD_ENDPOINT_URL = "";
const NOTIFY_EMAIL = "hello@leadscogen.in"; // update to your real inbox

const NAV_LINKS = [
  { href: "index.html", label: "Loans" },
  { href: "loan-optimization.html", label: "Loan optimization" },
  { href: "insurance.html", label: "Insurance" },
  { href: "mutual-funds.html", label: "Mutual funds" },
  { href: "about.html", label: "How it works" },
  { href: "contact.html", label: "Contact" },
];

function currentPage() {
  const p = location.pathname.split("/").pop();
  return p === "" ? "index.html" : p;
}

function renderHeader() {
  const slot = document.getElementById("site-header");
  if (!slot) return;
  const page = currentPage();
  const links = NAV_LINKS.map(
    (l) =>
      `<a href="${l.href}"${l.href === page ? ' class="active"' : ""}>${l.label}</a>`
  ).join("");
  slot.innerHTML = `
  <header class="site-header">
    <div class="container">
      <a href="index.html" class="brand"><span class="mark">L</span>Leadscogen</a>
      <nav class="nav" id="siteNav">${links}</nav>
      <div class="header-actions">
        <a href="contact.html" class="btn btn-outline btn-sm">Request a callback</a>
        <button class="btn btn-primary btn-sm" data-open-lead-form>Get started</button>
        <button class="nav-toggle" id="navToggle" aria-label="Toggle menu" aria-expanded="false">
          <span></span><span></span><span></span>
        </button>
      </div>
    </div>
  </header>`;

  const toggle = document.getElementById("navToggle");
  const nav = document.getElementById("siteNav");
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  });
}

function renderFooter() {
  const slot = document.getElementById("site-footer");
  if (!slot) return;
  const year = new Date().getFullYear();
  slot.innerHTML = `
  <footer class="site-footer">
    <div class="container">
      <div class="footer-grid">
        <div>
          <h4>Leadscogen</h4>
          <p style="color:rgba(255,255,255,0.62);max-width:40ch;font-size:0.88rem;">
            A financial-services facilitation and lead-generation platform. We help you share your
            requirement and explore options through our financial network.
          </p>
        </div>
        <div>
          <h4>Explore</h4>
          <a href="personal-loan.html">Personal loan</a>
          <a href="business-loan.html">Business loan</a>
          <a href="home-loan.html">Home loan</a>
          <a href="lap.html">Loan against property</a>
          <a href="loan-optimization.html">Loan optimization</a>
        </div>
        <div>
          <h4>Company</h4>
          <a href="about.html">About &amp; how it works</a>
          <a href="insurance.html">Insurance</a>
          <a href="mutual-funds.html">Mutual funds</a>
          <a href="contact.html">Contact &amp; grievance</a>
        </div>
        <div>
          <h4>Legal</h4>
          <a href="privacy.html">Privacy policy</a>
          <a href="terms.html">Terms of use</a>
          <a href="disclaimer.html">Disclaimer</a>
          <a href="consent.html">Consent policy</a>
        </div>
      </div>
      <p class="footer-disclaimer">
        Leadscogen is a lead-generation and financial-services facilitation platform and is not a
        bank, NBFC or lender. We do not sanction loans, determine interest rates or guarantee
        approval. Loan, insurance and mutual-fund outcomes are determined solely by the respective
        regulated financial partner, subject to their own eligibility, underwriting and
        documentation requirements. Submission of an enquiry does not guarantee approval, a
        particular rate, product or disbursement.
      </p>
      <div class="footer-bottom">
        <span>&copy; ${year} Leadscogen. All rights reserved.</span>
        <span>Sole proprietorship &middot; India</span>
      </div>
    </div>
  </footer>`;
}

/* ---------------------------------------------------------------------
   Lead form modal
--------------------------------------------------------------------- */
const PRODUCTS = [
  "Personal loan",
  "Business loan",
  "Home loan",
  "Loan against property",
  "Loan optimization",
  "Balance transfer",
  "Top-up loan",
  "Insurance",
  "Mutual funds",
];

const SLOTS = ["10 AM – 12 PM", "12 PM – 2 PM", "2 PM – 4 PM", "4 PM – 6 PM", "6 PM – 8 PM"];

function renderModal() {
  if (document.getElementById("leadModal")) return;
  const wrap = document.createElement("div");
  wrap.innerHTML = `
  <div class="modal-overlay" id="leadModal">
    <div class="modal" role="dialog" aria-modal="true" aria-labelledby="leadFormTitle">
      <button class="modal-close" id="leadModalClose" aria-label="Close">&times;</button>
      <h2 id="leadFormTitle" style="font-size:1.3rem;margin-bottom:4px;">Tell us what you need</h2>
      <p style="font-size:0.9rem;margin-bottom:18px;">Takes about a minute. No OTP, PIN or banking credentials are ever asked here.</p>
      <div class="modal-progress">
        <span class="s1 done"></span><span class="s2"></span><span class="s3"></span><span class="s4"></span>
      </div>
      <form id="leadForm" novalidate>
        <div class="form-step active" data-step="1">
          <div class="field">
            <label>What financial solution are you looking for?</label>
            <div class="option-grid" id="productOptions"></div>
            <div class="field-error" id="err-product">Please select one option to continue.</div>
          </div>
          <div class="form-nav"><span></span><button type="button" class="btn btn-primary" data-next>Continue</button></div>
        </div>

        <div class="form-step" data-step="2">
          <div class="field"><label for="f-name">Full name</label><input id="f-name" name="name" required /><div class="field-error">Enter your full name.</div></div>
          <div class="field"><label for="f-mobile">Mobile number</label><input id="f-mobile" name="mobile" inputmode="numeric" maxlength="10" required /><div class="field-error">Enter a valid 10-digit mobile number.</div></div>
          <div class="field"><label for="f-email">Email address</label><input id="f-email" name="email" type="email" required /><div class="field-error">Enter a valid email address.</div></div>
          <div class="field" style="display:flex;gap:12px;">
            <div style="flex:1;"><label for="f-city">City</label><input id="f-city" name="city" required /><div class="field-error">Enter your city.</div></div>
            <div style="flex:1;"><label for="f-state">State</label><input id="f-state" name="state" required /><div class="field-error">Enter your state.</div></div>
          </div>
          <div class="form-nav"><button type="button" class="btn btn-outline" data-back>Back</button><button type="button" class="btn btn-primary" data-next>Continue</button></div>
        </div>

        <div class="form-step" data-step="3">
          <div class="field"><label for="f-amount">Approximate amount (₹)</label><input id="f-amount" name="amount" inputmode="numeric" placeholder="e.g. 500000" /></div>
          <div class="field"><label for="f-employment">Employment type</label>
            <select id="f-employment" name="employment">
              <option>Salaried</option><option>Self-employed</option><option>Business owner</option><option>Professional</option><option>Other</option>
            </select>
          </div>
          <div class="field"><label for="f-income">Approx. monthly income / turnover (₹)</label><input id="f-income" name="income" inputmode="numeric" /></div>
          <div class="field"><label for="f-credit">Approximate credit score (self-declared, optional)</label>
            <select id="f-credit" name="creditScore">
              <option value="Not sure">I don't know / not sure</option>
              <option value="Below 650">Below 650</option>
              <option value="650–750">650–750</option>
              <option value="Above 750">Above 750</option>
            </select>
            <div style="font-size:0.78rem;color:var(--ink-faint);margin-top:5px;">This is just your own estimate — we don't run a credit check here. <a href="https://www.cibil.com/freecibilscore" target="_blank" rel="noopener">Check your free official score →</a></div>
          </div>
          <div class="field"><label>Do you have an existing loan?</label>
            <div class="option-grid" style="grid-template-columns:1fr 1fr;">
              <div class="option-tile" data-existing="Yes">Yes</div>
              <div class="option-tile" data-existing="No">No</div>
            </div>
          </div>
          <div id="existingLoanFields" style="display:none;">
            <div class="field"><label for="f-exist-type">Existing loan type</label><input id="f-exist-type" name="existingType" /></div>
            <div class="field" style="display:flex;gap:12px;">
              <div style="flex:1;"><label for="f-exist-out">Approx. outstanding (₹)</label><input id="f-exist-out" name="existingOutstanding" inputmode="numeric" /></div>
              <div style="flex:1;"><label for="f-exist-emi">Current EMI (₹)</label><input id="f-exist-emi" name="existingEmi" inputmode="numeric" /></div>
            </div>
            <div class="field"><label for="f-exist-lender">Current lender</label><input id="f-exist-lender" name="existingLender" /></div>
          </div>
          <div class="form-nav"><button type="button" class="btn btn-outline" data-back>Back</button><button type="button" class="btn btn-primary" data-next>Continue</button></div>
        </div>

        <div class="form-step" data-step="4">
          <div class="field">
            <label>Preferred callback time</label>
            <div class="slot-grid" id="slotOptions"></div>
            <div class="option-tile" id="anytimeOption" style="margin-top:10px;">Call me at the earliest available convenient time</div>
          </div>
          <div class="field"><label for="f-date">Preferred date (optional)</label><input id="f-date" name="date" type="date" /></div>
          <div class="hr" style="margin:16px 0;"></div>
          <div class="consent-row">
            <input type="checkbox" id="f-consent" required />
            <label for="f-consent">I agree to be contacted by Leadscogen regarding my enquiry and understand my information may be shared with relevant financial partners where necessary to respond to my request, subject to the <a href="privacy.html" target="_blank">privacy policy</a>.</label>
          </div>
          <div class="field-error" id="err-consent">Please provide consent to continue — it's required to process your enquiry.</div>
          <div class="consent-row">
            <input type="checkbox" id="f-marketing" />
            <label for="f-marketing">Also send me occasional updates about new loan, insurance and mutual-fund solutions (optional).</label>
          </div>
          <div class="form-nav"><button type="button" class="btn btn-outline" data-back>Back</button><button type="submit" class="btn btn-primary">Submit enquiry</button></div>
        </div>

        <div class="form-step" data-step="thanks">
          <h3>Thank you for contacting Leadscogen.</h3>
          <p>Your enquiry has been received. We will contact you during your selected time slot.</p>
          <div class="thankyou-ref">
            Reference number: <strong id="thanksRef"></strong><br />
            Enquiry category: <strong id="thanksProduct"></strong><br />
            Preferred callback: <strong id="thanksSlot"></strong>
          </div>
          <p style="font-size:0.85rem;">Submission of an enquiry does not guarantee loan approval or any particular financial product, rate, tenure or terms.</p>
          <button type="button" class="btn btn-outline btn-block" id="leadModalDone">Close</button>
        </div>
      </form>
    </div>
  </div>`;
  document.body.appendChild(wrap.firstElementChild);

  // populate product + slot options
  const prodWrap = document.getElementById("productOptions");
  PRODUCTS.forEach((p) => {
    const d = document.createElement("div");
    d.className = "option-tile";
    d.dataset.product = p;
    d.textContent = p;
    prodWrap.appendChild(d);
  });
  const slotWrap = document.getElementById("slotOptions");
  SLOTS.forEach((s) => {
    const d = document.createElement("div");
    d.className = "option-tile";
    d.dataset.slot = s;
    d.textContent = s;
    slotWrap.appendChild(d);
  });

  wireModal();
}

function wireModal() {
  const overlay = document.getElementById("leadModal");
  const form = document.getElementById("leadForm");
  let state = { step: 1, product: "", slot: "", existing: "No" };

  function openModal(preselectProduct) {
    overlay.classList.add("open");
    document.body.style.overflow = "hidden";
    if (preselectProduct) selectTile("product", preselectProduct);
  }
  function closeModal() {
    overlay.classList.remove("open");
    document.body.style.overflow = "";
  }
  document.getElementById("leadModalClose").addEventListener("click", closeModal);
  document.getElementById("leadModalDone")?.addEventListener("click", () => {
    closeModal();
    resetForm();
  });
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeModal();
  });

  document.querySelectorAll("[data-open-lead-form]").forEach((btn) => {
    btn.addEventListener("click", () => openModal(btn.getAttribute("data-product") || ""));
  });

  function selectTile(type, value) {
    if (type === "product") {
      state.product = value;
      document.querySelectorAll("#productOptions .option-tile").forEach((t) => {
        t.classList.toggle("selected", t.dataset.product === value);
      });
    }
  }

  document.getElementById("productOptions").addEventListener("click", (e) => {
    const tile = e.target.closest(".option-tile");
    if (!tile) return;
    selectTile("product", tile.dataset.product);
    hideError("err-product");
  });

  document.querySelectorAll("[data-existing]").forEach((tile) => {
    tile.addEventListener("click", () => {
      state.existing = tile.dataset.existing;
      document.querySelectorAll("[data-existing]").forEach((t) => t.classList.remove("selected"));
      tile.classList.add("selected");
      document.getElementById("existingLoanFields").style.display =
        state.existing === "Yes" ? "block" : "none";
    });
  });

  document.getElementById("slotOptions").addEventListener("click", (e) => {
    const tile = e.target.closest(".option-tile");
    if (!tile) return;
    state.slot = tile.dataset.slot;
    document.querySelectorAll("#slotOptions .option-tile").forEach((t) => t.classList.remove("selected"));
    document.getElementById("anytimeOption").classList.remove("selected");
    tile.classList.add("selected");
  });
  document.getElementById("anytimeOption").addEventListener("click", function () {
    state.slot = "Earliest available";
    document.querySelectorAll("#slotOptions .option-tile").forEach((t) => t.classList.remove("selected"));
    this.classList.add("selected");
  });

  function showStep(n) {
    document.querySelectorAll(".form-step").forEach((s) => s.classList.remove("active"));
    document.querySelector(`.form-step[data-step="${n}"]`).classList.add("active");
    [1, 2, 3, 4].forEach((i) => {
      document.querySelector(`.s${i}`)?.classList.toggle("done", i <= (n === "thanks" ? 4 : n));
    });
  }

  function showError(id) {
    document.getElementById(id)?.classList.add("show");
  }
  function hideError(id) {
    document.getElementById(id)?.classList.remove("show");
  }

  function validateStep(step) {
    let ok = true;
    if (step === 1) {
      if (!state.product) {
        showError("err-product");
        ok = false;
      }
    }
    if (step === 2) {
      const name = document.getElementById("f-name");
      const mobile = document.getElementById("f-mobile");
      const email = document.getElementById("f-email");
      const city = document.getElementById("f-city");
      const stateEl = document.getElementById("f-state");
      [name, mobile, email, city, stateEl].forEach((el) => el.nextElementSibling.classList.remove("show"));
      if (!name.value.trim()) { name.nextElementSibling.classList.add("show"); ok = false; }
      if (!/^[6-9]\d{9}$/.test(mobile.value.trim())) { mobile.nextElementSibling.classList.add("show"); ok = false; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) { email.nextElementSibling.classList.add("show"); ok = false; }
      if (!city.value.trim()) { city.nextElementSibling.classList.add("show"); ok = false; }
      if (!stateEl.value.trim()) { stateEl.nextElementSibling.classList.add("show"); ok = false; }
    }
    return ok;
  }

  form.addEventListener("click", (e) => {
    if (e.target.matches("[data-next]")) {
      if (!validateStep(state.step)) return;
      state.step += 1;
      showStep(state.step);
    }
    if (e.target.matches("[data-back]")) {
      state.step -= 1;
      showStep(state.step);
    }
  });

  function genRefId() {
    const d = new Date();
    const stamp = d.getFullYear().toString().slice(-2) + String(d.getMonth() + 1).padStart(2, "0") + String(d.getDate()).padStart(2, "0");
    return "LSG-" + stamp + "-" + Math.floor(1000 + Math.random() * 9000);
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideError("err-consent");
    const consent = document.getElementById("f-consent");
    if (!consent.checked) {
      showError("err-consent");
      return;
    }
    const refId = genRefId();
    const payload = {
      leadId: refId,
      timestamp: new Date().toISOString(),
      product: state.product,
      name: document.getElementById("f-name").value.trim(),
      mobile: document.getElementById("f-mobile").value.trim(),
      email: document.getElementById("f-email").value.trim(),
      city: document.getElementById("f-city").value.trim(),
      state: document.getElementById("f-state").value.trim(),
      amount: document.getElementById("f-amount").value.trim(),
      employment: document.getElementById("f-employment").value,
      income: document.getElementById("f-income").value.trim(),
      creditScore: document.getElementById("f-credit").value,
      existingLoan: state.existing,
      existingType: document.getElementById("f-exist-type").value.trim(),
      existingOutstanding: document.getElementById("f-exist-out").value.trim(),
      existingEmi: document.getElementById("f-exist-emi").value.trim(),
      existingLender: document.getElementById("f-exist-lender").value.trim(),
      preferredSlot: state.slot || "Earliest available",
      preferredDate: document.getElementById("f-date").value,
      consent: "Yes",
      marketingConsent: document.getElementById("f-marketing").checked ? "Yes" : "No",
      leadSource: document.title,
      pageUrl: location.href,
    };

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting…";

    try {
      if (LEAD_ENDPOINT_URL) {
        await fetch(LEAD_ENDPOINT_URL, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify(payload),
        });
      } else {
        // Fallback before the Apps Script endpoint is configured.
        const body = encodeURIComponent(
          Object.entries(payload).map(([k, v]) => `${k}: ${v}`).join("\n")
        );
        window.open(`mailto:${NOTIFY_EMAIL}?subject=New Leadscogen lead ${refId}&body=${body}`);
      }
    } catch (err) {
      console.error("Lead submission failed", err);
    }

    document.getElementById("thanksRef").textContent = refId;
    document.getElementById("thanksProduct").textContent = state.product;
    document.getElementById("thanksSlot").textContent = payload.preferredSlot;
    submitBtn.disabled = false;
    submitBtn.textContent = "Submit enquiry";
    showStep("thanks");
  });

  function resetForm() {
    form.reset();
    state = { step: 1, product: "", slot: "", existing: "No" };
    document.querySelectorAll(".option-tile").forEach((t) => t.classList.remove("selected"));
    document.getElementById("existingLoanFields").style.display = "none";
    showStep(1);
  }
}

/* ---------------------------------------------------------------------
   Icon sprite — simple hand-drawn line icons, no external icon font
--------------------------------------------------------------------- */
function renderIconSprite() {
  if (document.getElementById("iconSprite")) return;
  const div = document.createElement("div");
  div.innerHTML = `
  <svg id="iconSprite" style="display:none" aria-hidden="true">
    <symbol id="icon-cash" viewBox="0 0 24 24"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M6 10v4M18 10v4"/></symbol>
    <symbol id="icon-briefcase" viewBox="0 0 24 24"><rect x="2.5" y="7" width="19" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M2.5 13h19"/></symbol>
    <symbol id="icon-home" viewBox="0 0 24 24"><path d="M4 11.5 12 4l8 7.5"/><path d="M6 10v9h12v-9"/><path d="M10 19v-5h4v5"/></symbol>
    <symbol id="icon-building" viewBox="0 0 24 24"><rect x="4" y="3" width="11" height="18"/><path d="M8 7h3M8 11h3M8 15h3"/><path d="M15 10h5v11h-5"/></symbol>
    <symbol id="icon-compass" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9.5"/><path d="M15 9l-2 6-6 2 2-6 6-2z"/></symbol>
    <symbol id="icon-shield" viewBox="0 0 24 24"><path d="M12 3l7 3v6c0 5-3 8-7 9-4-1-7-4-7-9V6l7-3z"/><path d="M9 12l2 2 4-4"/></symbol>
    <symbol id="icon-trend" viewBox="0 0 24 24"><path d="M3 17l6-6 4 4 7-8"/><path d="M15 7h5v5"/></symbol>
    <symbol id="icon-phone" viewBox="0 0 24 24"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2C9.5 21 3 14.5 3 6a2 2 0 0 1 2-2z"/></symbol>
    <symbol id="icon-chat" viewBox="0 0 24 24"><path d="M21 11.5a8 8 0 0 1-8 8 8.3 8.3 0 0 1-3.6-.8L3 20l1.4-4.2A8 8 0 1 1 21 11.5z"/></symbol>
    <symbol id="icon-mail" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></symbol>
    <symbol id="icon-target" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/></symbol>
    <symbol id="icon-clock" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></symbol>
    <symbol id="icon-layers" viewBox="0 0 24 24"><path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 13l9 5 9-5"/></symbol>
    <symbol id="icon-map" viewBox="0 0 24 24"><path d="M12 21s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12z"/><circle cx="12" cy="9" r="2.5"/></symbol>
    <symbol id="icon-check-circle" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9.5"/><path d="M8 12.5l2.5 2.5L16 9.5"/></symbol>
    <symbol id="icon-doc" viewBox="0 0 24 24"><path d="M6 3h8l5 5v13H6z"/><path d="M14 3v5h5"/><path d="M9 13h6M9 17h6"/></symbol>
  </svg>`;
  document.body.prepend(div.firstElementChild);
}

document.addEventListener("DOMContentLoaded", () => {
  renderIconSprite();
  renderHeader();
  renderFooter();
  renderModal();
});
