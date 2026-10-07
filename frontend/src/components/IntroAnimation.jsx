import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import './IntroAnimation.css';
import {
  Truck,
  Package,
  Layers,
  BarChart3,
  ArrowRight,
  Boxes,
  CheckCircle2,
  ScanLine,
} from 'lucide-react';

const IntroAnimation = ({ onComplete }) => {
  const mountRef = useRef(null);
  const [phase, setPhase] = useState(1); // 1: Delivery Arrives, 2: Unloading, 3: Organizing, 4: Digital Inventory
  const [isExiting, setIsExiting] = useState(false);
  const [receivedCount, setReceivedCount] = useState(24);

  useEffect(() => {
    let animationFrameId;
    const container = mountRef.current;
    if (!container) return;

    // --- SCENE, CAMERA, RENDERER ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0e1420);
    scene.fog = new THREE.FogExp2(0x0e1420, 0.035);

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 7.5, 14.5);
    camera.lookAt(0, 1.2, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    // --- LIGHTING ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 1.8);
    sunLight.position.set(8, 16, 10);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 40;
    sunLight.shadow.camera.left = -14;
    sunLight.shadow.camera.right = 14;
    sunLight.shadow.camera.top = 14;
    sunLight.shadow.camera.bottom = -14;
    sunLight.shadow.bias = -0.0005;
    scene.add(sunLight);

    // Soft overhead industrial warehouse lights
    const bayLight = new THREE.PointLight(0x38bdf8, 2.5, 20);
    bayLight.position.set(-2, 8, 0);
    scene.add(bayLight);

    const rackLight = new THREE.PointLight(0xf59e0b, 1.8, 18);
    rackLight.position.set(4, 7, -2);
    scene.add(rackLight);

    // --- PROCEDURAL CARDBOARD TEXTURES ---
    const createCardboardTexture = (labelType = 1) => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');

      // Kraft brown cardboard background
      ctx.fillStyle = labelType === 1 ? '#c89966' : labelType === 2 ? '#b88958' : '#d2a677';
      ctx.fillRect(0, 0, 512, 512);

      // Fine fiber texture
      ctx.fillStyle = 'rgba(0,0,0,0.03)';
      for (let i = 0; i < 400; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        ctx.fillRect(x, y, Math.random() * 4 + 1, 1);
      }

      // Packaging tape line down the center
      ctx.fillStyle = 'rgba(255,255,255,0.18)';
      ctx.fillRect(230, 0, 52, 512);

      // Shipping label sticker
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(40, 260, 180, 200);
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 16px monospace';
      ctx.fillText('CORE-INVENTORY', 50, 290);
      ctx.font = '12px monospace';
      ctx.fillText(`SKU-80${labelType} / DEPT-${labelType}`, 50, 310);
      ctx.fillText('TRACK: #492-8819', 50, 330);

      // Barcode stripes
      ctx.fillStyle = '#0f172a';
      let bx = 50;
      while (bx < 200) {
        const bw = Math.random() > 0.5 ? 4 : 2;
        ctx.fillRect(bx, 350, bw, 60);
        bx += bw + (Math.random() > 0.5 ? 3 : 1);
      }

      // Handling icons
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 2;
      ctx.strokeRect(50, 420, 20, 20);
      ctx.font = 'bold 10px sans-serif';
      ctx.fillStyle = '#dc2626';
      ctx.fillText('FRAGILE', 75, 435);

      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      return texture;
    };

    const cardboardTex1 = createCardboardTexture(1);
    const cardboardTex2 = createCardboardTexture(2);
    const cardboardTex3 = createCardboardTexture(3);

    const cardboardMat1 = new THREE.MeshStandardMaterial({ map: cardboardTex1, roughness: 0.85, metalness: 0.05 });
    const cardboardMat2 = new THREE.MeshStandardMaterial({ map: cardboardTex2, roughness: 0.85, metalness: 0.05 });
    const cardboardMat3 = new THREE.MeshStandardMaterial({ map: cardboardTex3, roughness: 0.85, metalness: 0.05 });

    // --- POLISHED CONCRETE FLOOR WITH SAFETY MARKINGS ---
    const createFloorTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 1024;
      const ctx = canvas.getContext('2d');

      // Polished dark concrete
      ctx.fillStyle = '#1b2230';
      ctx.fillRect(0, 0, 1024, 1024);

      // Floor tiles/expansion grid
      ctx.strokeStyle = 'rgba(255,255,255,0.05)';
      ctx.lineWidth = 2;
      for (let i = 0; i < 1024; i += 128) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, 1024);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(1024, i);
        ctx.stroke();
      }

      // Yellow/Black diagonal safety hazard stripe
      const stripeY = 680;
      ctx.fillStyle = '#eab308';
      ctx.fillRect(100, stripeY, 824, 24);
      ctx.fillStyle = '#0f172a';
      for (let x = 100; x < 924; x += 32) {
        ctx.beginPath();
        ctx.moveTo(x, stripeY);
        ctx.lineTo(x + 16, stripeY);
        ctx.lineTo(x + 8, stripeY + 24);
        ctx.lineTo(x - 8, stripeY + 24);
        ctx.fill();
      }

      // Staging Area marking text
      ctx.fillStyle = 'rgba(234, 179, 8, 0.7)';
      ctx.font = 'bold 22px monospace';
      ctx.fillText('BAY 01 - RECEIVING & INVENTORY INTAKE', 140, stripeY - 14);

      const tex = new THREE.CanvasTexture(canvas);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(3, 3);
      return tex;
    };

    const floorGeo = new THREE.PlaneGeometry(60, 60);
    const floorMat = new THREE.MeshStandardMaterial({
      map: createFloorTexture(),
      roughness: 0.35,
      metalness: 0.2,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // --- WAREHOUSE STEEL STORAGE RACKS ---
    const rackGroup = new THREE.Group();
    const rackPillarMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.4, metalness: 0.6 }); // Industrial blue
    const rackBeamMat = new THREE.MeshStandardMaterial({ color: 0xea580c, roughness: 0.4, metalness: 0.5 });   // Safety orange
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x9a7b56, roughness: 0.9 });                       // Pallet wood

    // Build 2 Bay Racks
    for (let bay = 0; bay < 2; bay++) {
      const offsetX = 1.8 + bay * 3.4;
      const offsetZ = -3.2;

      // 4 Upright Pillars
      const pillarGeo = new THREE.BoxGeometry(0.12, 6.5, 0.12);
      const p1 = new THREE.Mesh(pillarGeo, rackPillarMat); p1.position.set(offsetX - 1.4, 3.25, offsetZ - 0.7); p1.castShadow = true;
      const p2 = new THREE.Mesh(pillarGeo, rackPillarMat); p2.position.set(offsetX + 1.4, 3.25, offsetZ - 0.7); p2.castShadow = true;
      const p3 = new THREE.Mesh(pillarGeo, rackPillarMat); p3.position.set(offsetX - 1.4, 3.25, offsetZ + 0.7); p3.castShadow = true;
      const p4 = new THREE.Mesh(pillarGeo, rackPillarMat); p4.position.set(offsetX + 1.4, 3.25, offsetZ + 0.7); p4.castShadow = true;
      rackGroup.add(p1, p2, p3, p4);

      // Shelf Level Beams (Bottom, Middle, Top)
      [0.6, 2.4, 4.4].forEach((shelfY) => {
        const beamFrontGeo = new THREE.BoxGeometry(2.92, 0.14, 0.08);
        const beamFront = new THREE.Mesh(beamFrontGeo, rackBeamMat);
        beamFront.position.set(offsetX, shelfY, offsetZ + 0.7);
        const beamBack = beamFront.clone();
        beamBack.position.set(offsetX, shelfY, offsetZ - 0.7);
        rackGroup.add(beamFront, beamBack);

        // Wooden Pallet on the shelf
        const pallet = new THREE.Group();
        const slatGeo = new THREE.BoxGeometry(2.6, 0.05, 0.16);
        for (let s = -0.55; s <= 0.55; s += 0.22) {
          const slat = new THREE.Mesh(slatGeo, woodMat);
          slat.position.set(0, 0.04, s);
          slat.castShadow = true;
          slat.receiveShadow = true;
          pallet.add(slat);
        }
        pallet.position.set(offsetX, shelfY + 0.05, offsetZ);
        rackGroup.add(pallet);
      });
    }
    scene.add(rackGroup);

    // Floor Pallet in Staging Area
    const stagingPallet = new THREE.Group();
    const palletSlatGeo = new THREE.BoxGeometry(2.8, 0.08, 0.2);
    for (let s = -0.7; s <= 0.7; s += 0.28) {
      const slat = new THREE.Mesh(palletSlatGeo, woodMat);
      slat.position.set(0, 0.06, s);
      slat.castShadow = true;
      slat.receiveShadow = true;
      stagingPallet.add(slat);
    }
    stagingPallet.position.set(3.2, 0, 1.2);
    scene.add(stagingPallet);

    // --- REALISTIC DELIVERY VAN MODEL ---
    const van = new THREE.Group();

    // Materials for Vehicle
    const vanBodyMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.2, metalness: 0.3 }); // Crisp white fleet van
    const vanDarkMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5, metalness: 0.4 });
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.1, metalness: 0.9 });
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.8 });
    const rimMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.3, metalness: 0.8 });
    const lightGlowMat = new THREE.MeshBasicMaterial({ color: 0x60a5fa });

    // Van Cabin
    const cabinGeo = new THREE.BoxGeometry(2.4, 2.2, 2.0);
    const cabin = new THREE.Mesh(cabinGeo, vanBodyMat);
    cabin.position.set(2.4, 1.35, 0);
    cabin.castShadow = true;

    // Windshield
    const windshieldGeo = new THREE.BoxGeometry(0.8, 0.9, 1.92);
    const windshield = new THREE.Mesh(windshieldGeo, glassMat);
    windshield.position.set(3.25, 1.65, 0);
    windshield.rotation.z = -0.35;

    // Cargo Box Container
    const cargoGeo = new THREE.BoxGeometry(4.2, 2.5, 2.2);
    const cargo = new THREE.Mesh(cargoGeo, vanBodyMat);
    cargo.position.set(-0.8, 1.5, 0);
    cargo.castShadow = true;

    // Logistics brand decal on van side
    const decalCanvas = document.createElement('canvas');
    decalCanvas.width = 512; decalCanvas.height = 128;
    const dctx = decalCanvas.getContext('2d');
    dctx.fillStyle = '#f1f5f9'; dctx.fillRect(0,0,512,128);
    dctx.fillStyle = '#2563eb'; dctx.font = 'bold 36px sans-serif';
    dctx.fillText('CORE LOGISTICS', 40, 75);
    const decalTex = new THREE.CanvasTexture(decalCanvas);
    const decalMat = new THREE.MeshStandardMaterial({ map: decalTex, roughness: 0.3 });
    const decalPlane = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 0.9), decalMat);
    decalPlane.position.set(-0.8, 1.6, 1.11);
    van.add(decalPlane);

    // Front Bumper & Headlights
    const bumper = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.4, 2.05), vanDarkMat);
    bumper.position.set(3.6, 0.45, 0);
    const headlightL = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.25, 0.35), lightGlowMat);
    headlightL.position.set(3.62, 0.95, 0.7);
    const headlightR = headlightL.clone();
    headlightR.position.set(3.62, 0.95, -0.7);

    // Headlight Spotlights on floor
    const spotL = new THREE.SpotLight(0x93c5fd, 3.5, 12, Math.PI / 6, 0.4);
    spotL.position.set(3.7, 0.95, 0.7);
    spotL.target.position.set(9, 0, 0.7);
    scene.add(spotL.target);
    const spotR = new THREE.SpotLight(0x93c5fd, 3.5, 12, Math.PI / 6, 0.4);
    spotR.position.set(3.7, 0.95, -0.7);
    spotR.target.position.set(9, 0, -0.7);
    scene.add(spotR.target);
    van.add(spotL, spotR);

    // Rear Doors (Swinging Open in Scene 2)
    const doorGeo = new THREE.BoxGeometry(0.08, 2.3, 1.05);
    const leftDoorPivot = new THREE.Group();
    leftDoorPivot.position.set(-2.9, 1.5, 1.05);
    const leftDoor = new THREE.Mesh(doorGeo, vanBodyMat);
    leftDoor.position.set(0, 0, -0.52);
    leftDoor.castShadow = true;
    leftDoorPivot.add(leftDoor);

    const rightDoorPivot = new THREE.Group();
    rightDoorPivot.position.set(-2.9, 1.5, -1.05);
    const rightDoor = new THREE.Mesh(doorGeo, vanBodyMat);
    rightDoor.position.set(0, 0, 0.52);
    rightDoor.castShadow = true;
    rightDoorPivot.add(rightDoor);

    // Wheels
    const wheels = [];
    const createWheel = (x, z) => {
      const wheelGroup = new THREE.Group();
      const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.32, 24), wheelMat);
      tire.rotation.x = Math.PI / 2;
      tire.castShadow = true;
      const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.34, 16), rimMat);
      rim.rotation.x = Math.PI / 2;
      wheelGroup.add(tire, rim);
      wheelGroup.position.set(x, 0.42, z);
      wheels.push(wheelGroup);
      van.add(wheelGroup);
    };

    createWheel(2.2, 1.05);
    createWheel(2.2, -1.05);
    createWheel(-1.8, 1.05);
    createWheel(-1.8, -1.05);

    van.add(cabin, windshield, cargo, bumper, headlightL, headlightR, leftDoorPivot, rightDoorPivot);
    van.position.set(-18, 0, 1.2); // Start far off screen
    scene.add(van);

    // --- CARDBOARD BOXES (PHYSICAL SIMULATION PARTICIPANTS) ---
    const boxes = [];
    const BOX_CONFIGS = [
      // Large Master Cartons
      { size: [0.85, 0.75, 0.8], mat: cardboardMat1, startOffset: [-2.2, 0.8, 0], messy: { x: -1.2, z: 0.6, y: 0.38, rotY: 0.4 }, target: { x: 2.6, z: 1.0, y: 0.45, rotY: 0 } },
      { size: [0.85, 0.75, 0.8], mat: cardboardMat1, startOffset: [-2.0, 0.8, 0.4], messy: { x: -0.4, z: 1.6, y: 0.38, rotY: -0.5 }, target: { x: 3.5, z: 1.0, y: 0.45, rotY: 0 } },
      { size: [0.85, 0.75, 0.8], mat: cardboardMat1, startOffset: [-2.4, 0.8, -0.4], messy: { x: -1.6, z: 1.9, y: 0.38, rotY: 0.2 }, target: { x: 2.6, z: 1.0, y: 1.2, rotY: 0 } },
      { size: [0.85, 0.75, 0.8], mat: cardboardMat1, startOffset: [-2.1, 0.8, 0.2], messy: { x: -0.8, z: 2.4, y: 0.38, rotY: -0.3 }, target: { x: 3.5, z: 1.0, y: 1.2, rotY: 0 } },

      // Medium Electronics Boxes (Moves to Warehouse Rack Level 1 & 2)
      { size: [0.7, 0.55, 0.65], mat: cardboardMat2, startOffset: [-1.6, 1.2, -0.2], messy: { x: 0.5, z: 0.4, y: 0.28, rotY: 0.8 }, target: { x: 1.2, z: -3.2, y: 0.95, rotY: 0 } },
      { size: [0.7, 0.55, 0.65], mat: cardboardMat2, startOffset: [-1.4, 1.2, 0.3], messy: { x: 1.4, z: 1.5, y: 0.28, rotY: -0.6 }, target: { x: 1.95, z: -3.2, y: 0.95, rotY: 0 } },
      { size: [0.7, 0.55, 0.65], mat: cardboardMat2, startOffset: [-1.8, 1.2, 0.1], messy: { x: 0.2, z: 2.2, y: 0.28, rotY: 0.3 }, target: { x: 1.2, z: -3.2, y: 1.5, rotY: 0 } },
      { size: [0.7, 0.55, 0.65], mat: cardboardMat2, startOffset: [-1.5, 1.2, -0.4], messy: { x: 1.1, z: 2.6, y: 0.28, rotY: -0.4 }, target: { x: 1.95, z: -3.2, y: 1.5, rotY: 0 } },

      // Small Parcels & Office Goods (Moves to Warehouse Rack Bay 2)
      { size: [0.6, 0.45, 0.55], mat: cardboardMat3, startOffset: [-1.2, 1.6, 0], messy: { x: 2.2, z: -0.5, y: 0.23, rotY: 0.5 }, target: { x: 4.6, z: -3.2, y: 0.9, rotY: 0 } },
      { size: [0.6, 0.45, 0.55], mat: cardboardMat3, startOffset: [-1.0, 1.6, 0.3], messy: { x: 2.8, z: 0.5, y: 0.23, rotY: -0.7 }, target: { x: 5.3, z: -3.2, y: 0.9, rotY: 0 } },
      { size: [0.6, 0.45, 0.55], mat: cardboardMat3, startOffset: [-1.1, 1.6, -0.3], messy: { x: 3.5, z: -0.2, y: 0.23, rotY: 0.2 }, target: { x: 4.6, z: -3.2, y: 1.35, rotY: 0 } },
      { size: [0.6, 0.45, 0.55], mat: cardboardMat3, startOffset: [-0.9, 1.6, 0.1], messy: { x: 4.0, z: 0.6, y: 0.23, rotY: -0.3 }, target: { x: 5.3, z: -3.2, y: 1.35, rotY: 0 } },
    ];

    BOX_CONFIGS.forEach((cfg) => {
      const geo = new THREE.BoxGeometry(cfg.size[0], cfg.size[1], cfg.size[2]);
      const mesh = new THREE.Mesh(geo, cfg.mat);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.visible = false; // Hidden until van unloads
      scene.add(mesh);
      boxes.push({ mesh, cfg });
    });

    // Barcode Laser Scanner Beam in Scene 3
    const laserGeo = new THREE.PlaneGeometry(0.04, 8);
    const laserMat = new THREE.MeshBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0, side: THREE.DoubleSide });
    const laserBeam = new THREE.Mesh(laserGeo, laserMat);
    laserBeam.rotation.x = Math.PI / 2;
    laserBeam.position.set(0, 1.2, 0);
    scene.add(laserBeam);

    // --- ANIMATION CHOREOGRAPHY TIMELINE ---
    const startTime = performance.now();

    const animate = (currentTime) => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsed = (currentTime - startTime) / 1000; // in seconds

      // Helper smoothstep easing
      const smooth = (t) => t * t * (3 - 2 * t);
      const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

      // ==========================================
      // SCENE 1 (0.0s - 1.8s): Delivery Van Arrives
      // ==========================================
      if (elapsed < 1.8) {
        setPhase(1);
        const t = smooth(clamp(elapsed / 1.6, 0, 1));
        const vanX = THREE.MathUtils.lerp(-16, -3.2, t);
        van.position.x = vanX;

        // Wheel rotation proportional to distance
        const wheelRot = vanX * 3.5;
        wheels.forEach((w) => (w.children[0].rotation.y = wheelRot));

        // Slight suspension bounce upon stopping
        if (t > 0.85) {
          const bounce = Math.sin((t - 0.85) * Math.PI * 4) * 0.04 * (1 - t);
          van.position.y = bounce;
        }

        // Camera gentle drift
        camera.position.set(1.5 - t * 0.8, 7.2 - t * 0.4, 14.2 - t * 0.8);
        camera.lookAt(0, 1.2, 0);
      }

      // ==========================================
      // SCENE 2 (1.8s - 3.4s): Van Doors Open & Unload
      // ==========================================
      else if (elapsed >= 1.8 && elapsed < 3.4) {
        setPhase(2);
        van.position.x = -3.2;

        const doorT = smooth(clamp((elapsed - 1.8) / 0.7, 0, 1));
        leftDoorPivot.rotation.y = doorT * 1.8;
        rightDoorPivot.rotation.y = -doorT * 1.8;

        // Boxes emerge and slide out to messy floor positions
        boxes.forEach(({ mesh, cfg }, idx) => {
          mesh.visible = true;
          const stagger = idx * 0.05;
          const individualT = smooth(clamp((elapsed - 2.1 - stagger) / 0.85, 0, 1));

          // Start inside van -> land messy on floor
          const startX = van.position.x + cfg.startOffset[0];
          const startY = van.position.y + cfg.startOffset[1];
          const startZ = van.position.z + cfg.startOffset[2];

          mesh.position.x = THREE.MathUtils.lerp(startX, cfg.messy.x, individualT);
          mesh.position.y = THREE.MathUtils.lerp(startY, cfg.messy.y, individualT);
          mesh.position.z = THREE.MathUtils.lerp(startZ, cfg.messy.z, individualT);
          mesh.rotation.y = cfg.messy.rotY * individualT;
          mesh.rotation.z = Math.sin(individualT * Math.PI) * 0.12; // slight natural tumble
        });

        camera.position.set(0.6, 6.8, 13.2);
        camera.lookAt(0.5, 1.1, 0.4);
      }

      // ==========================================
      // SCENE 3 (3.4s - 5.4s): Intelligent Automatic Organization
      // ==========================================
      else if (elapsed >= 3.4 && elapsed < 5.4) {
        setPhase(3);

        const organizeT = smooth(clamp((elapsed - 3.4) / 1.6, 0, 1));

        boxes.forEach(({ mesh, cfg }, idx) => {
          mesh.visible = true;
          const stagger = idx * 0.04;
          const individualT = smooth(clamp((elapsed - 3.4 - stagger) / 1.4, 0, 1));

          // Smooth sliding, rotating, stacking onto pallet & racks
          mesh.position.x = THREE.MathUtils.lerp(cfg.messy.x, cfg.target.x, individualT);
          mesh.position.y = THREE.MathUtils.lerp(cfg.messy.y, cfg.target.y, individualT);
          mesh.position.z = THREE.MathUtils.lerp(cfg.messy.z, cfg.target.z, individualT);
          mesh.rotation.y = THREE.MathUtils.lerp(cfg.messy.rotY, cfg.target.rotY, individualT);
          mesh.rotation.z = 0;
        });

        // Green Barcode Laser Sweep
        if (organizeT > 0.35) {
          laserMat.opacity = Math.sin((organizeT - 0.35) * Math.PI * 1.8) * 0.8;
          laserBeam.position.x = THREE.MathUtils.lerp(0.5, 5.5, (organizeT - 0.35) / 0.65);
        }

        // Camera slowly tracks into the organized shelving area
        camera.position.set(
          THREE.MathUtils.lerp(0.6, 2.8, organizeT * 0.7),
          THREE.MathUtils.lerp(6.8, 4.6, organizeT * 0.7),
          THREE.MathUtils.lerp(13.2, 9.4, organizeT * 0.7)
        );
        camera.lookAt(
          THREE.MathUtils.lerp(0.5, 3.2, organizeT * 0.7),
          THREE.MathUtils.lerp(1.1, 1.4, organizeT * 0.7),
          THREE.MathUtils.lerp(0.4, -0.5, organizeT * 0.7)
        );
      }

      // ==========================================
      // SCENE 4 (5.4s - 6.8s): Digital Inventory Synchronization
      // ==========================================
      else if (elapsed >= 5.4) {
        setPhase(4);
        laserMat.opacity = 0;

        // Keep all boxes cleanly locked in organized positions
        boxes.forEach(({ mesh, cfg }) => {
          mesh.position.set(cfg.target.x, cfg.target.y, cfg.target.z);
          mesh.rotation.set(0, cfg.target.rotY, 0);
        });

        // Subtle slow cinematic breathing move
        const t4 = elapsed - 5.4;
        camera.position.x = 2.8 + Math.sin(t4 * 0.5) * 0.15;
        camera.position.z = 9.4 - t4 * 0.1;

        // Auto trigger complete transition at 6.8s
        if (elapsed > 6.8 && !isExiting) {
          handleExit();
        }
      }

      renderer.render(scene, camera);
    };

    animationFrameId = requestAnimationFrame(animate);

    // Responsive Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  const handleExit = () => {
    setIsExiting(true);
    setTimeout(() => {
      if (onComplete) onComplete();
    }, 600);
  };

  return (
    <div className={`warehouse-intro-overlay ${isExiting ? 'exit' : ''}`}>
      {/* 3D WebGL Canvas */}
      <div className="warehouse-canvas-container" ref={mountRef} />

      {/* Cinematic Vignette */}
      <div className="warehouse-vignette" />

      {/* Top Header HUD */}
      <div className="warehouse-header-hud">
        <div className="warehouse-brand-pill">
          <span className="warehouse-status-indicator" />
          <span>CoreInventory Live Intake</span>
        </div>

        <div className="warehouse-timeline-bar">
          <div className={`warehouse-step-badge ${phase === 1 ? 'active' : ''}`}>
            <Truck size={13} /> 1. Delivery
          </div>
          <div className={`warehouse-step-badge ${phase === 2 ? 'active' : ''}`}>
            <Package size={13} /> 2. Unload
          </div>
          <div className={`warehouse-step-badge ${phase === 3 ? 'active' : ''}`}>
            <Layers size={13} /> 3. Organize
          </div>
          <div className={`warehouse-step-badge ${phase === 4 ? 'active' : ''}`}>
            <BarChart3 size={13} /> 4. Sync
          </div>
        </div>

        <button onClick={handleExit} className="warehouse-skip-btn">
          <span>Skip to Sign In</span>
          <ArrowRight size={14} />
        </button>
      </div>

      {/* Bottom Context Caption */}
      <div className="warehouse-bottom-caption">
        {phase === 1 && (
          <div className="warehouse-caption-card">
            <div className="warehouse-caption-title">
              <Truck size={16} style={{ color: '#60a5fa' }} /> Logistics Intake Inbound
            </div>
            <div className="warehouse-caption-desc">Delivery fleet docking at Receiving Bay 01</div>
          </div>
        )}
        {phase === 2 && (
          <div className="warehouse-caption-card">
            <div className="warehouse-caption-title">
              <Package size={16} style={{ color: '#f59e0b' }} /> Unprocessed Stock Receiving
            </div>
            <div className="warehouse-caption-desc">New cartons and parcel freight staged for automatic indexing</div>
          </div>
        )}
        {phase === 3 && (
          <div className="warehouse-caption-card">
            <div className="warehouse-caption-title">
              <ScanLine size={16} style={{ color: '#10b981' }} /> Intelligent Stock Stacking & Alignment
            </div>
            <div className="warehouse-caption-desc">Automatic sorting by SKU barcode and rack allocation</div>
          </div>
        )}
      </div>

      {/* Scene 4: Digital Inventory Transition Card */}
      <div className={`warehouse-digital-hud ${phase === 4 ? 'visible' : ''}`}>
        <div className="digital-hud-header">
          <span className="digital-hud-title">INVENTORY RECEIVED & INDEXED</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontSize: '0.8rem', fontWeight: 700 }}>
            <CheckCircle2 size={14} /> Synced
          </div>
        </div>

        <div className="digital-hud-metrics">
          <div className="digital-metric-box">
            <div className="digital-metric-label">PRODUCTS</div>
            <div className="digital-metric-value" style={{ color: '#60a5fa' }}>128</div>
          </div>
          <div className="digital-metric-box">
            <div className="digital-metric-label">CATEGORIES</div>
            <div className="digital-metric-value" style={{ color: '#a78bfa' }}>12</div>
          </div>
          <div className="digital-metric-box">
            <div className="digital-metric-label">STOCK ADDED</div>
            <div className="digital-metric-value" style={{ color: '#34d399' }}>+246</div>
          </div>
        </div>

        <button onClick={handleExit} className="digital-hud-button">
          Proceed to Sign In <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default IntroAnimation;
