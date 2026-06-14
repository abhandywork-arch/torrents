import { CONTACT_EMAIL, buildMailto, formDataToObject } from "./form-utils.mjs";

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyV_cEVbCPJFK1GAcYr2MR2olC4KnKGrP8VkNm0XfgzuhbGcz4no1bshELEcklifubihQ/exec";
const LEAD_API_KEY = "torrent-hs-lead-7f3a9c2e1b8d4a6f5e0c3b9d7a2f4e8";

const form = document.querySelector("#quoteForm");
const statusBox = document.querySelector("#formStatus");

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

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

  // ── Image validation + base64 encoding ──
  const fileInput = document.getElementById('projectPhoto');
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  const maxSize = 5 * 1024 * 1024;

  if (fileInput && fileInput.files.length > 0) {
    for (const file of fileInput.files) {

      // MIME type check
      if (!allowedTypes.includes(file.type)) {
        alert('Only JPG, PNG, WEBP, or GIF files are allowed.');
        return;
      }

      // Size check
      if (file.size > maxSize) {
        alert(`${file.name} exceeds the 5MB limit.`);
        return;
      }

      // Magic number check
      const slice = file.slice(0, 4);
      const buffer = await slice.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
      const validSignatures = ['ffd8ff', '89504e47', '52494646', '47494638'];
      if (!validSignatures.some(sig => hex.startsWith(sig))) {
        alert(`${file.name} does not appear to be a valid image file.`);
        return;
      }
    }

    // ── All checks passed — encode first image as base64 ──
    const file = fileInput.files[0];
    payload.photoBase64 = await fileToBase64(file);
    payload.photoName   = file.name;
    payload.photoType   = file.type;
  }

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