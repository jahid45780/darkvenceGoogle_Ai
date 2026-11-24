import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { Code2, Globe, Smartphone, TrendingUp, BarChart3, Sparkles } from 'lucide-react';
import {
  createBrowserScreenTexture,
  createCodeEditorTexture,
  createMobileAppTexture,
  createAnalyticsTexture,
  createSeoCardTexture,
  createCampaignCardTexture
} from './hero3dTextures.ts';

interface Hero3DWorkspaceProps {
  parallaxRef: React.RefObject<{ x: number; y: number }>;
  shouldReduceMotion: boolean;
}

function createRoundedRectShape(width: number, height: number, radius: number): THREE.Shape {
  const shape = new THREE.Shape();
  const x = -width / 2;
  const y = -height / 2;
  const r = Math.min(radius, width / 2, height / 2);

  shape.moveTo(x + r, y);
  shape.lineTo(x + width - r, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + r);
  shape.lineTo(x + width, y + height - r);
  shape.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  shape.lineTo(x + r, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - r);
  shape.lineTo(x, y + r);
  shape.quadraticCurveTo(x, y, x + r, y);
  return shape;
}

function createRoundedTriangleShape(size: number): THREE.Shape {
  const shape = new THREE.Shape();
  const h = size * 0.866;
  shape.moveTo(0, h * 0.62);
  shape.lineTo(size * 0.52, -h * 0.38);
  shape.lineTo(-size * 0.52, -h * 0.38);
  shape.closePath();
  return shape;
}

function detectWebGLSupport(): { supported: boolean; isSoftwareGl: boolean } {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return { supported: false, isSoftwareGl: false };
  }
  try {
    const canvas = document.createElement('canvas');
    const gl =
      (canvas.getContext('webgl2') as WebGL2RenderingContext | null) ||
      (canvas.getContext('webgl') as WebGLRenderingContext | null);
    if (!gl) return { supported: false, isSoftwareGl: false };

    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) || '');
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    const isSoftwareGl = /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    return { supported: true, isSoftwareGl };
  } catch {
    return { supported: false, isSoftwareGl: false };
  }
}

