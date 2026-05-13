const BUSINESS_EMAIL = "abhandywork@gmail.com";
const SHEET_NAME = "Leads";
const CALENDAR_ID = "primary";
const SPREADSHEET_ID = "PASTE_CLIENT_SHEET_ID_HERE";

function doPost(e) {
  const payload = normalizePayload(e);
    const payload = normalizePayload(e);
      const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
      const sheet = getOrCreateLeadSheet(spreadsheet);
      const event = createCalendarEvent(payload);

  sheet.appendRow([
    new Date(),
    payload.name,
    payload.email,
    payload.phone,
    payload.address,
    payload.service,
    payload.preferredDate,
    payload.preferredTime,
    payload.message,
    event ? event.getId() : "",
    payload.source
  ]);

  sendLeadEmails(payload, event);

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function normalizePayload(e) {
  const params = e && e.parameter ? e.parameter : {};
  return {
    name: safeValue(params.name),
    email: safeValue(params.email),
    phone: safeValue(params.phone),
    address: safeValue(params.address),
    service: safeValue(params.service),
    preferredDate: safeValue(params.preferredDate),
    preferredTime: safeValue(params.preferredTime),
    message: safeValue(params.message),
    source: safeValue(params.source) || "torrent-homeservice.ca"
  };
}

function safeValue(value) {
  return value ? String(value).trim() : "";
}

function getOrCreateLeadSheet(spreadsheet) {
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      "Submitted At",
      "Name",
      "Email",
      "Phone",
      "Address",
      "Service",
      "Preferred Date",
      "Preferred Time",
      "Message",
      "Calendar Event ID",
      "Source"
    ]);
  }

  return sheet;
}

function createCalendarEvent(payload) {
  const calendar = CalendarApp.getCalendarById(CALENDAR_ID);
  if (!calendar) {
    return null;
  }

  const start = getRequestedStart(payload.preferredDate, payload.preferredTime);
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  const title = `Torrent Home Service lead: ${payload.service || "Quote request"}`;
  const description = [
    `Name: ${payload.name}`,
    `Email: ${payload.email}`,
    `Phone: ${payload.phone}`,
    `Address: ${payload.address}`,
    "",
    "Project details:",
    payload.message
  ].join("\n");

  return calendar.createEvent(title, start, end, {
    description,
    location: payload.address,
    guests: payload.email || "",
    sendInvites: Boolean(payload.email)
  });
}

function getRequestedStart(dateValue, timeValue) {
  if (dateValue) {
    const time = timeValue || "09:00";
    return new Date(`${dateValue}T${time}:00`);
  }

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(9, 0, 0, 0);
  return tomorrow;
}

function sendLeadEmails(payload, event) {
  const subject = `New Torrent Home Service lead: ${payload.service || "Quote request"}`;
  const lines = [
    `Name: ${payload.name}`,
    `Email: ${payload.email}`,
    `Phone: ${payload.phone}`,
    `Address: ${payload.address}`,
    `Service: ${payload.service}`,
    `Preferred date: ${payload.preferredDate || "Not specified"}`,
    `Preferred time: ${payload.preferredTime || "Not specified"}`,
    event ? `Calendar event: ${event.getTitle()}` : "Calendar event: not created",
    "",
    "Project details:",
    payload.message
  ];

  GmailApp.sendEmail(BUSINESS_EMAIL, subject, lines.join("\n"), {
    replyTo: payload.email || BUSINESS_EMAIL
  });

  if (payload.email) {
    GmailApp.sendEmail(
      payload.email,
      "We received your Torrent Home Service request",
      [
        `Hi ${payload.name || "there"},`,
        "",
        "Thanks for contacting Torrent Home Service. We received your request and will follow up shortly.",
        "",
        "Your request:",
        `${payload.service || "Home service"} at ${payload.address || "your property"}`,
        "",
        "Torrent Home Service"
      ].join("\n"),
      { replyTo: BUSINESS_EMAIL }
    );
  }
}
