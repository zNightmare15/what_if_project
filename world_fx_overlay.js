// 2D / Composite Visual Effects Renderer for 1:1 Reference Fidelity
// Calibrated 1:1 to @man_ia_c reference frames (frame_001..040)

window.WorldFXOverlay = (function() {

  function renderOverlays(fxCtx, VIEW_W, VIEW_H, state) {
    const {
      t,
      sunScreenPos,
      handsGlowProg,
      peopleGlowProg,
      eruptionProg,
      whiteoutAlpha,
      earthAtmoMode,
      earthMapCanvas
    } = state;

    fxCtx.clearRect(0, 0, VIEW_W, VIEW_H);

    // =========================================================================
    // 1. ANIMATED 3D ATOM & BARE NUCLEUS (0.0s - 10.2s: frame_001..005)
    // =========================================================================
    const showAtom = state.showAtom !== false;
    if (showAtom && t < 10.2) {
      let moveProg = Math.max(0, Math.min(1, (t - 4.0) / 1.1));
      moveProg = moveProg * moveProg * (3 - 2 * moveProg);

      const cx = VIEW_W * 0.5 * (1 - moveProg) + 46 * moveProg;
      const cy = 98 * (1 - moveProg) + (VIEW_H * 0.465 - 36) * moveProg;
      const scale = 1.0 * (1 - moveProg) + 0.34 * moveProg;
      const fadeOut = (t > 9.0) ? Math.max(0, 1 - (t - 9.0) / 1.2) : 1.0;

      fxCtx.save();
      fxCtx.globalAlpha = fadeOut;
      fxCtx.translate(cx, cy);
      fxCtx.scale(scale, scale);

      if (t < 8.033) {
        const bgGrad = fxCtx.createRadialGradient(0, 0, 5, 0, 0, 82);
        bgGrad.addColorStop(0, 'rgba(12, 20, 38, 0.52)');
        bgGrad.addColorStop(1, 'rgba(12, 20, 38, 0)');
        fxCtx.fillStyle = bgGrad;
        fxCtx.beginPath();
        fxCtx.arc(0, 0, 82, 0, Math.PI * 2);
        fxCtx.fill();
      } else {
        const auraGrad = fxCtx.createRadialGradient(0, 0, 2, 0, 0, 48);
        auraGrad.addColorStop(0, 'rgba(255, 120, 80, 0.85)');
        auraGrad.addColorStop(0.45, 'rgba(220, 50, 30, 0.42)');
        auraGrad.addColorStop(1, 'rgba(220, 38, 38, 0)');
        fxCtx.fillStyle = auraGrad;
        fxCtx.beginPath();
        fxCtx.arc(0, 0, 48, 0, Math.PI * 2);
        fxCtx.fill();
      }

      if (t < 8.033) {
        const angles = [-0.48, 0.48, 1.48];
        angles.forEach((ang, idx) => {
          fxCtx.save();
          fxCtx.rotate(ang);
          fxCtx.strokeStyle = 'rgba(175, 220, 255, 0.86)';
          fxCtx.lineWidth = 1.8;
          fxCtx.shadowColor = '#60a5fa';
          fxCtx.shadowBlur = 8;
          fxCtx.beginPath();
          fxCtx.ellipse(0, 0, 60, 22, 0, 0, Math.PI * 2);
          fxCtx.stroke();

          const eAngle = t * (3.1 + idx * 0.65) + idx * 2.1;
          const ex = Math.cos(eAngle) * 60;
          const ey = Math.sin(eAngle) * 22;

          const eGlow = fxCtx.createRadialGradient(ex, ey, 1, ex, ey, 12);
          eGlow.addColorStop(0, 'rgba(255, 255, 255, 1)');
          eGlow.addColorStop(0.35, 'rgba(110, 180, 255, 0.92)');
          eGlow.addColorStop(1, 'rgba(96, 165, 250, 0)');
          fxCtx.fillStyle = eGlow;
          fxCtx.beginPath();
          fxCtx.arc(ex, ey, 12, 0, Math.PI * 2);
          fxCtx.fill();

          if (moveProg < 0.4) {
            fxCtx.rotate(-ang);
            fxCtx.fillStyle = 'rgba(255, 255, 255, 0.92)';
            fxCtx.font = 'italic 11.5px Georgia, serif';
            const lx = ex * Math.cos(ang) - ey * Math.sin(ang) + 9;
            const ly = ex * Math.sin(ang) + ey * Math.cos(ang) - 6;
            fxCtx.fillText('e⁻', lx, ly);
          }
          fxCtx.restore();
        });
      }

      const nucleons = [
        [-7, -5, '#dc2626'], [7, -4, '#e2e8f0'], [0, 7, '#dc2626'],
        [-6, 5, '#cbd5e1'], [6, 5, '#ef4444'], [0, -7, '#f1f5f9'], [0, 0, '#ef4444']
      ];
      const nucSpread = (t > 8.033) ? 1.0 + (t - 8.033) * 0.25 : 1.0;
      nucleons.forEach(([nx, ny, col]) => {
        const sx = nx * nucSpread;
        const sy = ny * nucSpread;
        const nGrad = fxCtx.createRadialGradient(sx - 2.2, sy - 2.2, 1, sx, sy, 8.2);
        nGrad.addColorStop(0, '#ffffff');
        nGrad.addColorStop(0.35, col);
        nGrad.addColorStop(1, '#1e293b');
        fxCtx.fillStyle = nGrad;
        fxCtx.beginPath();
        fxCtx.arc(sx, sy, 7.5, 0, Math.PI * 2);
        fxCtx.fill();
      });

      fxCtx.restore();
    }

    // =========================================================================
    // 2. ANAMORPHIC SUN + COPPER-ORANGE LENS FLARE RING (frame_006 & frame_019)
    // =========================================================================
    if (sunScreenPos && sunScreenPos.visible) {
      const sx = sunScreenPos.x;
      const sy = sunScreenPos.y;
      fxCtx.save();

      const haloGrad = fxCtx.createRadialGradient(sx, sy, 10, sx, sy, 76);
      haloGrad.addColorStop(0.0, 'rgba(255, 255, 255, 1)');
      haloGrad.addColorStop(0.35, 'rgba(255, 255, 255, 0.94)');
      haloGrad.addColorStop(0.68, 'rgba(200, 215, 235, 0.36)');
      haloGrad.addColorStop(0.96, 'rgba(140, 160, 185, 0.16)');
      haloGrad.addColorStop(1.0, 'rgba(0, 0, 0, 0)');
      fxCtx.fillStyle = haloGrad;
      fxCtx.beginPath();
      fxCtx.arc(sx, sy, 76, 0, Math.PI * 2);
      fxCtx.fill();

      const ringX = sx - 38;
      const ringY = sy + 64;
      const ringGrad = fxCtx.createRadialGradient(ringX, ringY, 4, ringX, ringY, 27);
      ringGrad.addColorStop(0.0, 'rgba(145, 72, 42, 0.20)');
      ringGrad.addColorStop(0.75, 'rgba(165, 82, 48, 0.34)');
      ringGrad.addColorStop(0.92, 'rgba(215, 115, 75, 0.48)');
      ringGrad.addColorStop(1.0, 'rgba(0, 0, 0, 0)');
      fxCtx.fillStyle = ringGrad;
      fxCtx.beginPath();
      fxCtx.arc(ringX, ringY, 27, 0, Math.PI * 2);
      fxCtx.fill();

      const streakW = 240;
      const streakGrad = fxCtx.createLinearGradient(sx - streakW, sy, sx + streakW, sy);
      streakGrad.addColorStop(0.0, 'rgba(135, 185, 250, 0)');
      streakGrad.addColorStop(0.20, 'rgba(165, 205, 255, 0.38)');
      streakGrad.addColorStop(0.42, 'rgba(235, 246, 255, 0.85)');
      streakGrad.addColorStop(0.50, 'rgba(255, 255, 255, 1.0)');
      streakGrad.addColorStop(0.58, 'rgba(235, 246, 255, 0.85)');
      streakGrad.addColorStop(0.80, 'rgba(165, 205, 255, 0.38)');
      streakGrad.addColorStop(1.0, 'rgba(135, 185, 250, 0)');
      fxCtx.fillStyle = streakGrad;
      fxCtx.beginPath();
      fxCtx.ellipse(sx, sy, streakW, 13, 0, 0, Math.PI * 2);
      fxCtx.fill();

      fxCtx.restore();
    }

    // =========================================================================
    // 3. NUCLEAR INCANDESCENCE BLOOM & SPARKS ON POV HANDS (frame_017: 30.8s - 34.8s)
    // =========================================================================
    if (handsGlowProg > 0.01) {
      fxCtx.save();
      const handCenters = [
        [VIEW_W * 0.20, VIEW_H * 0.72],
        [VIEW_W * 0.80, VIEW_H * 0.72]
      ];
      handCenters.forEach(([hx, hy]) => {
        const hGrad = fxCtx.createRadialGradient(hx, hy, 4, hx, hy, 88);
        hGrad.addColorStop(0.0, `rgba(255, 255, 255, ${0.22 * handsGlowProg})`);
        hGrad.addColorStop(0.55, `rgba(215, 235, 255, ${0.10 * handsGlowProg})`);
        hGrad.addColorStop(1.0, 'rgba(180, 215, 255, 0)');
        fxCtx.fillStyle = hGrad;
        fxCtx.beginPath();
        fxCtx.arc(hx, hy, 88, 0, Math.PI * 2);
        fxCtx.fill();
      });

      // Crisp pinpoint & 4-point diamond stars inside the glowing hands & sleeves (matching frame_017!)
      const handSparks = [
        [0.14, 0.58, 2.2], [0.19, 0.56, 3.0], [0.24, 0.59, 2.4], [0.28, 0.63, 2.0],
        [0.16, 0.66, 3.2], [0.22, 0.69, 2.6], [0.13, 0.74, 2.0], [0.20, 0.77, 3.4],
        [0.25, 0.83, 2.2], [0.15, 0.86, 2.5], [0.21, 0.92, 1.8], [0.11, 0.94, 2.2],
        [0.86, 0.58, 2.2], [0.81, 0.55, 3.1], [0.76, 0.59, 2.5], [0.72, 0.63, 2.0],
        [0.84, 0.66, 3.2], [0.78, 0.70, 2.8], [0.87, 0.74, 2.0], [0.80, 0.78, 3.4],
        [0.75, 0.84, 2.2], [0.85, 0.87, 2.5], [0.79, 0.92, 1.8], [0.89, 0.95, 2.2]
      ];
      handSparks.forEach(([rx, ry, sz], i) => {
        const sx = VIEW_W * rx;
        const sy = VIEW_H * ry;
        const pulse = 0.75 + 0.25 * Math.sin(t * 9.0 + i * 1.7);
        const r = sz * pulse * handsGlowProg;
        fxCtx.fillStyle = `rgba(255, 255, 255, ${0.95 * handsGlowProg})`;
        fxCtx.beginPath();
        fxCtx.moveTo(sx, sy - r * 1.8);
        fxCtx.lineTo(sx + r * 0.45, sy - r * 0.45);
        fxCtx.lineTo(sx + r * 1.8, sy);
        fxCtx.lineTo(sx + r * 0.45, sy + r * 0.45);
        fxCtx.lineTo(sx, sy + r * 1.8);
        fxCtx.lineTo(sx - r * 0.45, sy + r * 0.45);
        fxCtx.lineTo(sx - r * 1.8, sy);
        fxCtx.lineTo(sx - r * 0.45, sy - r * 0.45);
        fxCtx.closePath();
        fxCtx.fill();
      });
      fxCtx.restore();
    }

    // =========================================================================
    // 4. "EACH PERSON OUTSHINES THE SUN" BLOOM & CLOUD ERUPTION (frame_019, frame_021)
    // =========================================================================
    if (peopleGlowProg > 0.01) {
      fxCtx.save();
      const glowSpots = [
        [VIEW_W * 0.76, VIEW_H * 0.76, 95,  0.65], // Foreground right glowing person
        [VIEW_W * 0.14, VIEW_H * 0.66, 65,  0.60], // Left jumping frisbee player
        [VIEW_W * 0.42, VIEW_H * 0.62, 60,  0.50], // Midground crowd
        [VIEW_W * 0.50, VIEW_H * 0.56, 150, 0.32]  // Horizon tree-line glow
      ];
      glowSpots.forEach(([gx, gy, gr, weight]) => {
        const g = fxCtx.createRadialGradient(gx, gy, 4, gx, gy, gr);
        const a = Math.min(1, peopleGlowProg * weight);
        g.addColorStop(0.0, `rgba(255, 255, 255, ${a})`);
        g.addColorStop(0.45, `rgba(230, 242, 255, ${a * 0.55})`);
        g.addColorStop(1.0, 'rgba(190, 220, 255, 0)');
        fxCtx.fillStyle = g;
        fxCtx.beginPath();
        fxCtx.arc(gx, gy, gr, 0, Math.PI * 2);
        fxCtx.fill();
      });
      fxCtx.restore();
    }

    if (eruptionProg > 0.01) {
      fxCtx.save();
      const cGrad = fxCtx.createLinearGradient(0, VIEW_H * 0.25, 0, VIEW_H);
      cGrad.addColorStop(0.0, `rgba(215, 232, 255, 0)`);
      cGrad.addColorStop(0.28, `rgba(240, 248, 255, ${Math.min(0.95, eruptionProg * 1.1)})`);
      cGrad.addColorStop(0.55, `rgba(255, 255, 255, ${Math.min(1.0, eruptionProg * 1.25)})`);
      cGrad.addColorStop(0.82, `rgba(220, 235, 255, ${Math.min(0.92, eruptionProg * 1.05)})`);
      cGrad.addColorStop(1.0, `rgba(195, 215, 245, ${Math.min(0.85, eruptionProg)})`);
      fxCtx.fillStyle = cGrad;
      fxCtx.fillRect(0, VIEW_H * 0.22, VIEW_W, VIEW_H * 0.78);
      fxCtx.restore();
    }

    // =========================================================================
    // 5. EARTH ORBITAL HORIZON & MOON ENGULFMENT EXPLOSION (52.2s - 64.0s: frame_027..032)
    // =========================================================================
    if (earthAtmoMode === 'moon_horizon' || earthAtmoMode === 'horizon') {
      fxCtx.save();

      // Continuous rising Earth limb apex Y:
      // At t=52.2s (frame_027): apexY = 0.675 * VIEW_H (below Moon)
      // At t=54.5s (frame_028): apexY = 0.365 * VIEW_H (approaching Moon)
      // At t=55.5s..64.0s (frame_029..032): apexY = 0.238 * VIEW_H (has engulfed Moon!)
      const riseProg = Math.max(0, Math.min(1, (t - 52.2) / (55.6 - 52.2)));
      const smoothRise = riseProg * riseProg * (3 - 2 * riseProg);
      const apexY = VIEW_H * (0.675 - smoothRise * (0.675 - 0.238));

      // Gentle planetary curvature radius increases as the expanding Earth surface gets closer
      const rad = VIEW_H * (1.25 + smoothRise * 1.85);
      const cx = VIEW_W * 0.5;
      const cy = apexY + rad;

      // 1. Clip inside the curved planetary disk and draw swirling FBM cloud plasma
      fxCtx.save();
      fxCtx.beginPath();
      fxCtx.arc(cx, cy, rad, 0, Math.PI * 2);
      fxCtx.clip();

      if (earthMapCanvas) {
        const panX = Math.sin((t - 52.2) * 0.25) * 42;
        const panY = ((t - 52.2) * 14) % 180;
        fxCtx.drawImage(
          earthMapCanvas,
          -110 + panX,
          apexY - 40 - panY,
          VIEW_W + 260,
          (VIEW_H - apexY) + 280
        );
      }

      // Narrow incandescent upper limb rim glow inside the disk
      const limbSheen = fxCtx.createLinearGradient(0, apexY, 0, VIEW_H);
      limbSheen.addColorStop(0.0, 'rgba(255, 255, 255, 0.72)');
      limbSheen.addColorStop(0.06, 'rgba(245, 250, 255, 0.32)');
      limbSheen.addColorStop(0.16, 'rgba(225, 236, 255, 0.06)');
      limbSheen.addColorStop(0.65, 'rgba(195, 212, 245, 0.0)');
      limbSheen.addColorStop(1.0, 'rgba(135, 160, 215, 0.14)');
      fxCtx.fillStyle = limbSheen;
      fxCtx.fillRect(0, apexY - 6, VIEW_W, VIEW_H - apexY + 12);
      fxCtx.restore();

      // 2. Straddling cobalt-blue & white atmospheric corona drawn OVER the clip boundary (rad - 24 .. rad + 34) to feather the limb 100% seamlessly!
      const atmoGrad = fxCtx.createRadialGradient(cx, cy, rad - 24, cx, cy, rad + 34);
      atmoGrad.addColorStop(0.0, 'rgba(255, 255, 255, 0.0)');
      atmoGrad.addColorStop(0.32, 'rgba(245, 250, 255, 0.72)');
      atmoGrad.addColorStop(0.42, 'rgba(255, 255, 255, 0.98)');
      atmoGrad.addColorStop(0.54, 'rgba(215, 234, 255, 0.85)');
      atmoGrad.addColorStop(0.72, 'rgba(96, 145, 238, 0.44)');
      atmoGrad.addColorStop(0.88, 'rgba(38, 68, 145, 0.15)');
      atmoGrad.addColorStop(1.0, 'rgba(0, 0, 0, 0)');
      fxCtx.fillStyle = atmoGrad;
      fxCtx.beginPath();
      fxCtx.arc(cx, cy, rad + 34, 0, Math.PI * 2);
      fxCtx.fill();

      // 3. Moon Engulfment & Vaporization Explosion Shockwave (54.2s - 56.4s: as rising Earth limb swallows the Moon!)
      if (t >= 54.2 && t <= 56.4) {
        const mx = VIEW_W * 0.50;
        const my = Math.max(VIEW_H * 0.235, apexY - 4);
        const boomT = (t - 54.2) / (56.4 - 54.2); // 0 .. 1
        const flashIntensity = Math.pow(Math.sin(Math.min(1, boomT * 1.25) * Math.PI), 0.85);

        // Expanding plasma shockwave ring & core flash where the Moon is engulfed
        const shockR = 24 + boomT * 210;
        const coreGrad = fxCtx.createRadialGradient(mx, my, 2, mx, my, shockR);
        coreGrad.addColorStop(0.0, `rgba(255, 255, 255, ${Math.min(1, flashIntensity * 1.15)})`);
        coreGrad.addColorStop(0.28, `rgba(235, 245, 255, ${flashIntensity * 0.88})`);
        coreGrad.addColorStop(0.62, `rgba(145, 188, 255, ${flashIntensity * 0.38})`);
        coreGrad.addColorStop(1.0, 'rgba(80, 130, 240, 0)');
        fxCtx.fillStyle = coreGrad;
        fxCtx.beginPath();
        fxCtx.arc(mx, my, shockR, 0, Math.PI * 2);
        fxCtx.fill();

        // Anamorphic horizontal shockwave flare & vaporizing lunar fragments
        const flareW = 48 + boomT * 260;
        const flareGrad = fxCtx.createLinearGradient(mx - flareW, my, mx + flareW, my);
        flareGrad.addColorStop(0.0, 'rgba(140, 190, 255, 0)');
        flareGrad.addColorStop(0.5, `rgba(255, 255, 255, ${flashIntensity * 0.94})`);
        flareGrad.addColorStop(1.0, 'rgba(140, 190, 255, 0)');
        fxCtx.fillStyle = flareGrad;
        fxCtx.beginPath();
        fxCtx.ellipse(mx, my, flareW, 7 + (1 - boomT) * 12, 0, 0, Math.PI * 2);
        fxCtx.fill();

        // Radial incandescent lunar debris ejecta
        for (let i = 0; i < 48; i++) {
          const ang = (i / 48) * Math.PI * 2 + (i % 3) * 0.19;
          const speed = 26 + (i % 7) * 24;
          const dist = boomT * speed;
          const dx = mx + Math.cos(ang) * dist;
          const dy = my + Math.sin(ang) * dist * 0.72;
          const pr = (1.4 + (i % 3) * 1.0) * (1 - boomT * 0.75);
          if (pr > 0.2) {
            fxCtx.fillStyle = `rgba(248, 252, 255, ${Math.max(0, (1 - boomT) * 0.92)})`;
            fxCtx.beginPath();
            fxCtx.arc(dx, dy, pr, 0, Math.PI * 2);
            fxCtx.fill();
          }
        }
      }

      fxCtx.restore();
    }

    // =========================================================================
    // 6. VIOLENT PARTICLE EXPLOSION SHOCKWAVE & KINETIC STREAKS (69.3s - 72.5s)
    // =========================================================================
    if (t >= 69.3 && t < 72.5) {
      const dt = t - 69.3;
      const bp = Math.min(1, dt / 1.1);
      fxCtx.save();

      // Initial blinding impact flash at the exact moment of explosion (69.3s..69.65s)
      if (dt < 0.38) {
        const impactFlash = Math.pow(1.0 - dt / 0.38, 1.8) * 0.92;
        fxCtx.fillStyle = `rgba(255, 255, 255, ${impactFlash})`;
        fxCtx.fillRect(0, 0, VIEW_W, VIEW_H);
      }

      // Expanding white shockwave core & ring from the park epicenter
      const shockX = VIEW_W * 0.52;
      const shockY = VIEW_H * 0.60;
      const shockRadius = Math.max(12, dt * VIEW_H * 0.65);
      const coreAlpha = Math.max(0, 1.0 - dt / 2.2) * 0.78;
      if (coreAlpha > 0.01) {
        const shockGrad = fxCtx.createRadialGradient(shockX, shockY, 4, shockX, shockY, shockRadius);
        shockGrad.addColorStop(0.0, `rgba(255, 255, 255, ${coreAlpha})`);
        shockGrad.addColorStop(0.35, `rgba(255, 255, 255, ${coreAlpha * 0.55})`);
        shockGrad.addColorStop(0.72, `rgba(255, 255, 255, ${coreAlpha * 0.18})`);
        shockGrad.addColorStop(1.0, 'rgba(255, 255, 255, 0)');
        fxCtx.fillStyle = shockGrad;
        fxCtx.fillRect(0, 0, VIEW_W, VIEW_H);
      }

      // High-velocity radial + upward white particle streaks complementing the 115k 3D point cloud explosion
      for (let i = 0; i < 320; i++) {
        const angle = ((i * 137.5) % 360) * (Math.PI / 180);
        const speed = 220 + (i % 9) * 65;
        const r0 = 18 + ((i * 29.3) % 90) + dt * speed;
        const r1 = r0 + (22 + (i % 6) * 18) * Math.min(1, dt * 3.5);
        const x0 = shockX + Math.cos(angle) * r0 * 0.85;
        const y0 = shockY + Math.sin(angle) * r0 - dt * 110;
        const x1 = shockX + Math.cos(angle) * r1 * 0.85;
        const y1 = shockY + Math.sin(angle) * r1 - dt * 135;

        const alpha = (0.28 + (i % 4) * 0.18) * bp * Math.max(0, 1.0 - dt / 2.9);
        if (alpha > 0.02) {
          fxCtx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
          fxCtx.lineWidth = (i % 5 === 0) ? 2.0 : 1.1;
          fxCtx.beginPath();
          fxCtx.moveTo(x0, y0);
          fxCtx.lineTo(x1, y1);
          fxCtx.stroke();
        }
      }

      if (t >= 71.6) {
        const fadeBlack = Math.min(1, (t - 71.6) / 0.85);
        fxCtx.fillStyle = `rgba(0, 0, 0, ${fadeBlack})`;
        fxCtx.fillRect(0, 0, VIEW_W, VIEW_H);
      }

      fxCtx.restore();
    }

    // =========================================================================
    // 7. FULLSCREEN WHITEOUT FLASH
    // =========================================================================
    if (whiteoutAlpha > 0.01) {
      fxCtx.fillStyle = `rgba(255, 255, 255, ${Math.min(1, whiteoutAlpha)})`;
      fxCtx.fillRect(0, 0, VIEW_W, VIEW_H);
    }
  }

  return {
    renderOverlays
  };
})();
