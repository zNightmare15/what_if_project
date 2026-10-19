const puppeteer = require('puppeteer-core');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const OUTPUT_VIDEO = "what_if_electrons_tiktok.mp4";
const OUTPUT_VIDEO_2 = "what_if_electrons_blender_tiktok.mp4";
const AUDIO_FILE = "original_audio.mp3";
const VERIFY_DIR = path.resolve(__dirname, "v5_verify");
const VIEW_W = 405;
const VIEW_H = 720;
const OUT_W = 1080;
const DEVICE_SCALE = OUT_W / VIEW_W; // 2.6667 -> native 1080x1920 frames
const IS_DRAFT = process.argv.includes('--draft');
const FPS_ARG = process.argv.find(a => a.startsWith('--fps='));
const FPS = FPS_ARG ? parseInt(FPS_ARG.split('=')[1], 10) : (IS_DRAFT ? 30 : 60);
const DURATION = 80.0;
const TOTAL_FRAMES = Math.round(DURATION * FPS);

const VERIFY_TIMESTAMPS = [
  { name: "01_daylight_atom_2s.png", t: 2.5 },
  { name: "02_daylight_park_6s.png", t: 6.5 },
  { name: "02b_transition_flash_8s.png", t: 8.06 },
  { name: "03_xray_vanish_9s.png", t: 9.0 },
  { name: "04_xray_sun_flare_10s.png", t: 10.4 },
  { name: "05_xray_leaping_dog_13s.png", t: 13.2 },
  { name: "05b_ground_close_15s.png", t: 15.2 },
  { name: "06_pov_hands_stars_18s.png", t: 18.0 },
  { name: "07_xray_crowd_skirt_22s.png", t: 22.0 },
  { name: "08_nuclear_hands_33s.png", t: 33.0 },
  { name: "09_outshines_sun_37s.png", t: 37.0 },
  { name: "10_earth_expanding_45s.png", t: 45.0 },
  { name: "11_moon_above_earth_53s.png", t: 53.5 },
  { name: "11b_moon_engulfed_55s.png", t: 55.1 },
  { name: "12_moon_is_gone_59s.png", t: 59.0 },
  { name: "13_lidar_electrons_back_67s.png", t: 67.5 },
  { name: "14_second_blast_71s.png", t: 70.8 }
];

async function exportVideo() {
  if (!fs.existsSync(VERIFY_DIR)) {
    fs.mkdirSync(VERIFY_DIR, { recursive: true });
  }

  console.log("Launching headless GPU browser for V4 1:1 Simulation Render...");
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: "new",
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--use-gl=angle',
      '--use-angle=d3d11',
      '--allow-file-access-from-files'
    ]
  });

  const page = await browser.newPage();
  page.on('console', (msg) => {
    if (msg.type() === 'error' || msg.type() === 'warning') console.log(`[browser ${msg.type()}] ${msg.text()}`);
  });
  page.on('pageerror', (err) => console.log(`[browser pageerror] ${err.message}`));
  await page.setViewport({ width: VIEW_W, height: VIEW_H, deviceScaleFactor: DEVICE_SCALE });
  const htmlPath = 'file:///' + path.resolve(__dirname, 'sketch_viewer.html').replace(/\\/g, '/') + '?export=1';
  await page.goto(htmlPath, { waitUntil: 'load' });

  console.log("1. Rendering 14 keyframe verification screenshots...");
  for (const item of VERIFY_TIMESTAMPS) {
    await page.evaluate((sec) => window.renderAtTime(sec), item.t);
    const outPath = path.join(VERIFY_DIR, item.name);
    await page.screenshot({ path: outPath, type: 'png' });
    console.log(`   Saved verification keyframe: ${item.name} (t=${item.t}s)`);
  }

  if (process.argv.includes('--verify-only')) {
    await browser.close();
    console.log("Verification frames complete.");
    process.exit(0);
  }

  console.log(`2. Starting Full HD 1080x1920 video export: ${TOTAL_FRAMES} frames at ${FPS} FPS (${DURATION}s) with ${AUDIO_FILE}...`);

  const ffmpegArgs = [
    '-y',
    '-f', 'image2pipe',
    '-vcodec', 'mjpeg',
    '-r', String(FPS),
    '-i', '-',
    '-i', AUDIO_FILE,
    '-vf', 'scale=1080:1920:flags=lanczos',
    '-c:v', 'libx264',
    '-preset', 'slow',
    '-tune', 'film',
    '-crf', '15',
    '-pix_fmt', 'yuv420p',
    '-c:a', 'aac',
    '-b:a', '192k',
    '-shortest',
    OUTPUT_VIDEO
  ];

  const ffmpeg = spawn('ffmpeg', ffmpegArgs);

  ffmpeg.stderr.on('data', (data) => {
    const msg = data.toString();
    if (msg.includes('Error') || msg.includes('fatal')) {
      console.error('FFmpeg stderr:', msg);
    }
  });

  for (let f = 0; f < TOTAL_FRAMES; f++) {
    const time = f / FPS;
    await page.evaluate((t) => {
      window.renderAtTime(t);
    }, time);

    const buffer = await page.screenshot({ type: 'jpeg', quality: 97 });

    await new Promise((resolve) => {
      if (!ffmpeg.stdin.write(buffer)) {
        ffmpeg.stdin.once('drain', resolve);
      } else {
        process.nextTick(resolve);
      }
    });

    if (f % (FPS * 5) === 0 || f === TOTAL_FRAMES - 1) {
      const progress = Math.round((f / TOTAL_FRAMES) * 100);
      console.log(`Progress: ${progress}% (Frame ${f}/${TOTAL_FRAMES}, Time: ${time.toFixed(1)}s / ${DURATION}s)`);
    }
  }

  console.log("Finishing frame stream to FFmpeg...");
  ffmpeg.stdin.end();

  await new Promise((resolve, reject) => {
    ffmpeg.on('close', (code) => {
      if (code === 0) {
        console.log(`FFmpeg encoding completed successfully: ${OUTPUT_VIDEO}`);
        resolve();
      } else {
        reject(new Error(`FFmpeg exited with code ${code}`));
      }
    });
  });

  await browser.close();

  // Also copy to what_if_electrons_blender_tiktok.mp4 so both output paths have the latest V4 master
  fs.copyFileSync(OUTPUT_VIDEO, OUTPUT_VIDEO_2);
  console.log(`Full V4 1080x1920 master video complete! Saved to ${OUTPUT_VIDEO} and ${OUTPUT_VIDEO_2}`);
  process.exit(0);
}

exportVideo().catch(err => {
  console.error("Export failed:", err);
  process.exit(1);
});
