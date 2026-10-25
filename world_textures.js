// Procedural High-Definition Textures for 1:1 Reference Fidelity

window.WorldTextures = (function() {
  function createSkyTexture() {
    const c = document.createElement('canvas');
    c.width = 64;
    c.height = 512;
    const ctx = c.getContext('2d');
    // Cinematic sunset sky gradient: deep twilight slate zenith -> warm golden-amber horizon glow
    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0.0, '#1e293b');
    grad.addColorStop(0.32, '#3b4c63');
    grad.addColorStop(0.64, '#7d695d');
    grad.addColorStop(0.86, '#bf7d52');
    grad.addColorStop(1.0, '#e0985e');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 512);
    return new THREE.CanvasTexture(c);
  }

  function createGrassTexture(sRand) {
    const S = 1024;
    const c = document.createElement('canvas');
    c.width = S;
    c.height = S;
    const ctx = c.getContext('2d');
    // Rich dark emerald-forest green base (no washed-out tones!)
    ctx.fillStyle = '#122b10';
    ctx.fillRect(0, 0, S, S);

    // Deep shadow & rich moss tonal patches
    for (let i = 0; i < 75; i++) {
      const x = sRand() * S;
      const y = sRand() * S;
      const r = 80 + sRand() * 220;
      const g = ctx.createRadialGradient(x, y, 4, x, y, r);
      const dark = sRand() > 0.45;
      g.addColorStop(0, dark ? 'rgba(7, 18, 6, 0.42)' : 'rgba(34, 72, 22, 0.28)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      for (let ox = -S; ox <= S; ox += S) {
        for (let oy = -S; oy <= S; oy += S) {
          ctx.save();
          ctx.translate(ox, oy);
          ctx.fillRect(x - r, y - r, r * 2, r * 2);
          ctx.restore();
        }
      }
    }

    // Subtle mowing stripes
    for (let s = 0; s < 8; s++) {
      ctx.fillStyle = s % 2 === 0 ? 'rgba(38, 78, 24, 0.08)' : 'rgba(6, 16, 4, 0.09)';
      ctx.fillRect(0, s * S / 8, S, S / 8);
    }

    // Rich dark green blades with subtle golden-sunset tips
    for (let i = 0; i < 160000; i++) {
      const x = sRand() * S;
      const y = sRand() * S;
      const g = Math.floor(38 + sRand() * 36);
      const r = Math.floor(g * 0.42);
      const b = Math.floor(g * 0.18);
      ctx.fillStyle = `rgba(${r},${g},${b},0.62)`;
      ctx.fillRect(x, y, 1, 2.5 + sRand() * 2);
    }

    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(9, 9);
    return tex;
  }

  function createXrayGroundTexture(sRand) {
    const S = 2048;
    const c = document.createElement('canvas');
    c.width = S;
    c.height = S;
    const ctx = c.getContext('2d');
    // Pure pitch-black background (#000000) with minimalist pure-white micro-stipple (no neon colors!)
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, S, S);

    for (let i = 0; i < 240000; i++) {
      const x = sRand() * S;
      const y = sRand() * S;
      const p = sRand();
      if (p > 0.945) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
        ctx.fillRect(x, y, 1.1, 1.1);
      } else if (p > 0.70) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.42)';
        ctx.fillRect(x, y, 1.0, 2.0);
      } else {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
        ctx.fillRect(x, y, 0.9, 1.7);
      }
    }

    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(36, 36);
    return tex;
  }

  function createBuildingTexture(baseColor, litColor, isXray, sRand, cols = 16, rows = 72) {
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 1024;
    const ctx = c.getContext('2d');

    const cellW = c.width / cols;
    const cellH = c.height / rows;

    if (isXray) {
      // Minimalist white wireframe only on pure black background (#000000) — zero neon colors!
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, c.width, c.height);

      for (let r = 0; r < rows; r++) {
        // Crisp pure-white floor slab line
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.fillRect(0, r * cellH, c.width, 2.0);
      }
      // Subtle pure-white vertical mullions
      ctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
      for (let col = 0; col <= cols; col++) {
        ctx.fillRect(col * cellW - 0.6, 0, 1.2, c.height);
      }
      // Pure white facade outline
      ctx.strokeStyle = 'rgba(255, 255, 255, 1.0)';
      ctx.lineWidth = 5;
      ctx.strokeRect(0, 0, c.width, c.height);
    } else {
      ctx.fillStyle = baseColor;
      ctx.fillRect(0, 0, c.width, c.height);

      // Sky reflection gradient across the glass curtain wall
      const refl = ctx.createLinearGradient(0, 0, c.width, c.height);
      refl.addColorStop(0, 'rgba(200, 215, 230, 0.16)');
      refl.addColorStop(0.5, 'rgba(120, 140, 160, 0.04)');
      refl.addColorStop(1, 'rgba(200, 215, 230, 0.12)');

      for (let r = 0; r < rows; r++) {
        const floorLit = sRand() > 0.86;
        const floorTone = 0.85 + sRand() * 0.3;
        for (let col = 0; col < cols; col++) {
          const x = col * cellW;
          const y = r * cellH;
          const rnd = sRand();
          if (rnd > 0.93 || (floorLit && rnd > 0.45)) {
            ctx.fillStyle = litColor;
            ctx.globalAlpha = 0.55 + sRand() * 0.35;
          } else {
            const v = Math.floor((rnd > 0.5 ? 46 : 30) * floorTone);
            ctx.fillStyle = `rgb(${v}, ${Math.floor(v * 1.22)}, ${Math.floor(v * 1.55)})`;
            ctx.globalAlpha = 0.92;
          }
          ctx.fillRect(x + 1.6, y + 2.0, cellW - 3.2, cellH - 3.4);
        }
      }
      ctx.globalAlpha = 1.0;
      ctx.fillStyle = refl;
      ctx.fillRect(0, 0, c.width, c.height);
    }

    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }

  // Smooth 2D value noise + FBM domain warping for 1:1 Earth Cloud Plasma (frame_022..030)
  function createSwirlingEarthTexture(sRand) {
    const S = 1024;
    const c = document.createElement('canvas');
    c.width = S;
    c.height = S;
    const ctx = c.getContext('2d');
    const imgData = ctx.createImageData(S, S);
    const data = imgData.data;

    const gridSize = 64;
    const perm = new Float32Array(gridSize * gridSize);
    for (let i = 0; i < perm.length; i++) perm[i] = sRand();

    function noise(x, y) {
      const xi = ((Math.floor(x) % gridSize) + gridSize) % gridSize;
      const yi = ((Math.floor(y) % gridSize) + gridSize) % gridSize;
      const xf = x - Math.floor(x);
      const yf = y - Math.floor(y);
      const u = xf * xf * (3 - 2 * xf);
      const v = yf * yf * (3 - 2 * yf);
      const xi1 = (xi + 1) % gridSize;
      const yi1 = (yi + 1) % gridSize;
      const a = perm[yi * gridSize + xi];
      const b = perm[yi * gridSize + xi1];
      const c0 = perm[yi1 * gridSize + xi];
      const d = perm[yi1 * gridSize + xi1];
      return (a * (1 - u) + b * u) * (1 - v) + (c0 * (1 - u) + d * u) * v;
    }

    function fbm(x, y) {
      let val = 0;
      let amp = 0.52;
      let freq = 1.0;
      let norm = 0;
      for (let o = 0; o < 6; o++) {
        val += amp * noise(x * freq, y * freq);
        norm += amp;
        freq *= 2.03;
        amp *= 0.52;
      }
      return val / norm;
    }

    for (let py = 0; py < S; py++) {
      for (let px = 0; px < S; px++) {
        // Seamless toroidal mapping / multi-scale domain warping for silky cyclone bands
        const nx = (px / S) * 4.2;
        const ny = (py / S) * 4.2;
        const qx = fbm(nx + 1.2, ny + 3.4) - 0.5;
        const qy = fbm(nx + 5.2, ny + 1.3) - 0.5;
        const rx = fbm(nx + 4.2 * qx + 1.7, ny + 4.2 * qy + 9.2) - 0.5;
        const ry = fbm(nx + 4.2 * qx + 8.3, ny + 4.2 * qy + 2.8) - 0.5;
        const f = fbm(nx + 3.8 * rx, ny + 3.8 * ry);
        const ridge = 1.0 - Math.abs(fbm(nx * 1.6 + 2.5 * rx, ny * 1.6 + 2.5 * ry) - 0.5) * 4.2;

        // Normalize around actual FBM distribution [0.34, 0.66] for crisp swirling cloud contrast
        const rawT = Math.max(0, Math.min(1, (f - 0.345) / 0.31));
        const smoothT = rawT * rawT * (3 - 2 * rawT);
        const crest = Math.max(0, Math.min(1, ridge)) * 0.25;
        const tc = Math.max(0, Math.min(1, smoothT * 0.82 + crest));

        // Rich periwinkle-slate troughs (86, 108, 168) -> lavender midtones -> luminous white cloud crests (250, 253, 255)
        const r = Math.round(86 + tc * 164);
        const g = Math.round(108 + tc * 145);
        const b = Math.round(168 + tc * 87);

        const idx = (py * S + px) * 4;
        data[idx] = r;
        data[idx + 1] = g;
        data[idx + 2] = b;
        data[idx + 3] = 255;
      }
    }
    ctx.putImageData(imgData, 0, 0);
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }

  // Per-pixel 3D heightfield normal-shaded lunar surface (frame_026..028 — zero cartoon rings!)
  function createCrateredMoonTexture(sRand) {
    const W = 1024, H = 512;
    const c = document.createElement('canvas');
    c.width = W;
    c.height = H;
    const ctx = c.getContext('2d');
    const imgData = ctx.createImageData(W, H);
    const data = imgData.data;

    const gridSize = 64;
    const perm = new Float32Array(gridSize * gridSize);
    for (let i = 0; i < perm.length; i++) perm[i] = sRand();

    function noise(x, y) {
      const xi = ((Math.floor(x) % gridSize) + gridSize) % gridSize;
      const yi = ((Math.floor(y) % gridSize) + gridSize) % gridSize;
      const xf = x - Math.floor(x);
      const yf = y - Math.floor(y);
      const u = xf * xf * (3 - 2 * xf);
      const v = yf * yf * (3 - 2 * yf);
      const xi1 = (xi + 1) % gridSize;
      const yi1 = (yi + 1) % gridSize;
      const a = perm[yi * gridSize + xi];
      const b = perm[yi * gridSize + xi1];
      const c0 = perm[yi1 * gridSize + xi];
      const d = perm[yi1 * gridSize + xi1];
      return (a * (1 - u) + b * u) * (1 - v) + (c0 * (1 - u) + d * u) * v;
    }

    function fbm(x, y, octaves = 5) {
      let val = 0, amp = 0.5, freq = 1.0, norm = 0;
      for (let o = 0; o < octaves; o++) {
        val += amp * noise(x * freq, y * freq);
        norm += amp;
        freq *= 2.0;
        amp *= 0.5;
      }
      return val / norm;
    }

    // Generate physical lunar craters list for heightfield evaluation
    const craters = [];
    for (let i = 0; i < 165; i++) {
      craters.push({
        x: sRand() * W,
        y: 28 + sRand() * (H - 56),
        r: 6 + Math.pow(sRand(), 2.6) * 44,
        depth: 0.45 + sRand() * 0.55
      });
    }

    const heightMap = new Float32Array(W * H);
    const albedoMap = new Float32Array(W * H);

    for (let y = 0; y < H; y++) {
      const ny = (y / H) * 4.0;
      for (let x = 0; x < W; x++) {
        const nx = (x / W) * 8.0; // Period 8 divides gridSize=64 exactly for 100% seamless spherical UV wrap!
        const maria = fbm(nx, ny + 2.0, 4);
        const detail = fbm(nx * 4.0, ny * 4.0 + 4.0, 4);
        const micro = noise(nx * 16.0, ny * 16.0);

        // Smooth transition between darker basaltic maria and brighter lunar highlands
        const mariaFactor = Math.max(0, Math.min(1, (maria - 0.42) / 0.18));
        const baseAlbedo = 0.34 + mariaFactor * 0.36 + (detail - 0.5) * 0.22 + (micro - 0.5) * 0.06;
        let h = mariaFactor * 0.4 + detail * 0.35 + micro * 0.06;

        albedoMap[y * W + x] = baseAlbedo;
        heightMap[y * W + x] = h;
      }
    }

    // Carve physical parabolic crater bowls into heightMap & slightly darken deep crater floors
    for (let i = 0; i < craters.length; i++) {
      const cr = craters[i];
      const rMax = cr.r * 1.35;
      const rMax2 = rMax * rMax;
      const y0 = Math.max(0, Math.floor(cr.y - rMax));
      const y1 = Math.min(H - 1, Math.ceil(cr.y + rMax));

      for (const ox of [-W, 0, W]) {
        const cx = cr.x + ox;
        const x0 = Math.max(0, Math.floor(cx - rMax));
        const x1 = Math.min(W - 1, Math.ceil(cx + rMax));
        if (x0 > x1) continue;

        for (let py = y0; py <= y1; py++) {
          const dy = py - cr.y;
          const dy2 = dy * dy;
          for (let px = x0; px <= x1; px++) {
            const dx = px - cx;
            const d2 = dx * dx + dy2;
            if (d2 >= rMax2) continue;
            const u = Math.sqrt(d2) / cr.r;
            let dh = 0;
            if (u < 1.0) {
              // Smooth bowl depression
              dh = -cr.depth * (1.0 - u * u) * 0.55;
              albedoMap[py * W + px] -= (1.0 - u * u) * 0.05;
            } else {
              // Subtle gentle outer slope (no white ring!)
              const w = (1.35 - u) / 0.35;
              dh = cr.depth * 0.08 * w * w * (3 - 2 * w);
            }
            heightMap[py * W + px] += dh;
          }
        }
      }
    }

    // Compute directional relief shading from heightMap gradients (light from lower-left Earthshine)
    for (let y = 0; y < H; y++) {
      const ym = Math.max(0, y - 1);
      const yp = Math.min(H - 1, y + 1);
      for (let x = 0; x < W; x++) {
        const xm = (x - 1 + W) % W;
        const xp = (x + 1) % W;
        const dhdx = (heightMap[y * W + xp] - heightMap[y * W + xm]) * 2.2;
        const dhdy = (heightMap[yp * W + x] - heightMap[ym * W + x]) * 2.2;

        // Directional relief dot product (illuminated from bottom-left)
        const shade = Math.max(-0.28, Math.min(0.28, -dhdx * 0.72 + dhdy * 0.68));
        const val = Math.max(0.12, Math.min(0.82, albedoMap[y * W + x] + shade));

        // Cool lunar slate-silver palette matching frame_027
        const r = Math.round(val * 172);
        const g = Math.round(val * 184);
        const b = Math.round(val * 204);

        const idx = (y * W + x) * 4;
        data[idx] = r;
        data[idx + 1] = g;
        data[idx + 2] = b;
        data[idx + 3] = 255;
      }
    }

    ctx.putImageData(imgData, 0, 0);
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    return tex;
  }

  function createParticleGlowTexture(isDiamond = false) {
    const c = document.createElement('canvas');
    c.width = 64;
    c.height = 64;
    const ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(32, 32, 1, 32, 32, 30);
    g.addColorStop(0.0, 'rgba(255, 255, 255, 1)');
    g.addColorStop(0.28, 'rgba(255, 255, 255, 0.90)');
    g.addColorStop(0.65, 'rgba(255, 255, 255, 0.28)');
    g.addColorStop(1.0, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(32, 32, 30, 0, Math.PI * 2);
    ctx.fill();

    if (isDiamond) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.96)';
      ctx.beginPath();
      ctx.moveTo(32, 2); ctx.lineTo(37, 27); ctx.lineTo(62, 32);
      ctx.lineTo(37, 37); ctx.lineTo(32, 62); ctx.lineTo(27, 37);
      ctx.lineTo(2, 32); ctx.lineTo(27, 27);
      ctx.closePath();
      ctx.fill();
    }
    return new THREE.CanvasTexture(c);
  }

  // Cinematic Photorealistic Stylized Earth (Continents, Oceans, Clouds & Night City Lights)
  function createCinematicEarthTexture(sRand) {
    const W = 1024, H = 512;
    const c = document.createElement('canvas');
    c.width = W;
    c.height = H;
    const ctx = c.getContext('2d');
    const imgData = ctx.createImageData(W, H);
    const data = imgData.data;

    // Fast 2D Value Noise for organic continental borders & cloud vortices
    const gridSize = 64;
    const perm = new Float32Array(gridSize * gridSize);
    for (let i = 0; i < perm.length; i++) perm[i] = sRand();

    function noise(x, y) {
      const xi = ((Math.floor(x) % gridSize) + gridSize) % gridSize;
      const yi = ((Math.floor(y) % gridSize) + gridSize) % gridSize;
      const xf = x - Math.floor(x);
      const yf = y - Math.floor(y);
      const u = xf * xf * (3 - 2 * xf);
      const v = yf * yf * (3 - 2 * yf);
      const xi1 = (xi + 1) % gridSize;
      const yi1 = (yi + 1) % gridSize;
      const a = perm[yi * gridSize + xi];
      const b = perm[yi * gridSize + xi1];
      const c0 = perm[yi1 * gridSize + xi];
      const d = perm[yi1 * gridSize + xi1];
      return (a * (1 - u) + b * u) * (1 - v) + (c0 * (1 - u) + d * u) * v;
    }

    function fbm(x, y, oct = 4) {
      let val = 0, amp = 0.5, freq = 1.0, norm = 0;
      for (let o = 0; o < oct; o++) {
        val += amp * noise(x * freq, y * freq);
        norm += amp;
        freq *= 2.05;
        amp *= 0.5;
      }
      return val / norm;
    }

    // Continental Anchor Nodes (u in 0..1, v in 0..1, radius)
    const continents = [
      { u: 0.22, v: 0.30, rx: 0.16, ry: 0.14, type: 'land' }, // North America
      { u: 0.32, v: 0.65, rx: 0.09, ry: 0.18, type: 'land' }, // South America
      { u: 0.50, v: 0.28, rx: 0.11, ry: 0.10, type: 'land' }, // Europe
      { u: 0.52, v: 0.55, rx: 0.14, ry: 0.17, type: 'desert' }, // Africa / Sahara
      { u: 0.72, v: 0.32, rx: 0.22, ry: 0.16, type: 'land' }, // Asia
      { u: 0.82, v: 0.72, rx: 0.08, ry: 0.07, type: 'desert' }, // Australia
      { u: 0.50, v: 0.94, rx: 0.48, ry: 0.07, type: 'ice' } // Antarctica
    ];

    for (let py = 0; py < H; py++) {
      const v = py / H;
      const lat = (v - 0.5) * Math.PI;

      for (let px = 0; px < W; px++) {
        const u = px / W;
        const idx = (py * W + px) * 4;

        // FBM warp for coastlines
        const warpX = fbm(u * 12, v * 12) - 0.5;
        const warpY = fbm(u * 12 + 5.2, v * 12 + 3.1) - 0.5;
        const wu = u + warpX * 0.08;
        const wv = v + warpY * 0.08;

        // Check distance to continental centers
        let isLand = false;
        let cType = 'land';
        let minEdgeDist = 999;

        for (const c of continents) {
          let du = Math.abs(wu - c.u);
          if (du > 0.5) du = 1.0 - du; // Toroidal wrap
          const dv = Math.abs(wv - c.v);
          const dNorm = (du / c.rx) * (du / c.rx) + (dv / c.ry) * (dv / c.ry);

          const fractalNoise = fbm(u * 18 + c.u * 10, v * 18 + c.v * 10, 4) * 0.55;
          if (dNorm < 1.0 + fractalNoise) {
            isLand = true;
            cType = c.type;
            minEdgeDist = Math.min(minEdgeDist, 1.0 + fractalNoise - dNorm);
            break;
          }
        }

        // Arctic Polar Cap (v < 0.09)
        if (v < 0.09 + fbm(u * 14, 2.0) * 0.04) {
          isLand = true;
          cType = 'ice';
        }

        let r = 8, g = 24, b = 52; // Deep Ocean (#081834)

        if (!isLand) {
          // Ocean shelf near coast
          const shelfNoise = fbm(u * 20, v * 20) * 0.2;
          const oceanDepth = Math.sin(Math.abs(lat));
          r = Math.round(7 + oceanDepth * 10);
          g = Math.round(26 + (1.0 - oceanDepth) * 28);
          b = Math.round(58 + (1.0 - oceanDepth) * 45);
        } else {
          // Continental Landmasses
          if (cType === 'ice') {
            // Glacial Polar Ice
            r = 230; g = 242; b = 252;
          } else if (cType === 'desert') {
            // Warm Golden Sahara / Outback
            const dNoise = fbm(u * 24, v * 24) * 35;
            r = Math.round(180 + dNoise);
            g = Math.round(145 + dNoise * 0.8);
            b = Math.round(85 + dNoise * 0.4);
          } else {
            // Temperate Forest & Mountain Greens
            const mNoise = fbm(u * 28, v * 28);
            if (mNoise > 0.62) {
              // Mountain range peaks
              r = 135; g = 128; b = 120;
            } else {
              // Lush emerald & pine forest
              r = Math.round(28 + mNoise * 35);
              g = Math.round(75 + mNoise * 55);
              b = Math.round(35 + mNoise * 25);
            }
          }

          // Coastal sand beaches
          if (minEdgeDist < 0.12 && cType !== 'ice') {
            r = Math.round(r * 0.6 + 185 * 0.4);
            g = Math.round(g * 0.6 + 165 * 0.4);
            b = Math.round(b * 0.6 + 110 * 0.4);
          }
        }

        // 3. Swirling Weather Cyclone Clouds (FBM domain-warped white spirals)
        const cloudF = fbm(u * 14 + 1.2, v * 14 + 4.5, 5);
        const cloudWarp = fbm(u * 24 + cloudF * 2.5, v * 24 + cloudF * 2.5);
        if (cloudWarp > 0.54) {
          const cloudAlpha = Math.min(1.0, (cloudWarp - 0.54) * 3.8);
          r = Math.round(r * (1 - cloudAlpha) + 252 * cloudAlpha);
          g = Math.round(g * (1 - cloudAlpha) + 254 * cloudAlpha);
          b = Math.round(b * (1 - cloudAlpha) + 255 * cloudAlpha);
        }

        // 4. Night-Side City Lights (Clustered golden embers on land)
        if (isLand && cType !== 'ice') {
          const cityNoise = Math.pow(fbm(u * 45 + 7.2, v * 45 + 1.8, 3), 3.2);
          if (cityNoise > 0.38) {
            const glow = Math.min(1.0, (cityNoise - 0.38) * 4.2);
            r = Math.round(r * (1 - glow * 0.6) + 255 * (glow * 0.6));
            g = Math.round(g * (1 - glow * 0.6) + 205 * (glow * 0.6));
            b = Math.round(b * (1 - glow * 0.6) + 95 * (glow * 0.6));
          }
        }

        data[idx] = r;
        data[idx + 1] = g;
        data[idx + 2] = b;
        data[idx + 3] = 255;
      }
    }

    ctx.putImageData(imgData, 0, 0);
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    return tex;
  }

  // Deep Interstellar Space Nebula Texture with Glowing Cosmic Dust Clouds
  function createCosmicNebulaTexture(sRand) {
    const W = 2048;
    const H = 1024;
    const c = document.createElement('canvas');
    c.width = W;
    c.height = H;
    const ctx = c.getContext('2d');

    // Deep cosmic void background
    ctx.fillStyle = '#02030a';
    ctx.fillRect(0, 0, W, H);

    // Glowing Cosmic Dust Nebula Clouds (Vibrant Violet, Magenta, Cyan & Deep Blue filaments)
    const nebulaClouds = [
      { x: W * 0.28, y: H * 0.42, r: H * 0.65, col: 'rgba(139, 92, 246, 0.48)' }, // Electric Violet
      { x: W * 0.48, y: H * 0.35, r: H * 0.50, col: 'rgba(236, 72, 153, 0.42)' }, // Cosmic Magenta
      { x: W * 0.68, y: H * 0.58, r: H * 0.55, col: 'rgba(6, 182, 212, 0.45)' },  // Cyan Plasma
      { x: W * 0.85, y: H * 0.30, r: H * 0.45, col: 'rgba(59, 130, 246, 0.40)' }, // Deep Royal Blue
      { x: W * 0.15, y: H * 0.65, r: H * 0.40, col: 'rgba(245, 158, 11, 0.25)' }, // Warm Amber Stardust
      { x: W * 0.52, y: H * 0.62, r: H * 0.38, col: 'rgba(168, 85, 247, 0.35)' }  // Purple Core
    ];

    nebulaClouds.forEach(n => {
      const g = ctx.createRadialGradient(n.x, n.y, 20, n.x, n.y, n.r);
      g.addColorStop(0, n.col);
      g.addColorStop(0.5, n.col.replace(/[\d\.]+\)$/, '0.18)'));
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    });

    // Glittering Star Clusters & Distant Galaxies (1400 stars of varying magnitudes & spectral types)
    for (let i = 0; i < 1400; i++) {
      const sx = sRand() * W;
      const sy = sRand() * H;
      const mag = sRand();
      const r = 0.4 + mag * 1.9;

      // Spectral colors: Blue-white O/B type, Sun-like G type yellow, M type red/orange, pure diamond
      let starCol = '#ffffff';
      if (mag > 0.88) starCol = '#bae6fd'; // Bright Class B (Ice Blue)
      else if (mag > 0.72) starCol = '#fef08a'; // Class G (Warm Yellow)
      else if (mag > 0.58) starCol = '#fbcfe8'; // Soft Rose Pink

      // Faint atmospheric glow halo on brighter stars
      if (mag > 0.80) {
        ctx.fillStyle = starCol === '#bae6fd' ? 'rgba(186, 230, 253, 0.25)' : 'rgba(254, 240, 138, 0.25)';
        ctx.beginPath();
        ctx.arc(sx, sy, r * 3.5, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = starCol;
      ctx.beginPath();
      ctx.arc(sx, sy, r, 0, Math.PI * 2);
      ctx.fill();

      // Top 5% brightest stars get 4-point diffraction cross spikes
      if (mag > 0.95) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
        ctx.lineWidth = 0.9;
        ctx.beginPath();
        ctx.moveTo(sx - 8, sy); ctx.lineTo(sx + 8, sy);
        ctx.moveTo(sx, sy - 8); ctx.lineTo(sx, sy + 8);
        ctx.stroke();
      }
    }

    const tex = new THREE.CanvasTexture(c);
    tex.mapping = THREE.EquirectangularReflectionMapping;
    return tex;
  }

  return {
    createSkyTexture,
    createGrassTexture,
    createXrayGroundTexture,
    createBuildingTexture,
    createSwirlingEarthTexture,
    createCinematicEarthTexture,
    createCosmicNebulaTexture,
    createCrateredMoonTexture,
    createParticleGlowTexture
  };
})();

