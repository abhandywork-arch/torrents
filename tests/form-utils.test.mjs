import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildMailto, formDataToObject } from "../form-utils.mjs";

describe("formDataToObject", () => {
  it("trims string field values", () => {
    const formData = new FormData();
    formData.set("name", "  Jane Doe  ");
    formData.set("email", "jane@example.com");

    assert.deepEqual(formDataToObject(formData), {
      name: "Jane Doe",
      email: "jane@example.com"
    });
  });
});

describe("buildMailto", () => {
  it("builds a mailto link with encoded subject and body", () => {
    const link = buildMailto(
      {
        name: "Jane Doe",
        email: "jane@example.com",
        phone: "613-555-0100",
        address: "1 Main St, Ottawa",
        service: "Fence installation or repair",
        preferredDate: "2026-06-01",
        preferredTime: "09:00",
        message: "Need a 6 ft privacy fence."
      },
      "test@example.com"
    );

    assert.match(link, /^mailto:test@example.com\?/);
    assert.match(link, /subject=New%20quote%20request/);
    assert.match(link, /Jane%20Doe/);
    assert.match(link, /privacy%20fence/);
  });

  it("uses a default service label when service is missing", () => {
    const link = buildMailto(
      {
        name: "Jane",
        email: "jane@example.com",
        phone: "613",
        address: "Ottawa",
        message: "Hello"
      },
      "test@example.com"
    );

    assert.match(link, /subject=New%20quote%20request%3A%20Home%20service/);
  });
});
