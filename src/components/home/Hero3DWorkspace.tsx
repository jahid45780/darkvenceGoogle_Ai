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
  createCampaignCardTexture,
  createUiSystemCardTexture,
  createGlowSpriteTexture
} from './hero3dTextures.ts';

interface Hero3DWorkspaceProps {
  parallaxRef: React.RefObject<{ x: number; y: number }>;
  shouldReduceMotion: boolean;
}

interface AnimatedPanelEntry {
  group: THREE.Group;
  basePos: THREE.Vector3;
  baseRot: THREE.Euler;
  delay: number;
  floatSpeed: number;
  floatAmp: number;
  phase: number;
  parallaxDepth: number;
  scaleProgress: number;
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

function createTriangleShape(size: number): THREE.Shape {
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
    className="relative w-full h-full min-h-[300px] sm:min-h-[380px] lg:min-h-[480px] flex items-center justify-center p-4"
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

    // 1. WebGL Renderer setup
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;
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

    const initialW = Math.max(container.clientWidth || 560, 260);
    const initialH = Math.max(container.clientHeight || 520, 260);
    renderer.setSize(initialW, initialH);
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 2. Scene, Fog & Camera
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050505, 0.024);

    const camera = new THREE.PerspectiveCamera(35, initialW / initialH, 0.1, 100);
    const updateCameraForSize = (w: number, h: number) => {
      camera.aspect = w / Math.max(h, 1);
      if (w < 420) {
        camera.position.set(0, 0.08, 11.4);
      } else if (w < 640) {
        camera.position.set(0, 0.08, 10.2);
      } else if (w < 1024) {
        camera.position.set(0.05, 0.08, 9.1);
      } else {
        camera.position.set(0.14, 0.1, 8.35);
      }
      camera.updateProjectionMatrix();
    };
    updateCameraForSize(initialW, initialH);

    // 3. Studio Reflection Environment (RoomEnvironment)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTarget = pmremGenerator.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = envTarget.texture;
    pmremGenerator.dispose();

