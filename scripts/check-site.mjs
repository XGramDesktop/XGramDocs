import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const files = readdirSync(root).filter((file) => file.endsWith(".html"));
const pages = new Map(
  files.map((file) => [file, readFileSync(resolve(root, file), "utf8")]),
);
const publicFiles = files.filter((file) => file !== "404.html");
const titles = new Set();
const descriptions = new Set();
let links = 0;

for (const [file, html] of pages) {
  assert.match(html, /<html lang="ru">/, `${file}: missing language`);
  assert.equal(
    (html.match(/<h1\b/g) ?? []).length,
    1,
    `${file}: expected one heading`,
  );
  assert.match(
    html,
    /id="content" tabindex="-1"/,
    `${file}: missing skip target`,
  );
  assert.match(
    html,
    /class="skip-link" href="#content"/,
    `${file}: missing skip link`,
  );
  const title = html.match(/<title>(.*?)<\/title>/)?.[1];
  const description = html.match(/name="description"\s+content="([^"]+)"/)?.[1];
  assert.ok(title && !titles.has(title), `${file}: missing or duplicate title`);
  assert.ok(
    description && !descriptions.has(description),
    `${file}: missing or duplicate description`,
  );
  titles.add(title);
  descriptions.add(description);
  assert.doesNotMatch(
    html,
    /github\.com\/youknowimhigh\/XGramDesktop/i,
    `${file}: stale repository URL`,
  );

  const nav =
    html.match(/<nav aria-label="Основная навигация">(.*?)<\/nav>/s)?.[1] ?? "";
  for (const destination of publicFiles) {
    assert.ok(
      nav.includes(`href="${destination}"`),
      `${file}: missing ${destination} in navigation`,
    );
  }
  if (file !== "404.html") {
    assert.equal(
      (nav.match(/aria-current="page"/g) ?? []).length,
      1,
      `${file}: current page missing`,
    );
    assert.ok(
      nav.includes(`href="${file}" aria-current="page"`),
      `${file}: wrong current page`,
    );
    assert.match(html, /rel="canonical"/, `${file}: missing canonical URL`);
  } else {
    assert.match(
      html,
      /<base href="https:\/\/xgramdesktop\.github\.io\/XGramDocs\/"/,
    );
    assert.match(html, /name="robots" content="noindex"/);
  }

  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
  assert.equal(new Set(ids).size, ids.length, `${file}: duplicate IDs`);
  for (const [, destination] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    if (/^https:\/\//.test(destination)) continue;
    const [path, anchor] = destination.split("#");
    const target = path || file;
    assert.ok(
      existsSync(resolve(root, target)),
      `${file}: missing ${destination}`,
    );
    if (anchor) {
      const targetHtml = pages.get(target);
      assert.ok(
        targetHtml?.includes(`id="${anchor}"`),
        `${file}: missing anchor ${destination}`,
      );
    }
    links++;
  }
}

assert.ok(existsSync(resolve(root, ".nojekyll")), "Missing .nojekyll");
const sitemap = readFileSync(resolve(root, "sitemap.xml"), "utf8");
for (const file of publicFiles) {
  const suffix = file === "index.html" ? "" : file;
  assert.ok(
    sitemap.includes(
      `https://xgramdesktop.github.io/XGramDocs/${suffix}</loc>`,
    ),
  );
}
assert.match(
  readFileSync(resolve(root, "robots.txt"), "utf8"),
  /Sitemap: https:\/\/xgramdesktop\.github\.io\/XGramDocs\/sitemap\.xml/,
);
console.log(
  `PASS: ${files.length} HTML pages, ${links} local links/assets, unique metadata and complete navigation.`,
);
