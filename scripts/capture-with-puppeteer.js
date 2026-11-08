const puppeteer = require("puppeteer-core");
const path = require("path");
const fs = require("fs");

const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const outDir = path.resolve(__dirname, "../public/screenshots");

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function run() {
  console.log("Launching Edge browser via puppeteer-core...");
  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
    defaultViewport: { width: 1280, height: 850 },
  });

  const page = await browser.newPage();

  // 1. Landing Page
  console.log("Capturing 01-landing-page.png...");
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle0" });
  await page.screenshot({ path: path.join(outDir, "01-landing-page.png") });

  // 1b. Admin Login Modal Open
  console.log("Capturing 01b-admin-login-modal.png...");
  // Click admin button
  const adminBtn = await page.$('button[title*="Admin"]');
  if (adminBtn) {
    await adminBtn.click();
    await new Promise((r) => setTimeout(r, 600));
    await page.screenshot({ path: path.join(outDir, "01b-admin-login-modal.png") });
  }

  // 2. Perform Member Login (Priya Sharma / 9876543210)
  console.log("Logging in as Member Priya Sharma...");
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle0" });
  await page.type('input[placeholder*="Rahul Das"]', "Priya Sharma");
  await page.type('input[type="tel"]', "9876543210");
  await page.click('button[type="submit"]');
  await page.waitForNavigation({ waitUntil: "networkidle0" });

  // 3. User Dashboard
  console.log("Capturing 02-user-dashboard.png...");
  await page.screenshot({ path: path.join(outDir, "02-user-dashboard.png") });

  // 4. Voting Page
  console.log("Capturing 03-voting-calendar.png...");
  await page.goto("http://localhost:3000/vote", { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 500));
  await page.screenshot({ path: path.join(outDir, "03-voting-calendar.png") });

  // 5. Results Page
  console.log("Capturing 04-results-leaderboard.png...");
  await page.goto("http://localhost:3000/results", { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 500));
  await page.screenshot({ path: path.join(outDir, "04-results-leaderboard.png") });

  // 6. Discussion Chat
  console.log("Capturing 05-group-discussion.png...");
  await page.goto("http://localhost:3000/discussion", { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 500));
  await page.screenshot({ path: path.join(outDir, "05-group-discussion.png") });

  // 7. Members Directory
  console.log("Capturing 07-members-directory.png...");
  await page.goto("http://localhost:3000/members", { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 500));
  await page.screenshot({ path: path.join(outDir, "07-members-directory.png") });

  // 8. Admin Login (djvaibhav900@gmail.com / abcd@1234)
  console.log("Logging in as Admin Vaibhav Das...");
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle0" });
  const cornerBtn = await page.$('button[title*="Admin"]');
  if (cornerBtn) {
    await cornerBtn.click();
    await new Promise((r) => setTimeout(r, 500));
    // Fill password in modal
    const passInput = await page.$('input[placeholder="Enter password"]');
    if (passInput) {
      await passInput.type("abcd@1234");
      const submitBtn = await page.$('button[type="submit"]');
      if (submitBtn) {
        await submitBtn.click();
        await page.waitForNavigation({ waitUntil: "networkidle0" });
      }
    }
  }

  // 9. Admin Console
  console.log("Capturing 06-admin-console.png...");
  await page.goto("http://localhost:3000/admin", { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 500));
  await page.screenshot({ path: path.join(outDir, "06-admin-console.png") });

  await browser.close();
  console.log("All screenshots successfully captured!");
}

run().catch((err) => {
  console.error("Puppeteer screenshot script error:", err);
  process.exit(1);
});
