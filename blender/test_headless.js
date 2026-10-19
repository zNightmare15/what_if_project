const puppeteer = require('puppeteer-core');
const path = require('path');

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

async function test() {
  console.log("Launching Edge via puppeteer-core...");
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--use-gl=angle', '--use-angle=d3d11']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 720, height: 1280 });
  const htmlPath = 'file:///' + path.resolve(__dirname, 'sketch_viewer.html').replace(/\\/g, '/');
  console.log("Navigating to:", htmlPath);
  await page.goto(htmlPath, { waitUntil: 'load' });
  
  // Take a test screenshot of the phone container
  const phoneElement = await page.$('.phone-container');
  await phoneElement.screenshot({ path: 'test_render_frame.png' });
  console.log("Screenshot saved to test_render_frame.png!");
  await browser.close();
}

test().catch(err => {
  console.error("Test failed:", err);
  process.exit(1);
});

