const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
/**
 *
 * @param {string} mainLicense
 * @param {Map<string, Record<'from'|'version'|'resolved'|'description'|'homepage'|'repository'|'license'|'licenseText', string>>} licenses
 */
const handlerHtml = (mainLicense, licenses) => {
  const head = [
    "<style>",
    "body, pre { font-family: sans-serif; font-size: 12px; }",
    "h3 { font-size: 1.5em; }",
    "h4 { font-size: 1.25em; margin: 1em 0 .5em; }",
    "pre { white-space: pre-wrap; }",
    "hr { border: 0; border-bottom: 1px solid #ccc; margin: 2em 0; }",
    "</style>",
  ].join("\n");

  const main = [
    `<h3>PIA Player license</h3>`,
    `<pre>${mainLicense}</pre>`,
    `<h3>Bundled dependencies</h3>`,
  ].join("\n");

  const dependencies = Array.from(licenses)
    .sort()
    .map(([_, pkg]) => {
      const item = [];
      item.push(`<h4>${pkg.from}</h4>`);
      item.push(`<div>License: ${pkg.license}</div>`);
      item.push(
        `<div>Repository: <a href="${pkg.repository}" target="_blank">${pkg.repository}</a></div>`
      );
      item.push(`<pre>${pkg.licenseText}</pre>`);
      return item.join("\n");
    })
    .join("<hr>");

  fs.writeFileSync(
    path.resolve("build/license.html"),
    [head, main, dependencies].join("\n")
  );
};

(async () => {
  const licenses = new Map();

  const [{ dependencies }] = await new Promise((resolve, reject) => {
    let res = "";
    const child = spawn("pnpm", [
      "list",
      "--json",
      "--long",
      "--prod",
      "--depth=0",
    ]);
    child.stdout.on("data", (data) => {
      res += data;
    });
    child.on("close", (code) => {
      if (code === 0) {
        resolve(JSON.parse(res));
      } else {
        reject(code);
      }
    });
  });

  Object.values(dependencies).forEach((pkg) => {
    const pkgPath = path.resolve("node_modules", pkg.from);
    if (!fs.existsSync(pkgPath)) return;
    const files = fs.readdirSync(pkgPath);
    const licenseFile = files.find((file) => file.match(/^LICENSE/));
    const pkgJson = require(path.resolve(pkgPath, "package.json"));
    let licenseText = "";
    if (licenseFile) {
      const licensePath = path.resolve(pkgPath, licenseFile);
      licenseText = fs.readFileSync(licensePath, "utf8");
    }
    licenses.set(pkg.from, {
      ...pkg,
      licenseText,
      license: pkgJson.license,
      repository: pkg.repository.replace(/^git\+/, ""),
    });
  });

  const mainLicense = fs.readFileSync(
    path.resolve(process.cwd(), "LICENSE"),
    "utf8"
  );

  handlerHtml(mainLicense, licenses);
})();
