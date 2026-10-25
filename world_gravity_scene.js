// =============================================================================
// WorldGravityScene — Bespoke 3D Simulation for "What If Gravity Disappeared for 5 Seconds?"
// Features: Coastal Suspension Bridge, Moving & Floating Vehicles, Driver Cockpit POV,
// Ocean Water Uplift, Orbit Tangent Moon Escape, and 120k LiDAR Freefall Impact Slam.
// =============================================================================

window.WorldGravityScene = (function() {

  function createPrism(w, h, d) {
    return new THREE.BoxGeometry(w, h, d);
  }

  // --- 1. PROCEDURAL LOW-POLY VEHICLES ---
  function buildVehicle(type, bodyColor, registerFn, mats, opts = {}) {
    const carGroup = new THREE.Group();
    const wheels = [];
    const cargoItems = [];

    const carBodyMat = new THREE.MeshLambertMaterial({ color: bodyColor, flatShading: true });
    const glassMat = new THREE.MeshLambertMaterial({ color: 0x223344, flatShading: true, transparent: true, opacity: 0.85 });
    const chromeMat = new THREE.MeshLambertMaterial({ color: 0xdde4eb, flatShading: true });
    const wheelMat = new THREE.MeshLambertMaterial({ color: 0x18181b, flatShading: true });
    const headlightMat = new THREE.MeshBasicMaterial({ color: 0xfff3c4 });
    const taillightMat = new THREE.MeshBasicMaterial({ color: 0xdc2626 });

    if (type === 'sedan' || type === 'taxi') {
      // Lower chassis
      const baseGeo = createPrism(1.9, 0.65, 4.4);
      const baseMesh = registerFn(new THREE.Mesh(baseGeo, carBodyMat), carBodyMat, { edgeThreshold: 14 });
      baseMesh.position.y = 0.55;
      carGroup.add(baseMesh);

      // Cabin / Greenhouse
      const cabinGeo = createPrism(1.65, 0.60, 2.3);
      const cabinMesh = registerFn(new THREE.Mesh(cabinGeo, glassMat), glassMat, { edgeThreshold: 14 });
      cabinMesh.position.set(0, 1.12, -0.2);
      carGroup.add(cabinMesh);

      // Roof cap
      const roofGeo = createPrism(1.62, 0.08, 2.2);
      const roofMesh = registerFn(new THREE.Mesh(roofGeo, carBodyMat), carBodyMat, { edgeThreshold: 14 });
      roofMesh.position.set(0, 1.45, -0.2);
      carGroup.add(roofMesh);

      // Taxi sign if taxi
      if (type === 'taxi') {
        const signGeo = createPrism(0.6, 0.22, 0.35);
        const signMesh = registerFn(new THREE.Mesh(signGeo, headlightMat), headlightMat, { edgeThreshold: 12 });
        signMesh.position.set(0, 1.60, -0.2);
        carGroup.add(signMesh);
      }
    } else if (type === 'suv') {
      // SUV chassis & tall cabin
      const baseGeo = createPrism(2.05, 0.85, 4.8);
      const baseMesh = registerFn(new THREE.Mesh(baseGeo, carBodyMat), carBodyMat, { edgeThreshold: 14 });
      baseMesh.position.y = 0.75;
      carGroup.add(baseMesh);

      const cabinGeo = createPrism(1.85, 0.75, 3.2);
      const cabinMesh = registerFn(new THREE.Mesh(cabinGeo, glassMat), glassMat, { edgeThreshold: 14 });
      cabinMesh.position.set(0, 1.45, -0.4);
      carGroup.add(cabinMesh);

      const roofRackGeo = createPrism(1.7, 0.12, 2.8);
      const roofRack = registerFn(new THREE.Mesh(roofRackGeo, chromeMat), chromeMat, { edgeThreshold: 14 });
      roofRack.position.set(0, 1.88, -0.4);
      carGroup.add(roofRack);
    } else if (type === 'truck') {
      // Cargo Truck Cabin
      const cabGeo = createPrism(2.2, 1.5, 2.1);
      const cabMesh = registerFn(new THREE.Mesh(cabGeo, carBodyMat), carBodyMat, { edgeThreshold: 14 });
      cabMesh.position.set(0, 1.25, 1.5);
      carGroup.add(cabMesh);

      // Windshield
      const glassGeo = createPrism(2.0, 0.65, 0.3);
      const glass = registerFn(new THREE.Mesh(glassGeo, glassMat), glassMat, { edgeThreshold: 14 });
      glass.position.set(0, 1.45, 2.45);
      carGroup.add(glass);

      // Open cargo bed
      const bedFloorGeo = createPrism(2.2, 0.25, 4.4);
      const bedFloor = registerFn(new THREE.Mesh(bedFloorGeo, chromeMat), chromeMat, { edgeThreshold: 14 });
      bedFloor.position.set(0, 0.75, -1.8);
      carGroup.add(bedFloor);

      const bedWallLGeo = createPrism(0.12, 0.75, 4.4);
      const bedWallL = registerFn(new THREE.Mesh(bedWallLGeo, carBodyMat), carBodyMat, { edgeThreshold: 14 });
      bedWallL.position.set(1.05, 1.15, -1.8);
      carGroup.add(bedWallL);

      const bedWallR = registerFn(new THREE.Mesh(bedWallLGeo, carBodyMat), carBodyMat, { edgeThreshold: 14 });
      bedWallR.position.set(-1.05, 1.15, -1.8);
      carGroup.add(bedWallR);

      // Loose cargo boxes inside truck bed that will float away in Zero-G!
      const boxMat = new THREE.MeshLambertMaterial({ color: 0x92400e, flatShading: true });
      for (let b = 0; b < 3; b++) {
        const boxGeo = createPrism(0.75, 0.75, 0.85);
        const boxMesh = registerFn(new THREE.Mesh(boxGeo, boxMat), boxMat, { edgeThreshold: 12 });
        boxMesh.position.set((b - 1) * 0.65, 1.25, -1.2 - b * 0.9);
        carGroup.add(boxMesh);
        cargoItems.push({
          mesh: boxMesh,
          origPos: boxMesh.position.clone(),
          spinVel: new THREE.Vector3(0.8 + b * 0.3, 1.2 - b * 0.2, 0.5 + b * 0.4),
          driftVel: new THREE.Vector3((b - 1) * 0.3, 0.9 + b * 0.25, 0.4)
        });
      }
    }

    // 4 Articulated Wheels with rims
    const wheelGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.32, 10);
    wheelGeo.rotateZ(Math.PI / 2);
    const wheelOffsets = [
      { x: 0.95, y: 0.38, z: 1.3 },
      { x: -0.95, y: 0.38, z: 1.3 },
      { x: 0.95, y: 0.38, z: -1.3 },
      { x: -0.95, y: 0.38, z: -1.3 }
    ];
    wheelOffsets.forEach(pos => {
      const wMesh = registerFn(new THREE.Mesh(wheelGeo, wheelMat), wheelMat, { edgeThreshold: 18 });
      wMesh.position.set(pos.x, pos.y, pos.z);
      carGroup.add(wMesh);
      wheels.push(wMesh);
    });

    // Headlights and taillights
    const hlGeo = createPrism(0.32, 0.18, 0.12);
    const hlL = registerFn(new THREE.Mesh(hlGeo, headlightMat), headlightMat, { edgeThreshold: 12 });
    hlL.position.set(0.68, 0.62, 2.22);
    carGroup.add(hlL);
    const hlR = registerFn(new THREE.Mesh(hlGeo, headlightMat), headlightMat, { edgeThreshold: 12 });
    hlR.position.set(-0.68, 0.62, 2.22);
    carGroup.add(hlR);

    const tlGeo = createPrism(0.35, 0.16, 0.12);
    const tlL = registerFn(new THREE.Mesh(tlGeo, taillightMat), taillightMat, { edgeThreshold: 12 });
    tlL.position.set(0.68, 0.62, -2.22);
    carGroup.add(tlL);
    const tlR = registerFn(new THREE.Mesh(tlGeo, taillightMat), taillightMat, { edgeThreshold: 12 });
    tlR.position.set(-0.68, 0.62, -2.22);
    carGroup.add(tlR);

    return {
      group: carGroup,
      wheels,
      cargoItems,
      type,
      lane: opts.lane || 0,
      baseSpeed: opts.speed || 12,
      initZ: opts.initZ || 0,
      floatPhase: {
        liftSpeed: 0.45 + Math.random() * 0.35,
        rotSpeed: new THREE.Vector3(
          (Math.random() - 0.5) * 0.6,
          (Math.random() - 0.5) * 0.5,
          (Math.random() - 0.5) * 0.7
        ),
        lateralDrift: (Math.random() - 0.5) * 0.3
      }
    };
  }

  // --- 2. SUSPENSION BRIDGE & HIGHWAY ENVIRONMENT ---
  function buildBridgeEnvironment(registerFn, mats, textures) {
    const envGroup = new THREE.Group();

    // Roadway Deck: 240m long, 16m wide
    const deckGeo = new THREE.BoxGeometry(16, 1.2, 260);
    const roadMat = new THREE.MeshLambertMaterial({ color: 0x22262c, flatShading: true });
    const deckMesh = registerFn(new THREE.Mesh(deckGeo, roadMat), roadMat, { edgeThreshold: 15 });
    deckMesh.position.set(0, 0, 0);
    deckMesh.receiveShadow = true;
    envGroup.add(deckMesh);

    // Center divider barrier
    const barrierGeo = new THREE.BoxGeometry(0.8, 0.9, 260);
    const barrierMat = new THREE.MeshLambertMaterial({ color: 0x94a3b8, flatShading: true });
    const barrierMesh = registerFn(new THREE.Mesh(barrierGeo, barrierMat), barrierMat, { edgeThreshold: 15 });
    barrierMesh.position.set(0, 0.75, 0);
    envGroup.add(barrierMesh);

    // Edge Guardrails
    const railGeo = new THREE.BoxGeometry(0.4, 1.1, 260);
    const railL = registerFn(new THREE.Mesh(railGeo, barrierMat), barrierMat, { edgeThreshold: 15 });
    railL.position.set(7.8, 0.85, 0);
    envGroup.add(railL);

    const railR = registerFn(new THREE.Mesh(railGeo, barrierMat), barrierMat, { edgeThreshold: 15 });
    railR.position.set(-7.8, 0.85, 0);
    envGroup.add(railR);

    // Road dashed lane stripes
    const stripeMat = new THREE.MeshBasicMaterial({ color: 0xf8fafc });
    const stripeGeo = new THREE.PlaneGeometry(0.22, 2.8);
    stripeGeo.rotateX(-Math.PI / 2);
    for (let z = -120; z <= 120; z += 5.5) {
      // Lane 1 divider (+3.8m)
      const st1 = registerFn(new THREE.Mesh(stripeGeo, stripeMat), stripeMat, { edgeThreshold: 10 });
      st1.position.set(3.8, 0.61, z);
      envGroup.add(st1);

      // Lane 2 divider (-3.8m)
      const st2 = registerFn(new THREE.Mesh(stripeGeo, stripeMat), stripeMat, { edgeThreshold: 10 });
      st2.position.set(-3.8, 0.61, z);
      envGroup.add(st2);
    }

    // Two Colossal Suspension Bridge Towers (Tower 1 at z = -40, Tower 2 at z = 40)
    const towerMat = new THREE.MeshLambertMaterial({ color: 0xc2410c, flatShading: true }); // Golden-Gate rust orange
    const suspensionPillars = [];

    [-40, 40].forEach(tz => {
      const towerGroup = new THREE.Group();
      towerGroup.position.set(0, 0, tz);

      // Left Column (58m tall)
      const colGeo = new THREE.BoxGeometry(2.4, 58, 2.8);
      const colL = registerFn(new THREE.Mesh(colGeo, towerMat), towerMat, { edgeThreshold: 12 });
      colL.position.set(8.8, 24, 0);
      towerGroup.add(colL);

      // Right Column
      const colR = registerFn(new THREE.Mesh(colGeo, towerMat), towerMat, { edgeThreshold: 12 });
      colR.position.set(-8.8, 24, 0);
      towerGroup.add(colR);

      // Crossbeams
      [14, 32, 50].forEach(cy => {
        const beamGeo = new THREE.BoxGeometry(20, 2.2, 2.4);
        const beam = registerFn(new THREE.Mesh(beamGeo, towerMat), towerMat, { edgeThreshold: 12 });
        beam.position.set(0, cy, 0);
        towerGroup.add(beam);
      });

      envGroup.add(towerGroup);
      suspensionPillars.push(towerGroup);
    });

    // Suspension Cables: Parabolic drooping main cable + vertical suspenders
    const cableMat = new THREE.MeshBasicMaterial({ color: 0xe2e8f0 });
    const cablePointsL = [];
    const cablePointsR = [];

    for (let z = -120; z <= 120; z += 4) {
      // Parabolic catenary approximation
      let normZ = (z + 40) / 80;
      let sagY = 50 - 36 * Math.sin(Math.min(1, Math.max(0, (z + 40) / 80)) * Math.PI);
      if (z < -40) sagY = 50 - ((z + 40) / -80) * 35;
      if (z > 40) sagY = 50 - ((z - 40) / 80) * 35;

      cablePointsL.push(new THREE.Vector3(8.8, Math.max(2, sagY), z));
      cablePointsR.push(new THREE.Vector3(-8.8, Math.max(2, sagY), z));

      // Vertical suspender cable wire
      const suspenderGeo = new THREE.CylinderGeometry(0.04, 0.04, Math.max(0.5, sagY - 1.2), 4);
      const suspMeshL = registerFn(new THREE.Mesh(suspenderGeo, cableMat), cableMat, { edgeThreshold: 20 });
      suspMeshL.position.set(8.8, (sagY + 1.2) * 0.5, z);
      envGroup.add(suspMeshL);

      const suspMeshR = registerFn(new THREE.Mesh(suspenderGeo, cableMat), cableMat, { edgeThreshold: 20 });
      suspMeshR.position.set(-8.8, (sagY + 1.2) * 0.5, z);
      envGroup.add(suspMeshR);
    }

    // Bridge Streetlights along center barrier
    const lampMat = new THREE.MeshLambertMaterial({ color: 0x475569, flatShading: true });
    const lampBulbMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    const streetlamps = [];

    for (let z = -110; z <= 110; z += 18) {
      const poleGroup = new THREE.Group();
      poleGroup.position.set(0, 0.75, z);

      const poleGeo = new THREE.CylinderGeometry(0.08, 0.10, 5.5, 6);
      const poleMesh = registerFn(new THREE.Mesh(poleGeo, lampMat), lampMat, { edgeThreshold: 15 });
      poleMesh.position.y = 2.75;
      poleGroup.add(poleMesh);

      const armGeo = new THREE.BoxGeometry(2.4, 0.08, 0.08);
      const armMesh = registerFn(new THREE.Mesh(armGeo, lampMat), lampMat, { edgeThreshold: 12 });
      armMesh.position.y = 5.4;
      poleGroup.add(armMesh);

      const bulbGeo = new THREE.SphereGeometry(0.16, 6, 4);
      const bulbL = registerFn(new THREE.Mesh(bulbGeo, lampBulbMat), lampBulbMat, { edgeThreshold: 10 });
      bulbL.position.set(1.1, 5.25, 0);
      poleGroup.add(bulbL);
      const bulbR = registerFn(new THREE.Mesh(bulbGeo, lampBulbMat), lampBulbMat, { edgeThreshold: 10 });
      bulbR.position.set(-1.1, 5.25, 0);
      poleGroup.add(bulbR);

      envGroup.add(poleGroup);
      streetlamps.push(poleGroup);
    }

    // Ocean Bay Surface underneath bridge (at y = -14m)
    const waterGeo = new THREE.PlaneGeometry(320, 320, 28, 28);
    waterGeo.rotateX(-Math.PI / 2);
    const waterMat = new THREE.MeshLambertMaterial({
      color: 0x0f2a4a, // Deep rich ocean bay blue
      flatShading: true,
      transparent: true,
      opacity: 0.92
    });
    const waterMesh = registerFn(new THREE.Mesh(waterGeo, waterMat), waterMat, { edgeThreshold: 18 });
    waterMesh.position.set(0, -14, 0);
    envGroup.add(waterMesh);

    return {
      group: envGroup,
      waterMesh,
      waterGeo,
      streetlamps,
      suspensionPillars
    };
  }

  // --- 3. DRIVER COCKPIT & ZERO-G FLOATING OBJECTS POV ---
  function buildCockpitPOV(registerFn, mats) {
    const cockpitGroup = new THREE.Group();

    // Wireframe Dashboard & Windshield Frame
    const dashMat = new THREE.MeshLambertMaterial({ color: 0x1e293b, flatShading: true });
    const dashGeo = new THREE.BoxGeometry(1.8, 0.35, 0.85);
    const dashMesh = registerFn(new THREE.Mesh(dashGeo, dashMat), dashMat, { edgeThreshold: 14, isHandSleeve: true });
    dashMesh.position.set(0, -0.48, -0.75);
    cockpitGroup.add(dashMesh);

    // Windshield A-Pillars (Framing the view)
    const pillarMat = new THREE.MeshLambertMaterial({ color: 0x0f172a, flatShading: true });
    const pillarGeo = new THREE.BoxGeometry(0.08, 1.8, 0.08);
    const pL = registerFn(new THREE.Mesh(pillarGeo, pillarMat), pillarMat, { edgeThreshold: 12 });
    pL.position.set(0.68, 0.35, -0.75);
    pL.rotation.z = -0.18;
    cockpitGroup.add(pL);

    const pR = registerFn(new THREE.Mesh(pillarGeo, pillarMat), pillarMat, { edgeThreshold: 12 });
    pR.position.set(-0.68, 0.35, -0.75);
    pR.rotation.z = 0.18;
    cockpitGroup.add(pR);

    // Detached Floating Steering Wheel (Tumbling in Zero-G, positioned inside 9:16 FOV)
    const wheelTorusGeo = new THREE.TorusGeometry(0.18, 0.028, 6, 14);
    const stWheelMat = new THREE.MeshLambertMaterial({ color: 0x334155, flatShading: true });
    const stWheelMesh = registerFn(new THREE.Mesh(wheelTorusGeo, stWheelMat), stWheelMat, { edgeThreshold: 14 });
    const stWheelGroup = new THREE.Group();
    stWheelGroup.position.set(-0.10, 0.04, -0.58);
    stWheelGroup.add(stWheelMesh);

    // 3 Center spokes
    for (let sp = 0; sp < 3; sp++) {
      const spGeo = new THREE.BoxGeometry(0.03, 0.17, 0.02);
      const spMesh = registerFn(new THREE.Mesh(spGeo, stWheelMat), stWheelMat, { edgeThreshold: 10 });
      spMesh.rotation.z = sp * (Math.PI * 2 / 3);
      spMesh.position.y = -0.07 * Math.cos(spMesh.rotation.z);
      spMesh.position.x = 0.07 * Math.sin(spMesh.rotation.z);
      stWheelGroup.add(spMesh);
    }
    cockpitGroup.add(stWheelGroup);

    // Tumbling Coffee Cup & Lid (Zero-G Iconography)
    const cupGroup = new THREE.Group();
    cupGroup.position.set(0.15, 0.08, -0.52);
    const cupGeo = new THREE.CylinderGeometry(0.048, 0.036, 0.13, 8);
    const cupMat = new THREE.MeshLambertMaterial({ color: 0xf1f5f9, flatShading: true });
    const cupMesh = registerFn(new THREE.Mesh(cupGeo, cupMat), cupMat, { edgeThreshold: 12 });
    cupGroup.add(cupMesh);

    const lidGeo = new THREE.CylinderGeometry(0.052, 0.050, 0.022, 8);
    const lidMat = new THREE.MeshLambertMaterial({ color: 0x0f172a, flatShading: true });
    const lidMesh = registerFn(new THREE.Mesh(lidGeo, lidMat), lidMat, { edgeThreshold: 10 });
    lidMesh.position.y = 0.068;
    cupGroup.add(lidMesh);
    cockpitGroup.add(cupGroup);

    // Tumbling Floating Smartphone / Keys
    const phoneGroup = new THREE.Group();
    phoneGroup.position.set(-0.02, 0.22, -0.48);
    const phoneGeo = new THREE.BoxGeometry(0.07, 0.13, 0.012);
    const phoneMat = new THREE.MeshLambertMaterial({ color: 0x0284c7, flatShading: true });
    const phoneMesh = registerFn(new THREE.Mesh(phoneGeo, phoneMat), phoneMat, { edgeThreshold: 10 });
    phoneGroup.add(phoneMesh);
    cockpitGroup.add(phoneGroup);

    // Left and Right Hands reaching forward toward the floating wheel & cup
    const handsGroup = new THREE.Group();
    const handMat = new THREE.MeshLambertMaterial({ color: 0xc89369, flatShading: true });

    // Left Hand
    const handLGroup = new THREE.Group();
    handLGroup.position.set(-0.13, -0.22, -0.42);
    const palmLGeo = new THREE.BoxGeometry(0.09, 0.035, 0.11);
    const palmL = registerFn(new THREE.Mesh(palmLGeo, handMat), handMat, { edgeThreshold: 12, isHand: true });
    handLGroup.add(palmL);
    for (let f = 0; f < 4; f++) {
      const fGeo = new THREE.BoxGeometry(0.018, 0.020, 0.07);
      const fMesh = registerFn(new THREE.Mesh(fGeo, handMat), handMat, { edgeThreshold: 10, isHand: true });
      fMesh.position.set(-0.032 + f * 0.021, 0.010, -0.08);
      fMesh.rotation.x = -0.25 + f * 0.05;
      handLGroup.add(fMesh);
    }
    handsGroup.add(handLGroup);

    // Right Hand
    const handRGroup = new THREE.Group();
    handRGroup.position.set(0.13, -0.20, -0.42);
    const palmRGeo = new THREE.BoxGeometry(0.09, 0.035, 0.11);
    const palmR = registerFn(new THREE.Mesh(palmRGeo, handMat), handMat, { edgeThreshold: 12, isHand: true });
    handRGroup.add(palmR);
    for (let f = 0; f < 4; f++) {
      const fGeo = new THREE.BoxGeometry(0.018, 0.020, 0.07);
      const fMesh = registerFn(new THREE.Mesh(fGeo, handMat), handMat, { edgeThreshold: 10, isHand: true });
      fMesh.position.set(-0.032 + f * 0.021, 0.012, -0.08);
      fMesh.rotation.x = -0.30 + f * 0.05;
      handRGroup.add(fMesh);
    }
    handsGroup.add(handRGroup);
    handsGroup.add(handRGroup);

    cockpitGroup.add(handsGroup);

    return {
      cockpitGroup,
      stWheelGroup,
      cupGroup,
      phoneGroup,
      handLGroup,
      handRGroup
    };
  }

  // --- 4. UPLIFTING OCEAN WATER SPIRES (Phase 2 & 3 Zero-G) ---
  function buildWaterSpires(registerFn) {
    const spiresGroup = new THREE.Group();
    const spireMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
      transparent: true,
      opacity: 0.85
    });

    const spires = [];
    const count = 18;
    for (let i = 0; i < count; i++) {
      const h = 8 + (i % 5) * 6;
      const r = 1.2 + (i % 4) * 0.8;
      const geo = new THREE.ConeGeometry(r, h, 6, 4, true);
      geo.rotateX(Math.PI); // Pointing upward
      const mesh = registerFn(new THREE.Mesh(geo, spireMat), spireMat, { edgeThreshold: 10 });
      const angle = (i / count) * Math.PI * 2;
      const dist = 18 + (i % 6) * 12;
      mesh.position.set(Math.cos(angle) * dist, -14, Math.sin(angle) * dist * 1.8);
      spiresGroup.add(mesh);
      spires.push({
        mesh,
        baseY: -14,
        maxRise: 28 + (i % 4) * 12,
        speed: 0.65 + (i % 5) * 0.2
      });
    }

    return { spiresGroup, spires };
  }

  // --- 5. 120,000 LIDAR BRIDGE POINT CLOUD (Phase 7 Impact Slam) ---
  function buildLidarBridge(scene, sRand, dotSpriteTex) {
    const lidarWorld = new THREE.Group();
    scene.add(lidarWorld);
    lidarWorld.visible = false;

    const LIDAR_COUNT = 120000;
    const lidarGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(LIDAR_COUNT * 3);
    const basePositions = new Float32Array(LIDAR_COUNT * 3);
    const velocitiesX = new Float32Array(LIDAR_COUNT);
    const velocitiesY = new Float32Array(LIDAR_COUNT);
    const velocitiesZ = new Float32Array(LIDAR_COUNT);
    const originalElevations = new Float32Array(LIDAR_COUNT);

    let pIdx = 0;

    // 1. Bridge Roadway Deck & Guardrails (45,000 points)
    for (let i = 0; i < 45000; i++) {
      const rx = (sRand() - 0.5) * 16;
      const rz = (sRand() - 0.5) * 220;
      const ry = (Math.abs(rx) > 7.4) ? sRand() * 1.2 : sRand() * 0.15;

      const i3 = pIdx * 3;
      basePositions[i3] = rx;
      basePositions[i3 + 1] = ry;
      basePositions[i3 + 2] = rz;
      originalElevations[pIdx] = ry;

      velocitiesX[pIdx] = (sRand() - 0.5) * 14;
      velocitiesY[pIdx] = 6 + sRand() * 22;
      velocitiesZ[pIdx] = (sRand() - 0.5) * 14;
      pIdx++;
    }

    // 2. Twin Suspension Towers & Main Cables (40,000 points)
    for (let i = 0; i < 40000; i++) {
      const isTower = sRand() > 0.45;
      let rx, ry, rz;

      if (isTower) {
        const tz = sRand() > 0.5 ? 40 : -40;
        const colSide = sRand() > 0.5 ? 8.8 : -8.8;
        rx = colSide + (sRand() - 0.5) * 2.4;
        ry = sRand() * 58;
        rz = tz + (sRand() - 0.5) * 2.8;
      } else {
        // Catenary cable points
        rz = (sRand() - 0.5) * 200;
        const colSide = sRand() > 0.5 ? 8.8 : -8.8;
        rx = colSide + (sRand() - 0.5) * 0.4;
        ry = 50 - 36 * Math.sin(Math.min(1, Math.max(0, (rz + 40) / 80)) * Math.PI);
        if (rz < -40) ry = 50 - ((rz + 40) / -80) * 35;
        if (rz > 40) ry = 50 - ((rz - 40) / 80) * 35;
      }

      const i3 = pIdx * 3;
      basePositions[i3] = rx;
      basePositions[i3 + 1] = ry;
      basePositions[i3 + 2] = rz;
      originalElevations[pIdx] = ry;

      velocitiesX[pIdx] = (sRand() - 0.5) * 18;
      velocitiesY[pIdx] = 8 + sRand() * 24;
      velocitiesZ[pIdx] = (sRand() - 0.5) * 18;
      pIdx++;
    }

    // 3. Floating Suspended Vehicles and Water Spurt Debris (35,000 points)
    for (let i = 0; i < 35000; i++) {
      const rx = (sRand() - 0.5) * 28;
      const ry = 8 + sRand() * 32; // Floating high in the air at return moment!
      const rz = (sRand() - 0.5) * 160;

      const i3 = pIdx * 3;
      basePositions[i3] = rx;
      basePositions[i3 + 1] = ry;
      basePositions[i3 + 2] = rz;
      originalElevations[pIdx] = ry;

      // Upon impact, violently blasts outward radially
      velocitiesX[pIdx] = (sRand() - 0.5) * 32;
      velocitiesY[pIdx] = 4 + sRand() * 36;
      velocitiesZ[pIdx] = (sRand() - 0.5) * 32;
      pIdx++;
    }

    positions.set(basePositions);
    lidarGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const lidarMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.16,
      map: dotSpriteTex,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const lidarPoints = new THREE.Points(lidarGeo, lidarMat);
    lidarWorld.add(lidarPoints);

    return {
      lidarWorld,
      lidarGeo,
      lidarCount: LIDAR_COUNT,
      basePositions,
      velocitiesX,
      velocitiesY,
      velocitiesZ,
      originalElevations
    };
  }

  // ===========================================================================
  // MASTER BUILD FUNCTION
  // ===========================================================================
  function buildGravityWorld(scene, registerFn, mats, textures, sRand, dotSpriteTex) {
    const gravityWorld = new THREE.Group();
    scene.add(gravityWorld);

    // 1. Highway Bridge Environment
    const bridge = buildBridgeEnvironment(registerFn, mats, textures);
    gravityWorld.add(bridge.group);

    // 2. 8 Distinct Vehicles on the Highway
    const vehicleConfigs = [
      { type: 'sedan', color: 0x94a3b8, lane: 2.2, speed: 18, initZ: -65 },
      { type: 'taxi', color: 0xeab308, lane: -2.2, speed: 17, initZ: -45 },
      { type: 'sports', color: 0xdc2626, lane: 5.8, speed: 24, initZ: -80 },
      { type: 'suv', color: 0x2563eb, lane: -5.8, speed: 16, initZ: -30 },
      { type: 'truck', color: 0xd97706, lane: 2.2, speed: 13, initZ: -10 },
      { type: 'sedan', color: 0x0f172a, lane: -2.2, speed: 18, initZ: 15 },
      { type: 'suv', color: 0x16a34a, lane: 5.8, speed: 19, initZ: 40 },
      { type: 'sedan', color: 0xf1f5f9, lane: -5.8, speed: 20, initZ: 65 }
    ];

    const vehicles = vehicleConfigs.map(cfg => {
      const v = buildVehicle(cfg.type, cfg.color, registerFn, mats, cfg);
      v.group.position.set(cfg.lane, 0, cfg.initZ);
      gravityWorld.add(v.group);
      return v;
    });

    // 3. Driver Cockpit POV with Tumbling Steering Wheel, Coffee Cup, Phone & Hands
    const cockpit = buildCockpitPOV(registerFn, mats);
    gravityWorld.add(cockpit.cockpitGroup);
    cockpit.cockpitGroup.visible = false;

    // 4. Uplifting Ocean Water Spires
    const waterSpires = buildWaterSpires(registerFn);
    gravityWorld.add(waterSpires.spiresGroup);
    waterSpires.spiresGroup.visible = false;

    // 5. 120,000 LiDAR Point Cloud for Final Freefall & Impact Explosion
    const lidarData = buildLidarBridge(scene, sRand, dotSpriteTex);

    return {
      gravityWorld,
      bridge,
      vehicles,
      cockpit,
      waterSpires,
      lidarData
    };
  }

  return {
    buildGravityWorld
  };

})();
