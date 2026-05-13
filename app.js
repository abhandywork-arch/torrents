const GOOGLE_SCRIPT_URL = "";
const CONTACT_EMAIL = "abhandywork@gmail.com";

const form = document.querySelector("#quoteForm");
const statusBox = document.querySelector("#formStatus");

function setStatus(message, type = "success") {
  statusBox.textContent = message;
  statusBox.className = `form-status visible ${type}`;
}

function formDataToObject(formData) {
  return Object.fromEntries([...formData.entries()].map(([key, value]) => [key, String(value).trim()]));
}

function buildMailto(payload) {
  const subject = encodeURIComponent(`New quote request: ${payload.service || "Home service"}`);
  const body = encodeURIComponent(
    [
      `Name: ${payload.name}`,
      `Email: ${payload.email}`,
      `Phone: ${payload.phone}`,
      `Address: ${payload.address}`,
      `Service: ${payload.service}`,
      `Preferred date: ${payload.preferredDate || "Not specified"}`,
      `Preferred time: ${payload.preferredTime || "Not specified"}`,
      "",
      "Project details:",
      payload.message
    ].join("\n")
  );

  return `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
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
      body: new URLSearchParams(payload)
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
