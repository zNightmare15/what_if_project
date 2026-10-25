// =============================================================================
// WorldGravityScene — High-Concept Bespoke 3D Simulation for "What If Gravity Disappeared for 5 Seconds?"
// Features:
//   - Diverse Creative Fleet: Double-Decker Bus, Muscle Car with Surfboard, Food Truck,
//     Station Wagon with Roof Luggage & Bike, Construction Mixer, Taxi, Delivery Van, Sports Car.
//   - Highway Infrastructure: Overhead Gantry Highway Signs, Sailboat in Bay, Tumbling Suitcases & Balls.
//   - Immersive Cockpit POV: Glowing Zero-G Speedometer, Fuzzy Dice, Coffee with Floating Liquid Spheres.
//   - Planetary Cosmic Scale: Continents & Night City Lights, Atmospheric Escape Plume,
//     Snapping Orbit Ring, Newton Tangent Vector, 3D ISS Space Station, and Deep Cosmic Nebula.
//   - 120k LiDAR Bridge Point Cloud Freefall & Ground Slam Impact.
// =============================================================================

window.WorldGravityScene = (function() {

  function createPrism(w, h, d) {
    return new THREE.BoxGeometry(w, h, d);
  }

  // --- 1. PROCEDURAL CREATIVE VEHICLE CONSTRUCTORS ---
  function buildVehicle(cfg, registerFn, mats) {
    const carGroup = new THREE.Group();
    const wheels = [];
    const looseCargo = [];

    const bodyMat = new THREE.MeshLambertMaterial({ color: cfg.color, flatShading: true });
    const whiteMat = new THREE.MeshLambertMaterial({ color: 0xf8fafc, flatShading: true });
    const darkMat = new THREE.MeshLambertMaterial({ color: 0x0f172a, flatShading: true });
    const glassMat = new THREE.MeshLambertMaterial({ color: 0x1e293b, flatShading: true, transparent: true, opacity: 0.85 });
    const chromeMat = new THREE.MeshLambertMaterial({ color: 0xdde4eb, flatShading: true });
    const wheelMat = new THREE.MeshLambertMaterial({ color: 0x18181b, flatShading: true });
    const woodMat = new THREE.MeshLambertMaterial({ color: 0x78350f, flatShading: true });
    const hlMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    const tlMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });

    function addWheels(offsets, radius = 0.38, width = 0.30) {
      const wGeo = new THREE.CylinderGeometry(radius, radius, width, 10);
      wGeo.rotateZ(Math.PI / 2);
      offsets.forEach(pos => {
        const wMesh = registerFn(new THREE.Mesh(wGeo, wheelMat), wheelMat, { edgeThreshold: 18 });
        wMesh.position.set(pos.x, pos.y, pos.z);
        carGroup.add(wMesh);
        wheels.push(wMesh);
      });
    }

    if (cfg.type === 'double_decker_bus') {
      // Two-tier London/Transit style double-decker bus (4.2m tall)
      const busBodyGeo = createPrism(2.4, 4.1, 8.8);
      const busMesh = registerFn(new THREE.Mesh(busBodyGeo, bodyMat), bodyMat, { edgeThreshold: 14 });
      busMesh.position.y = 2.3;
      carGroup.add(busMesh);

      // Upper & lower window glass bands
      const glassUpper = registerFn(new THREE.Mesh(createPrism(2.45, 0.75, 7.8), glassMat), glassMat, { edgeThreshold: 12 });
      glassUpper.position.set(0, 3.2, 0.2);
      carGroup.add(glassUpper);

      const glassLower = registerFn(new THREE.Mesh(createPrism(2.45, 0.75, 6.8), glassMat), glassMat, { edgeThreshold: 12 });
      glassLower.position.set(0, 1.8, -0.3);
      carGroup.add(glassLower);

      // Illuminated Destination Sign
      const signMesh = registerFn(new THREE.Mesh(createPrism(1.8, 0.32, 0.15), hlMat), hlMat, { edgeThreshold: 10 });
      signMesh.position.set(0, 3.8, 4.42);
      carGroup.add(signMesh);

      addWheels([
        { x: 1.25, y: 0.48, z: 2.8 }, { x: -1.25, y: 0.48, z: 2.8 },
        { x: 1.25, y: 0.48, z: -2.8 }, { x: -1.25, y: 0.48, z: -2.8 }
      ], 0.48, 0.36);

    } else if (cfg.type === 'muscle_car') {
      // Classic Muscle Convertible with Racing Stripe and Surfboard on back
      const chass = registerFn(new THREE.Mesh(createPrism(1.95, 0.60, 4.6), bodyMat), bodyMat, { edgeThreshold: 14 });
      chass.position.y = 0.55;
      carGroup.add(chass);

      // White racing stripes on hood
      const stripeMesh = registerFn(new THREE.Mesh(createPrism(0.45, 0.05, 4.62), whiteMat), whiteMat, { edgeThreshold: 12 });
      stripeMesh.position.set(0, 0.86, 0);
      carGroup.add(stripeMesh);

      // Open cockpit interior & seats
      const seatL = registerFn(new THREE.Mesh(createPrism(0.5, 0.55, 0.45), darkMat), darkMat, { edgeThreshold: 12 });
      seatL.position.set(0.42, 0.85, -0.2);
      carGroup.add(seatL);
      const seatR = registerFn(new THREE.Mesh(createPrism(0.5, 0.55, 0.45), darkMat), darkMat, { edgeThreshold: 12 });
      seatR.position.set(-0.42, 0.85, -0.2);
      carGroup.add(seatR);

      // Angled Windshield
      const wShield = registerFn(new THREE.Mesh(createPrism(1.7, 0.45, 0.08), glassMat), glassMat, { edgeThreshold: 12 });
      wShield.position.set(0, 0.95, 0.55);
      wShield.rotation.x = -0.38;
      carGroup.add(wShield);

      // Surfboard mounted on back that floats away in Zero-G!
      const surfMat = new THREE.MeshLambertMaterial({ color: 0x06b6d4, flatShading: true });
      const surfGeo = createPrism(0.55, 0.06, 2.1);
      const surfMesh = registerFn(new THREE.Mesh(surfGeo, surfMat), surfMat, { edgeThreshold: 12 });
      surfMesh.position.set(0.35, 1.05, -1.5);
      surfMesh.rotation.set(0.25, 0.15, -0.10);
      carGroup.add(surfMesh);
      looseCargo.push({
        mesh: surfMesh,
        origPos: surfMesh.position.clone(),
        driftVel: new THREE.Vector3(0.4, 1.4, -0.6),
        spinVel: new THREE.Vector3(1.4, 0.8, 1.9)
      });

      addWheels([
        { x: 1.02, y: 0.38, z: 1.4 }, { x: -1.02, y: 0.38, z: 1.4 },
        { x: 1.02, y: 0.38, z: -1.4 }, { x: -1.02, y: 0.38, z: -1.4 }
      ]);

    } else if (cfg.type === 'station_wagon') {
      // Vintage Station Wagon with Woodgrain Panels and Loaded Roof Rack
      const chass = registerFn(new THREE.Mesh(createPrism(1.9, 0.72, 4.7), bodyMat), bodyMat, { edgeThreshold: 14 });
      chass.position.y = 0.60;
      carGroup.add(chass);

      // Woodgrain side panels
      const woodL = registerFn(new THREE.Mesh(createPrism(0.04, 0.45, 3.6), woodMat), woodMat, { edgeThreshold: 10 });
      woodL.position.set(0.97, 0.62, -0.2);
      carGroup.add(woodL);
      const woodR = registerFn(new THREE.Mesh(createPrism(0.04, 0.45, 3.6), woodMat), woodMat, { edgeThreshold: 10 });
      woodR.position.set(-0.97, 0.62, -0.2);
      carGroup.add(woodR);

      // Long glass cabin
      const cabin = registerFn(new THREE.Mesh(createPrism(1.7, 0.68, 3.2), glassMat), glassMat, { edgeThreshold: 14 });
      cabin.position.set(0, 1.25, -0.4);
      carGroup.add(cabin);

      // Roof Rack with Suitcases and a Bicycle frame that break loose!
      const rack = registerFn(new THREE.Mesh(createPrism(1.5, 0.08, 2.4), chromeMat), chromeMat, { edgeThreshold: 12 });
      rack.position.set(0, 1.62, -0.4);
      carGroup.add(rack);

      // Suitcase 1 (Red)
      const sc1Mat = new THREE.MeshLambertMaterial({ color: 0xdc2626, flatShading: true });
      const sc1 = registerFn(new THREE.Mesh(createPrism(0.65, 0.24, 0.45), sc1Mat), sc1Mat, { edgeThreshold: 10 });
      sc1.position.set(-0.35, 1.78, -0.2);
      carGroup.add(sc1);
      looseCargo.push({
        mesh: sc1,
        origPos: sc1.position.clone(),
        driftVel: new THREE.Vector3(-0.6, 1.6, 0.4),
        spinVel: new THREE.Vector3(2.1, 1.2, 0.8)
      });

      // Suitcase 2 (Yellow)
      const sc2Mat = new THREE.MeshLambertMaterial({ color: 0xfacc15, flatShading: true });
      const sc2 = registerFn(new THREE.Mesh(createPrism(0.55, 0.22, 0.40), sc2Mat), sc2Mat, { edgeThreshold: 10 });
      sc2.position.set(0.35, 1.78, -0.6);
      carGroup.add(sc2);
      looseCargo.push({
        mesh: sc2,
        origPos: sc2.position.clone(),
        driftVel: new THREE.Vector3(0.5, 1.8, -0.5),
        spinVel: new THREE.Vector3(1.1, 2.4, 1.5)
      });

      addWheels([
        { x: 0.98, y: 0.38, z: 1.4 }, { x: -0.98, y: 0.38, z: 1.4 },
        { x: 0.98, y: 0.38, z: -1.4 }, { x: -0.98, y: 0.38, z: -1.4 }
      ]);

    } else if (cfg.type === 'food_truck') {
      // Pastel Gourmet Food Truck with Service Awning & Roof Vent
      const body = registerFn(new THREE.Mesh(createPrism(2.2, 2.3, 5.2), bodyMat), bodyMat, { edgeThreshold: 14 });
      body.position.y = 1.45;
      carGroup.add(body);

      // Side serving window opening
      const windowHatch = registerFn(new THREE.Mesh(createPrism(0.12, 0.85, 2.1), darkMat), darkMat, { edgeThreshold: 10 });
      windowHatch.position.set(1.12, 1.55, -0.4);
      carGroup.add(windowHatch);

      // Colorful striped awning
      const awnMat = new THREE.MeshLambertMaterial({ color: 0xf97316, flatShading: true });
      const awning = registerFn(new THREE.Mesh(createPrism(0.65, 0.06, 2.3), awnMat), awnMat, { edgeThreshold: 12 });
      awning.position.set(1.42, 2.05, -0.4);
      awning.rotation.z = -0.32;
      carGroup.add(awning);

      // Floating Pizza Box / Food tray in Zero-G
      const pzMat = new THREE.MeshLambertMaterial({ color: 0xfef08a, flatShading: true });
      const pizzaBox = registerFn(new THREE.Mesh(createPrism(0.45, 0.08, 0.45), pzMat), pzMat, { edgeThreshold: 8 });
      pizzaBox.position.set(1.45, 1.25, -0.2);
      carGroup.add(pizzaBox);
      looseCargo.push({
        mesh: pizzaBox,
        origPos: pizzaBox.position.clone(),
        driftVel: new THREE.Vector3(0.8, 1.5, 0.3),
        spinVel: new THREE.Vector3(0.9, 2.8, 1.4)
      });

      addWheels([
        { x: 1.15, y: 0.45, z: 1.6 }, { x: -1.15, y: 0.45, z: 1.6 },
        { x: 1.15, y: 0.45, z: -1.6 }, { x: -1.15, y: 0.45, z: -1.6 }
      ], 0.45, 0.34);

    } else if (cfg.type === 'construction_truck') {
      // Concrete Mixer Truck with angled rotating drum
      const cab = registerFn(new THREE.Mesh(createPrism(2.3, 1.6, 2.2), bodyMat), bodyMat, { edgeThreshold: 14 });
      cab.position.set(0, 1.35, 1.9);
      carGroup.add(cab);

      // Mixer drum (Conical cylinder angled at 15 degrees)
      const drumMat = new THREE.MeshLambertMaterial({ color: 0x94a3b8, flatShading: true });
      const drumGeo = new THREE.CylinderGeometry(0.85, 1.25, 3.8, 8);
      drumGeo.rotateX(Math.PI / 2);
      const drum = registerFn(new THREE.Mesh(drumGeo, drumMat), drumMat, { edgeThreshold: 14 });
      drum.position.set(0, 1.65, -1.4);
      drum.rotation.x = -0.26;
      carGroup.add(drum);

      addWheels([
        { x: 1.2, y: 0.48, z: 2.1 }, { x: -1.2, y: 0.48, z: 2.1 },
        { x: 1.2, y: 0.48, z: -0.9 }, { x: -1.2, y: 0.48, z: -0.9 },
        { x: 1.2, y: 0.48, z: -2.2 }, { x: -1.2, y: 0.48, z: -2.2 }
      ], 0.48, 0.36);

    } else if (cfg.type === 'taxi') {
      // Classic NYC Checker Cab with Checkerboard Side Stripe
      const baseMesh = registerFn(new THREE.Mesh(createPrism(1.9, 0.65, 4.4), bodyMat), bodyMat, { edgeThreshold: 14 });
      baseMesh.position.y = 0.55;
      carGroup.add(baseMesh);

      // Cabin
      const cabinMesh = registerFn(new THREE.Mesh(createPrism(1.65, 0.60, 2.3), glassMat), glassMat, { edgeThreshold: 14 });
      cabinMesh.position.set(0, 1.12, -0.2);
      carGroup.add(cabinMesh);

      // Taxi Medallion Roof Sign
      const signMesh = registerFn(new THREE.Mesh(createPrism(0.65, 0.24, 0.32), hlMat), hlMat, { edgeThreshold: 12 });
      signMesh.position.set(0, 1.55, -0.2);
      carGroup.add(signMesh);

      // Checker decals along beltline
      const checkMat = new THREE.MeshLambertMaterial({ color: 0x0f172a, flatShading: true });
      for (let ch = -1.6; ch <= 1.6; ch += 0.5) {
        const sqL = registerFn(new THREE.Mesh(createPrism(0.04, 0.12, 0.22), checkMat), checkMat, { edgeThreshold: 8 });
        sqL.position.set(0.97, 0.65, ch);
        carGroup.add(sqL);
        const sqR = registerFn(new THREE.Mesh(createPrism(0.04, 0.12, 0.22), checkMat), checkMat, { edgeThreshold: 8 });
        sqR.position.set(-0.97, 0.65, ch);
        carGroup.add(sqR);
      }

      addWheels([
        { x: 0.95, y: 0.38, z: 1.3 }, { x: -0.95, y: 0.38, z: 1.3 },
        { x: 0.95, y: 0.38, z: -1.3 }, { x: -0.95, y: 0.38, z: -1.3 }
      ]);

    } else if (cfg.type === 'sports_car') {
      // Low Aerodynamic Coupe with High-Downforce Rear Wing Spoiler
      const baseMesh = registerFn(new THREE.Mesh(createPrism(1.95, 0.50, 4.5), bodyMat), bodyMat, { edgeThreshold: 14 });
      baseMesh.position.y = 0.45;
      carGroup.add(baseMesh);

      const cabinMesh = registerFn(new THREE.Mesh(createPrism(1.5, 0.48, 2.0), glassMat), glassMat, { edgeThreshold: 14 });
      cabinMesh.position.set(0, 0.88, -0.3);
      carGroup.add(cabinMesh);

      // High Rear Spoiler Wing
      const wing = registerFn(new THREE.Mesh(createPrism(1.7, 0.06, 0.35), darkMat), darkMat, { edgeThreshold: 12 });
      wing.position.set(0, 1.05, -2.05);
      carGroup.add(wing);

      const wingStalkL = registerFn(new THREE.Mesh(createPrism(0.06, 0.42, 0.08), darkMat), darkMat, { edgeThreshold: 8 });
      wingStalkL.position.set(0.65, 0.84, -2.05);
      carGroup.add(wingStalkL);
      const wingStalkR = registerFn(new THREE.Mesh(createPrism(0.06, 0.42, 0.08), darkMat), darkMat, { edgeThreshold: 8 });
      wingStalkR.position.set(-0.65, 0.84, -2.05);
      carGroup.add(wingStalkR);

      addWheels([
        { x: 0.98, y: 0.34, z: 1.3 }, { x: -0.98, y: 0.34, z: 1.3 },
        { x: 0.98, y: 0.34, z: -1.3 }, { x: -0.98, y: 0.34, z: -1.3 }
      ], 0.34, 0.32);

    } else {
      // Default Modern Sedan
      const baseMesh = registerFn(new THREE.Mesh(createPrism(1.9, 0.65, 4.4), bodyMat), bodyMat, { edgeThreshold: 14 });
      baseMesh.position.y = 0.55;
      carGroup.add(baseMesh);

      const cabinMesh = registerFn(new THREE.Mesh(createPrism(1.65, 0.60, 2.3), glassMat), glassMat, { edgeThreshold: 14 });
      cabinMesh.position.set(0, 1.12, -0.2);
      carGroup.add(cabinMesh);

      addWheels([
        { x: 0.95, y: 0.38, z: 1.3 }, { x: -0.95, y: 0.38, z: 1.3 },
        { x: 0.95, y: 0.38, z: -1.3 }, { x: -0.95, y: 0.38, z: -1.3 }
      ]);
    }

    return {
      group: carGroup,
      wheels,
      looseCargo,
      type: cfg.type,
      lane: cfg.lane || 0,
      baseSpeed: cfg.speed || 15,
      initZ: cfg.initZ || 0,
      floatPhase: {
        liftSpeed: 0.40 + Math.random() * 0.40,
        rotSpeed: new THREE.Vector3(
          (Math.random() - 0.5) * 0.7,
          (Math.random() - 0.5) * 0.6,
          (Math.random() - 0.5) * 0.8
        ),
        lateralDrift: (Math.random() - 0.5) * 0.35
      }
    };
  }

  // --- 2. HIGHWAY OVERHEAD GANTRY SIGN & SAILBOAT IN BAY ---
  function buildBridgeDecorations(registerFn, mats) {
    const decorGroup = new THREE.Group();

    // A. Overhead Highway Gantry Sign at z = -15m
    const gantryGroup = new THREE.Group();
    gantryGroup.position.set(0, 0, -15);

    const trussMat = new THREE.MeshLambertMaterial({ color: 0x475569, flatShading: true });
    const signGreenMat = new THREE.MeshLambertMaterial({ color: 0x15803d, flatShading: true });
    const textWhiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    // Left and Right Gantry Legs
    const legGeo = createPrism(0.4, 7.5, 0.4);
    const legL = registerFn(new THREE.Mesh(legGeo, trussMat), trussMat, { edgeThreshold: 10 });
    legL.position.set(7.8, 3.75, 0);
    gantryGroup.add(legL);
    const legR = registerFn(new THREE.Mesh(legGeo, trussMat), trussMat, { edgeThreshold: 10 });
    legR.position.set(-7.8, 3.75, 0);
    gantryGroup.add(legR);

    // Cross-truss spanning road
    const spanGeo = createPrism(16.0, 0.6, 0.6);
    const spanMesh = registerFn(new THREE.Mesh(spanGeo, trussMat), trussMat, { edgeThreshold: 10 });
    spanMesh.position.y = 7.2;
    gantryGroup.add(spanMesh);

    // Green Freeway Directional Sign 1 (Northbound)
    const sign1 = registerFn(new THREE.Mesh(createPrism(4.2, 1.8, 0.12), signGreenMat), signGreenMat, { edgeThreshold: 10 });
    sign1.position.set(3.4, 6.2, 0.35);
    gantryGroup.add(sign1);

    // Green Freeway Sign 2 (Downtown / Speed Limit)
    const sign2 = registerFn(new THREE.Mesh(createPrism(3.6, 1.8, 0.12), signGreenMat), signGreenMat, { edgeThreshold: 10 });
    sign2.position.set(-3.2, 6.2, 0.35);
    gantryGroup.add(sign2);

    decorGroup.add(gantryGroup);

    // B. Low-Poly Sailboat Anchored in Ocean Bay (Lifting in Zero-G!)
    const boatGroup = new THREE.Group();
    boatGroup.position.set(38, -14, -25);

    const hullMat = new THREE.MeshLambertMaterial({ color: 0x0284c7, flatShading: true });
    const sailMat = new THREE.MeshLambertMaterial({ color: 0xf8fafc, flatShading: true, side: THREE.DoubleSide });
    const mastMat = new THREE.MeshLambertMaterial({ color: 0xd4d4d8, flatShading: true });

    // Sharp low-poly hull
    const hullGeo = createPrism(3.2, 1.4, 8.5);
    const hullMesh = registerFn(new THREE.Mesh(hullGeo, hullMat), hullMat, { edgeThreshold: 14 });
    hullMesh.position.y = 0.7;
    boatGroup.add(hullMesh);

    // 12m Tall Mast
    const mastGeo = new THREE.CylinderGeometry(0.12, 0.16, 12, 6);
    const mastMesh = registerFn(new THREE.Mesh(mastGeo, mastMat), mastMat, { edgeThreshold: 12 });
    mastMesh.position.set(0, 7.2, 0.5);
    boatGroup.add(mastMesh);

    // Mainsail (Triangular blade)
    const sailGeo = new THREE.BufferGeometry();
    const sailVerts = new Float32Array([
      0, 1.8, 0.4,
      0, 12.5, 0.4,
      0, 2.2, -4.2
    ]);
    sailGeo.setAttribute('position', new THREE.BufferAttribute(sailVerts, 3));
    sailGeo.computeVertexNormals();
    const sailMesh = registerFn(new THREE.Mesh(sailGeo, sailMat), sailMat, { edgeThreshold: 10 });
    boatGroup.add(sailMesh);

    decorGroup.add(boatGroup);

    return {
      decorGroup,
      gantryGroup,
      boatGroup
    };
  }

  // --- 3. CREATIVE DRIVER COCKPIT POV ---
  function buildCreativeCockpitPOV(registerFn, mats) {
    const cockpitGroup = new THREE.Group();

    // Wireframe Dashboard & Windshield Frame
    const dashMat = new THREE.MeshLambertMaterial({ color: 0x1e293b, flatShading: true });
    const dashGeo = new THREE.BoxGeometry(1.8, 0.35, 0.85);
    const dashMesh = registerFn(new THREE.Mesh(dashGeo, dashMat), dashMat, { edgeThreshold: 14, isHandSleeve: true });
    dashMesh.position.set(0, -0.48, -0.75);
    cockpitGroup.add(dashMesh);

    // Illuminated Digital Speedometer Screen reading "0 MPH | ZERO-G"
    const screenMat = new THREE.MeshBasicMaterial({ color: 0x0284c7 });
    const screenMesh = registerFn(new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.16, 0.02), screenMat), screenMat, { edgeThreshold: 8 });
    screenMesh.position.set(-0.10, -0.28, -0.68);
    cockpitGroup.add(screenMesh);

    // Windshield A-Pillars
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

    // Rearview Mirror with Hanging Fuzzy Dice swaying in Zero-G!
    const mirror = registerFn(new THREE.Mesh(createPrism(0.28, 0.09, 0.04), pillarMat), pillarMat, { edgeThreshold: 10 });
    mirror.position.set(0, 0.42, -0.65);
    cockpitGroup.add(mirror);

    const diceGroup = new THREE.Group();
    diceGroup.position.set(0, 0.32, -0.62);
    const diceMat = new THREE.MeshLambertMaterial({ color: 0xef4444, flatShading: true });
    const d1 = registerFn(new THREE.Mesh(createPrism(0.065, 0.065, 0.065), diceMat), diceMat, { edgeThreshold: 8 });
    d1.position.set(-0.04, -0.05, 0);
    diceGroup.add(d1);
    const d2 = registerFn(new THREE.Mesh(createPrism(0.065, 0.065, 0.065), diceMat), diceMat, { edgeThreshold: 8 });
    d2.position.set(0.04, -0.08, 0.02);
    diceGroup.add(d2);
    cockpitGroup.add(diceGroup);

    // Detached Floating Steering Wheel (Tumbling in Zero-G)
    const wheelTorusGeo = new THREE.TorusGeometry(0.18, 0.028, 6, 14);
    const stWheelMat = new THREE.MeshLambertMaterial({ color: 0x334155, flatShading: true });
    const stWheelMesh = registerFn(new THREE.Mesh(wheelTorusGeo, stWheelMat), stWheelMat, { edgeThreshold: 14 });
    const stWheelGroup = new THREE.Group();
    stWheelGroup.position.set(-0.10, 0.04, -0.58);
    stWheelGroup.add(stWheelMesh);

    for (let sp = 0; sp < 3; sp++) {
      const spGeo = new THREE.BoxGeometry(0.03, 0.17, 0.02);
      const spMesh = registerFn(new THREE.Mesh(spGeo, stWheelMat), stWheelMat, { edgeThreshold: 10 });
      spMesh.rotation.z = sp * (Math.PI * 2 / 3);
      spMesh.position.y = -0.07 * Math.cos(spMesh.rotation.z);
      spMesh.position.x = 0.07 * Math.sin(spMesh.rotation.z);
      stWheelGroup.add(spMesh);
    }
    cockpitGroup.add(stWheelGroup);

    // Tumbling Coffee Cup & Floating Spherical Liquid Droplets!
    const cupGroup = new THREE.Group();
    cupGroup.position.set(0.15, 0.08, -0.52);
    const cupGeo = new THREE.CylinderGeometry(0.048, 0.036, 0.13, 8);
    const cupMat = new THREE.MeshLambertMaterial({ color: 0xf1f5f9, flatShading: true });
    const cupMesh = registerFn(new THREE.Mesh(cupGeo, cupMat), cupMat, { edgeThreshold: 12 });
    cupGroup.add(cupMesh);

    // Floating spherical liquid globules (surface tension in zero gravity!)
    const liquidMat = new THREE.MeshLambertMaterial({ color: 0x451a03, transparent: true, opacity: 0.88 });
    const liquidDroplets = [];
    for (let d = 0; d < 4; d++) {
      const dropMesh = registerFn(new THREE.Mesh(new THREE.SphereGeometry(0.015 + d * 0.005, 6, 5), liquidMat), liquidMat, { edgeThreshold: 8 });
      dropMesh.position.set((Math.random() - 0.5) * 0.08, 0.10 + d * 0.04, (Math.random() - 0.5) * 0.08);
      cupGroup.add(dropMesh);
      liquidDroplets.push(dropMesh);
    }
    cockpitGroup.add(cupGroup);

    // Tumbling Floating Smartphone / Keys
    const phoneGroup = new THREE.Group();
    phoneGroup.position.set(-0.02, 0.22, -0.48);
    const phoneGeo = new THREE.BoxGeometry(0.07, 0.13, 0.012);
    const phoneMat = new THREE.MeshLambertMaterial({ color: 0x0284c7, flatShading: true });
    const phoneMesh = registerFn(new THREE.Mesh(phoneGeo, phoneMat), phoneMat, { edgeThreshold: 10 });
    phoneGroup.add(phoneMesh);
    cockpitGroup.add(phoneGroup);

    // Left and Right Hands reaching forward
    const handsGroup = new THREE.Group();
    const handMat = new THREE.MeshLambertMaterial({ color: 0xc89369, flatShading: true });

    const handLGroup = new THREE.Group();
    handLGroup.position.set(-0.13, -0.22, -0.42);
    const palmL = registerFn(new THREE.Mesh(createPrism(0.09, 0.035, 0.11), handMat), handMat, { edgeThreshold: 12, isHand: true });
    handLGroup.add(palmL);
    for (let f = 0; f < 4; f++) {
      const fMesh = registerFn(new THREE.Mesh(createPrism(0.018, 0.020, 0.07), handMat), handMat, { edgeThreshold: 10, isHand: true });
      fMesh.position.set(-0.032 + f * 0.021, 0.010, -0.08);
      fMesh.rotation.x = -0.25 + f * 0.05;
      handLGroup.add(fMesh);
    }
    handsGroup.add(handLGroup);

    const handRGroup = new THREE.Group();
    handRGroup.position.set(0.13, -0.20, -0.42);
    const palmR = registerFn(new THREE.Mesh(createPrism(0.09, 0.035, 0.11), handMat), handMat, { edgeThreshold: 12, isHand: true });
    handRGroup.add(palmR);
    for (let f = 0; f < 4; f++) {
      const fMesh = registerFn(new THREE.Mesh(createPrism(0.018, 0.020, 0.07), handMat), handMat, { edgeThreshold: 10, isHand: true });
      fMesh.position.set(-0.032 + f * 0.021, 0.012, -0.08);
      fMesh.rotation.x = -0.30 + f * 0.05;
      handRGroup.add(fMesh);
    }
    handsGroup.add(handRGroup);

    cockpitGroup.add(handsGroup);

    return {
      cockpitGroup,
      stWheelGroup,
      diceGroup,
      cupGroup,
      phoneGroup,
      handLGroup,
      handRGroup
    };
  }

  // --- 4. BESPOKE PLANETARY SPACE SCENE (ISS, Continental Earth, Moon Tangent Break) ---
  function buildSpaceGravityWorld(scene, cinematicEarthTex, cosmicNebulaTex, moonTex, sRand, dotSpriteTex) {
    const spaceGroup = new THREE.Group();
    scene.add(spaceGroup);
    spaceGroup.visible = false;

    // A. Cosmic Nebula Celestial Sphere (Disabled in favor of crisp 3,500-star deep space system)
    // const skyDome = new THREE.Mesh(skyDomeGeo, skyDomeMat);
    // spaceGroup.add(skyDome);

    // B. High-Detail Stylized Earth Sphere (Continents, Oceans, Clouds, Night Lights)
    const earthGeo = new THREE.SphereGeometry(3.6, 64, 64);
    const earthMat = new THREE.MeshLambertMaterial({
      map: cinematicEarthTex,
      flatShading: false
    });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    earthMesh.rotation.z = 0.41; // 23.5 degree axial tilt
    spaceGroup.add(earthMesh);

    // C. Ethereal Atmospheric Rim Glow Sprite (feathers seamlessly into cosmic void)
    const atmoSpriteMat = new THREE.SpriteMaterial({
      map: dotSpriteTex,
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const atmoShell = new THREE.Sprite(atmoSpriteMat);
    atmoShell.scale.set(9.5, 9.5, 1);
    earthMesh.add(atmoShell);

    // D. Escaping Atmospheric Plume Particles (Boiling off in Zero-G)
    const plumeCount = 1800;
    const plumeGeo = new THREE.BufferGeometry();
    const plumePos = new Float32Array(plumeCount * 3);
    const plumeVels = new Float32Array(plumeCount * 3);

    for (let i = 0; i < plumeCount; i++) {
      const theta = sRand() * Math.PI * 2;
      const phi = (sRand() - 0.5) * Math.PI;
      const r = 3.65 + sRand() * 0.4;
      const i3 = i * 3;
      const nx = Math.cos(phi) * Math.cos(theta);
      const ny = Math.sin(phi);
      const nz = Math.cos(phi) * Math.sin(theta);
      plumePos[i3] = nx * r;
      plumePos[i3 + 1] = ny * r;
      plumePos[i3 + 2] = nz * r;

      plumeVels[i3] = nx * (0.8 + sRand() * 1.5);
      plumeVels[i3 + 1] = ny * (0.8 + sRand() * 1.5);
      plumeVels[i3 + 2] = nz * (0.8 + sRand() * 1.5);
    }
    plumeGeo.setAttribute('position', new THREE.BufferAttribute(plumePos, 3));
    const plumeInitPos = new Float32Array(plumePos);
    const plumeMat = new THREE.PointsMaterial({
      map: dotSpriteTex,
      color: 0x7dd3fc,
      size: 0.28,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const plumePoints = new THREE.Points(plumeGeo, plumeMat);
    spaceGroup.add(plumePoints);

    // E. Cratered Moon
    const moonGeo = new THREE.SphereGeometry(1.0, 32, 32);
    const moonMatMesh = new THREE.MeshLambertMaterial({
      map: moonTex,
      flatShading: true
    });
    const moonMesh = new THREE.Mesh(moonGeo, moonMatMesh);
    spaceGroup.add(moonMesh);

    // F. Snapping Elliptical Orbit Line & Glowing Newton Tangent Vector Line
    const orbitPts = [];
    for (let a = 0; a <= Math.PI * 2; a += 0.08) {
      orbitPts.push(new THREE.Vector3(Math.cos(a) * 6.2, 0.8 + Math.sin(a * 0.4) * 1.6, Math.sin(a) * 6.2));
    }
    const orbitGeo = new THREE.BufferGeometry().setFromPoints(orbitPts);
    const orbitLineMat = new THREE.LineDashedMaterial({
      color: 0x38bdf8,
      dashSize: 0.6,
      gapSize: 0.4,
      transparent: true,
      opacity: 0.85
    });
    const orbitLine = new THREE.Line(orbitGeo, orbitLineMat);
    orbitLine.computeLineDistances();
    spaceGroup.add(orbitLine);

    // Tangent Laser Vector Line
    const tangentPts = [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(18.0, 4.5, -28.0)
    ];
    const tangentGeo = new THREE.BufferGeometry().setFromPoints(tangentPts);
    const tangentMat = new THREE.LineBasicMaterial({
      color: 0xfacc15,
      linewidth: 2,
      transparent: true,
      opacity: 0.95
    });
    const tangentLine = new THREE.Line(tangentGeo, tangentMat);
    tangentLine.visible = false;
    spaceGroup.add(tangentLine);

    // G. Low-Poly 3D International Space Station (ISS) tumbling away!
    const issGroup = new THREE.Group();
    issGroup.position.set(4.2, 1.8, 1.2);
    const issMat = new THREE.MeshLambertMaterial({ color: 0xe2e8f0, flatShading: true });
    const solarMat = new THREE.MeshLambertMaterial({ color: 0x1d4ed8, flatShading: true });

    // Main pressurized truss & modules
    const issTruss = new THREE.Mesh(createPrism(1.8, 0.12, 0.12), issMat);
    issGroup.add(issTruss);
    const issModule = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.75, 8), issMat);
    issModule.rotateZ(Math.PI / 2);
    issGroup.add(issModule);

    // 4 Solar panel wings (Blue/Gold arrays)
    [-0.7, 0.7].forEach(sx => {
      const p1 = new THREE.Mesh(createPrism(0.4, 0.02, 0.9), solarMat);
      p1.position.set(sx, 0.45, 0);
      issGroup.add(p1);
      const p2 = new THREE.Mesh(createPrism(0.4, 0.02, 0.9), solarMat);
      p2.position.set(sx, -0.45, 0);
      issGroup.add(p2);
    });
    issGroup.scale.set(0.65, 0.65, 0.65);
    spaceGroup.add(issGroup);

    return {
      spaceGroup,
      earthMesh,
      atmoShell,
      plumePoints,
      plumeGeo,
      plumePos,
      plumeInitPos,
      plumeVels,
      moonMesh,
      orbitLine,
      tangentLine,
      issGroup
    };
  }

  // ===========================================================================
  // MASTER BUILD FUNCTION
  // ===========================================================================
  function buildGravityWorld(scene, registerFn, mats, textures, sRand, dotSpriteTex) {
    const gravityWorld = new THREE.Group();
    scene.add(gravityWorld);

    // 1. Suspension Bridge Highway Base
    const bridgeGeo = new THREE.BoxGeometry(16, 1.2, 260);
    const roadMat = new THREE.MeshLambertMaterial({ color: 0x22262c, flatShading: true });
    const bridgeDeck = registerFn(new THREE.Mesh(bridgeGeo, roadMat), roadMat, { edgeThreshold: 15 });
    bridgeDeck.receiveShadow = true;
    gravityWorld.add(bridgeDeck);

    // Dividers & Guardrails
    const barrierMat = new THREE.MeshLambertMaterial({ color: 0x94a3b8, flatShading: true });
    const barMid = registerFn(new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.9, 260), barrierMat), barrierMat, { edgeThreshold: 14 });
    barMid.position.y = 0.75;
    gravityWorld.add(barMid);

    const railL = registerFn(new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.1, 260), barrierMat), barrierMat, { edgeThreshold: 14 });
    railL.position.set(7.8, 0.85, 0);
    gravityWorld.add(railL);
    const railR = registerFn(new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.1, 260), barrierMat), barrierMat, { edgeThreshold: 14 });
    railR.position.set(-7.8, 0.85, 0);
    gravityWorld.add(railR);

    // Road dashed stripes
    const stripeMat = new THREE.MeshBasicMaterial({ color: 0xf8fafc });
    const stripeGeo = new THREE.PlaneGeometry(0.22, 2.8);
    stripeGeo.rotateX(-Math.PI / 2);
    for (let z = -120; z <= 120; z += 5.5) {
      const st1 = registerFn(new THREE.Mesh(stripeGeo, stripeMat), stripeMat, { edgeThreshold: 10 });
      st1.position.set(3.8, 0.61, z);
      gravityWorld.add(st1);
      const st2 = registerFn(new THREE.Mesh(stripeGeo, stripeMat), stripeMat, { edgeThreshold: 10 });
      st2.position.set(-3.8, 0.61, z);
      gravityWorld.add(st2);
    }

    // Two Golden-Gate Suspension Towers (58m high)
    const towerMat = new THREE.MeshLambertMaterial({ color: 0xc2410c, flatShading: true });
    [-40, 40].forEach(tz => {
      const tg = new THREE.Group();
      tg.position.set(0, 0, tz);

      const colL = registerFn(new THREE.Mesh(new THREE.BoxGeometry(2.4, 58, 2.8), towerMat), towerMat, { edgeThreshold: 12 });
      colL.position.set(8.8, 24, 0);
      tg.add(colL);
      const colR = registerFn(new THREE.Mesh(new THREE.BoxGeometry(2.4, 58, 2.8), towerMat), towerMat, { edgeThreshold: 12 });
      colR.position.set(-8.8, 24, 0);
      tg.add(colR);

      [14, 32, 50].forEach(cy => {
        const beam = registerFn(new THREE.Mesh(new THREE.BoxGeometry(20, 2.2, 2.4), towerMat), towerMat, { edgeThreshold: 12 });
        beam.position.set(0, cy, 0);
        tg.add(beam);
      });
      gravityWorld.add(tg);
    });

    // Main Suspension Cables + Vertical Suspenders
    const cableMat = new THREE.MeshBasicMaterial({ color: 0xe2e8f0 });
    for (let z = -120; z <= 120; z += 4) {
      let sagY = 50 - 36 * Math.sin(Math.min(1, Math.max(0, (z + 40) / 80)) * Math.PI);
      if (z < -40) sagY = 50 - ((z + 40) / -80) * 35;
      if (z > 40) sagY = 50 - ((z - 40) / 80) * 35;

      const suspL = registerFn(new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, Math.max(0.5, sagY - 1.2), 4), cableMat), cableMat, { edgeThreshold: 16 });
      suspL.position.set(8.8, (sagY + 1.2) * 0.5, z);
      gravityWorld.add(suspL);
      const suspR = registerFn(new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, Math.max(0.5, sagY - 1.2), 4), cableMat), cableMat, { edgeThreshold: 16 });
      suspR.position.set(-8.8, (sagY + 1.2) * 0.5, z);
      gravityWorld.add(suspR);
    }

    // Streetlamps
    const lampMat = new THREE.MeshLambertMaterial({ color: 0x475569, flatShading: true });
    const bulbMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    for (let z = -110; z <= 110; z += 18) {
      const pl = registerFn(new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.10, 5.5, 6), lampMat), lampMat, { edgeThreshold: 12 });
      pl.position.set(0, 3.5, z);
      gravityWorld.add(pl);
      const arm = registerFn(new THREE.Mesh(createPrism(2.4, 0.08, 0.08), lampMat), lampMat, { edgeThreshold: 10 });
      arm.position.set(0, 6.15, z);
      gravityWorld.add(arm);
      const bL = registerFn(new THREE.Mesh(new THREE.SphereGeometry(0.15, 6, 4), bulbMat), bulbMat, { edgeThreshold: 8 });
      bL.position.set(1.1, 6.0, z);
      gravityWorld.add(bL);
      const bR = registerFn(new THREE.Mesh(new THREE.SphereGeometry(0.15, 6, 4), bulbMat), bulbMat, { edgeThreshold: 8 });
      bR.position.set(-1.1, 6.0, z);
      gravityWorld.add(bR);
    }

    // Ocean Bay Surface underneath
    const waterGeo = new THREE.PlaneGeometry(320, 320, 24, 24);
    waterGeo.rotateX(-Math.PI / 2);
    const waterMat = new THREE.MeshLambertMaterial({
      color: 0x0c2540,
      flatShading: true,
      transparent: true,
      opacity: 0.92
    });
    const waterMesh = registerFn(new THREE.Mesh(waterGeo, waterMat), waterMat, { edgeThreshold: 18 });
    waterMesh.position.set(0, -14, 0);
    gravityWorld.add(waterMesh);

    // 2. Creative Infrastructure: Highway Overhead Gantry Sign & Sailboat in Bay
    const bridgeDecor = buildBridgeDecorations(registerFn, mats);
    gravityWorld.add(bridgeDecor.decorGroup);

    // 3. 10 Highly Diverse & Creative Vehicles
    const vehicleConfigs = [
      { type: 'double_decker_bus', color: 0x0284c7, lane: -2.2, speed: 14, initZ: -75 },
      { type: 'muscle_car', color: 0xdc2626, lane: 5.8, speed: 25, initZ: -95 },
      { type: 'station_wagon', color: 0xd97706, lane: 2.2, speed: 17, initZ: -45 },
      { type: 'food_truck', color: 0x10b981, lane: -5.8, speed: 15, initZ: -30 },
      { type: 'construction_truck', color: 0xeab308, lane: 2.2, speed: 13, initZ: -10 },
      { type: 'taxi', color: 0xfacc15, lane: -2.2, speed: 18, initZ: 15 },
      { type: 'sports_car', color: 0x64748b, lane: 5.8, speed: 23, initZ: 40 },
      { type: 'sedan', color: 0x7c3aed, lane: -5.8, speed: 19, initZ: 65 }
    ];

    const vehicles = vehicleConfigs.map(cfg => {
      const v = buildVehicle(cfg, registerFn, mats);
      v.group.position.set(cfg.lane, 0, cfg.initZ);
      gravityWorld.add(v.group);
      return v;
    });

    // 4. Creative Cockpit POV with Digital Speedometer, Fuzzy Dice & Liquid Droplets
    const cockpit = buildCreativeCockpitPOV(registerFn, mats);
    gravityWorld.add(cockpit.cockpitGroup);
    cockpit.cockpitGroup.visible = false;

    // 5. Ocean Water Spires
    const spiresGroup = new THREE.Group();
    const spireMat = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0.85 });
    const spires = [];
    for (let i = 0; i < 18; i++) {
      const h = 8 + (i % 5) * 6;
      const geo = new THREE.ConeGeometry(1.2 + (i % 4) * 0.8, h, 6, 4, true);
      geo.rotateX(Math.PI);
      const mesh = registerFn(new THREE.Mesh(geo, spireMat), spireMat, { edgeThreshold: 10 });
      const angle = (i / 18) * Math.PI * 2;
      const dist = 18 + (i % 6) * 12;
      mesh.position.set(Math.cos(angle) * dist, -14, Math.sin(angle) * dist * 1.8);
      spiresGroup.add(mesh);
      spires.push({ mesh, baseY: -14, maxRise: 28 + (i % 4) * 12, speed: 0.65 + (i % 5) * 0.2 });
    }
    gravityWorld.add(spiresGroup);
    spiresGroup.visible = false;

    // 6. Bespoke Planetary Space Scene (ISS, Continental Earth, Moon Tangent Break)
    const cinematicEarthTex = textures.cinematicEarthTex || textures.groundXrayTex;
    const cosmicNebulaTex = textures.cosmicNebulaTex || textures.groundXrayTex;
    const moonTex = textures.moonTex || textures.groundXrayTex;
    const spaceGravity = buildSpaceGravityWorld(scene, cinematicEarthTex, cosmicNebulaTex, moonTex, sRand, dotSpriteTex);

    // 7. 120,000 LiDAR Point Cloud for Bridge Ground Slam
    const LIDAR_COUNT = 120000;
    const lidarWorld = new THREE.Group();
    scene.add(lidarWorld);
    lidarWorld.visible = false;

    const lidarGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(LIDAR_COUNT * 3);
    const basePositions = new Float32Array(LIDAR_COUNT * 3);
    const velocitiesX = new Float32Array(LIDAR_COUNT);
    const velocitiesY = new Float32Array(LIDAR_COUNT);
    const velocitiesZ = new Float32Array(LIDAR_COUNT);
    const originalElevations = new Float32Array(LIDAR_COUNT);

    let pIdx = 0;
    // Deck & roadway (45k points)
    for (let i = 0; i < 45000; i++) {
      const rx = (sRand() - 0.5) * 16;
      const rz = (sRand() - 0.5) * 220;
      const ry = (Math.abs(rx) > 7.4) ? sRand() * 1.2 : sRand() * 0.15;
      const i3 = pIdx * 3;
      basePositions[i3] = rx; basePositions[i3 + 1] = ry; basePositions[i3 + 2] = rz;
      originalElevations[pIdx] = ry;
      velocitiesX[pIdx] = (sRand() - 0.5) * 14; velocitiesY[pIdx] = 6 + sRand() * 22; velocitiesZ[pIdx] = (sRand() - 0.5) * 14;
      pIdx++;
    }
    // Towers & Cables (40k points)
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
        rz = (sRand() - 0.5) * 200;
        const colSide = sRand() > 0.5 ? 8.8 : -8.8;
        rx = colSide + (sRand() - 0.5) * 0.4;
        ry = 50 - 36 * Math.sin(Math.min(1, Math.max(0, (rz + 40) / 80)) * Math.PI);
        if (rz < -40) ry = 50 - ((rz + 40) / -80) * 35;
        if (rz > 40) ry = 50 - ((rz - 40) / 80) * 35;
      }
      const i3 = pIdx * 3;
      basePositions[i3] = rx; basePositions[i3 + 1] = ry; basePositions[i3 + 2] = rz;
      originalElevations[pIdx] = ry;
      velocitiesX[pIdx] = (sRand() - 0.5) * 18; velocitiesY[pIdx] = 8 + sRand() * 24; velocitiesZ[pIdx] = (sRand() - 0.5) * 18;
      pIdx++;
    }
    // Suspended vehicles, gantry sign & water (35k points)
    for (let i = 0; i < 35000; i++) {
      const rx = (sRand() - 0.5) * 28;
      const ry = 8 + sRand() * 32;
      const rz = (sRand() - 0.5) * 160;
      const i3 = pIdx * 3;
      basePositions[i3] = rx; basePositions[i3 + 1] = ry; basePositions[i3 + 2] = rz;
      originalElevations[pIdx] = ry;
      velocitiesX[pIdx] = (sRand() - 0.5) * 32; velocitiesY[pIdx] = 4 + sRand() * 36; velocitiesZ[pIdx] = (sRand() - 0.5) * 32;
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
    lidarWorld.add(new THREE.Points(lidarGeo, lidarMat));

    return {
      gravityWorld,
      bridgeDeck,
      bridgeDecor,
      vehicles,
      cockpit,
      waterSpires: { spiresGroup, spires },
      spaceGravity,
      lidarData: {
        lidarWorld,
        lidarGeo,
        lidarCount: LIDAR_COUNT,
        basePositions,
        velocitiesX,
        velocitiesY,
        velocitiesZ,
        originalElevations
      }
    };
  }

  return {
    buildGravityWorld
  };

})();