const StaticWorkspaceFallback: React.FC = () => (
  <div
    className="relative w-full h-full min-h-[280px] sm:min-h-[360px] lg:min-h-[460px] flex items-center justify-center p-4"
    aria-label="Darkvence software engineering and digital growth workspace preview"
  >
    <div className="relative w-full max-w-[520px] rounded-2xl bg-[#0b0b0b] border border-[#232323] p-5 shadow-2xl space-y-4">
      <div className="flex items-center justify-between border-b border-[#1f1f1f] pb-3">
        <div className="flex items-center gap-2 text-xs font-mono text-[#B7FF32]">
          <Globe className="w-4 h-4" />
          <span>DARKVENCE STUDIO · 3D WORKSPACE</span>
        </div>
        <span className="text-[11px] font-mono text-[#B7FF32] bg-[#B7FF32]/10 border border-[#B7FF32]/30 px-2 py-0.5 rounded">
          99.98% LIVE
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-3.5 rounded-xl bg-[#101010] border border-[#232323] space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-mono text-[#B7FF32]">
            <Code2 className="w-3.5 h-3.5" />
            <span>ENGINEERING</span>
          </div>
          <p className="text-sm font-display font-bold text-white">Full-Stack Web &amp; App</p>
          <p className="text-[11px] text-[#A1A1A1]">React, TypeScript, Cloud APIs</p>
        </div>

        <div className="p-3.5 rounded-xl bg-[#101010] border border-[#232323] space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-mono text-[#B7FF32]">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>GROWTH &amp; SEO</span>
          </div>
          <p className="text-sm font-display font-bold text-white">+218% Organic Lift</p>
          <p className="text-[11px] text-[#A1A1A1]">ROAS 4.8x · Attribution</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        <div className="p-2.5 rounded-xl bg-[#101010] border border-[#232323] flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-[#B7FF32] shrink-0" />
          <span className="text-[11px] font-mono text-white truncate">Mobile OS</span>
        </div>
        <div className="p-2.5 rounded-xl bg-[#101010] border border-[#232323] flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-[#B7FF32] shrink-0" />
          <span className="text-[11px] font-mono text-white truncate">SEO 98/100</span>
        </div>
        <div className="p-2.5 rounded-xl bg-[#101010] border border-[#232323] flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#B7FF32] shrink-0" />
          <span className="text-[11px] font-mono text-white truncate">CPA -38%</span>
        </div>
      </div>
    </div>
  </div>
);

export const Hero3DWorkspace: React.FC<Hero3DWorkspaceProps> = ({
  parallaxRef,
  shouldReduceMotion
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [webglUnavailable, setWebglUnavailable] = useState(false);

  useEffect(() => {
    if (shouldReduceMotion) return;

    const container = mountRef.current;
    if (!container) return;

    const { supported, isSoftwareGl } = detectWebGLSupport();
    if (!supported) {
      setWebglUnavailable(true);
      return;
    }

    let disposed = false;
    let frameId = 0;

    // 1. Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.setClearColor(0x000000, 0);

    const isMobileViewport = () => (container.clientWidth || window.innerWidth) < 640;

    const updateRendererPixelRatio = () => {
      if (isSoftwareGl) {
        renderer.setPixelRatio(1);
      } else {
        const cap = isMobileViewport() ? 1.5 : 2;
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, cap));
      }
    };
    updateRendererPixelRatio();

    const initialW = Math.max(container.clientWidth || 520, 260);
    const initialH = Math.max(container.clientHeight || 460, 260);
    renderer.setSize(initialW, initialH);
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 2. Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, initialW / initialH, 0.1, 100);
    const updateCameraForSize = (w: number, h: number) => {
      camera.aspect = w / Math.max(h, 1);
      if (w < 420) {
        camera.position.set(0, 0.1, 11.4);
      } else if (w < 640) {
        camera.position.set(0, 0.1, 10.2);
      } else if (w < 1024) {
        camera.position.set(0, 0.1, 9.2);
      } else {
        camera.position.set(0.1, 0.12, 8.6);
      }
      camera.updateProjectionMatrix();
    };
    updateCameraForSize(initialW, initialH);

    // 3. Studio Environment Reflection (RoomEnvironment)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTarget = pmremGenerator.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = envTarget.texture;
    pmremGenerator.dispose();

    // 4. Lighting Rig (3-point + Neon Green accent)
    const hemiLight = new THREE.HemisphereLight(0xdbeafe, 0x050505, 0.65);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.85);
    keyLight.position.set(4.5, 6.2, 6.5);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xa3e635, 0.55);
    fillLight.position.set(-5.5, 1.5, 4.0);
    scene.add(fillLight);

    const neonRimLight = new THREE.PointLight(0xb7ff32, 3.2, 14, 1.6);
    neonRimLight.position.set(2.8, -1.6, 3.6);
    scene.add(neonRimLight);

    const topAccentLight = new THREE.PointLight(0xb7ff32, 2.0, 12, 1.7);
    topAccentLight.position.set(-2.5, 3.2, 2.4);
    scene.add(topAccentLight);

    // Track disposable resources
    const geometries: THREE.BufferGeometry[] = [];
    const materials: THREE.Material[] = [];
    const textures: THREE.Texture[] = [];

    const trackGeo = <T extends THREE.BufferGeometry>(g: T): T => {
      geometries.push(g);
      return g;
    };
    const trackMat = <T extends THREE.Material>(m: T): T => {
      materials.push(m);
      return m;
    };
    const trackTex = <T extends THREE.Texture>(t: T): T => {
      textures.push(t);
      return t;
    };

    const maxAnisotropy = Math.min(renderer.capabilities.getMaxAnisotropy() || 1, 8);

    // Shared PBR Materials
    const chassisMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x101010,
        metalness: 0.78,
        roughness: 0.28
      })
    );
    const titaniumMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x1c1c1c,
        metalness: 0.88,
        roughness: 0.2
      })
    );
    const darkInsetMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x050505,
        metalness: 0.3,
        roughness: 0.65
      })
    );
    const neonTrimMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xb7ff32,
        emissive: 0xb7ff32,
        emissiveIntensity: 0.75,
        metalness: 0.25,
        roughness: 0.25
      })
    );
    const subtleRingMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x262626,
        metalness: 0.9,
        roughness: 0.22
      })
    );

    // Helper: Build a beveled floating display panel with chassis + neon rim + texture face
    const buildDisplayPanel = (
      width: number,
      height: number,
      depth: number,
      radius: number,
      texture: THREE.Texture,
      includeNeonRim = true
    ): THREE.Group => {
      const group = new THREE.Group();

      const chassisShape = createRoundedRectShape(width, height, radius);
      const chassisGeo = trackGeo(
        new THREE.ExtrudeGeometry(chassisShape, {
          depth,
          bevelEnabled: true,
          bevelSegments: 3,
          steps: 1,
          bevelSize: 0.025,
          bevelThickness: 0.025
        })
      );
      chassisGeo.center();
      const chassisMesh = new THREE.Mesh(chassisGeo, chassisMat);
      group.add(chassisMesh);

      if (includeNeonRim) {
        const rimGeo = trackGeo(
          new THREE.BoxGeometry(width * 0.42, 0.028, 0.03)
        );
        const rimMesh = new THREE.Mesh(rimGeo, neonTrimMat);
        rimMesh.position.set(0, height / 2 + 0.014, depth / 2 + 0.005);
        group.add(rimMesh);
      }

      const screenGeo = trackGeo(new THREE.PlaneGeometry(width - 0.14, height - 0.14));
      const screenMat = trackMat(
        new THREE.MeshStandardMaterial({
          map: texture,
          emissive: 0xffffff,
          emissiveMap: texture,
          emissiveIntensity: 0.85,
          roughness: 0.18,
          metalness: 0.1
        })
      );
      const screenMesh = new THREE.Mesh(screenGeo, screenMat);
      screenMesh.position.set(0, 0, depth / 2 + 0.028);
      group.add(screenMesh);

      return group;
    };

    // Root Workspace Group (scaled responsively + parallax target)
    const workspaceRoot = new THREE.Group();
    workspaceRoot.scale.setScalar(0.86);
    workspaceRoot.position.y = -0.4;
    scene.add(workspaceRoot);

    // --- 5A. MAIN FLOATING 3D BROWSER WINDOW (CENTERPIECE) ---
    const browserTex = trackTex(createBrowserScreenTexture(maxAnisotropy));
    const browserGroup = buildDisplayPanel(3.6, 2.38, 0.12, 0.14, browserTex, true);
    browserGroup.position.set(0, 0.08, 0);
    browserGroup.rotation.set(-0.04, -0.14, 0.01);

    // Raised 3D UI Component Chips floating subtly in front of Browser
    const uiChipGeo = trackGeo(new THREE.BoxGeometry(0.76, 0.24, 0.045));
    const uiChipMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x141414,
        metalness: 0.7,
        roughness: 0.25
      })
    );
    const uiChip1 = new THREE.Mesh(uiChipGeo, uiChipMat);
    uiChip1.position.set(-0.98, 0.62, 0.14);
    const uiChipDot = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.16, 0.05, 0.055)),
      neonTrimMat
    );
    uiChipDot.position.set(-0.22, 0, 0.01);
    uiChip1.add(uiChipDot);
    browserGroup.add(uiChip1);

    workspaceRoot.add(browserGroup);

    // --- 5B. CODE EDITOR INTERFACE (UPPER LEFT SOFTWARE LAYER) ---
    const codeTex = trackTex(createCodeEditorTexture(maxAnisotropy));
    const codeGroup = buildDisplayPanel(2.05, 1.38, 0.09, 0.1, codeTex, true);
    codeGroup.position.set(-1.72, 0.96, 0.68);
    codeGroup.rotation.set(0.08, 0.26, -0.04);
    workspaceRoot.add(codeGroup);

    // --- 5C. MOBILE APPLICATION MOCKUP (LOWER LEFT FOREGROUND) ---
    const mobileTex = trackTex(createMobileAppTexture(maxAnisotropy));
    const mobileGroup = new THREE.Group();
    const phoneShape = createRoundedRectShape(0.96, 1.88, 0.14);
    const phoneBodyGeo = trackGeo(
      new THREE.ExtrudeGeometry(phoneShape, {
        depth: 0.085,
        bevelEnabled: true,
        bevelSegments: 3,
        steps: 1,
        bevelSize: 0.022,
        bevelThickness: 0.022
      })
    );
    phoneBodyGeo.center();
    const phoneBody = new THREE.Mesh(phoneBodyGeo, titaniumMat);
    mobileGroup.add(phoneBody);

    const phoneScreenGeo = trackGeo(new THREE.PlaneGeometry(0.84, 1.74));
    const phoneScreenMat = trackMat(
      new THREE.MeshStandardMaterial({
        map: mobileTex,
        emissive: 0xffffff,
        emissiveMap: mobileTex,
        emissiveIntensity: 0.88,
        roughness: 0.15,
        metalness: 0.08
      })
    );
    const phoneScreen = new THREE.Mesh(phoneScreenGeo, phoneScreenMat);
    phoneScreen.position.z = 0.066;
    mobileGroup.add(phoneScreen);

    // Phone side accent button
    const sideBtn = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.025, 0.22, 0.03)),
      neonTrimMat
    );
    sideBtn.position.set(0.5, 0.22, 0);
    mobileGroup.add(sideBtn);

    mobileGroup.position.set(-1.58, -0.78, 1.08);
    mobileGroup.rotation.set(-0.08, 0.34, 0.06);
    workspaceRoot.add(mobileGroup);

    // --- 5D. FLOATING ANALYTICS & DIGITAL GROWTH DASHBOARD (RIGHT LAYER) ---
    const analyticsTex = trackTex(createAnalyticsTexture(maxAnisotropy));
    const analyticsGroup = buildDisplayPanel(2.38, 1.54, 0.1, 0.12, analyticsTex, true);

    // Physical 3D Extruded Growth Bars mounted along bottom-right of Analytics Board
    const barHeights = [0.22, 0.34, 0.48, 0.64, 0.86];
    const barGeo = trackGeo(new THREE.BoxGeometry(0.11, 1, 0.09));
    barHeights.forEach((bh, idx) => {
      const isHighlight = idx >= 3;
      const barMesh = new THREE.Mesh(barGeo, isHighlight ? neonTrimMat : titaniumMat);
      barMesh.scale.y = bh;
      barMesh.position.set(0.32 + idx * 0.16, -0.52 + bh / 2, 0.12);
      analyticsGroup.add(barMesh);
    });

    analyticsGroup.position.set(1.62, 0.72, 0.56);
    analyticsGroup.rotation.set(0.06, -0.34, 0.03);
    workspaceRoot.add(analyticsGroup);

    // --- 5E. SEO PERFORMANCE & CAMPAIGN CARDS (LOWER RIGHT FOREGROUND) ---
    const seoTex = trackTex(createSeoCardTexture(maxAnisotropy));
    const seoCardGroup = buildDisplayPanel(1.36, 0.85, 0.075, 0.08, seoTex, false);
    seoCardGroup.position.set(1.52, -0.78, 0.96);
    seoCardGroup.rotation.set(-0.09, -0.28, -0.04);
    workspaceRoot.add(seoCardGroup);

    const campaignTex = trackTex(createCampaignCardTexture(maxAnisotropy));
    const campaignCardGroup = buildDisplayPanel(1.28, 0.75, 0.07, 0.08, campaignTex, false);
    campaignCardGroup.position.set(0.18, -1.22, 0.76);
    campaignCardGroup.rotation.set(-0.14, 0.06, 0.02);
    workspaceRoot.add(campaignCardGroup);

    // --- 5F. ABSTRACT TECH ORBITALS & BRAND TRIANGLE EMBLEM ---
    const orbitalGroup = new THREE.Group();
    const outerRing = new THREE.Mesh(
      trackGeo(new THREE.TorusGeometry(2.75, 0.016, 12, 96)),
      subtleRingMat
    );
    outerRing.rotation.set(Math.PI / 2.6, 0.18, 0);
    orbitalGroup.add(outerRing);

    const innerNeonArc = new THREE.Mesh(
      trackGeo(new THREE.TorusGeometry(2.25, 0.012, 10, 84, Math.PI * 1.15)),
      neonTrimMat
    );
    innerNeonArc.rotation.set(-Math.PI / 3.1, -0.35, 0.4);
    orbitalGroup.add(innerNeonArc);

    // Floating 3D Darkvence Triangle Accent
    const triShape = createRoundedTriangleShape(0.42);
    const triGeo = trackGeo(
      new THREE.ExtrudeGeometry(triShape, {
        depth: 0.06,
        bevelEnabled: true,
        bevelSegments: 2,
        steps: 1,
        bevelSize: 0.02,
        bevelThickness: 0.02
      })
    );
    triGeo.center();
    const triAccent = new THREE.Mesh(triGeo, neonTrimMat);
    triAccent.position.set(0.24, 1.66, -0.28);
    orbitalGroup.add(triAccent);

    // Ambient Backing Glow Halo Plane (subtle, zero z-fighting)
    const backingPlate = new THREE.Mesh(
      trackGeo(new THREE.RingGeometry(1.5, 2.6, 48)),
      darkInsetMat
    );
    backingPlate.position.set(0, 0, -1.35);
    orbitalGroup.add(backingPlate);

    workspaceRoot.add(orbitalGroup);

    // Lightweight Instanced Tech Nodes (skipped on narrow mobile for peak FPS)
    let nodesMesh: THREE.InstancedMesh | null = null;
    const nodeCount = isMobileViewport() ? 0 : 22;
    const nodeOrbitData: { radius: number; speed: number; angle: number; yOffset: number; scale: number }[] = [];

    if (nodeCount > 0) {
      const nodeGeo = trackGeo(new THREE.OctahedronGeometry(0.045, 0));
      nodesMesh = new THREE.InstancedMesh(nodeGeo, neonTrimMat, nodeCount);
      nodesMesh.frustumCulled = false;
      const dummy = new THREE.Object3D();

      for (let i = 0; i < nodeCount; i++) {
        const angle = (i / nodeCount) * Math.PI * 2;
        const radius = 2.25 + (i % 4) * 0.38;
        const yOffset = ((i % 5) - 2) * 0.42;
        const speed = (0.14 + (i % 3) * 0.05) * (i % 2 === 0 ? 1 : -1);
        const scale = 0.7 + (i % 3) * 0.35;
        nodeOrbitData.push({ radius, speed, angle, yOffset, scale });

        dummy.position.set(Math.cos(angle) * radius, yOffset, Math.sin(angle) * radius * 0.65);
        dummy.scale.setScalar(scale);
        dummy.updateMatrix();
        nodesMesh.setMatrixAt(i, dummy.matrix);
      }
      nodesMesh.instanceMatrix.needsUpdate = true;
      workspaceRoot.add(nodesMesh);
    }

    // Pre-compile shaders cleanly on hardware GL
    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // ResizeObserver for crisp responsive scaling
    const resizeObserver = new ResizeObserver((entries) => {
      if (disposed) return;
      for (const entry of entries) {
        const w = Math.max(Math.floor(entry.contentRect.width), 240);
        const h = Math.max(Math.floor(entry.contentRect.height), 240);
        updateRendererPixelRatio();
        updateCameraForSize(w, h);
        renderer.setSize(w, h);
      }
    });
    resizeObserver.observe(container);

    // Pre-allocated animation helpers (zero GC in loop)
    const clock = new THREE.Clock();
    const _dummy = new THREE.Object3D();

    let currentParallaxX = 0;
    let currentParallaxY = 0;
    let entranceScale = 0.86;
    let entranceY = -0.35;

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (typeof gl?.fenceSync === 'function') {
        const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
        gl.flush();
        const poll = () => {
          if (disposed) return;
          const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
          if (state === gl.UNSIGNALED) {
            frameId = window.setTimeout(poll, 5);
          } else {
            gl.deleteSync(sync);
            frameId = window.setTimeout(cb, 80);
          }
        };
        frameId = window.setTimeout(poll, 5);
      } else {
        frameId = window.setTimeout(cb, 80);
      }
    }

    function tick() {
      if (disposed) return;

      const delta = Math.min(clock.getDelta(), 0.05);
      const elapsed = clock.getElapsedTime();

      // Smooth entrance damping
      entranceScale = THREE.MathUtils.damp(entranceScale, 1, 4.2, delta);
      entranceY = THREE.MathUtils.damp(entranceY, 0, 4.2, delta);

      const responsiveScale = isMobileViewport() ? 0.86 : 1;
      workspaceRoot.scale.setScalar(entranceScale * responsiveScale);

      // Mouse parallax damping
      const targetPX = parallaxRef.current?.x ?? 0;
      const targetPY = parallaxRef.current?.y ?? 0;
      currentParallaxX = THREE.MathUtils.damp(currentParallaxX, targetPX, 4.5, delta);
      currentParallaxY = THREE.MathUtils.damp(currentParallaxY, targetPY, 4.5, delta);

      workspaceRoot.rotation.y = currentParallaxX * 0.22 + Math.sin(elapsed * 0.35) * 0.04;
      workspaceRoot.rotation.x = -currentParallaxY * 0.14 + Math.cos(elapsed * 0.3) * 0.025;
      workspaceRoot.position.y = entranceY + Math.sin(elapsed * 0.7) * 0.05;

      // Subtle individual floating & depth breathing
      browserGroup.position.y = 0.08 + Math.sin(elapsed * 0.9) * 0.055;
      codeGroup.position.y = 0.96 + Math.sin(elapsed * 1.05 + 1.1) * 0.065;
      mobileGroup.position.y = -0.78 + Math.sin(elapsed * 1.15 + 2.2) * 0.07;
      analyticsGroup.position.y = 0.72 + Math.sin(elapsed * 0.95 + 0.6) * 0.06;
      seoCardGroup.position.y = -0.78 + Math.sin(elapsed * 1.1 + 3.1) * 0.055;
      campaignCardGroup.position.y = -1.22 + Math.sin(elapsed * 1.0 + 4.0) * 0.05;

      // Subtle orbital rotation
      orbitalGroup.rotation.z = elapsed * 0.06;
      innerNeonArc.rotation.z = 0.4 + elapsed * 0.12;
      triAccent.rotation.y = elapsed * 0.45;
      triAccent.position.y = 1.66 + Math.sin(elapsed * 1.3) * 0.06;

      // Update instanced nodes
      if (nodesMesh) {
        for (let i = 0; i < nodeOrbitData.length; i++) {
          const item = nodeOrbitData[i];
          const a = item.angle + elapsed * item.speed;
          _dummy.position.set(
            Math.cos(a) * item.radius,
            item.yOffset + Math.sin(elapsed * 0.9 + i) * 0.08,
            Math.sin(a) * item.radius * 0.55 - 0.35
          );
          _dummy.rotation.set(elapsed * 0.4, a, 0);
          _dummy.scale.setScalar(item.scale);
          _dummy.updateMatrix();
          nodesMesh.setMatrixAt(i, _dummy.matrix);
        }
        nodesMesh.instanceMatrix.needsUpdate = true;
      }

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    tick();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      resizeObserver.disconnect();

      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      textures.forEach((t) => t.dispose());
      envTarget.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [parallaxRef, shouldReduceMotion]);

  if (shouldReduceMotion || webglUnavailable) {
    return <StaticWorkspaceFallback />;
  }

  return (
    <div
      className="relative w-full h-[300px] sm:h-[380px] md:h-[420px] lg:h-[490px] xl:h-[540px] select-none overflow-hidden"
      aria-label="Interactive 3D visualization of Darkvence software engineering and digital marketing systems"
    >
      {/* Subtle neon ambient aura behind canvas (never over it with backdrop-blur) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-6 rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(183,255,50,0.16),transparent_68%)]"
      />
      <div ref={mountRef} className="relative w-full h-full" />
    </div>
  );
};