    // 4. Cinematic Lighting Rig (Studio Key + Cool Fill + Neon Lime Rim Accents)
    const hemiLight = new THREE.HemisphereLight(0xe5e7eb, 0x050505, 0.72);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.05);
    keyLight.position.set(4.8, 6.4, 6.8);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xb7ff32, 0.65);
    fillLight.position.set(-5.8, 1.8, 4.2);
    scene.add(fillLight);

    const neonRimLight = new THREE.PointLight(0xb7ff32, 3.6, 15, 1.55);
    neonRimLight.position.set(2.9, -1.5, 3.5);
    scene.add(neonRimLight);

    const topAccentLight = new THREE.PointLight(0xb7ff32, 2.3, 13, 1.65);
    topAccentLight.position.set(-2.6, 3.3, 2.5);
    scene.add(topAccentLight);

    // Resource tracking arrays
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

    // Shared Cinematic PBR Materials
    const chassisMat = trackMat(
      new THREE.MeshPhysicalMaterial({
        color: 0x101010,
        metalness: 0.82,
        roughness: 0.24,
        clearcoat: 0.55,
        clearcoatRoughness: 0.16,
        reflectivity: 0.9
      })
    );
    const titaniumMat = trackMat(
      new THREE.MeshPhysicalMaterial({
        color: 0x1c1c1e,
        metalness: 0.9,
        roughness: 0.19,
        clearcoat: 0.65,
        clearcoatRoughness: 0.14
      })
    );
    const glassRimMat = trackMat(
      new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        metalness: 0.1,
        roughness: 0.12,
        clearcoat: 1.0,
        transparent: true,
        opacity: 0.14,
        depthWrite: false
      })
    );
    const neonTrimMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xb7ff32,
        emissive: 0xb7ff32,
        emissiveIntensity: 0.9,
        metalness: 0.22,
        roughness: 0.22
      })
    );
    const pulseBeaconMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xb7ff32,
        emissive: 0xb7ff32,
        emissiveIntensity: 1.35,
        metalness: 0.1,
        roughness: 0.15
      })
    );
    const subtleRingMat = trackMat(
      new THREE.MeshPhysicalMaterial({
        color: 0x262626,
        metalness: 0.92,
        roughness: 0.2,
        clearcoat: 0.45
      })
    );
    const splineConduitMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x2a331d,
        emissive: 0xb7ff32,
        emissiveIntensity: 0.28,
        metalness: 0.6,
        roughness: 0.3,
        transparent: true,
        opacity: 0.68
      })
    );

    // Helper: Build multi-layered beveled glassmorphic display assembly
    const buildDisplayPanel = (
      width: number,
      height: number,
      depth: number,
      radius: number,
      texture: THREE.Texture,
      options: { includeNeonRim?: boolean; includeGlassHalo?: boolean } = {}
    ): THREE.Group => {
      const { includeNeonRim = true, includeGlassHalo = true } = options;
      const group = new THREE.Group();

      // Main beveled titanium chassis
      const chassisShape = createRoundedRectShape(width, height, radius);
      const chassisGeo = trackGeo(
        new THREE.ExtrudeGeometry(chassisShape, {
          depth,
          bevelEnabled: true,
          bevelSegments: 3,
          steps: 1,
          bevelSize: 0.024,
          bevelThickness: 0.024
        })
      );
      chassisGeo.center();
      const chassisMesh = new THREE.Mesh(chassisGeo, chassisMat);
      group.add(chassisMesh);

      // Smoked translucent glass outer bevel collar
      if (includeGlassHalo) {
        const haloShape = createRoundedRectShape(width + 0.09, height + 0.09, radius + 0.03);
        const haloGeo = trackGeo(new THREE.ShapeGeometry(haloShape));
        const haloMesh = new THREE.Mesh(haloGeo, glassRimMat);
        haloMesh.position.set(0, 0, -depth / 2 - 0.02);
        haloMesh.renderOrder = 1;
        group.add(haloMesh);
      }

      // Top neon light bar accent
      if (includeNeonRim) {
        const rimGeo = trackGeo(new THREE.BoxGeometry(width * 0.4, 0.026, 0.032));
        const rimMesh = new THREE.Mesh(rimGeo, neonTrimMat);
        rimMesh.position.set(0, height / 2 + 0.015, depth / 2 + 0.008);
        group.add(rimMesh);
      }

      // Crisp screen display plane
      const screenGeo = trackGeo(new THREE.PlaneGeometry(width - 0.13, height - 0.13));
      const screenMat = trackMat(
        new THREE.MeshPhysicalMaterial({
          map: texture,
          emissive: 0xffffff,
          emissiveMap: texture,
          emissiveIntensity: 0.9,
          roughness: 0.16,
          metalness: 0.08,
          clearcoat: 0.35,
          clearcoatRoughness: 0.12
        })
      );
      const screenMesh = new THREE.Mesh(screenGeo, screenMat);
      screenMesh.position.set(0, 0, depth / 2 + 0.028);
      group.add(screenMesh);

      return group;
    };

    // Root Workspace Group
    const workspaceRoot = new THREE.Group();
    scene.add(workspaceRoot);

    // Volumetric Atmospheric Backlight Halo behind centerpiece
    const glowTex = trackTex(createGlowSpriteTexture());
    const glowMat = trackMat(
      new THREE.MeshBasicMaterial({
        map: glowTex,
        transparent: true,
        opacity: 0.65,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    );
    const glowPlane = new THREE.Mesh(trackGeo(new THREE.PlaneGeometry(6.8, 6.8)), glowMat);
    glowPlane.position.set(0.15, 0.05, -1.75);
    glowPlane.renderOrder = -1;
    workspaceRoot.add(glowPlane);

    const animatedPanels: AnimatedPanelEntry[] = [];
    const registerPanel = (
      group: THREE.Group,
      pos: [number, number, number],
      rot: [number, number, number],
      delay: number,
      floatSpeed: number,
      floatAmp: number,
      phase: number,
      parallaxDepth: number
    ) => {
      group.position.set(pos[0], pos[1], pos[2]);
      group.rotation.set(rot[0], rot[1], rot[2]);
      workspaceRoot.add(group);
      animatedPanels.push({
        group,
        basePos: new THREE.Vector3(pos[0], pos[1], pos[2]),
        baseRot: new THREE.Euler(rot[0], rot[1], rot[2]),
        delay,
        floatSpeed,
        floatAmp,
        phase,
        parallaxDepth,
        scaleProgress: 0.72
      });
    };

    // --- 5A. MAIN FLOATING 3D BROWSER WINDOW (CENTERPIECE) ---
    const browserTex = trackTex(createBrowserScreenTexture(maxAnisotropy));
    const browserGroup = buildDisplayPanel(3.55, 2.34, 0.12, 0.14, browserTex, {
      includeNeonRim: true,
      includeGlassHalo: true
    });

    // Raised 3D UI Component Chip floating forward on Browser
    const uiChipMat = trackMat(
      new THREE.MeshPhysicalMaterial({
        color: 0x151517,
        metalness: 0.75,
        roughness: 0.22,
        clearcoat: 0.5
      })
    );
    const uiChip1 = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.84, 0.24, 0.048)),
      uiChipMat
    );
    uiChip1.position.set(-0.92, 0.62, 0.16);
    const uiChipBeacon = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.16, 0.048, 0.056)),
      pulseBeaconMat
    );
    uiChipBeacon.position.set(-0.26, 0, 0.008);
    uiChip1.add(uiChipBeacon);
    browserGroup.add(uiChip1);

    // Secondary Floating Deployment Chip bottom-right of browser
    const uiChip2 = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.56, 0.18, 0.042)),
      uiChipMat
    );
    uiChip2.position.set(1.06, -0.78, 0.15);
    const uiChip2Led = new THREE.Mesh(
      trackGeo(new THREE.SphereGeometry(0.032, 12, 12)),
      pulseBeaconMat
    );
    uiChip2Led.position.set(-0.18, 0, 0.025);
    uiChip2.add(uiChip2Led);
    browserGroup.add(uiChip2);

    registerPanel(browserGroup, [0, 0.06, 0], [-0.04, -0.13, 0.01], 0, 0.85, 0.055, 0, 0.12);

    // --- 5B. CODE EDITOR INTERFACE (UPPER LEFT SOFTWARE LAYER) ---
    const codeTex = trackTex(createCodeEditorTexture(maxAnisotropy));
    const codeGroup = buildDisplayPanel(2.04, 1.36, 0.09, 0.1, codeTex, {
      includeNeonRim: true,
      includeGlassHalo: true
    });
    registerPanel(codeGroup, [-1.72, 0.96, 0.68], [0.08, 0.27, -0.04], 0.08, 1.02, 0.065, 1.1, 0.22);

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
    mobileGroup.add(new THREE.Mesh(phoneBodyGeo, titaniumMat));

    const phoneScreenMat = trackMat(
      new THREE.MeshPhysicalMaterial({
        map: mobileTex,
        emissive: 0xffffff,
        emissiveMap: mobileTex,
        emissiveIntensity: 0.9,
        roughness: 0.14,
        metalness: 0.08,
        clearcoat: 0.45
      })
    );
    const phoneScreen = new THREE.Mesh(trackGeo(new THREE.PlaneGeometry(0.84, 1.74)), phoneScreenMat);
    phoneScreen.position.z = 0.068;
    mobileGroup.add(phoneScreen);

    // Metallic neon side rail button
    const sideBtn = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.026, 0.24, 0.032)),
      neonTrimMat
    );
    sideBtn.position.set(0.5, 0.22, 0);
    mobileGroup.add(sideBtn);

    // Floating 3D live badge above top-right of mobile
    const mobileFloatChip = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.42, 0.14, 0.036)),
      uiChipMat
    );
    mobileFloatChip.position.set(0.28, 0.72, 0.13);
    const mobileDot = new THREE.Mesh(
      trackGeo(new THREE.SphereGeometry(0.026, 12, 12)),
      pulseBeaconMat
    );
    mobileDot.position.set(-0.12, 0, 0.022);
    mobileFloatChip.add(mobileDot);
    mobileGroup.add(mobileFloatChip);

    registerPanel(mobileGroup, [-1.58, -0.78, 1.08], [-0.08, 0.34, 0.06], 0.15, 1.12, 0.072, 2.2, 0.34);

    // --- 5D. MODULAR UI COMPONENT ARCHITECTURE CARD (UPPER CENTER-BACK) ---
    const uiSysTex = trackTex(createUiSystemCardTexture(maxAnisotropy));
    const uiCardGroup = buildDisplayPanel(1.32, 0.78, 0.07, 0.08, uiSysTex, {
      includeNeonRim: false,
      includeGlassHalo: true
    });
    registerPanel(uiCardGroup, [0.22, 1.46, -0.42], [0.1, -0.08, -0.02], 0.18, 0.9, 0.055, 0.5, 0.08);

    // --- 5E. FLOATING ANALYTICS & DIGITAL GROWTH DASHBOARD (RIGHT MIDGROUND) ---
    const analyticsTex = trackTex(createAnalyticsTexture(maxAnisotropy));
    const analyticsGroup = buildDisplayPanel(2.38, 1.54, 0.1, 0.12, analyticsTex, {
      includeNeonRim: true,
      includeGlassHalo: true
    });

    // Animated 3D Extruded Growth Equalizer Bars in bottom-right chart bay
    const baseBarHeights = [0.22, 0.34, 0.48, 0.64, 0.86];
    const barGeo = trackGeo(new THREE.BoxGeometry(0.105, 1, 0.095));
    const animatedBars: { mesh: THREE.Mesh; baseH: number; phase: number; x: number }[] = [];

    baseBarHeights.forEach((bh, idx) => {
      const isHighlight = idx >= 3;
      const barMesh = new THREE.Mesh(barGeo, isHighlight ? neonTrimMat : titaniumMat);
      const bx = 0.42 + idx * 0.145;
      barMesh.scale.y = bh;
      barMesh.position.set(bx, -0.52 + bh / 2, 0.12);
      analyticsGroup.add(barMesh);
      animatedBars.push({ mesh: barMesh, baseH: bh, phase: idx * 0.75, x: bx });
    });

    // 3D glowing terminal growth node sphere
    const chartBeacon = new THREE.Mesh(
      trackGeo(new THREE.SphereGeometry(0.045, 16, 16)),
      pulseBeaconMat
    );
    chartBeacon.position.set(0.24, -0.02, 0.11);
    analyticsGroup.add(chartBeacon);

    registerPanel(analyticsGroup, [1.62, 0.7, 0.58], [0.06, -0.34, 0.03], 0.22, 0.94, 0.062, 0.65, 0.24);

    // --- 5F. SEO PERFORMANCE & CAMPAIGN CARDS (LOWER RIGHT & CENTER FOREGROUND) ---
    const seoTex = trackTex(createSeoCardTexture(maxAnisotropy));
    const seoCardGroup = buildDisplayPanel(1.36, 0.85, 0.075, 0.08, seoTex, {
      includeNeonRim: false,
      includeGlassHalo: true
    });
    // Subtle 3D circular bezel accent around SEO score ring
    const seoRingAccent = new THREE.Mesh(
      trackGeo(new THREE.TorusGeometry(0.21, 0.012, 10, 40)),
      neonTrimMat
    );
    seoRingAccent.position.set(-0.37, -0.04, 0.072);
    seoCardGroup.add(seoRingAccent);
    registerPanel(seoCardGroup, [1.54, -0.78, 0.98], [-0.09, -0.28, -0.04], 0.28, 1.08, 0.056, 3.1, 0.32);

    const campaignTex = trackTex(createCampaignCardTexture(maxAnisotropy));
    const campaignCardGroup = buildDisplayPanel(1.28, 0.75, 0.07, 0.08, campaignTex, {
      includeNeonRim: false,
      includeGlassHalo: true
    });
    registerPanel(campaignCardGroup, [0.16, -1.24, 0.82], [-0.14, 0.06, 0.02], 0.33, 0.98, 0.052, 4.0, 0.28);

    // --- 5G. CURVED DATA CONDUIT SPLINES & TRAVELING TELEMETRY PULSES ---
    const splineConfigs = [
      [
        new THREE.Vector3(-1.35, 0.72, 0.55),
        new THREE.Vector3(-0.65, 0.48, 0.22),
        new THREE.Vector3(0.15, 0.22, 0.14),
        new THREE.Vector3(1.15, 0.54, 0.45)
      ],
      [
        new THREE.Vector3(-1.15, -0.62, 0.88),
        new THREE.Vector3(-0.35, -0.82, 0.55),
        new THREE.Vector3(0.45, -0.88, 0.65),
        new THREE.Vector3(1.25, -0.68, 0.82)
      ],
      [
        new THREE.Vector3(0.15, 1.15, -0.22),
        new THREE.Vector3(0.68, 0.82, 0.18),
        new THREE.Vector3(1.18, 0.58, 0.46)
      ]
    ];

    const dataPulses: { curve: THREE.CatmullRomCurve3; mesh: THREE.Mesh; speed: number; offset: number }[] = [];
    const pulseSphereGeo = trackGeo(new THREE.SphereGeometry(0.036, 12, 12));

    splineConfigs.forEach((pts, idx) => {
      const curve = new THREE.CatmullRomCurve3(pts);
      const tubeGeo = trackGeo(new THREE.TubeGeometry(curve, 36, 0.0085, 6, false));
      const tubeMesh = new THREE.Mesh(tubeGeo, splineConduitMat);
      workspaceRoot.add(tubeMesh);

      const pulseMesh = new THREE.Mesh(pulseSphereGeo, pulseBeaconMat);
      workspaceRoot.add(pulseMesh);
      dataPulses.push({
        curve,
        mesh: pulseMesh,
        speed: 0.28 + idx * 0.07,
        offset: idx * 0.33
      });
    });

    // --- 5H. TECH ORBITALS & 3D DARKVENCE BRAND TRIANGLE EMBLEM ---
    const orbitalGroup = new THREE.Group();
    const outerRing = new THREE.Mesh(
      trackGeo(new THREE.TorusGeometry(2.85, 0.015, 12, 100)),
      subtleRingMat
    );
    outerRing.rotation.set(Math.PI / 2.55, 0.18, 0);
    orbitalGroup.add(outerRing);

    const innerNeonArc = new THREE.Mesh(
      trackGeo(new THREE.TorusGeometry(2.32, 0.013, 10, 84, Math.PI * 1.18)),
      neonTrimMat
    );
    innerNeonArc.rotation.set(-Math.PI / 3.1, -0.35, 0.4);
    orbitalGroup.add(innerNeonArc);

    // 3D Geometric Brand Emblem (Outer Lime Triangle + Inner Inverted Titanium Core)
    const triEmblemGroup = new THREE.Group();
    const outerTriGeo = trackGeo(
      new THREE.ExtrudeGeometry(createTriangleShape(0.44), {
        depth: 0.055,
        bevelEnabled: true,
        bevelSegments: 2,
        steps: 1,
        bevelSize: 0.018,
        bevelThickness: 0.018
      })
    );
    outerTriGeo.center();
    triEmblemGroup.add(new THREE.Mesh(outerTriGeo, neonTrimMat));

    const innerTriGeo = trackGeo(
      new THREE.ExtrudeGeometry(createTriangleShape(0.22), {
        depth: 0.07,
        bevelEnabled: true,
        bevelSegments: 2,
        steps: 1,
        bevelSize: 0.01,
        bevelThickness: 0.01
      })
    );
    innerTriGeo.center();
    const innerTri = new THREE.Mesh(innerTriGeo, titaniumMat);
    innerTri.rotation.z = Math.PI;
    innerTri.position.set(0, -0.02, 0.015);
    triEmblemGroup.add(innerTri);

    triEmblemGroup.position.set(-0.78, 1.54, -0.22);
    orbitalGroup.add(triEmblemGroup);

    // Subtle geometric reticle ring behind centerpiece
    const backingRing = new THREE.Mesh(
      trackGeo(new THREE.RingGeometry(1.75, 1.79, 64)),
      glassRimMat
    );
    backingRing.position.set(0, 0, -1.25);
    orbitalGroup.add(backingRing);

    workspaceRoot.add(orbitalGroup);

    // --- 5I. LIGHTWEIGHT INSTANCED TECH NODES & FLOATING PARTICLES (SKIPPED ON MOBILE) ---
    let nodesMesh: THREE.InstancedMesh | null = null;
    const nodeCount = isMobileViewport() ? 0 : 24;
    const nodeOrbitData: { radius: number; speed: number; angle: number; yOffset: number; scale: number }[] = [];

    if (nodeCount > 0) {
      const nodeGeo = trackGeo(new THREE.OctahedronGeometry(0.042, 0));
      nodesMesh = new THREE.InstancedMesh(nodeGeo, neonTrimMat, nodeCount);
      nodesMesh.frustumCulled = false;
      const dummy = new THREE.Object3D();

      for (let i = 0; i < nodeCount; i++) {
        const angle = (i / nodeCount) * Math.PI * 2;
        const radius = 2.3 + (i % 4) * 0.4;
        const yOffset = ((i % 5) - 2) * 0.44;
        const speed = (0.14 + (i % 3) * 0.05) * (i % 2 === 0 ? 1 : -1);
        const scale = 0.65 + (i % 3) * 0.35;
        nodeOrbitData.push({ radius, speed, angle, yOffset, scale });

        dummy.position.set(Math.cos(angle) * radius, yOffset, Math.sin(angle) * radius * 0.6);
        dummy.scale.setScalar(scale);
        dummy.updateMatrix();
        nodesMesh.setMatrixAt(i, dummy.matrix);
      }
      nodesMesh.instanceMatrix.needsUpdate = true;
      workspaceRoot.add(nodesMesh);
    }

    // Subtle ambient particle dust field on desktop/tablet
    let dustPoints: THREE.Points | null = null;
    if (!isMobileViewport()) {
      const dustCount = 48;
      const positions = new Float32Array(dustCount * 3);
      for (let i = 0; i < dustCount; i++) {
        const theta = i * 2.39996;
        const r = 1.6 + (i % 6) * 0.45;
        positions[i * 3] = Math.cos(theta) * r;
        positions[i * 3 + 1] = ((i % 9) - 4) * 0.48;
        positions[i * 3 + 2] = Math.sin(theta) * r * 0.65 - 0.3;
      }
      const dustGeo = trackGeo(new THREE.BufferGeometry());
      dustGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const dustMat = trackMat(
        new THREE.PointsMaterial({
          color: 0xb7ff32,
          size: 0.032,
          transparent: true,
          opacity: 0.5,
          depthWrite: false
        })
      );
      dustPoints = new THREE.Points(dustGeo, dustMat);
      workspaceRoot.add(dustPoints);
    }

    // Pre-compile shaders cleanly on hardware GL
    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // Responsive ResizeObserver
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

    // Passive Scroll Interaction (zero React state updates)
    let targetScrollProgress = 0;
    const handleScroll = () => {
      const maxScroll = Math.max(window.innerHeight * 0.9, 640);
      targetScrollProgress = THREE.MathUtils.clamp(window.scrollY / maxScroll, 0, 1);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Pre-allocated animation state (zero GC allocations inside tick)
    const clock = new THREE.Clock();
    const _dummy = new THREE.Object3D();
    const _curvePt = new THREE.Vector3();

    let currentParallaxX = 0;
    let currentParallaxY = 0;
    let currentScrollProgress = 0;
    let rootEntranceY = -0.28;

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

      // Smooth root damping
      rootEntranceY = THREE.MathUtils.damp(rootEntranceY, 0, 4.0, delta);
      const responsiveScale = isMobileViewport() ? 0.88 : 1.03;
      workspaceRoot.scale.setScalar(responsiveScale);

      // Mouse parallax + passive scroll damping
      const targetPX = parallaxRef.current?.x ?? 0;
      const targetPY = parallaxRef.current?.y ?? 0;
      currentParallaxX = THREE.MathUtils.damp(currentParallaxX, targetPX, 4.5, delta);
      currentParallaxY = THREE.MathUtils.damp(currentParallaxY, targetPY, 4.5, delta);
      currentScrollProgress = THREE.MathUtils.damp(currentScrollProgress, targetScrollProgress, 5.0, delta);

      workspaceRoot.rotation.y =
        currentParallaxX * 0.24 +
        currentScrollProgress * 0.28 +
        Math.sin(elapsed * 0.34) * 0.04;
      workspaceRoot.rotation.x =
        -currentParallaxY * 0.15 +
        currentScrollProgress * 0.14 +
        Math.cos(elapsed * 0.29) * 0.025;
      workspaceRoot.position.y =
        rootEntranceY + Math.sin(elapsed * 0.68) * 0.045 - currentScrollProgress * 0.28;
      workspaceRoot.position.z = -currentScrollProgress * 0.45;

      // Staggered entrance + multi-harmonic floating + layered depth parallax per panel
      for (let i = 0; i < animatedPanels.length; i++) {
        const p = animatedPanels[i];
        const active = elapsed >= p.delay;
        p.scaleProgress = THREE.MathUtils.damp(p.scaleProgress, active ? 1 : 0.72, 4.8, delta);
        p.group.scale.setScalar(p.scaleProgress);

        const floatY = Math.sin(elapsed * p.floatSpeed + p.phase) * p.floatAmp;
        const floatZ = Math.cos(elapsed * (p.floatSpeed * 0.7) + p.phase) * 0.03;
        const microRotZ = Math.sin(elapsed * 0.6 + p.phase) * 0.014;

        p.group.position.x = p.basePos.x + currentParallaxX * p.parallaxDepth;
        p.group.position.y = p.basePos.y + floatY - currentParallaxY * (p.parallaxDepth * 0.65);
        p.group.position.z = p.basePos.z + floatZ + (p.scaleProgress - 1) * 1.4;
        p.group.rotation.z = p.baseRot.z + microRotZ;
      }

      // Live animated 3D growth equalizer bars
      for (let i = 0; i < animatedBars.length; i++) {
        const bar = animatedBars[i];
        const wave = 1 + Math.sin(elapsed * 2.1 + bar.phase) * 0.14;
        const h = bar.baseH * wave;
        bar.mesh.scale.y = h;
        bar.mesh.position.y = -0.52 + h / 2;
      }

      // Traveling telemetry pulses along splines
      for (let i = 0; i < dataPulses.length; i++) {
        const pulse = dataPulses[i];
        const t = (elapsed * pulse.speed + pulse.offset) % 1;
        pulse.curve.getPointAt(t, _curvePt);
        pulse.mesh.position.copy(_curvePt);
      }

      // Subtle breathing pulse on neon rim light & beacons
      neonRimLight.intensity = 3.4 + Math.sin(elapsed * 2.0) * 0.45;
      pulseBeaconMat.emissiveIntensity = 1.15 + Math.sin(elapsed * 3.2) * 0.35;

      // Orbital rotation & 3D triangle emblem motion
      orbitalGroup.rotation.z = elapsed * 0.055;
      innerNeonArc.rotation.z = 0.4 + elapsed * 0.13;
      triEmblemGroup.rotation.y = elapsed * 0.48;
      triEmblemGroup.position.y = 1.54 + Math.sin(elapsed * 1.25) * 0.06;

      if (dustPoints) {
        dustPoints.rotation.y = elapsed * 0.035;
      }

      // Update instanced tech nodes
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
      window.removeEventListener('scroll', handleScroll);

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
      className="relative w-full h-[320px] sm:h-[400px] md:h-[450px] lg:h-[540px] xl:h-[600px] select-none overflow-hidden"
      aria-label="Interactive 3D visualization of Darkvence software engineering and digital marketing systems"
    >
      {/* Subtle volumetric neon backlight halo behind WebGL canvas */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-4 rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(183,255,50,0.18),transparent_66%)]"
      />
      <div ref={mountRef} className="relative w-full h-full" />
    </div>
  );
};
