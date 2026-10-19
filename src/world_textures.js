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

  return {
    createSkyTexture,
    createGrassTexture,
    createXrayGroundTexture,
    createBuildingTexture,
    createSwirlingEarthTexture,
    createCrateredMoonTexture,
    createParticleGlowTexture
  };
})();

