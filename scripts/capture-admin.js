const puppeteer = require("puppeteer-core");
const path = require("path");

const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const outDir = path.resolve(__dirname, "../public/screenshots");

async function run() {
  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    defaultViewport: { width: 1280, height: 900 },
  });

  const page = await browser.newPage();
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle0" });

  // Direct login via API
  await page.evaluate(async () => {
    await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "djvaibhav900@gmail.com",
        password: "abcd@1234",
      }),
    });
  });

  await page.goto("http://localhost:3000/admin", { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 800));
  await page.screenshot({ path: path.join(outDir, "06-admin-console.png") });
  console.log("Admin console screenshot captured!");

  await browser.close();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
