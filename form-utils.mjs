export const CONTACT_EMAIL = "abhandywork@gmail.com";

export function formDataToObject(formData) {
  return Object.fromEntries([...formData.entries()].map(([key, value]) => [key, String(value).trim()]));
}

export function buildMailto(payload, contactEmail = CONTACT_EMAIL) {
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

  return `mailto:${contactEmail}?subject=${subject}&body=${body}`;
}
