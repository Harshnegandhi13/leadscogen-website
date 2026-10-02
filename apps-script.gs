/**
 * Leadscogen — lead capture backend (Google Apps Script, free tier)
 *
 * SETUP
 * 1. Create a Google Sheet. Add this header row to the first tab (exact order):
 *    Lead ID | Date | Time | Name | Phone | Email | City | State | Product |
 *    Loan Amount | Employment Type | Income/Turnover | Credit Score (self-declared) |
 *    Existing Loan | Existing Lender | Outstanding | EMI | Preferred Callback Date |
 *    Preferred Callback Time | Consent | Marketing Consent | Lead Source |
 *    Page URL | Status | Notes
 * 2. Extensions → Apps Script. Paste this file as Code.gs.
 * 3. Update NOTIFY_EMAIL below to your real inbox.
 * 4. Deploy → New deployment → type "Web app".
 *      Execute as: Me
 *      Who has access: Anyone
 * 5. Copy the deployed web app URL into LEAD_ENDPOINT_URL at the top of script.js.
 *
 * NOTE: Apps Script and Google Sheets are free, but have daily quotas
 * (e.g. email sends per day on a free Gmail account). This is fine for a
 * starting volume of enquiries; revisit if volume grows significantly.
 */

const NOTIFY_EMAIL = "hello@leadscogen.in"; // <-- update to your real inbox
const SHEET_NAME = "Sheet1"; // <-- update if your tab is named differently

function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const data = JSON.parse(e.postData.contents);

  const now = new Date();
  const dateStr = Utilities.formatDate(now, "Asia/Kolkata", "yyyy-MM-dd");
  const timeStr = Utilities.formatDate(now, "Asia/Kolkata", "HH:mm:ss");

  sheet.appendRow([
    data.leadId || "",
    dateStr,
    timeStr,
    data.name || "",
    data.mobile || "",
    data.email || "",
    data.city || "",
    data.state || "",
    data.product || "",
    data.amount || "",
    data.employment || "",
    data.income || "",
    data.creditScore || "",
    data.existingLoan || "",
    data.existingLender || "",
    data.existingOutstanding || "",
    data.existingEmi || "",
    data.preferredDate || "",
    data.preferredSlot || "",
    data.consent || "",
    data.marketingConsent || "",
    data.leadSource || "",
    data.pageUrl || "",
    "New",
    "",
  ]);

  sendNotificationEmail(data);

  return ContentService
    .createTextOutput(JSON.stringify({ status: "ok", leadId: data.leadId }))
    .setMimeType(ContentService.MimeType.JSON);
}

function sendNotificationEmail(data) {
  const subject = `New Leadscogen Lead – ${data.product || "Enquiry"} – ${data.leadId}`;
  const body = [
    "New Lead Received",
    "",
    `Lead ID: ${data.leadId}`,
    `Date: ${new Date().toLocaleString("en-IN")}`,
    "",
    `Customer: ${data.name}`,
    `Mobile: ${data.mobile}`,
    `Email: ${data.email}`,
    `City: ${data.city}`,
    `State: ${data.state}`,
    "",
    `Product: ${data.product}`,
    `Loan amount: ${data.amount || "-"}`,
    `Employment type: ${data.employment || "-"}`,
    `Income/turnover: ${data.income || "-"}`,
    `Credit score (self-declared): ${data.creditScore || "-"}`,
    "",
    `Existing loan: ${data.existingLoan || "-"}`,
    `Existing lender: ${data.existingLender || "-"}`,
    `Outstanding: ${data.existingOutstanding || "-"}`,
    `EMI: ${data.existingEmi || "-"}`,
    "",
    `Preferred callback date: ${data.preferredDate || "-"}`,
    `Preferred callback time: ${data.preferredSlot || "-"}`,
    "",
    `Consent: ${data.consent}`,
    `Marketing consent: ${data.marketingConsent}`,
    "",
    `Lead source: ${data.leadSource || "-"}`,
    `Page URL: ${data.pageUrl || "-"}`,
  ].join("\n");

  MailApp.sendEmail(NOTIFY_EMAIL, subject, body);
}

/** Lets you open the web app URL in a browser to confirm it's deployed. */
function doGet() {
  return ContentService.createTextOutput("Leadscogen lead endpoint is live.");
}
