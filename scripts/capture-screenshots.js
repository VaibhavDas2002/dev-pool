const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const outDir = path.resolve(__dirname, "../public/screenshots");

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const pages = [
  { name: "01-landing-page.png", url: "http://localhost:3000/" },
  { name: "02-dashboard-page.png", url: "http://localhost:3000/dashboard" },
  { name: "03-voting-calendar.png", url: "http://localhost:3000/vote" },
  { name: "04-live-results.png", url: "http://localhost:3000/results" },
  { name: "05-discussion-chat.png", url: "http://localhost:3000/discussion" },
  { name: "06-admin-console.png", url: "http://localhost:3000/admin" },
  { name: "07-members-directory.png", url: "http://localhost:3000/members" },
];

console.log("Starting screenshot capture with Microsoft Edge...");

for (const p of pages) {
  const dest = path.join(outDir, p.name);
  console.log(`Capturing ${p.name} from ${p.url}...`);
  try {
    const cmd = `"${edgePath}" --headless --screenshot="${dest}" --window-size=1280,820 --default-background-color=00000000 --hide-scrollbars "${p.url}"`;
    execSync(cmd, { stdio: "inherit" });
    console.log(`Saved ${dest} (${fs.statSync(dest).size} bytes)`);
  } catch (err) {
    console.error(`Failed to capture ${p.name}:`, err.message);
  }
}

console.log("All screenshots captured successfully!");
