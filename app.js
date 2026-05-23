import { CONTACT_EMAIL, buildMailto, formDataToObject } from "./form-utils.mjs";

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyQfpZ_398-g63MZxbnQ9IN7RhXK-oMyA4FGcsfLvcyyL39NE0-XdN63haLgh029mJj7A/exec";
const LEAD_API_KEY = "torrent-hs-lead-7f3a9c2e1b8d4a6f5e0c3b9d7a2f4e8";

const form = document.querySelector("#quoteForm");
const statusBox = document.querySelector("#formStatus");

function setStatus(message, type = "success") {
  statusBox.textContent = message;
  statusBox.className = `form-status visible ${type}`;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const submitButton = form.querySelector("button[type='submit']");
  const payload = formDataToObject(new FormData(form));
  payload.source = "torrent-homeservice.ca";
  payload.submittedAt = new Date().toISOString();

  submitButton.disabled = true;
  submitButton.textContent = "Sending...";

  try {
    if (!GOOGLE_SCRIPT_URL) {
      window.location.href = buildMailto(payload);
      setStatus("Your email app has been opened with the request details. Send that message and we will follow up from there.", "warning");
      return;
    }

    await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
      },
      body: new URLSearchParams({ ...payload, apiKey: LEAD_API_KEY })
    });

    setStatus("Thanks. Your request was sent. We will review the details and follow up shortly.");
    form.reset();
  } catch (error) {
    setStatus(`Something blocked the form submission. Please email ${CONTACT_EMAIL} directly.`, "warning");
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Send request";
  }
});
