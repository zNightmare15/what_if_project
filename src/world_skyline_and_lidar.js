// Central Park South / Midtown Manhattan Skyline & Surface-Sampled LiDAR Point Cloud
// Calibrated 1:1 to @man_ia_c reference frames (frame_002..013, frame_019, frame_021, frame_033..036)

window.WorldSkylineAndLidar = (function() {

  function createBoxWithScaledUVs(w, h, d, uvScaleX = 0.20, uvScaleY = 0.095) {
    const geo = new THREE.BoxGeometry(w, h, d);
    const uv = geo.attributes.uv;
    for (let i = 0; i < uv.count; i++) {
      uv.setXY(i, uv.getX(i) * w * uvScaleX, uv.getY(i) * h * uvScaleY);
    }
    return geo;
  }

  function buildManhattanSkyline(parkWorld, mats, registerFn) {
    const skylineGroup = new THREE.Group();
    parkWorld.add(skylineGroup);

    // Calibrated to match the exact silhouette & open sky gaps of frame_002, frame_004, frame_005, frame_007, frame_013, frame_019:
    const towerDefs = [
      // Far-left mid-rise & stepped towers (seen when camera pans left in frame_007, frame_012, frame_019)
      { x: -38, z: -42, w: 5.5, d: 4.5, h: 15, style: 'midrise', mat: mats.bCool },
      { x: -31, z: -40, w: 6.2, d: 4.8, h: 17, style: 'setback2', mat: mats.bWarm },
      { x: -24, z: -39, w: 5.8, d: 4.5, h: 14, style: 'midrise', mat: mats.bCool },
      { x: -18, z: -41, w: 5.2, d: 4.5, h: 16, style: 'midrise', mat: mats.bDark },

      // Center-Main Iconic Central Park South Skyline (seen in frame_002, frame_004, frame_005, frame_013, frame_021):
      // 1. Left stepped tower
      { x: -12.5, z: -44, w: 5.0, d: 4.8, h: 27, style: 'setback3', mat: mats.bCool },
      // 2. Iconic 111 West 57th Slender Needle Taper Tower (left-center in frame_004, frame_005, frame_013!)
      { x:  -6.2, z: -43, w: 4.2, d: 4.2, h: 34, style: 'needle_taper', mat: mats.bWarm },
      //Low connecting building at base
      { x:  -3.2, z: -41, w: 4.5, d: 4.0, h: 11, style: 'midrise', mat: mats.bCool },
      // 3. Tall Dark Center Supertall (Central Park Tower in frame_002, frame_005, frame_013!)
      { x:   0.2, z: -44, w: 4.6, d: 4.6, h: 38, style: 'supertall', mat: mats.bDark },
      // Mid-rise stepped tower in front-center
      { x:   2.8, z: -39, w: 3.8, d: 3.8, h: 15, style: 'setback2', mat: mats.bCool },
      // Warm brown-red mid-rise building on right-center (visible in frame_002!)
      { x:   6.4, z: -40, w: 4.0, d: 3.8, h: 14, style: 'setback2', mat: mats.bRedBrick },
      // 4. Twin Stepped Towers on Right (visible in frame_002, frame_005, frame_013!)
      { x:   9.8, z: -44, w: 5.4, d: 5.0, h: 33, style: 'setback4', mat: mats.bCool },
      { x:  15.6, z: -44, w: 5.4, d: 5.0, h: 33, style: 'setback4', mat: mats.bWarm },

      // Far-right skyline continuation
      { x:  22.5, z: -43, w: 5.8, d: 4.8, h: 22, style: 'setback3', mat: mats.bDark },
      { x:  29.5, z: -44, w: 6.0, d: 5.0, h: 28, style: 'setback4', mat: mats.bCool },
      { x:  37.0, z: -44, w: 5.5, d: 4.8, h: 24, style: 'setback3', mat: mats.bWarm }
    ];

    towerDefs.forEach((t) => {
      const bGroup = new THREE.Group();
      bGroup.position.set(t.x, 0, t.z);

      function addTier(w, h, d, yCenter) {
        const geo = createBoxWithScaledUVs(w, h, d, 0.22, 0.10);
        const m = registerFn(new THREE.Mesh(geo, t.mat), t.mat, { isBuilding: true, edgeThreshold: 15 });
        m.position.y = yCenter;
        bGroup.add(m);
      }

      if (t.style === 'midrise') {
        addTier(t.w, t.h, t.d, t.h * 0.5);
      } else if (t.style === 'setback2') {
        const h1 = t.h * 0.72, h2 = t.h * 0.28;
        addTier(t.w, h1, t.d, h1 * 0.5);
        addTier(t.w * 0.74, h2, t.d * 0.74, h1 + h2 * 0.5);
      } else if (t.style === 'setback3') {
        const h1 = t.h * 0.52, h2 = t.h * 0.28, h3 = t.h * 0.20;
        addTier(t.w, h1, t.d, h1 * 0.5);
        addTier(t.w * 0.78, h2, t.d * 0.78, h1 + h2 * 0.5);
        addTier(t.w * 0.56, h3, t.d * 0.56, h1 + h2 + h3 * 0.5);
      } else if (t.style === 'setback4') {
        const h1 = t.h * 0.44, h2 = t.h * 0.24, h3 = t.h * 0.18, h4 = t.h * 0.14;
        addTier(t.w, h1, t.d, h1 * 0.5);
        addTier(t.w * 0.84, h2, t.d * 0.84, h1 + h2 * 0.5);
        addTier(t.w * 0.68, h3, t.d * 0.68, h1 + h2 + h3 * 0.5);
        addTier(t.w * 0.52, h4, t.d * 0.52, h1 + h2 + h3 + h4 * 0.5);
      } else if (t.style === 'needle_taper') {
        let curY = 0;
        const baseH = t.h * 0.34;
        addTier(t.w, baseH, t.d, baseH * 0.5);
        curY += baseH;
        const steps = 6;
        const remH = t.h - baseH;
        for (let s = 0; s < steps; s++) {
          const sh = remH / steps;
          const frac = 1.0 - (s + 1) * 0.135;
          addTier(t.w * frac, sh, t.d * frac, curY + sh * 0.5);
          curY += sh;
        }
      } else if (t.style === 'supertall') {
        const h1 = t.h * 0.38, h2 = t.h * 0.34, h3 = t.h * 0.28;
        addTier(t.w, h1, t.d, h1 * 0.5);
        addTier(t.w * 0.86, h2, t.d * 0.86, h1 + h2 * 0.5);
        addTier(t.w * 0.74, h3, t.d * 0.74, h1 + h2 + h3 * 0.5);
      }

      skylineGroup.add(bGroup);
    });

    return { skylineGroup, towerDefs };
  }

  // Build 1:1 Surface-Sampled LiDAR Point Cloud World (matching frame_033, frame_035, frame_036)
  function buildLidarWorld(scene, parkWorld, allRegisteredObjects, dotSpriteTex, sRand) {
    const lidarWorld = new THREE.Group();
    lidarWorld.visible = false;
    scene.add(lidarWorld);

    // Pure pitch-black floor (#000000) so there is zero horizon seam or neon tint during the LiDAR & explosion shots
    const lidarFloorGeo = new THREE.PlaneGeometry(180, 38);
    lidarFloorGeo.rotateX(-Math.PI / 2);
    const lidarFloorMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const lidarFloor = new THREE.Mesh(lidarFloorGeo, lidarFloorMat);
    lidarFloor.position.set(0, -0.02, -7.5);
    lidarWorld.add(lidarFloor);

    parkWorld.updateMatrixWorld(true);

    const lidarCount = 115000;
    const lidarGeo = new THREE.BufferGeometry();
    const lidarBasePos = new Float32Array(lidarCount * 3);
    const lidarCurPos = new Float32Array(lidarCount * 3);
    const lidarVelX = new Float32Array(lidarCount);
    const lidarVelY = new Float32Array(lidarCount);
    const lidarVelZ = new Float32Array(lidarCount);
    const lidarColors = new Float32Array(lidarCount * 3);

    let ptIdx = 0;
    const vA = new THREE.Vector3();
    const vB = new THREE.Vector3();
    const vC = new THREE.Vector3();
    const vP = new THREE.Vector3();

    function addPoint(x, y, z, r, g, b, velScale = 1.0) {
      if (ptIdx >= lidarCount) return;
      const i3 = ptIdx * 3;
      lidarBasePos[i3] = x;
      lidarBasePos[i3 + 1] = y;
      lidarBasePos[i3 + 2] = z;
      lidarColors[i3] = r;
      lidarColors[i3 + 1] = g;
      lidarColors[i3 + 2] = b;

      // Violent 3D radial + vertical blast velocity vector from park epicenter (0, 0.5, -5.5)
      const dx = x - 0.0;
      const dz = z - (-5.5);
      const rDist = Math.max(0.4, Math.sqrt(dx * dx + dz * dz));
      // Multi-tier velocity distribution so particles violently shatter outward & upward across the full 3-second blast window
      const tier = Math.pow(sRand(), 1.6);
      const radialSpeed = (1.2 + tier * 9.5) * velScale;
      lidarVelX[ptIdx] = (dx / rDist) * radialSpeed + (sRand() - 0.5) * 3.8;
      lidarVelY[ptIdx] = (1.5 + tier * 12.5 + (sRand() - 0.3) * 2.5) * velScale;
      lidarVelZ[ptIdx] = (dz / rDist) * radialSpeed + (sRand() - 0.5) * 4.5;
      ptIdx++;
    }

    function sampleMeshSurface(mesh, numPoints, r, g, b, xzScale = 1.0, yScale = 1.0, yOffset = 0.0, jitter = 0.02) {
      const geom = mesh.geometry.isBufferGeometry ? mesh.geometry.toNonIndexed() : mesh.geometry;
      const posAttr = geom.attributes.position;
      const triCount = Math.floor(posAttr.count / 3);
      if (triCount === 0) return;

      for (let i = 0; i < numPoints && ptIdx < lidarCount; i++) {
        const tIdx = Math.floor(sRand() * triCount) * 3;
        vA.fromBufferAttribute(posAttr, tIdx).applyMatrix4(mesh.matrixWorld);
        vB.fromBufferAttribute(posAttr, tIdx + 1).applyMatrix4(mesh.matrixWorld);
        vC.fromBufferAttribute(posAttr, tIdx + 2).applyMatrix4(mesh.matrixWorld);

        const mode = sRand();
        if (mode < 0.38) {
          const u = sRand();
          if (sRand() < 0.5) vP.lerpVectors(vA, vB, u);
          else vP.lerpVectors(vB, vC, u);
        } else {
          let r1 = sRand(), r2 = sRand();
          if (r1 + r2 > 1) { r1 = 1 - r1; r2 = 1 - r2; }
          const r3 = 1 - r1 - r2;
          vP.set(
            vA.x * r1 + vB.x * r2 + vC.x * r3,
            vA.y * r1 + vB.y * r2 + vC.y * r3,
            vA.z * r1 + vB.z * r2 + vC.z * r3
          );
        }

        const jx = (sRand() - 0.5) * jitter;
        const jy = (sRand() - 0.5) * jitter;
        const jz = (sRand() - 0.5) * jitter;
        addPoint(vP.x * xzScale + jx, vP.y * yScale + yOffset + jy, vP.z * xzScale + jz, r, g, b);
      }
    }

    // 1. Sample every human & dog mesh in Central Park (34,000 crisp pure-white dots -> recognizable ghostly silhouettes!)
    const personMeshes = allRegisteredObjects.filter(m => m.userData.isPerson);
    const ptsPerPersonMesh = Math.max(60, Math.floor(34000 / Math.max(1, personMeshes.length)));
    personMeshes.forEach(m => {
      sampleMeshSurface(m, ptsPerPersonMesh, 0.90, 0.92, 0.96, 1.0, 1.0, 0.0, 0.016);
    });

    // 2. Sample Manhattan skyscraper tiers (62,000 points + minimalist white wireframe edges!)
    const buildingMeshes = allRegisteredObjects.filter(m => m.userData.isBuilding);
    const ptsPerBuildingMesh = Math.max(400, Math.floor(62000 / Math.max(1, buildingMeshes.length)));

    const lidarWireGroup = new THREE.Group();
    const lidarEdgeMat = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.42
    });

    const bXZScale = 0.56;
    const bYScale = 0.62;
    buildingMeshes.forEach(m => {
      sampleMeshSurface(m, ptsPerBuildingMesh, 0.98, 0.99, 1.0, bXZScale, bYScale, 0.0, 0.03);

      const eGeo = new THREE.EdgesGeometry(m.geometry, 20);
      const eLine = new THREE.LineSegments(eGeo, lidarEdgeMat);
      const wp = m.getWorldPosition(new THREE.Vector3());
      eLine.position.set(wp.x * bXZScale, wp.y * bYScale, wp.z * bXZScale);
      eLine.scale.set(bXZScale, bYScale, bXZScale);
      lidarWireGroup.add(eLine);
    });
    lidarWorld.add(lidarWireGroup);

    // 3. Glowing horizontal city base horizon line & subtle ground dots (remaining ~19,000 points)
    while (ptIdx < lidarCount) {
      const isHorizon = sRand() < 0.78;
      if (isHorizon) {
        const hx = (sRand() - 0.5) * 32;
        const hy = Math.pow(sRand(), 2.2) * 1.65;
        const hz = -23.5 + (sRand() - 0.5) * 2.4;
        addPoint(hx, hy, hz, 1.0, 1.0, 1.0, 1.25);
      } else {
        const gx = (sRand() - 0.5) * 30;
        const gz = -22.0 + sRand() * 29;
        addPoint(gx, 0.02 + sRand() * 0.03, gz, 0.85, 0.88, 0.92, 1.15);
      }
    }

    lidarCurPos.set(lidarBasePos);
    lidarGeo.setAttribute('position', new THREE.BufferAttribute(lidarCurPos, 3));
    lidarGeo.setAttribute('color', new THREE.BufferAttribute(lidarColors, 3));

    // Crisp laser dots
    const lidarMat = new THREE.PointsMaterial({
      size: 0.068,
      map: dotSpriteTex,
      vertexColors: true,
      transparent: true,
      opacity: 0.94,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    const lidarPoints = new THREE.Points(lidarGeo, lidarMat);
    lidarWorld.add(lidarPoints);

    return {
      lidarWorld,
      lidarGeo,
      lidarBasePos,
      lidarVelX,
      lidarVelY,
      lidarVelZ,
      lidarCount,
      lidarWireGroup,
      lidarMat
    };
  }

  return {
    buildManhattanSkyline,
    buildLidarWorld
  };
})();
