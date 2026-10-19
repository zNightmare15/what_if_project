const puppeteer = require('puppeteer-core');
const path = require('path');

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

async function testFrames() {
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--use-gl=angle', '--use-angle=d3d11']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 540, height: 960 });
  const htmlPath = 'file:///' + path.resolve(__dirname, 'sketch_viewer.html').replace(/\\/g, '/') + '?export=1';
  await page.goto(htmlPath, { waitUntil: 'load' });

  const timestamps = [
    { time: 2.0, name: 'v2_frame_1_daylight_atom.png' },
    { time: 10.2, name: 'v2_frame_2_xray_sun.png' },
    { time: 16.8, name: 'v2_frame_3_xray_hands.png' },
    { time: 25.5, name: 'v2_frame_4_positive_repel.png' },
    { time: 37.5, name: 'v2_frame_5_nuclear_outshine.png' },
    { time: 52.5, name: 'v2_frame_6_earth_moon.png' },
    { time: 58.5, name: 'v2_frame_7_moon_gone.png' },
    { time: 66.5, name: 'v2_frame_8_lidar_back.png' }
  ];

  for (const item of timestamps) {
    await page.evaluate((t) => {
      window.renderAtTime(t);
    }, item.time);
    await page.screenshot({ path: item.name });
    console.log(`Rendered ${item.name} at ${item.time}s`);
  }

  await browser.close();
  process.exit(0);
}

testFrames().catch(err => {
  console.error("Frame render failed:", err);
  process.exit(1);
});
