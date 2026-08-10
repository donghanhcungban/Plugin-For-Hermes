'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export interface AvatarState {
  status: 'idle' | 'listening' | 'thinking' | 'speaking';
  audioVolume: number;
}

interface Props {
  avatarState: AvatarState;
}

export const CyberRobotAvatar: React.FC<Props> = ({ avatarState }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<AvatarState>(avatarState);

  useEffect(() => {
    stateRef.current = avatarState;
  }, [avatarState]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // --- Scene Setup ---
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x060c18, 0.04);

    const camera = new THREE.PerspectiveCamera(
      36,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0.2, 3.1);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
      stencil: false,
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // --- Generate Dynamic HDRI Studio Environment Map for Realistic Metallic Reflections ---
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileCubemapShader();

    const envScene = new THREE.Scene();
    envScene.background = new THREE.Color(0x0a1426);
    
    // Add studio light objects into env scene for specular map
    const envLight1 = new THREE.Mesh(
      new THREE.SphereGeometry(2, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    envLight1.position.set(5, 5, 5);
    envScene.add(envLight1);

    const envLight2 = new THREE.Mesh(
      new THREE.SphereGeometry(2, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0x00f3ff })
    );
    envLight2.position.set(-5, 3, -5);
    envScene.add(envLight2);

    const envMap = pmremGenerator.fromScene(envScene).texture;
    scene.environment = envMap;

    // --- Procedural Carbon Fiber Normal/Bump Texture ---
    const createCarbonMap = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#0f141d';
        ctx.fillRect(0, 0, 256, 256);
        ctx.fillStyle = '#263042';
        for (let y = 0; y < 256; y += 8) {
          for (let x = 0; x < 256; x += 8) {
            if ((x + y) % 16 === 0) {
              ctx.fillRect(x, y, 8, 8);
            }
          }
        }
      }
      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(6, 6);
      return texture;
    };
    const carbonTex = createCarbonMap();

    // --- Lighting Setup ---
    const ambientLight = new THREE.AmbientLight(0x182436, 1.6);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff5ea, 3.2);
    keyLight.position.set(2.0, 4.5, 3.8);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const cyanRim = new THREE.DirectionalLight(0x00f3ff, 5.0);
    cyanRim.position.set(-4.0, 2.5, -2.5);
    scene.add(cyanRim);

    const blueRim = new THREE.DirectionalLight(0x0066ff, 4.5);
    blueRim.position.set(4.0, 1.8, -2.0);
    scene.add(blueRim);

    // --- Ultra-HD Materials ---
    const porcelainMat = new THREE.MeshPhysicalMaterial({
      color: 0xf4f6f8,
      roughness: 0.1,
      metalness: 0.05,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      reflectivity: 0.95,
      envMapIntensity: 1.2,
    });

    const carbonArmorMat = new THREE.MeshStandardMaterial({
      color: 0x111622,
      map: carbonTex,
      bumpMap: carbonTex,
      bumpScale: 0.025,
      roughness: 0.3,
      metalness: 0.9,
      envMapIntensity: 1.5,
    });

    // const titaniumMat = new THREE.MeshStandardMaterial({
    //   color: 0xa0b2c6,
    //   roughness: 0.15,
    //   metalness: 0.98,
    //   envMapIntensity: 2.0,
    // });

    const neonMat = new THREE.MeshStandardMaterial({
      color: 0x00f3ff,
      emissive: 0x00f3ff,
      emissiveIntensity: 2.5,
      roughness: 0.1,
    });

    const eyeIrisMat = new THREE.MeshStandardMaterial({
      color: 0x00e1ff,
      emissive: 0x0099ff,
      emissiveIntensity: 4.0,
      roughness: 0.05,
    });

    const glassCorneaMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.95,
      opacity: 1,
      transparent: true,
      roughness: 0.02,
      ior: 1.52,
    });

    // --- Robot Group Assembly ---
    const robotGroup = new THREE.Group();
    robotGroup.position.set(0, -0.75, 0);
    scene.add(robotGroup);

    // 1. Torso
    const chestGroup = new THREE.Group();
    robotGroup.add(chestGroup);

    const abdomen = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.2, 0.75, 32), carbonArmorMat);
    abdomen.position.set(0, 0.5, 0);
    chestGroup.add(abdomen);

    // Sculpted Chest Armor Plates
    const chestShape = new THREE.Shape();
    chestShape.moveTo(0, 0);
    chestShape.lineTo(0.28, 0.1);
    chestShape.lineTo(0.32, 0.55);
    chestShape.lineTo(0.05, 0.65);
    chestShape.lineTo(0, 0.58);

    const chestPlateGeo = new THREE.ExtrudeGeometry(chestShape, { depth: 0.15, bevelEnabled: true, bevelSegments: 5, steps: 1, bevelSize: 0.03, bevelThickness: 0.04 });

    const leftChest = new THREE.Mesh(chestPlateGeo, porcelainMat);
    leftChest.position.set(-0.31, 0.45, 0.06);
    leftChest.rotation.set(-0.1, 0.25, -0.1);
    leftChest.scale.set(0.85, 0.85, 0.85);
    chestGroup.add(leftChest);

    const rightChest = new THREE.Mesh(chestPlateGeo, porcelainMat);
    rightChest.position.set(0.31, 0.45, 0.06);
    rightChest.rotation.set(-0.1, -0.25, 0.1);
    rightChest.scale.set(-0.85, 0.85, 0.85);
    chestGroup.add(rightChest);

    // Neon Ribs
    for (let r = 0; r < 4; r++) {
      const ribNeon = new THREE.Mesh(new THREE.TorusGeometry(0.24 + r * 0.015, 0.008, 16, 64, Math.PI * 0.75), neonMat);
      ribNeon.rotation.x = Math.PI / 2 + 0.15;
      ribNeon.position.set(0, 0.3 + r * 0.11, 0.04);
      chestGroup.add(ribNeon);
    }

    // 2. Sculpted Head & Eyelids (Blinking Animation Support)
    const neckGroup = new THREE.Group();
    neckGroup.position.set(0, 0.95, 0);
    chestGroup.add(neckGroup);

    const neckCore = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.14, 0.32, 24), carbonArmorMat);
    neckGroup.add(neckCore);

    const headGroup = new THREE.Group();
    headGroup.position.set(0, 0.24, 0);
    neckGroup.add(headGroup);

    const skull = new THREE.Mesh(new THREE.SphereGeometry(0.32, 48, 36).scale(0.85, 1.15, 0.96), porcelainMat);
    skull.position.set(0, 0.16, 0);
    headGroup.add(skull);

    // Nose & Face Plate
    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.14, 4), porcelainMat);
    nose.rotation.set(-0.2, 0, 0);
    nose.position.set(0, 0.15, 0.28);
    headGroup.add(nose);

    // Mouth & Jaw Group (TTS Movement)
    const jawGroup = new THREE.Group();
    jawGroup.position.set(0, 0.02, 0.08);
    headGroup.add(jawGroup);

    const jawMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.14, 0.18, 24, 1, false, -Math.PI / 2, Math.PI).scale(0.88, 1, 1.1),
      porcelainMat
    );
    jawMesh.position.set(0, -0.06, 0.1);
    jawGroup.add(jawMesh);

    // Eyelids (Blinking system)
    const createEyeAssembly = (xPos: number) => {
      const eyeGroup = new THREE.Group();
      eyeGroup.position.set(xPos, 0.18, 0.24);

      const sclera = new THREE.Mesh(new THREE.SphereGeometry(0.038, 16, 16), porcelainMat);
      eyeGroup.add(sclera);

      const iris = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.01, 24), eyeIrisMat);
      iris.rotation.x = Math.PI / 2;
      iris.position.z = 0.02;
      eyeGroup.add(iris);

      const cornea = new THREE.Mesh(new THREE.SphereGeometry(0.04, 16, 16), glassCorneaMat);
      eyeGroup.add(cornea);

      // Eyelid Cover
      const eyelidGeo = new THREE.SphereGeometry(0.042, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2);
      const eyelid = new THREE.Mesh(eyelidGeo, porcelainMat);
      eyelid.rotation.x = -Math.PI / 2;
      eyeGroup.add(eyelid);

      return { eyeGroup, eyelid };
    };

    const leftEyeObj = createEyeAssembly(-0.11);
    headGroup.add(leftEyeObj.eyeGroup);

    const rightEyeObj = createEyeAssembly(0.11);
    headGroup.add(rightEyeObj.eyeGroup);

    // Ear Pod Discs
    const createEarPod = (isLeft: boolean) => {
      const earGroup = new THREE.Group();
      earGroup.position.set(isLeft ? -0.28 : 0.28, 0.18, -0.02);
      earGroup.rotation.y = isLeft ? -Math.PI / 2 : Math.PI / 2;

      const podBase = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.05, 32), carbonArmorMat);
      podBase.rotation.x = Math.PI / 2;
      earGroup.add(podBase);

      const neonRing = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.015, 16, 32), neonMat);
      earGroup.add(neonRing);

      return { earGroup, neonRing };
    };

    const leftEar = createEarPod(true);
    headGroup.add(leftEar.earGroup);

    const rightEar = createEarPod(false);
    headGroup.add(rightEar.earGroup);

    // 3. Holographic Audio Wave Ring around Robot Body
    const holoRingGeo = new THREE.TorusGeometry(0.75, 0.012, 16, 64);
    const holoRingMat = new THREE.MeshBasicMaterial({
      color: 0x00f3ff,
      wireframe: true,
      transparent: true,
      opacity: 0.5,
    });
    const holoRing = new THREE.Mesh(holoRingGeo, holoRingMat);
    holoRing.rotation.x = Math.PI / 2 + 0.3;
    holoRing.position.set(0, 0.1, 0);
    robotGroup.add(holoRing);

    // 4. Background Particle Field
    const pCount = 120;
    const pGeo = new THREE.BufferGeometry();
    const pPositions = new Float32Array(pCount * 3);

    for (let i = 0; i < pCount * 3; i += 3) {
      pPositions[i] = (Math.random() - 0.5) * 8;
      pPositions[i + 1] = (Math.random() - 0.5) * 5;
      pPositions[i + 2] = (Math.random() - 0.5) * 5 - 1;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
    const pMat = new THREE.PointsMaterial({ color: 0x00f3ff, size: 0.03, transparent: true, opacity: 0.7 });
    const pMesh = new THREE.Points(pGeo, pMat);
    scene.add(pMesh);

    // 5. Optional External GLTF Custom 3D Model Loader
    const loader = new GLTFLoader();
    loader.load(
      '/models/cyber_android.glb',
      (gltf) => {
        // If user drops custom photorealistic GLB model file into /public/models/cyber_android.glb, render it!
        const model = gltf.scene;
        model.scale.set(1, 1, 1);
        model.position.set(0, -0.7, 0);
        scene.remove(robotGroup);
        scene.add(model);
      },
      undefined,
      () => {
        // Fallback silently to our high-detail procedural avatar
      }
    );

    // --- Mouse Tracking & Resize ---
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.targetX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.targetY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    };

    window.addEventListener('mousemove', handleMouseMove);

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // --- Animation Systems & Blinking Loop ---
    const clock = new THREE.Clock();
    let blinkTimer = 0;
    let nextBlinkTime = 3.0;
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();
      const currentStatus = stateRef.current.status;
      const audioVol = stateRef.current.audioVolume || 0;

      // 1. Mouse Head Tracking
      mouse.x += (mouse.targetX - mouse.x) * 0.06;
      mouse.y += (mouse.targetY - mouse.y) * 0.06;

      headGroup.rotation.y = mouse.x * 0.42;
      headGroup.rotation.x = -mouse.y * 0.28;
      chestGroup.rotation.y = mouse.x * 0.14;

      // 2. Realistic Eyelid Blinking System
      blinkTimer += 0.016;
      if (blinkTimer > nextBlinkTime) {
        const blinkProgress = Math.sin((blinkTimer - nextBlinkTime) * 25);
        if (blinkProgress > 0) {
          leftEyeObj.eyelid.rotation.x = -Math.PI / 2 + blinkProgress * 1.4;
          rightEyeObj.eyelid.rotation.x = -Math.PI / 2 + blinkProgress * 1.4;
        } else {
          leftEyeObj.eyelid.rotation.x = -Math.PI / 2;
          rightEyeObj.eyelid.rotation.x = -Math.PI / 2;
          blinkTimer = 0;
          nextBlinkTime = 2.5 + Math.random() * 3.5;
        }
      }

      // 3. Idle Breathing
      robotGroup.position.y = -0.75 + Math.sin(elapsedTime * 2.2) * 0.03;
      chestGroup.rotation.z = Math.cos(elapsedTime * 1.5) * 0.015;

      // 4. TTS Mouth Lip-Sync
      if (currentStatus === 'speaking') {
        const mouthOpen = audioVol * 0.09 + Math.sin(elapsedTime * 24) * 0.02;
        jawGroup.position.y = 0.02 - Math.max(0, mouthOpen);
      } else {
        jawGroup.position.y += (0.02 - jawGroup.position.y) * 0.15;
      }

      // 5. Holographic Audio Ring Pulse
      if (currentStatus === 'speaking') {
        holoRing.scale.setScalar(1.0 + audioVol * 0.3);
        holoRing.rotation.z = elapsedTime * 2.0;
        holoRingMat.opacity = 0.8 + audioVol * 0.2;
      } else {
        holoRing.scale.setScalar(1.0);
        holoRing.rotation.z = elapsedTime * 0.5;
        holoRingMat.opacity = 0.35;
      }

      // 6. Dynamic Glow Colors
      const targetColor = new THREE.Color(0x00f3ff);
      let targetIntensity = 2.5;

      if (currentStatus === 'listening') {
        targetColor.setHex(0x00ffff);
        targetIntensity = 3.5 + Math.sin(elapsedTime * 9) * 1.5;
      } else if (currentStatus === 'thinking') {
        targetColor.setHex(0xaa00ff);
        targetIntensity = 3.8 + Math.cos(elapsedTime * 14) * 1.8;
      } else if (currentStatus === 'speaking') {
        targetColor.setHex(0x0088ff);
        targetIntensity = 2.8 + audioVol * 6.0;
      } else {
        targetIntensity = 2.0 + Math.sin(elapsedTime * 2.5) * 0.5;
      }

      neonMat.color.lerp(targetColor, 0.1);
      neonMat.emissive.lerp(targetColor, 0.1);
      neonMat.emissiveIntensity = THREE.MathUtils.lerp(neonMat.emissiveIntensity, targetIntensity, 0.1);

      leftEar.neonRing.rotation.z = elapsedTime * 0.8;
      rightEar.neonRing.rotation.z = -elapsedTime * 0.8;
      pMesh.rotation.y = elapsedTime * 0.04;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
      pmremGenerator.dispose();
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-full min-h-[500px]">
      <div ref={mountRef} className="w-full h-full absolute inset-0 cursor-grab active:cursor-grabbing" />
    </div>
  );
};
