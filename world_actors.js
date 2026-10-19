// Sculpted Low-Poly Articulated Humans, Dog, Y-Branching Trees, and 3D POV Hands
// Calibrated 1:1 to @man_ia_c reference frames (frame_001..frame_040)

window.WorldActors = (function() {

  function createTaperedPrism(topW, topD, botW, botD, height, yOffset = 0) {
    const geo = new THREE.CylinderGeometry(1, 1, height, 4, 1);
    geo.rotateY(Math.PI / 4);
    const pos = geo.attributes.position;
    const s = Math.SQRT2 / 2;
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      const isTop = y > 0;
      const w = isTop ? topW : botW;
      const d = isTop ? topD : botD;
      const nx = pos.getX(i) / s;
      const nz = pos.getZ(i) / s;
      pos.setX(i, nx * (w * 0.5));
      pos.setZ(i, nz * (d * 0.5));
      pos.setY(i, y + yOffset);
    }
    geo.computeVertexNormals();
    return geo;
  }

  // Sculpted low-poly head + hair cap with clean feature edges in X-Ray mode (frame_005, frame_008)
  function createSculptedHeadAndHair(skinMat, hairMat, registerFn) {
    const headGroup = new THREE.Group();

    const neckGeo = createTaperedPrism(0.075, 0.075, 0.095, 0.095, 0.08, 0.04);
    const neck = registerFn(new THREE.Mesh(neckGeo, skinMat), skinMat, { isPerson: true, edgeThreshold: 25 });
    headGroup.add(neck);

    // Low-poly 8-sided sculpted ovoid head (clean facet lines in X-ray without messy dense triangles)
    const craniumGeo = new THREE.SphereGeometry(0.132, 6, 5);
    craniumGeo.scale(0.90, 1.15, 0.96);
    const cranium = registerFn(new THREE.Mesh(craniumGeo, skinMat), skinMat, { isPerson: true, edgeThreshold: 22 });
    cranium.position.set(0, 0.20, 0);
    headGroup.add(cranium);

    if (hairMat) {
      const hairGeo = new THREE.SphereGeometry(0.140, 6, 4, 0, Math.PI * 2, 0, Math.PI * 0.58);
      hairGeo.scale(0.95, 1.05, 1.02);
      const hair = registerFn(new THREE.Mesh(hairGeo, hairMat), hairMat, { isPerson: true, edgeThreshold: 24 });
      hair.position.set(0, 0.215, -0.012);
      hair.rotation.x = -0.22;
      headGroup.add(hair);
    }

    return headGroup;
  }

  function createArticulatedArm(upperMat, lowerMat, registerFn, opts = {}) {
    const shoulderPivot = new THREE.Group();
    const uLen = opts.upperLen || 0.27;
    const fLen = opts.foreLen || 0.26;

    const uGeo = createTaperedPrism(0.10, 0.10, 0.082, 0.082, uLen, -uLen * 0.5);
    const upperMesh = registerFn(new THREE.Mesh(uGeo, upperMat), upperMat, { isPerson: true, edgeThreshold: 15 });
    shoulderPivot.add(upperMesh);

    const elbowPivot = new THREE.Group();
    elbowPivot.position.set(0, -uLen, 0);
    shoulderPivot.add(elbowPivot);

    const fGeo = createTaperedPrism(0.08, 0.08, 0.065, 0.065, fLen, -fLen * 0.5);
    const foreMesh = registerFn(new THREE.Mesh(fGeo, lowerMat), lowerMat, { isPerson: true, edgeThreshold: 15 });
    elbowPivot.add(foreMesh);

    return { shoulderPivot, elbowPivot };
  }

  function createShadowStreak(w, d) {
    const geo = new THREE.PlaneGeometry(w, d);
    geo.rotateX(-Math.PI / 2);
    const dayShadowMat = new THREE.MeshBasicMaterial({
      color: 0x0b1c05,
      transparent: true,
      opacity: 0.42,
      depthWrite: false
    });
    const xrayShadowMat = new THREE.MeshBasicMaterial({
      color: 0xd8ecff,
      transparent: true,
      opacity: 0.22,
      depthWrite: false
    });
    const mesh = new THREE.Mesh(geo, dayShadowMat);
    mesh.position.set(-w * 0.28, 0.015, 0.04);
    mesh.userData = {
      dayMat: dayShadowMat,
      xrayMat: xrayShadowMat,
      edges: { visible: false },
      isShadow: true
    };
    return mesh;
  }

  // 1. FOREGROUND PICNIC BLANKET & 3 EXACT SITTERS (frame_002, frame_005, frame_008, frame_013)
  function buildPicnicScene(parkWorld, mats, registerFn, allObjs, animatedActors) {
    function makeBlanket(bx, bz, size, rotY, hasCup = false) {
      const bGroup = new THREE.Group();
      bGroup.position.set(bx, 0.02, bz);
      bGroup.rotation.y = rotY;
      const tiles = 6;
      const tSize = size / tiles;
      for (let r = 0; r < tiles; r++) {
        for (let c = 0; c < tiles; c++) {
          const geo = new THREE.PlaneGeometry(tSize, tSize);
          geo.rotateX(-Math.PI / 2);
          const isRed = (r + c) % 2 === 0;
          const m = registerFn(
            new THREE.Mesh(geo, isRed ? mats.red : mats.white),
            isRed ? mats.red : mats.white,
            { isBlanket: true, isRedTile: isRed, edgeThreshold: 1 }
          );
          m.position.set((c - tiles / 2 + 0.5) * tSize, 0, (r - tiles / 2 + 0.5) * tSize);
          bGroup.add(m);
        }
      }
      if (hasCup) {
        const cupGeo = createTaperedPrism(0.075, 0.075, 0.06, 0.06, 0.13, 0.065);
        const cup = registerFn(new THREE.Mesh(cupGeo, mats.white), mats.white, { isPerson: true });
        cup.position.set(-0.22, 0.01, 0.18);
        bGroup.add(cup);
      }
      parkWorld.add(bGroup);
      return bGroup;
    }

    // Main foreground blanket at (0.15, 1.5) so it matches frame_002 & frame_005 framing
    makeBlanket(0.15, 1.50, 2.30, -0.10, true);
    // Secondary right blanket in midground (frame_002, frame_007, frame_013)
    makeBlanket(6.4, -5.5, 1.85, 0.12, false);
    // Far left midground blanket
    makeBlanket(-7.5, -8.5, 1.75, -0.18, false);

    // SITTER A (LEFT): Light steel-blue sleeveless top, white shorts/base, bare tan arms bent forward
    const sitterL = new THREE.Group();
    sitterL.position.set(-0.75, 0.02, 1.75);
    sitterL.rotation.y = Math.PI * 0.60;

    sitterL.add(registerFn(new THREE.Mesh(createTaperedPrism(0.36, 0.25, 0.38, 0.27, 0.16, 0.08), mats.white), mats.white, { isPerson: true }));
    sitterL.add(registerFn(new THREE.Mesh(createTaperedPrism(0.42, 0.24, 0.35, 0.23, 0.50, 0.41), mats.shirtLightBlue), mats.shirtLightBlue, { isPerson: true }));

    const headL = createSculptedHeadAndHair(mats.skin, mats.hairBrown, registerFn);
    headL.position.set(0, 0.66, 0);
    sitterL.add(headL);

    const legL1Geo = createTaperedPrism(0.15, 0.42, 0.13, 0.42, 0.13, 0.065);
    const legL1 = registerFn(new THREE.Mesh(legL1Geo, mats.white), mats.white, { isPerson: true });
    legL1.position.set(-0.10, 0, 0.26);
    const legL2 = registerFn(new THREE.Mesh(legL1Geo, mats.white), mats.white, { isPerson: true });
    legL2.position.set(0.10, 0, 0.26);
    sitterL.add(legL1, legL2);

    const armLL = createArticulatedArm(mats.skin, mats.skin, registerFn);
    armLL.shoulderPivot.position.set(-0.24, 0.62, 0);
    armLL.shoulderPivot.rotation.set(-0.55, 0, 0.18);
    armLL.elbowPivot.rotation.set(-0.65, 0, -0.15);
    sitterL.add(armLL.shoulderPivot);

    const armLR = createArticulatedArm(mats.skin, mats.skin, registerFn);
    armLR.shoulderPivot.position.set(0.24, 0.62, 0);
    armLR.shoulderPivot.rotation.set(-0.62, 0, -0.18);
    armLR.elbowPivot.rotation.set(-0.72, 0, 0.15);
    sitterL.add(armLR.shoulderPivot);

    const shL = createShadowStreak(0.95, 0.55);
    allObjs.push(shL);
    sitterL.add(shL);
    parkWorld.add(sitterL);
    animatedActors.push({
      group: sitterL, head: headL,
      armL: armLL.shoulderPivot, elbowL: armLL.elbowPivot,
      armR: armLR.shoulderPivot, elbowR: armLR.elbowPivot,
      type: 'sitter', phase: 0.0
    });

    // SITTER B (CENTER): Royal blue sweater, dark pants, elbows angled out (< > pose)
    const sitterC = new THREE.Group();
    sitterC.position.set(0.02, 0.02, 0.72);
    sitterC.rotation.y = 0.08;

    sitterC.add(registerFn(new THREE.Mesh(createTaperedPrism(0.36, 0.24, 0.38, 0.26, 0.15, 0.075), mats.pantsDark), mats.pantsDark, { isPerson: true }));
    const torsoC = registerFn(new THREE.Mesh(createTaperedPrism(0.45, 0.25, 0.35, 0.22, 0.50, 0.40), mats.shirtRoyalBlue), mats.shirtRoyalBlue, { isPerson: true });
    sitterC.add(torsoC);

    const headC = createSculptedHeadAndHair(mats.skin, mats.hairBrown, registerFn);
    headC.position.set(0, 0.65, 0);
    sitterC.add(headC);

    const kneeLGeo = createTaperedPrism(0.14, 0.38, 0.12, 0.36, 0.14, 0.07);
    const kneeL = registerFn(new THREE.Mesh(kneeLGeo, mats.pantsDark), mats.pantsDark, { isPerson: true });
    kneeL.position.set(-0.12, 0.02, 0.22);
    kneeL.rotation.y = 0.25;
    const kneeR = registerFn(new THREE.Mesh(kneeLGeo, mats.pantsDark), mats.pantsDark, { isPerson: true });
    kneeR.position.set(0.12, 0.02, 0.22);
    kneeR.rotation.y = -0.25;
    sitterC.add(kneeL, kneeR);

    const armCL = createArticulatedArm(mats.shirtRoyalBlue, mats.shirtRoyalBlue, registerFn);
    armCL.shoulderPivot.position.set(-0.25, 0.60, 0);
    armCL.shoulderPivot.rotation.set(-0.25, 0, 0.52);
    armCL.elbowPivot.rotation.set(-0.45, 0, -0.88);
    sitterC.add(armCL.shoulderPivot);

    const armCR = createArticulatedArm(mats.shirtRoyalBlue, mats.shirtRoyalBlue, registerFn);
    armCR.shoulderPivot.position.set(0.25, 0.60, 0);
    armCR.shoulderPivot.rotation.set(-0.25, 0, -0.52);
    armCR.elbowPivot.rotation.set(-0.45, 0, 0.88);
    sitterC.add(armCR.shoulderPivot);

    const shC = createShadowStreak(0.85, 0.50);
    allObjs.push(shC);
    sitterC.add(shC);
    parkWorld.add(sitterC);
    animatedActors.push({
      group: sitterC, head: headC, torso: torsoC,
      armL: armCL.shoulderPivot, elbowL: armCL.elbowPivot,
      armR: armCR.shoulderPivot, elbowR: armCR.elbowPivot,
      type: 'sitter', phase: 2.1
    });

    // SITTER C (RIGHT): Bright yellow long-sleeve shirt, light grey outstretched legs, leaning back
    const sitterR = new THREE.Group();
    sitterR.position.set(0.92, 0.02, 1.38);
    sitterR.rotation.y = -Math.PI * 0.56;

    sitterR.add(registerFn(new THREE.Mesh(createTaperedPrism(0.36, 0.25, 0.38, 0.26, 0.15, 0.075), mats.pantsLightGrey), mats.pantsLightGrey, { isPerson: true }));
    const torsoR = registerFn(new THREE.Mesh(createTaperedPrism(0.44, 0.25, 0.35, 0.22, 0.52, 0.40), mats.shirtYellow), mats.shirtYellow, { isPerson: true });
    torsoR.rotation.x = -0.14;
    sitterR.add(torsoR);

    const headR = createSculptedHeadAndHair(mats.skin, mats.hairBlonde, registerFn);
    headR.position.set(0, 0.66, -0.06);
    sitterR.add(headR);

    const legRGeo = createTaperedPrism(0.15, 0.68, 0.13, 0.68, 0.14, 0.07);
    const legRL = registerFn(new THREE.Mesh(legRGeo, mats.pantsLightGrey), mats.pantsLightGrey, { isPerson: true });
    legRL.position.set(-0.10, 0.01, 0.40);
    const legRR = registerFn(new THREE.Mesh(legRGeo, mats.pantsLightGrey), mats.pantsLightGrey, { isPerson: true });
    legRR.position.set(0.10, 0.01, 0.40);
    sitterR.add(legRL, legRR);

    const armRL = createArticulatedArm(mats.shirtYellow, mats.shirtYellow, registerFn, { upperLen: 0.30, foreLen: 0.30 });
    armRL.shoulderPivot.position.set(-0.25, 0.60, -0.05);
    armRL.shoulderPivot.rotation.set(0.32, 0, 0.22);
    armRL.elbowPivot.rotation.set(0.12, 0, 0.05);
    sitterR.add(armRL.shoulderPivot);

    const armRR = createArticulatedArm(mats.shirtYellow, mats.shirtYellow, registerFn);
    armRR.shoulderPivot.position.set(0.25, 0.60, -0.04);
    armRR.shoulderPivot.rotation.set(-0.35, 0, -0.20);
    armRR.elbowPivot.rotation.set(-0.55, 0, 0.25);
    sitterR.add(armRR.shoulderPivot);

    const shR = createShadowStreak(0.95, 0.55);
    allObjs.push(shR);
    sitterR.add(shR);
    parkWorld.add(sitterR);
    animatedActors.push({
      group: sitterR, head: headR, torso: torsoR,
      armL: armRL.shoulderPivot, elbowL: armRL.elbowPivot,
      armR: armRR.shoulderPivot, elbowR: armRR.elbowPivot,
      type: 'sitter', phase: 4.2
    });

    // FOREGROUND-RIGHT FOLDING LAWN CHAIR & RECLINED READER WITH OPEN BOOK (matches media_1792440143285_a835490a.png)
    const chairGroup = new THREE.Group();
    chairGroup.position.set(1.42, 0.02, 1.32);
    chairGroup.rotation.y = -Math.PI * 0.36;
    chairGroup.scale.set(0.92, 0.92, 0.92);

    const frameBarGeo = createTaperedPrism(0.035, 0.035, 0.035, 0.035, 0.62, 0.31);
    [-0.24, 0.24].forEach((cx) => {
      const fLeg1 = registerFn(new THREE.Mesh(frameBarGeo, mats.pantsLightGrey), mats.pantsLightGrey, { isPerson: true, edgeThreshold: 12 });
      fLeg1.position.set(cx, 0, 0.16);
      fLeg1.rotation.x = -0.52;
      chairGroup.add(fLeg1);

      const fLeg2 = registerFn(new THREE.Mesh(frameBarGeo, mats.pantsLightGrey), mats.pantsLightGrey, { isPerson: true, edgeThreshold: 12 });
      fLeg2.position.set(cx, 0, -0.16);
      fLeg2.rotation.x = 0.52;
      chairGroup.add(fLeg2);

      const armRest = registerFn(new THREE.Mesh(createTaperedPrism(0.045, 0.44, 0.045, 0.44, 0.03, 0), mats.white), mats.white, { isPerson: true, edgeThreshold: 12 });
      armRest.position.set(cx, 0.48, -0.02);
      chairGroup.add(armRest);
    });

    const seatCanvas = registerFn(new THREE.Mesh(createTaperedPrism(0.46, 0.44, 0.46, 0.44, 0.04, 0), mats.shirtBeige), mats.shirtBeige, { isPerson: true, edgeThreshold: 12 });
    seatCanvas.position.set(0, 0.28, 0.04);
    seatCanvas.rotation.x = -0.15;
    chairGroup.add(seatCanvas);

    const backCanvas = registerFn(new THREE.Mesh(createTaperedPrism(0.46, 0.04, 0.46, 0.04, 0.58, 0.29), mats.shirtBeige), mats.shirtBeige, { isPerson: true, edgeThreshold: 12 });
    backCanvas.position.set(0, 0.26, -0.15);
    backCanvas.rotation.x = -0.42;
    chairGroup.add(backCanvas);

    // Reclined Reader body on the lawn chair
    const readerHip = registerFn(new THREE.Mesh(createTaperedPrism(0.35, 0.26, 0.36, 0.28, 0.14, 0.07), mats.pantsDark), mats.pantsDark, { isPerson: true });
    readerHip.position.set(0, 0.29, 0.02);
    chairGroup.add(readerHip);

    const readerTorso = registerFn(new THREE.Mesh(createTaperedPrism(0.42, 0.23, 0.34, 0.21, 0.48, 0.24), mats.shirtLightBlue), mats.shirtLightBlue, { isPerson: true });
    readerTorso.position.set(0, 0.34, -0.08);
    readerTorso.rotation.x = -0.38;
    chairGroup.add(readerTorso);

    const readerHead = createSculptedHeadAndHair(mats.skin, mats.hairDark, registerFn);
    readerHead.position.set(0, 0.78, -0.25);
    readerHead.rotation.x = 0.28; // Looking down at book
    chairGroup.add(readerHead);

    // Bent thighs & calves extending forward off the chair seat
    [-0.10, 0.10].forEach((lx, li) => {
      const thigh = registerFn(new THREE.Mesh(createTaperedPrism(0.14, 0.38, 0.12, 0.38, 0.12, 0), mats.pantsDark), mats.pantsDark, { isPerson: true });
      thigh.position.set(lx, 0.34, 0.20);
      thigh.rotation.x = -0.22;
      chairGroup.add(thigh);

      const calf = registerFn(new THREE.Mesh(createTaperedPrism(0.11, 0.11, 0.09, 0.09, 0.36, -0.18), mats.skin), mats.skin, { isPerson: true });
      calf.position.set(lx, 0.38, 0.37);
      calf.rotation.x = 0.35 + li * 0.12;
      chairGroup.add(calf);
    });

    const rArmL = createArticulatedArm(mats.shirtLightBlue, mats.skin, registerFn);
    rArmL.shoulderPivot.position.set(-0.23, 0.70, -0.18);
    rArmL.shoulderPivot.rotation.set(-0.55, 0.18, 0.22);
    rArmL.elbowPivot.rotation.set(-0.92, 0, -0.25);
    chairGroup.add(rArmL.shoulderPivot);

    const rArmR = createArticulatedArm(mats.shirtLightBlue, mats.skin, registerFn);
    rArmR.shoulderPivot.position.set(0.23, 0.70, -0.18);
    rArmR.shoulderPivot.rotation.set(-0.55, -0.18, -0.22);
    rArmR.elbowPivot.rotation.set(-0.92, 0, 0.25);
    chairGroup.add(rArmR.shoulderPivot);

    // Open V-shaped book held in reader's hands
    const bookGroup = new THREE.Group();
    bookGroup.position.set(0, 0.56, 0.12);
    bookGroup.rotation.x = 0.55;
    const pageGeo = createTaperedPrism(0.13, 0.18, 0.13, 0.18, 0.018, 0);
    const pageL = registerFn(new THREE.Mesh(pageGeo, mats.white), mats.white, { isPerson: true, edgeThreshold: 10 });
    pageL.position.set(-0.062, 0, 0);
    pageL.rotation.z = -0.25;
    const pageR = registerFn(new THREE.Mesh(pageGeo, mats.white), mats.white, { isPerson: true, edgeThreshold: 10 });
    pageR.position.set(0.062, 0, 0);
    pageR.rotation.z = 0.25;
    bookGroup.add(pageL, pageR);
    chairGroup.add(bookGroup);

    const shChair = createShadowStreak(1.15, 0.65);
    allObjs.push(shChair);
    chairGroup.add(shChair);
    parkWorld.add(chairGroup);
    animatedActors.push({
      group: chairGroup, head: readerHead, torso: readerTorso,
      armL: rArmL.shoulderPivot, elbowL: rArmL.elbowPivot,
      armR: rArmR.shoulderPivot, elbowR: rArmR.elbowPivot,
      book: bookGroup, type: 'reader', phase: 1.3
    });

    // FOREGROUND-LEFT CLASSIC BABY STROLLER / PRAM (matches media_1792440143285_a835490a.png)
    const strollerGroup = new THREE.Group();
    strollerGroup.position.set(-1.58, 0.02, 0.88);
    strollerGroup.rotation.y = 0.46;
    strollerGroup.scale.set(0.86, 0.86, 0.86);

    // Bassinet carriage tub
    const tubGeo = createTaperedPrism(0.42, 0.68, 0.34, 0.56, 0.26, 0.13);
    const tub = registerFn(new THREE.Mesh(tubGeo, mats.pantsDark), mats.pantsDark, { isPerson: true, edgeThreshold: 12 });
    tub.position.set(0, 0.34, 0);
    strollerGroup.add(tub);

    // Sculpted polygonal folding stroller canopy hood (arched over front half of carriage)
    const hoodTop = registerFn(new THREE.Mesh(createTaperedPrism(0.41, 0.32, 0.42, 0.34, 0.04, 0), mats.shirtBeige), mats.shirtBeige, { isPerson: true, edgeThreshold: 12 });
    hoodTop.position.set(0, 0.82, 0.16);
    hoodTop.rotation.x = 0.22;
    strollerGroup.add(hoodTop);

    const hoodBack = registerFn(new THREE.Mesh(createTaperedPrism(0.41, 0.04, 0.42, 0.04, 0.26, 0.13), mats.shirtBeige), mats.shirtBeige, { isPerson: true, edgeThreshold: 12 });
    hoodBack.position.set(0, 0.58, 0.30);
    hoodBack.rotation.x = -0.22;
    strollerGroup.add(hoodBack);

    [-0.20, 0.20].forEach((sx) => {
      const hoodSide = registerFn(new THREE.Mesh(createTaperedPrism(0.03, 0.30, 0.03, 0.34, 0.24, 0.12), mats.shirtBeige), mats.shirtBeige, { isPerson: true, edgeThreshold: 12 });
      hoodSide.position.set(sx, 0.58, 0.16);
      strollerGroup.add(hoodSide);
    });

    // 4 Stroller Wheels + Chassis Struts + Push Handlebar
    const wheelGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.035, 10);
    wheelGeo.rotateZ(Math.PI / 2);
    [[-0.22, -0.24], [0.22, -0.24], [-0.22, 0.24], [0.22, 0.24]].forEach(([wx, wz]) => {
      const wheel = registerFn(new THREE.Mesh(wheelGeo, mats.white), mats.white, { isPerson: true, edgeThreshold: 12 });
      wheel.position.set(wx, 0.14, wz);
      strollerGroup.add(wheel);

      const strut = registerFn(new THREE.Mesh(createTaperedPrism(0.025, 0.025, 0.025, 0.025, 0.26, 0.13), mats.pantsLightGrey), mats.pantsLightGrey, { isPerson: true });
      strut.position.set(wx * 0.85, 0.14, wz * 0.85);
      strut.rotation.x = wz > 0 ? -0.25 : 0.25;
      strollerGroup.add(strut);
    });

    // Diagonal push-handle bar
    [-0.19, 0.19].forEach((hx) => {
      const hBar = registerFn(new THREE.Mesh(createTaperedPrism(0.028, 0.028, 0.028, 0.028, 0.54, 0.27), mats.pantsLightGrey), mats.pantsLightGrey, { isPerson: true });
      hBar.position.set(hx, 0.44, -0.26);
      hBar.rotation.x = -0.62;
      strollerGroup.add(hBar);
    });
    const gripBar = registerFn(new THREE.Mesh(createTaperedPrism(0.40, 0.032, 0.40, 0.032, 0.032, 0), mats.white), mats.white, { isPerson: true });
    gripBar.position.set(0, 0.86, -0.57);
    strollerGroup.add(gripBar);

    const shStroller = createShadowStreak(0.95, 0.55);
    allObjs.push(shStroller);
    strollerGroup.add(shStroller);
    parkWorld.add(strollerGroup);

    // MIDGROUND RECLINED LAWN LOUNGER PROPPED ON ELBOWS (clean anatomical hierarchy)
    const loungerGrp = new THREE.Group();
    loungerGrp.position.set(2.45, 0.02, -3.15);
    loungerGrp.rotation.y = -Math.PI * 0.62;

    const lPelvis = registerFn(new THREE.Mesh(createTaperedPrism(0.34, 0.24, 0.36, 0.26, 0.13, 0.065), mats.pantsLightGrey), mats.pantsLightGrey, { isPerson: true });
    loungerGrp.add(lPelvis);

    const lTorso = registerFn(new THREE.Mesh(createTaperedPrism(0.40, 0.22, 0.33, 0.20, 0.48, 0.24), mats.shirtDarkRed), mats.shirtDarkRed, { isPerson: true });
    lTorso.position.set(0, 0.08, -0.04);
    lTorso.rotation.x = -0.62; // Reclining back on elbows
    loungerGrp.add(lTorso);

    const lHead = createSculptedHeadAndHair(mats.skin, mats.hairBrown, registerFn);
    lHead.position.set(0, 0.48, -0.32);
    loungerGrp.add(lHead);

    const lLegGeo = createTaperedPrism(0.14, 0.64, 0.12, 0.64, 0.13, 0.065);
    const lLeg1 = registerFn(new THREE.Mesh(lLegGeo, mats.pantsLightGrey), mats.pantsLightGrey, { isPerson: true });
    lLeg1.position.set(-0.09, 0.01, 0.36);
    const lLeg2 = registerFn(new THREE.Mesh(lLegGeo, mats.pantsLightGrey), mats.pantsLightGrey, { isPerson: true });
    lLeg2.position.set(0.09, 0.01, 0.36);
    loungerGrp.add(lLeg1, lLeg2);

    [-0.22, 0.22].forEach((ax) => {
      const lArm = registerFn(new THREE.Mesh(createTaperedPrism(0.09, 0.09, 0.075, 0.075, 0.42, -0.21), mats.skin), mats.skin, { isPerson: true });
      lArm.position.set(ax, 0.42, -0.26);
      lArm.rotation.x = 0.22;
      loungerGrp.add(lArm);
    });

    const shLounger = createShadowStreak(1.10, 0.50);
    allObjs.push(shLounger);
    loungerGrp.add(shLounger);
    parkWorld.add(loungerGrp);
    animatedActors.push({ group: loungerGrp, head: lHead, torso: lTorso, type: 'sitter', phase: 3.4 });

    // PARK BENCHES WITH SEATED VISITORS ALONG MIDGROUND PATH
    function makeBenchWithVisitor(bx, bz, rotY, shirtMat, pantsMat, phase) {
      const bGrp = new THREE.Group();
      bGrp.position.set(bx, 0.02, bz);
      bGrp.rotation.y = rotY;

      const seat = registerFn(new THREE.Mesh(createTaperedPrism(1.35, 0.42, 1.35, 0.42, 0.05, 0), mats.treeTrunk), mats.treeTrunk, { isPerson: true, edgeThreshold: 12 });
      seat.position.set(0, 0.34, 0);
      bGrp.add(seat);

      const back = registerFn(new THREE.Mesh(createTaperedPrism(1.35, 0.05, 1.35, 0.05, 0.38, 0.19), mats.treeTrunk), mats.treeTrunk, { isPerson: true, edgeThreshold: 12 });
      back.position.set(0, 0.36, -0.18);
      back.rotation.x = -0.18;
      bGrp.add(back);

      [-0.58, 0.58].forEach((lx) => {
        const bLeg = registerFn(new THREE.Mesh(createTaperedPrism(0.06, 0.40, 0.06, 0.40, 0.34, 0.17), mats.pantsDark), mats.pantsDark, { isPerson: true });
        bLeg.position.set(lx, 0, 0);
        bGrp.add(bLeg);
      });

      const vTorso = registerFn(new THREE.Mesh(createTaperedPrism(0.38, 0.22, 0.32, 0.20, 0.48, 0.24), shirtMat), shirtMat, { isPerson: true });
      vTorso.position.set(-0.18, 0.36, -0.04);
      vTorso.rotation.x = -0.12;
      bGrp.add(vTorso);

      const vHead = createSculptedHeadAndHair(mats.skin, mats.hairDark, registerFn);
      vHead.position.set(-0.18, 0.84, -0.08);
      bGrp.add(vHead);

      const vLegs = registerFn(new THREE.Mesh(createTaperedPrism(0.28, 0.36, 0.24, 0.36, 0.34, -0.17), pantsMat), pantsMat, { isPerson: true });
      vLegs.position.set(-0.18, 0.36, 0.18);
      bGrp.add(vLegs);

      const shB = createShadowStreak(1.5, 0.55);
      allObjs.push(shB);
      bGrp.add(shB);
      parkWorld.add(bGrp);
      animatedActors.push({ group: bGrp, head: vHead, torso: vTorso, type: 'sitter', phase });
    }
    makeBenchWithVisitor(-5.65, -7.2, 0.28, mats.shirtBeige, mats.pantsDark, 0.9);
    makeBenchWithVisitor(4.25, -8.2, -0.25, mats.shirtLightBlue, mats.white, 2.7);

    function createBgSitter(bx, bz, rotY, topMat, botMat, phase = 0) {
      const g = new THREE.Group();
      g.position.set(bx, 0.02, bz);
      g.rotation.y = rotY;
      const tr = registerFn(new THREE.Mesh(createTaperedPrism(0.38, 0.22, 0.32, 0.22, 0.52, 0.28), topMat), topMat, { isPerson: true });
      g.add(tr);
      const hd = createSculptedHeadAndHair(mats.skin, mats.hairDark, registerFn);
      hd.position.set(0, 0.55, 0);
      g.add(hd);
      const lg = registerFn(new THREE.Mesh(createTaperedPrism(0.28, 0.45, 0.26, 0.45, 0.13, 0.065), botMat), botMat, { isPerson: true });
      lg.position.set(0, 0, 0.25);
      g.add(lg);
      parkWorld.add(g);
      animatedActors.push({ group: g, head: hd, torso: tr, type: 'sitter', phase });
    }
    createBgSitter(5.75, -5.45, Math.PI * 0.48, mats.pantsDark, mats.white, 0.5);
    createBgSitter(7.05, -5.55, -Math.PI * 0.48, mats.shirtLightBlue, mats.pantsDark, 1.8);
    createBgSitter(1.65, -4.5, 0.15, mats.shirtBeige, mats.pantsDark, 3.1);
  }

  // 2. STANDING, WALKING, & FRISBEE ACTORS SPREAD NATURALLY ACROSS THE LAWN
  function buildParkCrowd(parkWorld, mats, registerFn, allObjs, animatedActors, sRand) {
    function createStandingActor(opts) {
      const p = new THREE.Group();
      p.position.set(opts.x, opts.y || 0, opts.z);
      p.rotation.y = opts.rotY || 0;
      if (opts.tiltZ) p.rotation.z = opts.tiltZ;

      const scale = opts.scale || 1.0;
      p.scale.set(scale, scale, scale);

      const torsoGeo = createTaperedPrism(0.42, 0.23, 0.33, 0.20, 0.56, 1.04);
      const torsoMesh = registerFn(new THREE.Mesh(torsoGeo, opts.shirtMat), opts.shirtMat, { isPerson: true });
      p.add(torsoMesh);

      if (opts.hasSkirt) {
        const skirtGeo = createTaperedPrism(0.33, 0.20, 0.52, 0.34, 0.42, 0.62);
        p.add(registerFn(new THREE.Mesh(skirtGeo, opts.skirtMat || opts.shirtMat), opts.skirtMat || opts.shirtMat, { isPerson: true }));
      } else {
        const pelvisGeo = createTaperedPrism(0.33, 0.20, 0.34, 0.21, 0.16, 0.70);
        p.add(registerFn(new THREE.Mesh(pelvisGeo, opts.pantsMat), opts.pantsMat, { isPerson: true }));
      }

      const head = createSculptedHeadAndHair(mats.skin, opts.hairMat || mats.hairBrown, registerFn);
      head.position.set(0, 1.32, 0);
      p.add(head);

      const legLen = opts.hasSkirt ? 0.42 : 0.68;
      const legTopY = opts.hasSkirt ? 0.42 : 0.68;
      const legMat = opts.hasSkirt ? mats.skin : opts.pantsMat;
      const shoeGeo = createTaperedPrism(0.12, 0.20, 0.13, 0.22, 0.08, -legLen + 0.04);

      const legL = new THREE.Group();
      legL.position.set(-0.10, legTopY, 0);
      legL.add(registerFn(new THREE.Mesh(createTaperedPrism(0.14, 0.15, 0.11, 0.12, legLen, -legLen * 0.5), legMat), legMat, { isPerson: true }));
      const shoeL = registerFn(new THREE.Mesh(shoeGeo, mats.pantsDark), mats.pantsDark, { isPerson: true });
      shoeL.position.z = 0.03;
      legL.add(shoeL);
      p.add(legL);

      const legR = new THREE.Group();
      legR.position.set(0.10, legTopY, 0);
      legR.add(registerFn(new THREE.Mesh(createTaperedPrism(0.14, 0.15, 0.11, 0.12, legLen, -legLen * 0.5), legMat), legMat, { isPerson: true }));
      const shoeR = registerFn(new THREE.Mesh(shoeGeo, mats.pantsDark), mats.pantsDark, { isPerson: true });
      shoeR.position.z = 0.03;
      legR.add(shoeR);
      p.add(legR);

      if (opts.stride) {
        legL.rotation.x = opts.stride;
        legR.rotation.x = -opts.stride;
      }

      const armL = createArticulatedArm(opts.sleeveMat || opts.shirtMat, mats.skin, registerFn);
      armL.shoulderPivot.position.set(-0.24, 1.28, 0);
      p.add(armL.shoulderPivot);

      const armR = createArticulatedArm(opts.sleeveMat || opts.shirtMat, mats.skin, registerFn);
      armR.shoulderPivot.position.set(0.24, 1.28, 0);
      p.add(armR.shoulderPivot);

      let discMesh = null;
      if (opts.pose === 'folded_arms') {
        armL.shoulderPivot.rotation.set(-0.55, 0.35, 0.25);
        armL.elbowPivot.rotation.set(-1.15, 0, -0.95);
        armR.shoulderPivot.rotation.set(-0.55, -0.35, -0.25);
        armR.elbowPivot.rotation.set(-1.15, 0, 0.95);
      } else if (opts.pose === 'jump_catch') {
        armL.shoulderPivot.rotation.set(-2.65, 0, 0.22);
        armL.elbowPivot.rotation.set(-0.25, 0, 0);
        armR.shoulderPivot.rotation.set(-2.75, 0, -0.22);
        armR.elbowPivot.rotation.set(-0.20, 0, 0);
        legL.rotation.z = 0.18;
        legR.rotation.z = -0.12;
      } else if (opts.pose === 'frisbee_throw') {
        armR.shoulderPivot.rotation.set(-0.85, -0.25, -0.35);
        armR.elbowPivot.rotation.set(-0.45, 0, 0.35);
        const discGeo = new THREE.CylinderGeometry(0.20, 0.20, 0.035, 14);
        discMesh = registerFn(new THREE.Mesh(discGeo, mats.shirtYellow), mats.shirtYellow, { isPerson: true, edgeThreshold: 10 });
        discMesh.position.set(-2.1, 1.25, -4.9);
        parkWorld.add(discMesh);
      } else if (opts.pose === 'hands_on_hips') {
        armL.shoulderPivot.rotation.set(0.1, 0, 0.42);
        armL.elbowPivot.rotation.set(-0.3, 0, -0.75);
        armR.shoulderPivot.rotation.set(0.1, 0, -0.42);
        armR.elbowPivot.rotation.set(-0.3, 0, 0.75);
      }

      if (!opts.y || opts.y < 0.1) {
        const sh = createShadowStreak(1.2, 0.42);
        allObjs.push(sh);
        p.add(sh);
      }

      parkWorld.add(p);
      animatedActors.push({
        group: p,
        torso: torsoMesh,
        head,
        armL: armL.shoulderPivot,
        elbowL: armL.elbowPivot,
        armR: armR.shoulderPivot,
        elbowR: armR.elbowPivot,
        legL,
        legR,
        disc: discMesh,
        type: opts.pose || 'walker',
        startX: opts.x,
        startY: opts.y || 0,
        startZ: opts.z,
        startRotY: opts.rotY || 0,
        phase: (opts.x * 1.37 + opts.z * 0.73)
      });
      return p;
    }

    // 1. Woman in A-line skirt with folded arms (frame_012 foreground-left, frame_019 foreground-right)
    createStandingActor({
      x: -2.85, z: 0.25, rotY: 0.25,
      shirtMat: mats.shirtDarkRed, skirtMat: mats.shirtDarkRed,
      hasSkirt: true, pose: 'folded_arms', hairMat: mats.hairDark
    });

    // 2. Standing Man in White Pants & Dark Vest with Frisbee in Midground (frame_002, frame_004, frame_005)
    createStandingActor({
      x: -1.85, z: -5.4, rotY: 0.35,
      shirtMat: mats.pantsDark, sleeveMat: mats.white, pantsMat: mats.white,
      pose: 'frisbee_throw', hairMat: mats.hairBrown
    });

    // 3. Running Person in Red Shirt & White Pants in Midground (frame_004)
    createStandingActor({
      x: -0.65, z: -4.2, rotY: 0.85, scale: 0.76, stride: 0.55,
      shirtMat: mats.red, pantsMat: mats.white,
      pose: 'runner', hairMat: mats.hairBlonde
    });

    // 4. Mid-Air Jumping Frisbee Catcher (frame_012 right, frame_019 left)
    createStandingActor({
      x: -5.2, y: 0.48, z: -3.2, rotY: 0.35, tiltZ: -0.44,
      shirtMat: mats.shirtRoyalBlue, pantsMat: mats.pantsDark,
      pose: 'jump_catch', hairMat: mats.hairBrown
    });

    // 5. Standing Man with Hands on Hips on Left Lawn (frame_007 left, frame_013 left)
    createStandingActor({
      x: -4.4, z: -4.8, rotY: 0.15,
      shirtMat: mats.shirtLightBlue, pantsMat: mats.pantsDark,
      pose: 'hands_on_hips', hairMat: mats.hairBrown
    });

    // 6. Standing Person in Blue Suit in Midground (frame_002, frame_004)
    createStandingActor({
      x: 0.75, z: -8.2, rotY: -0.2,
      shirtMat: mats.shirtRoyalBlue, pantsMat: mats.shirtRoyalBlue,
      pose: 'hands_on_hips', hairMat: mats.hairDark
    });

    // 7. Background Park Strollers & Couples near the tree line (z = -10 to -18, matching frame_002 & frame_004)
    const bgSpecs = [
      [-8.5, -10.5, 0.4, mats.white, mats.pantsDark, false],
      [-7.6, -10.8, -0.3, mats.shirtBeige, mats.shirtBeige, true],
      [-4.2, -12.5, 0.2, mats.shirtLightBlue, mats.white, false],
      [-3.3, -12.8, -0.4, mats.shirtDarkRed, mats.pantsDark, true],
      [-1.2, -13.5, 0.1, mats.shirtBeige, mats.pantsLightGrey, false],
      [2.2, -11.8, -0.5, mats.white, mats.pantsDark, false],
      [3.1, -12.2, 0.3, mats.shirtYellow, mats.shirtYellow, true],
      [-0.2, -11.4, 0.25, mats.shirtRoyalBlue, mats.white, false],
      [0.55, -11.6, -0.25, mats.shirtDarkRed, mats.shirtBeige, true],
      [5.2, -13.8, 0.0, mats.shirtRoyalBlue, mats.white, false],
      [8.2, -10.5, -0.6, mats.shirtLightBlue, mats.pantsDark, false],
      [9.1, -10.9, 0.4, mats.white, mats.white, true],
      [-5.8, -15.2, 0.2, mats.white, mats.pantsDark, false],
      [-2.1, -16.5, -0.2, mats.shirtLightBlue, mats.pantsDark, false],
      [1.4, -15.8, 0.4, mats.shirtDarkRed, mats.white, true],
      [4.4, -16.2, -0.3, mats.shirtBeige, mats.pantsDark, false],
      [7.2, -15.5, 0.1, mats.shirtRoyalBlue, mats.pantsLightGrey, false]
    ];
    bgSpecs.forEach(([bx, bz, brot, smat, pmat, isSkirt]) => {
      createStandingActor({
        x: bx, z: bz, rotY: brot, scale: 0.90 + sRand() * 0.12,
        shirtMat: smat, pantsMat: pmat, skirtMat: pmat, hasSkirt: isSkirt
      });
    });
  }

  // 3. SCULPTED LEAPING GOLDEN-BROWN DOG (frame_004 & frame_007)
  function buildSculptedDog(parkWorld, dogMat, registerFn) {
    const dogGroup = new THREE.Group();

    const bodyGeo = createTaperedPrism(0.24, 0.72, 0.22, 0.68, 0.26, 0);
    dogGroup.add(registerFn(new THREE.Mesh(bodyGeo, dogMat), dogMat, { isPerson: true, edgeThreshold: 12 }));

    const neckGeo = createTaperedPrism(0.18, 0.20, 0.20, 0.22, 0.22, 0.10);
    const neck = registerFn(new THREE.Mesh(neckGeo, dogMat), dogMat, { isPerson: true, edgeThreshold: 12 });
    neck.position.set(0, 0.08, -0.30);
    neck.rotation.x = 0.45;
    dogGroup.add(neck);

    const headGeo = createTaperedPrism(0.20, 0.22, 0.22, 0.24, 0.20, 0);
    const head = registerFn(new THREE.Mesh(headGeo, dogMat), dogMat, { isPerson: true, edgeThreshold: 12 });
    head.position.set(0, 0.24, -0.42);
    dogGroup.add(head);

    const snoutGeo = createTaperedPrism(0.11, 0.18, 0.13, 0.18, 0.11, 0);
    const snout = registerFn(new THREE.Mesh(snoutGeo, dogMat), dogMat, { isPerson: true, edgeThreshold: 12 });
    snout.position.set(0, 0.21, -0.57);
    dogGroup.add(snout);

    const earGeo = createTaperedPrism(0.05, 0.09, 0.06, 0.10, 0.14, -0.05);
    const earL = registerFn(new THREE.Mesh(earGeo, dogMat), dogMat, { isPerson: true, edgeThreshold: 12 });
    earL.position.set(-0.11, 0.30, -0.40);
    earL.rotation.z = 0.25;
    const earR = registerFn(new THREE.Mesh(earGeo, dogMat), dogMat, { isPerson: true, edgeThreshold: 12 });
    earR.position.set(0.11, 0.30, -0.40);
    earR.rotation.z = -0.25;
    dogGroup.add(earL, earR);

    const legGeo = createTaperedPrism(0.075, 0.075, 0.055, 0.055, 0.34, -0.17);
    const legFL = registerFn(new THREE.Mesh(legGeo, dogMat), dogMat, { isPerson: true, edgeThreshold: 12 });
    legFL.position.set(-0.08, -0.08, -0.28);
    legFL.rotation.x = 0.68;

    const legFR = registerFn(new THREE.Mesh(legGeo, dogMat), dogMat, { isPerson: true, edgeThreshold: 12 });
    legFR.position.set(0.08, -0.08, -0.28);
    legFR.rotation.x = 0.52;

    const legBL = registerFn(new THREE.Mesh(legGeo, dogMat), dogMat, { isPerson: true, edgeThreshold: 12 });
    legBL.position.set(-0.08, -0.08, 0.28);
    legBL.rotation.x = -0.75;

    const legBR = registerFn(new THREE.Mesh(legGeo, dogMat), dogMat, { isPerson: true, edgeThreshold: 12 });
    legBR.position.set(0.08, -0.08, 0.28);
    legBR.rotation.x = -0.60;

    const tailGeo = createTaperedPrism(0.04, 0.04, 0.06, 0.06, 0.28, 0.14);
    const tail = registerFn(new THREE.Mesh(tailGeo, dogMat), dogMat, { isPerson: true, edgeThreshold: 12 });
    tail.position.set(0, 0.06, 0.34);
    tail.rotation.x = -0.95;

    dogGroup.add(legFL, legFR, legBL, legBR, tail);
    dogGroup.rotation.y = Math.PI * 0.42;
    dogGroup.position.set(-2.6, 0.62, -4.5);
    dogGroup.userData.parts = { legFL, legFR, legBL, legBR, tail, head, neck };
    parkWorld.add(dogGroup);
    return dogGroup;
  }

  // 4. Y-BRANCHING CENTRAL PARK TREES (Positioned at z = -21..-28 so tree band matches frame_002 & frame_005!)
  function buildParkTrees(parkWorld, mats, registerFn, sRand) {
    function createYBranchTree(x, z, scale) {
      const tGroup = new THREE.Group();
      tGroup.position.set(x, 0, z);

      const trunkH = 2.1 * scale;
      const trunkGeo = new THREE.CylinderGeometry(0.14 * scale, 0.22 * scale, trunkH, 5);
      const trunk = registerFn(
        new THREE.Mesh(trunkGeo, mats.treeTrunk),
        mats.treeTrunk,
        { isTreeTrunk: true, edgeThreshold: 12 }
      );
      trunk.position.y = trunkH * 0.5;
      tGroup.add(trunk);

      const branchAngles = [
        [0.42, 0.25], [-0.42, 0.22], [0.28, -0.38], [-0.32, -0.35]
      ];
      branchAngles.forEach(([rx, rz]) => {
        const bLen = 1.65 * scale;
        const bGeo = new THREE.CylinderGeometry(0.055 * scale, 0.11 * scale, bLen, 4);
        bGeo.translate(0, bLen * 0.5, 0);
        const branch = registerFn(
          new THREE.Mesh(bGeo, mats.treeTrunk),
          mats.treeTrunk,
          { isTreeTrunk: true, edgeThreshold: 12 }
        );
        branch.position.set(0, trunkH * 0.82, 0);
        branch.rotation.set(rx, 0, rz);
        tGroup.add(branch);
      });

      const clusterSpecs = [
        [0, 3.35, 0, 1.65, 1.25, 0.72, 1.15, mats.treeDark],
        [-0.85, 3.05, 0.35, 1.25, 1.15, 0.75, 1.10, mats.treeMid],
        [0.85, 3.15, -0.25, 1.30, 1.15, 0.75, 1.10, mats.treeMid],
        [0.15, 3.85, 0.20, 1.15, 1.20, 0.68, 1.15, mats.treeDark]
      ];
      clusterSpecs.forEach(([cx, cy, cz, rad, sx, sy, sz, cMat]) => {
        const cGeo = new THREE.IcosahedronGeometry(rad * scale, 1);
        cGeo.scale(sx, sy, sz);
        const pos = cGeo.attributes.position;
        for (let i = 0; i < pos.count; i++) {
          const d = 0.92 + ((i * 17) % 10) * 0.016;
          pos.setXYZ(i, pos.getX(i) * d, pos.getY(i) * d, pos.getZ(i) * d);
        }
        cGeo.computeVertexNormals();
        const cMesh = registerFn(
          new THREE.Mesh(cGeo, cMat),
          cMat,
          { isTreeCanopy: true, edgeThreshold: 4 }
        );
        cMesh.position.set(cx * scale, cy * scale, cz * scale);
        tGroup.add(cMesh);
      });

      parkWorld.add(tGroup);
    }

    for (let i = 0; i < 46; i++) {
      const tx = -45 + i * 2.0 + (sRand() - 0.5) * 0.7;
      const tz = -21.5 - (i % 3) * 3.0 - sRand() * 2.5;
      const ts = 1.15 + sRand() * 0.45;
      createYBranchTree(tx, tz, ts);
    }
  }

  // 5. FIRST-PERSON 3D ARTICULATED POV HANDS (1:1 match to frame_010 & frame_017)
  function buildPovHands(camera, mats, registerFn) {
    const povHandsGroup = new THREE.Group();
    camera.add(povHandsGroup);

    // Continuous 3-segment curved low-poly finger geometry (zero internal knuckle end-cap boxes!)
    function createCurvedFingerGeo(wBot, dBot, wTop, dTop, totalLen, bendX, bendZ = 0) {
      const segs = 3;
      const geo = new THREE.CylinderGeometry(1, 1, totalLen, 4, segs, false);
      geo.rotateY(Math.PI / 4);
      const pos = geo.attributes.position;
      const s = Math.SQRT2 / 2;
      for (let i = 0; i < pos.count; i++) {
        const rawY = pos.getY(i) + totalLen * 0.5; // 0 .. totalLen
        const t = Math.max(0, Math.min(1, rawY / totalLen));
        const w = wBot + (wTop - wBot) * t;
        const d = dBot + (dTop - dBot) * t;
        const nx = pos.getX(i) / s;
        const nz = pos.getZ(i) / s;

        // Smooth phalanx curve along local Z and X
        const curveZ = Math.pow(t, 1.55) * bendX * totalLen;
        const curveX = Math.pow(t, 1.35) * bendZ * totalLen;
        const localX = nx * (w * 0.5) + curveX;
        const localZ = nz * (d * 0.5) + curveZ;
        const localY = rawY * Math.cos(t * bendX * 0.35);

        pos.setXYZ(i, localX, localY, localZ);
      }
      geo.computeVertexNormals();
      return geo;
    }

    function createDetailedHand(isLeft) {
      const hRoot = new THREE.Group();
      const s = isLeft ? -1 : 1;

      // 1. Long angled coat/shirt sleeve entering from bottom corner (matches frame_010 & frame_017)
      const sleeveGeo = createTaperedPrism(0.185, 0.13, 0.25, 0.16, 0.58, -0.29);
      const sleeve = registerFn(
        new THREE.Mesh(sleeveGeo, mats.shirtLightBlue),
        mats.shirtLightBlue,
        { isHand: true, isHandSleeve: true, edgeThreshold: 22 }
      );
      sleeve.position.set(0, -0.095, 0);
      hRoot.add(sleeve);

      // 2. Crisp rectangular wrist cuff step collar (matching frame_010 & frame_017)
      const cuffGeo = createTaperedPrism(0.198, 0.142, 0.188, 0.132, 0.068, -0.034);
      const cuff = registerFn(
        new THREE.Mesh(cuffGeo, mats.white),
        mats.white,
        { isHand: true, isHandSleeve: true, edgeThreshold: 22 }
      );
      cuff.position.set(0, -0.062, 0);
      hRoot.add(cuff);

      // 3. 3D Sculpted Palm rotated in 3/4 profile so side thickness & back planes match frame_010
      const palmGroup = new THREE.Group();
      palmGroup.position.set(0, -0.058, 0);
      palmGroup.rotation.y = s * 0.54;
      hRoot.add(palmGroup);

      const palmGeo = createTaperedPrism(0.162, 0.052, 0.146, 0.060, 0.185, 0.0925);
      const palm = registerFn(
        new THREE.Mesh(palmGeo, mats.skin),
        mats.skin,
        { isHand: true, edgeThreshold: 22 }
      );
      palmGroup.add(palm);

      // 4. Continuous Low-Poly Thumb on inner side of palm (facing center gap)
      const thumbGroup = new THREE.Group();
      thumbGroup.position.set(-s * 0.072, 0.032, 0.018);
      thumbGroup.rotation.set(0.18, -s * 0.18, s * 0.42);
      const thumbGeo = createCurvedFingerGeo(0.048, 0.044, 0.033, 0.031, 0.155, 0.28, -s * 0.18);
      thumbGroup.add(registerFn(
        new THREE.Mesh(thumbGeo, mats.skin),
        mats.skin,
        { isHand: true, edgeThreshold: 24 }
      ));
      palmGroup.add(thumbGroup);

      // 5. Four Continuous Curved Low-Poly Fingers (Index, Middle, Ring, Pinky — zero internal knuckle boxes!)
      const fSpecs = [
        { x: -0.057, len: 0.192, spread: -0.05, bend: 0.34 },
        { x: -0.019, len: 0.212, spread: -0.01, bend: 0.38 },
        { x:  0.019, len: 0.198, spread:  0.03, bend: 0.42 },
        { x:  0.055, len: 0.164, spread:  0.08, bend: 0.46 }
      ];

      fSpecs.forEach((fs) => {
        const fBase = new THREE.Group();
        fBase.position.set(fs.x * s, 0.182, 0);
        fBase.rotation.z = -fs.spread * s;
        fBase.rotation.x = 0.12;

        const fGeo = createCurvedFingerGeo(0.035, 0.035, 0.024, 0.024, fs.len, fs.bend, 0);
        const fMesh = registerFn(
          new THREE.Mesh(fGeo, mats.skin),
          mats.skin,
          { isHand: true, edgeThreshold: 24 }
        );
        fBase.add(fMesh);
        palmGroup.add(fBase);
      });

      // Calibrated 1:1 to frame_010 & frame_017: all 5 digits sit cleanly inside bottom 42% of screen below HUD timer
      hRoot.scale.set(0.60, 0.60, 0.60);
      hRoot.position.set(s * 0.132, -0.258, -0.92);
      hRoot.rotation.z = s * 0.10;
      hRoot.rotation.x = 0.16;
      return hRoot;
    }

    const leftHand = createDetailedHand(true);
    const rightHand = createDetailedHand(false);
    povHandsGroup.add(leftHand, rightHand);
    povHandsGroup.visible = false;
    return povHandsGroup;
  }

  return {
    createTaperedPrism,
    buildPicnicScene,
    buildParkCrowd,
    buildSculptedDog,
    buildParkTrees,
    buildPovHands
  };
})();
