# Leadscogen website — architecture & deployment guide

A free, static, mobile-first website for loan/insurance/mutual-fund lead generation,
built as plain HTML/CSS/JS with a free Google Apps Script backend.

## 1. Sitemap

```
/                     index.html            Home
/personal-loan.html                         Loan product page
/business-loan.html                         Loan product page
/home-loan.html                             Loan product page
/lap.html                                   Loan against property
/loan-optimization.html                     Core differentiator page
/insurance.html                             Secondary vertical
/mutual-funds.html                          Secondary vertical
/about.html                                 About + how it works
/contact.html                               Contact + grievance
/privacy.html, /terms.html,
/disclaimer.html, /consent.html             Legal pages
```

## 2. Customer journey

Home / product page → "Get started" opens the multi-step lead form (modal) →
Step 1 product → Step 2 contact details → Step 3 requirement details →
Step 4 callback slot + consent → submit → thank-you step with reference number
→ lead written to Google Sheet + email notification sent to you.

## 3. Lead data architecture

Every submission becomes one row in your Google Sheet with: Lead ID, date,
time, name, phone, email, city, state, product, loan amount, employment type,
income/turnover, self-declared credit score band, existing loan details,
preferred callback date/time, consent status, marketing consent status, lead
source, page URL, status, notes.

**Credit score field — important note:** the form only collects a
*self-declared* band (Below 650 / 650–750 / Above 750 / Not sure) that the
customer picks themselves. It is not a real credit bureau pull. A genuine
CIBIL/Experian/Equifax/CRIF check requires Leadscogen to be registered as a
"specified user" under the Credit Information Companies (Regulation) Act,
2005, with a commercial agreement and per-check fee from the bureau — this
cannot be added for free and isn't something a website script can do on its
own. The form links out to CIBIL's own free official annual check
(`cibil.com/freecibilscore`) instead of pretending to run one.
`status` starts as "New" — update manually as the lead moves through
Contacted → Callback Scheduled → Documents Pending → Shared With Partner →
Under Evaluation → Sanctioned → Disbursed / Closed / Not Interested /
Not Eligible / Duplicate.

## 4. Compliance-sensitive areas (flagged for your legal/compliance review)

- All legal pages (`privacy.html`, `terms.html`, `disclaimer.html`,
  `consent.html`) are **drafts** and must be reviewed by an Indian lawyer
  before go-live. They are marked as such on the pages themselves.
- The site makes **no claim** that Leadscogen is RBI-regulated, an NBFC, an
  insurance broker, or a SEBI/AMFI-registered entity. If/when you obtain any
  such registration, update the relevant pages with the verified details —
  do not add registration numbers or badges until they're real.
- DSA/channel-partner agreements with actual lenders should be in place (or
  in progress) before the site goes live and generates real leads, since
  Leadscogen's role depends on those arrangements.
- TRAI commercial-communication / DND rules: the consent checkbox is the
  compliance mechanism for calling leads — do not remove or pre-tick it.
- No fake trust signals (testimonials, partner logos, stats) have been
  added. Keep it that way until you have verified, real content.

## 5. Design system

- Colors: deep navy (#0A1A30) + warm brass accent (#B6862C) on a warm paper
  background (#F6F5F1), per the "premium Indian financial services" brief.
- Type: Fraunces (serif, headlines) + Inter (sans, body/UI) — both free via
  Google Fonts.
- Cards use a left accent bar instead of heavy shadows; hairline borders
  throughout for a calm, structured feel.

## 6. Free technology stack — what's genuinely free vs. has limits

| Piece | Service | Free? | Limits to know |
|---|---|---|---|
| Hosting | GitHub Pages or Cloudflare Pages | Yes, free | Static sites only (this site qualifies) |
| Frontend | HTML/CSS/JS, no framework | Yes, free | — |
| Fonts | Google Fonts (Fraunces, Inter) | Yes, free | — |
| Lead storage | Google Sheets | Yes, free | Normal Google account storage limits |
| Backend | Google Apps Script | Yes, free | Daily quotas on triggers/email sends on a free Gmail account (generous for low-to-moderate lead volume) |
| Email notification | MailApp via Apps Script (your Gmail) | Yes, free | Subject to Gmail's daily send quota |
| WhatsApp | `wa.me` link (customer-initiated chat) | Yes, free | This is NOT the WhatsApp Business API — bulk/automated messaging would need a paid API later |
| Domain | leadscogen.in / .com | **Not free** | You'll need to register and pay for this separately |

## 7. Google Sheets architecture

Create one sheet named exactly as `SHEET_NAME` in `apps-script.gs` (default
`Sheet1`), with this header row (Apps Script appends rows in this order):

```
Lead ID | Date | Time | Name | Phone | Email | City | State | Product |
Loan Amount | Employment Type | Income/Turnover | Credit Score (self-declared) |
Existing Loan | Existing Lender | Outstanding | EMI | Preferred Callback Date |
Preferred Callback Time | Consent | Marketing Consent | Lead Source |
Page URL | Status | Notes
```

## 8. Email notification architecture

Apps Script sends a plain-text email to `NOTIFY_EMAIL` (set this in
`apps-script.gs`) on every submission, with subject
`New Leadscogen Lead – [Product] – [Lead ID]` and a structured body.

## 9. WhatsApp architecture

The "Chat with Leadscogen" button on `contact.html` opens a `wa.me` link,
which is a free, no-API way to let a customer start a WhatsApp conversation
with your number. This is customer-initiated only — it is not bulk
messaging and needs no paid setup. If you later want automated WhatsApp
notifications, that requires the paid WhatsApp Business API.

## 10. Deployment architecture (free path)

**Option A — GitHub Pages**
1. Create a GitHub repo, upload all files in this folder to the repo root.
2. Repo Settings → Pages → Deploy from branch → `main` / root.
3. Your site is live at `https://<username>.github.io/<repo>/`.
4. To use `leadscogen.in`: buy the domain, add a `CNAME` file with the
   domain name, and point its DNS to GitHub Pages per GitHub's instructions.

**Option B — Cloudflare Pages**
1. Push the same files to a GitHub repo (or upload directly in Cloudflare).
2. Cloudflare dashboard → Pages → Create project → connect repo →
   no build command needed (static site) → deploy.
3. Add your custom domain under the project's custom domains tab once
   registered.

**Backend**
1. Follow the setup steps at the top of `apps-script.gs`.
2. Paste the deployed web app URL into `LEAD_ENDPOINT_URL` near the top of
   `script.js`, then redeploy the static site.
3. Until you do this, the form still works — it falls back to opening a
   pre-filled email to `NOTIFY_EMAIL` in `script.js`.

## 11. Before you go live — please update these placeholders

- Phone number on `contact.html` (`tel:` and WhatsApp `wa.me` links)
- `NOTIFY_EMAIL` in `script.js` and `apps-script.gs`
- `grievance@leadscogen.in` references across legal pages
- "Last updated" dates on the legal pages
- Your actual registered business address, once you want to publish it
- `LEAD_ENDPOINT_URL` in `script.js` after deploying `apps-script.gs`

None of the above were invented with placeholder-looking real-sounding
details — they're intentionally generic so you don't accidentally publish
something untrue. Please replace them with your real details before launch.
