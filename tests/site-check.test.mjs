import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const indexHtml = readFileSync(join(root, "index.html"), "utf8");

const requiredSiteFiles = ["index.html", "styles.css", "app.js", "form-utils.mjs", "robots.txt", "sitemap.xml"];

function localAssetPaths(html) {
  const matches = [...html.matchAll(/(?:href|src)="([^"]+)"/g)];
  return matches
    .map(([, value]) => value)
    .filter((value) => !value.startsWith("http") && !value.startsWith("mailto:") && !value.startsWith("#"));
}

describe("site files", () => {
  for (const file of requiredSiteFiles) {
    it(`includes ${file}`, () => {
      assert.equal(existsSync(join(root, file)), true);
    });
  }

  it("includes the quote form and status region", () => {
    assert.match(indexHtml, /id="quoteForm"/);
    assert.match(indexHtml, /id="formStatus"/);
    assert.match(indexHtml, /<script type="module" src="app\.js"><\/script>/);
  });

  it("references only existing local assets", () => {
    for (const assetPath of localAssetPaths(indexHtml)) {
      const resolved = join(root, assetPath.split("?")[0]);
      assert.equal(existsSync(resolved), true, `missing asset: ${assetPath}`);
    }
  });
});
