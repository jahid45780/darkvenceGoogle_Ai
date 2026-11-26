import * as THREE from 'three';

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function finalizeTexture(
  canvas: HTMLCanvasElement,
  anisotropy: number
): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = anisotropy;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.needsUpdate = true;
  return tex;
}

export function createGlowSpriteTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createRadialGradient(128, 128, 6, 128, 128, 126);
  grad.addColorStop(0, 'rgba(183, 255, 50, 0.55)');
  grad.addColorStop(0.32, 'rgba(183, 255, 50, 0.22)');
  grad.addColorStop(0.68, 'rgba(183, 255, 50, 0.06)');
  grad.addColorStop(1, 'rgba(183, 255, 50, 0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

export function createBrowserScreenTexture(anisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 680;
  const ctx = canvas.getContext('2d')!;

  // Base Obsidian surface
  ctx.fillStyle = '#060606';
  ctx.fillRect(0, 0, 1024, 680);

  // Subtle architectural grid lines
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.032)';
  ctx.lineWidth = 1;
  for (let gx = 0; gx <= 1024; gx += 48) {
    ctx.beginPath();
    ctx.moveTo(gx, 0);
    ctx.lineTo(gx, 680);
    ctx.stroke();
  }
  for (let gy = 0; gy <= 680; gy += 48) {
    ctx.beginPath();
    ctx.moveTo(0, gy);
    ctx.lineTo(1024, gy);
    ctx.stroke();
  }

  // Top browser chrome bar
  ctx.fillStyle = '#101010';
  ctx.fillRect(0, 0, 1024, 62);
  ctx.strokeStyle = '#262626';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 62);
  ctx.lineTo(1024, 62);
  ctx.stroke();

  // Window control dots
  const dotColors = ['#343434', '#343434', '#B7FF32'];
  dotColors.forEach((c, idx) => {
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.arc(34 + idx * 24, 31, 7, 0, Math.PI * 2);
    ctx.fill();
  });

  // Address bar
  ctx.fillStyle = '#070707';
  drawRoundedRect(ctx, 136, 15, 574, 32, 10);
  ctx.fill();
  ctx.strokeStyle = '#262626';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = '#B7FF32';
  ctx.font = '600 15px monospace';
  ctx.fillText('https://', 158, 36);
  ctx.fillStyle = '#f4f4f5';
  ctx.fillText('darkvence.com/platform-v4', 234, 36);

  // Status badge top-right
  ctx.fillStyle = 'rgba(183, 255, 50, 0.14)';
  drawRoundedRect(ctx, 804, 16, 188, 30, 15);
  ctx.fill();
  ctx.strokeStyle = 'rgba(183, 255, 50, 0.5)';
  ctx.stroke();
  ctx.fillStyle = '#B7FF32';
  ctx.font = '700 13px monospace';
  ctx.fillText('EDGE · 99.98% LIVE', 824, 36);

  // Left App Navigation Rail
  ctx.fillStyle = '#0b0b0b';
  ctx.fillRect(0, 63, 214, 617);
  ctx.strokeStyle = '#1e1e1e';
  ctx.beginPath();
  ctx.moveTo(214, 63);
  ctx.lineTo(214, 680);
  ctx.stroke();

  // Brand emblem in sidebar
  ctx.fillStyle = '#B7FF32';
  ctx.beginPath();
  ctx.moveTo(42, 104);
  ctx.lineTo(58, 132);
  ctx.lineTo(26, 132);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = '700 19px sans-serif';
  ctx.fillText('DARKVENCE', 70, 126);

  const navLabels = ['Architecture', 'UI Systems', 'Cloud Edge', 'Analytics', 'Growth Ops'];
  navLabels.forEach((label, idx) => {
    const ny = 180 + idx * 54;
    if (idx === 0) {
      ctx.fillStyle = 'rgba(183, 255, 50, 0.16)';
      drawRoundedRect(ctx, 18, ny - 24, 178, 40, 10);
      ctx.fill();
      ctx.strokeStyle = 'rgba(183, 255, 50, 0.35)';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = '#B7FF32';
    } else {
      ctx.fillStyle = '#8b8b8b';
    }
    ctx.font = '600 16px sans-serif';
    ctx.fillText(label, 34, ny);
  });

  // Sidebar status card at bottom
  ctx.fillStyle = '#121212';
  drawRoundedRect(ctx, 18, 558, 178, 86, 12);
  ctx.fill();
  ctx.strokeStyle = '#242424';
  ctx.stroke();
  ctx.fillStyle = '#737373';
  ctx.font = '600 12px monospace';
  ctx.fillText('CLUSTER HEALTH', 34, 586);
  ctx.fillStyle = '#B7FF32';
  ctx.font = '700 22px sans-serif';
  ctx.fillText('18ms Global', 34, 620);

  // Main Canvas Area Ambient Glow
  const grad = ctx.createRadialGradient(800, 150, 20, 740, 210, 390);
  grad.addColorStop(0, 'rgba(183, 255, 50, 0.22)');
  grad.addColorStop(1, 'rgba(183, 255, 50, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(216, 64, 808, 616);

  // Eyebrow pill
  ctx.fillStyle = '#141414';
  drawRoundedRect(ctx, 256, 102, 268, 32, 16);
  ctx.fill();
  ctx.strokeStyle = '#2c2c2c';
  ctx.stroke();
  ctx.fillStyle = '#B7FF32';
  ctx.font = '600 13px monospace';
  ctx.fillText('FULL-STACK CLOUD ENGINE', 280, 123);

  // Hero UI Headline
  ctx.fillStyle = '#ffffff';
  ctx.font = '700 40px sans-serif';
  ctx.fillText('Scalable Web Systems', 256, 192);
  ctx.fillStyle = '#B7FF32';
  ctx.fillText('Engineered for Growth.', 256, 240);

  // Primary CTA button inside browser preview
  ctx.fillStyle = '#B7FF32';
  drawRoundedRect(ctx, 256, 274, 184, 44, 10);
  ctx.fill();
  ctx.fillStyle = '#050505';
  ctx.font = '700 16px sans-serif';
  ctx.fillText('Deploy Build →', 286, 302);

  // Secondary CTA
  ctx.fillStyle = '#131313';
  drawRoundedRect(ctx, 456, 274, 156, 44, 10);
  ctx.fill();
  ctx.strokeStyle = '#333333';
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.fillText('Inspect API', 488, 302);

  // 3 Modular Telemetry Cards
  const cardData = [
    { title: 'Core Web Vitals', value: '99 / 100', sub: '0.4s FCP Edge Cache' },
    { title: 'API Throughput', value: '14.2k/s', sub: 'Zero Cold Starts' },
    { title: 'Conversion Lift', value: '+148%', sub: 'Funnel Velocity' }
  ];
  cardData.forEach((c, idx) => {
    const cx = 256 + idx * 246;
    const cy = 360;
    ctx.fillStyle = '#101010';
    drawRoundedRect(ctx, cx, cy, 228, 150, 16);
    ctx.fill();
    ctx.strokeStyle = idx === 2 ? 'rgba(183, 255, 50, 0.58)' : '#252525';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#9a9a9a';
    ctx.font = '600 13px monospace';
    ctx.fillText(c.title.toUpperCase(), cx + 20, cy + 36);

    ctx.fillStyle = idx === 2 ? '#B7FF32' : '#ffffff';
    ctx.font = '700 32px sans-serif';
    ctx.fillText(c.value, cx + 20, cy + 84);

    ctx.fillStyle = '#7b7b7b';
    ctx.font = '500 14px sans-serif';
    ctx.fillText(c.sub, cx + 20, cy + 122);
  });

  // Bottom live deployment log bar
  ctx.fillStyle = '#0d0d0d';
  drawRoundedRect(ctx, 256, 540, 720, 96, 14);
  ctx.fill();
  ctx.strokeStyle = '#242424';
  ctx.stroke();

  ctx.fillStyle = '#B7FF32';
  ctx.font = '600 15px monospace';
  ctx.fillText('✓ EDGE PRODUCTION PIPELINE SYNCED · REACT + TYPESCRIPT + CLOUD', 284, 582);

  ctx.fillStyle = '#8b8b8b';
  ctx.font = '500 13px monospace';
  ctx.fillText('BUILD HASH: dv-49a8e  |  LIGHTHOUSE: 100  |  TLS 1.3 VERIFIED', 284, 614);

  return finalizeTexture(canvas, anisotropy);
}

export function createCodeEditorTexture(anisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 768;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#070707';
  ctx.fillRect(0, 0, 768, 512);

  // Header
  ctx.fillStyle = '#111111';
  ctx.fillRect(0, 0, 768, 54);
  ctx.strokeStyle = '#252525';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 54);
  ctx.lineTo(768, 54);
  ctx.stroke();

  // Active tab
  ctx.fillStyle = '#070707';
  drawRoundedRect(ctx, 20, 12, 210, 42, 8);
  ctx.fill();
  ctx.fillStyle = '#B7FF32';
  ctx.fillRect(20, 12, 210, 3);
  ctx.font = '600 16px monospace';
  ctx.fillText('HeroEngine.tsx', 48, 38);

  ctx.fillStyle = '#6f6f6f';
  ctx.fillText('growthApi.ts', 258, 38);
  ctx.fillText('schema.ts', 416, 38);

  // Active line highlight behind line 08
  ctx.fillStyle = 'rgba(183, 255, 50, 0.09)';
  ctx.fillRect(0, 294, 768, 36);
  ctx.fillStyle = '#B7FF32';
  ctx.fillRect(0, 294, 4, 36);

  const lines: { num: string; tokens: [string, string][] }[] = [
    { num: '01', tokens: [['import ', '#B7FF32'], ['{ Pipeline } ', '#ffffff'], ['from ', '#B7FF32'], ["'@darkvence/core';", '#9a9a9a']] },
    { num: '02', tokens: [] },
    { num: '03', tokens: [['export async function ', '#B7FF32'], ['launchSystem', '#ffffff'], ['(cfg: Config) {', '#a1a1aa']] },
    { num: '04', tokens: [['  const ', '#B7FF32'], ['stack ', '#ffffff'], ['= await ', '#a1a1aa'], ['Pipeline.compile(cfg);', '#e5e5e5']] },
    { num: '05', tokens: [['  const ', '#B7FF32'], ['vitals ', '#ffffff'], ['= await ', '#a1a1aa'], ['stack.measureWeb();', '#e5e5e5']] },
    { num: '06', tokens: [] },
    { num: '07', tokens: [['  if ', '#B7FF32'], ['(vitals.lcpMs < ', '#e5e5e5'], ['600', '#B7FF32'], [') {', '#e5e5e5']] },
    { num: '08', tokens: [['    await ', '#B7FF32'], ['stack.scaleEdge(', '#ffffff'], ["'global'", '#B7FF32'], [');', '#ffffff']] },
    { num: '09', tokens: [['    return ', '#B7FF32'], ['{ status: ', '#ffffff'], ["'OPTIMIZED'", '#B7FF32'], [', roas: 4.8 };', '#ffffff']] },
    { num: '10', tokens: [['  }', '#e5e5e5']] },
    { num: '11', tokens: [['}', '#a1a1aa']] }
  ];

  lines.forEach((line, idx) => {
    const y = 96 + idx * 36;
    ctx.fillStyle = '#4a4a4a';
    ctx.font = '500 17px monospace';
    ctx.fillText(line.num, 24, y);

    let x = 76;
    line.tokens.forEach(([text, color]) => {
      ctx.fillStyle = color;
      ctx.fillText(text, x, y);
      x += ctx.measureText(text).width;
    });
  });

  // Footer terminal status
  ctx.fillStyle = '#111111';
  ctx.fillRect(0, 456, 768, 56);
  ctx.strokeStyle = '#222222';
  ctx.beginPath();
  ctx.moveTo(0, 456);
  ctx.lineTo(768, 456);
  ctx.stroke();

  ctx.fillStyle = '#B7FF32';
  ctx.font = '600 15px monospace';
  ctx.fillText('● TS CHECK: 0 ERRORS   |   BUILD READY: 100%', 26, 490);

  return finalizeTexture(canvas, anisotropy);
}

export function createMobileAppTexture(anisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 440;
  canvas.height = 880;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#060606';
  ctx.fillRect(0, 0, 440, 880);

  // Subtle top glow
  const glow = ctx.createRadialGradient(220, 140, 10, 220, 160, 220);
  glow.addColorStop(0, 'rgba(183, 255, 50, 0.16)');
  glow.addColorStop(1, 'rgba(183, 255, 50, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, 440, 420);

  // Dynamic Island notch
  ctx.fillStyle = '#000000';
  drawRoundedRect(ctx, 148, 22, 144, 34, 17);
  ctx.fill();
  ctx.strokeStyle = '#242424';
  ctx.stroke();

  // App header
  ctx.fillStyle = '#ffffff';
  ctx.font = '700 26px sans-serif';
  ctx.fillText('DARKVENCE', 32, 108);
  ctx.fillStyle = '#B7FF32';
  ctx.font = '600 14px monospace';
  ctx.fillText('MOBILE GROWTH OS', 32, 134);

  // Hero KPI tile
  ctx.fillStyle = '#111111';
  drawRoundedRect(ctx, 28, 168, 384, 194, 24);
  ctx.fill();
  ctx.strokeStyle = 'rgba(183, 255, 50, 0.48)';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#9ca3af';
  ctx.font = '600 14px monospace';
  ctx.fillText('MONTHLY REVENUE IMPACT', 52, 206);
  ctx.fillStyle = '#B7FF32';
  ctx.font = '700 54px sans-serif';
  ctx.fillText('+284%', 52, 274);
  ctx.fillStyle = '#e4e4e7';
  ctx.font = '500 17px sans-serif';
  ctx.fillText('Native iOS & Android Platform', 52, 326);

  // Mini sparkline chart box
  ctx.fillStyle = '#101010';
  drawRoundedRect(ctx, 28, 392, 384, 220, 24);
  ctx.fill();
  ctx.strokeStyle = '#242424';
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = '600 18px sans-serif';
  ctx.fillText('Active Sessions', 52, 434);
  ctx.fillStyle = '#B7FF32';
  ctx.font = '700 15px monospace';
  ctx.fillText('+42.8% MoM', 292, 434);

  const pts: [number, number][] = [
    [54, 572],
    [114, 548],
    [174, 558],
    [234, 512],
    [294, 488],
    [354, 452],
    [386, 434]
  ];

  // Sparkline gradient fill
  const sparkGrad = ctx.createLinearGradient(0, 434, 0, 584);
  sparkGrad.addColorStop(0, 'rgba(183, 255, 50, 0.28)');
  sparkGrad.addColorStop(1, 'rgba(183, 255, 50, 0)');
  ctx.fillStyle = sparkGrad;
  ctx.beginPath();
  ctx.moveTo(pts[0][0], 584);
  pts.forEach(([px, py]) => ctx.lineTo(px, py));
  ctx.lineTo(pts[pts.length - 1][0], 584);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = '#B7FF32';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  pts.forEach(([px, py], i) => {
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  });
  ctx.stroke();

  // Action rows
  const rows = ['Conversion Funnel', 'Server-Side CAPI', 'Push Retention'];
  rows.forEach((label, idx) => {
    const ry = 640 + idx * 66;
    ctx.fillStyle = '#111111';
    drawRoundedRect(ctx, 28, ry, 384, 54, 16);
    ctx.fill();
    ctx.strokeStyle = '#222222';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.font = '600 16px sans-serif';
    ctx.fillText(label, 52, ry + 33);
    ctx.fillStyle = '#B7FF32';
    ctx.font = '700 15px monospace';
    ctx.fillText('ACTIVE', 330, ry + 33);
  });

  return finalizeTexture(canvas, anisotropy);
}

export function createAnalyticsTexture(anisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 896;
  canvas.height = 580;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#080808';
  ctx.fillRect(0, 0, 896, 580);

  // Header bar
  ctx.fillStyle = '#111111';
  ctx.fillRect(0, 0, 896, 68);
  ctx.strokeStyle = '#242424';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 68);
  ctx.lineTo(896, 68);
  ctx.stroke();

  ctx.fillStyle = '#B7FF32';
  ctx.font = '700 16px monospace';
  ctx.fillText('GROWTH & SEO TELEMETRY', 32, 40);

  ctx.fillStyle = 'rgba(183, 255, 50, 0.14)';
  drawRoundedRect(ctx, 684, 17, 180, 34, 12);
  ctx.fill();
  ctx.strokeStyle = 'rgba(183, 255, 50, 0.45)';
  ctx.stroke();
  ctx.fillStyle = '#B7FF32';
  ctx.font = '700 15px monospace';
  ctx.fillText('ROAS · 4.8x', 722, 40);

  // Top Metric Pills
  const metrics = [
    { label: 'ORGANIC SEARCH', val: '+218%' },
    { label: 'CONVERSION RATE', val: '6.42%' },
    { label: 'AD PIPELINE', val: '$1.84M' }
  ];
  metrics.forEach((m, idx) => {
    const x = 32 + idx * 282;
    ctx.fillStyle = '#111111';
    drawRoundedRect(ctx, x, 94, 264, 108, 16);
    ctx.fill();
    ctx.strokeStyle = idx === 0 ? 'rgba(183, 255, 50, 0.46)' : '#252525';
    ctx.stroke();

    ctx.fillStyle = '#9ca3af';
    ctx.font = '600 14px monospace';
    ctx.fillText(m.label, x + 20, 130);
    ctx.fillStyle = idx === 0 ? '#B7FF32' : '#ffffff';
    ctx.font = '700 34px sans-serif';
    ctx.fillText(m.val, x + 20, 178);
  });

  // Growth Curve Area Chart Box
  ctx.fillStyle = '#0d0d0d';
  drawRoundedRect(ctx, 32, 226, 832, 322, 18);
  ctx.fill();
  ctx.strokeStyle = '#232323';
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = '600 18px sans-serif';
  ctx.fillText('Compound Acquisition Velocity', 60, 266);
  ctx.fillStyle = '#B7FF32';
  ctx.font = '600 14px monospace';
  ctx.fillText('SEO + META CAPI + GOOGLE PMAX', 534, 266);

  // Horizontal dashed guide lines
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
  ctx.lineWidth = 1;
  [328, 388, 448, 506].forEach((gy) => {
    ctx.beginPath();
    ctx.moveTo(60, gy);
    ctx.lineTo(836, gy);
    ctx.stroke();
  });

  // Upward Growth Curve (leaves lower-right bay clean for live 3D extruded bars)
  const curvePts: [number, number][] = [
    [68, 496],
    [138, 480],
    [208, 456],
    [278, 444],
    [348, 398],
    [418, 376],
    [488, 336],
    [548, 304]
  ];

  const areaGrad = ctx.createLinearGradient(0, 290, 0, 514);
  areaGrad.addColorStop(0, 'rgba(183, 255, 50, 0.34)');
  areaGrad.addColorStop(1, 'rgba(183, 255, 50, 0)');
  ctx.fillStyle = areaGrad;
  ctx.beginPath();
  ctx.moveTo(curvePts[0][0], 514);
  curvePts.forEach(([px, py]) => ctx.lineTo(px, py));
  ctx.lineTo(curvePts[curvePts.length - 1][0], 514);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = '#B7FF32';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  curvePts.forEach(([px, py], i) => {
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  });
  ctx.stroke();

  // Terminal highlight dot
  const [tx, ty] = curvePts[curvePts.length - 1];
  ctx.fillStyle = '#B7FF32';
  ctx.beginPath();
  ctx.arc(tx, ty, 8, 0, Math.PI * 2);
  ctx.fill();

  // Label above right 3D bar bay
  ctx.fillStyle = '#9ca3af';
  ctx.font = '600 13px monospace';
  ctx.fillText('REAL-TIME LIFT INDEX', 610, 326);

  return finalizeTexture(canvas, anisotropy);
}

export function createSeoCardTexture(anisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 480;
  canvas.height = 300;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#090909';
  ctx.fillRect(0, 0, 480, 300);

  ctx.fillStyle = '#B7FF32';
  ctx.font = '700 15px monospace';
  ctx.fillText('SEO AUTHORITY INDEX', 28, 44);

  // Circular score ring
  const cx = 104;
  const cy = 166;
  const radius = 64;
  ctx.strokeStyle = '#242424';
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = '#B7FF32';
  ctx.lineWidth = 14;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(cx, cy, radius, -Math.PI / 2, Math.PI * 1.38);
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = '700 38px sans-serif';
  ctx.fillText('98', cx - 22, cy + 12);

  // Right side keyword metrics
  ctx.fillStyle = '#ffffff';
  ctx.font = '700 24px sans-serif';
  ctx.fillText('#1 Rankings', 210, 128);
  ctx.fillStyle = '#a1a1aa';
  ctx.font = '500 17px sans-serif';
  ctx.fillText('Technical SEO · Schema', 210, 162);
  ctx.fillStyle = '#B7FF32';
  ctx.font = '700 19px monospace';
  ctx.fillText('↑ +182% Organic', 210, 212);

  return finalizeTexture(canvas, anisotropy);
}

export function createCampaignCardTexture(anisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 480;
  canvas.height = 280;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#090909';
  ctx.fillRect(0, 0, 480, 280);

  ctx.fillStyle = '#9ca3af';
  ctx.font = '700 15px monospace';
  ctx.fillText('PERFORMANCE MARKETING', 28, 44);

  ctx.fillStyle = '#B7FF32';
  ctx.font = '700 46px sans-serif';
  ctx.fillText('-38% CPA', 28, 118);

  ctx.fillStyle = '#ffffff';
  ctx.font = '500 18px sans-serif';
  ctx.fillText('Server-Side Attribution Active', 28, 160);

  const barVals = [0.42, 0.56, 0.68, 0.78, 0.92, 1.0];
  barVals.forEach((v, idx) => {
    const bx = 28 + idx * 70;
    const bh = Math.round(52 * v);
    ctx.fillStyle = idx >= 4 ? '#B7FF32' : '#262626';
    drawRoundedRect(ctx, bx, 244 - bh, 50, bh, 6);
    ctx.fill();
  });

  return finalizeTexture(canvas, anisotropy);
}

export function createUiSystemCardTexture(anisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 480;
  canvas.height = 280;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#090909';
  ctx.fillRect(0, 0, 480, 280);

  ctx.fillStyle = '#B7FF32';
  ctx.font = '700 14px monospace';
  ctx.fillText('MODULAR UI SYSTEM · V4', 28, 42);

  // Status dot
  ctx.fillStyle = '#B7FF32';
  ctx.beginPath();
  ctx.arc(438, 36, 6, 0, Math.PI * 2);
  ctx.fill();

  // Design system wireframe blocks
  ctx.fillStyle = '#131313';
  drawRoundedRect(ctx, 28, 72, 200, 174, 14);
  ctx.fill();
  ctx.strokeStyle = '#262626';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = '#B7FF32';
  drawRoundedRect(ctx, 48, 94, 72, 22, 6);
  ctx.fill();
  ctx.fillStyle = '#2a2a2a';
  drawRoundedRect(ctx, 48, 132, 156, 16, 5);
  ctx.fill();
  drawRoundedRect(ctx, 48, 160, 132, 14, 5);
  ctx.fill();
  ctx.fillStyle = 'rgba(183, 255, 50, 0.25)';
  drawRoundedRect(ctx, 48, 192, 156, 32, 8);
  ctx.fill();

  // Right metrics
  ctx.fillStyle = '#ffffff';
  ctx.font = '700 28px sans-serif';
  ctx.fillText('60 FPS', 256, 120);
  ctx.fillStyle = '#a1a1aa';
  ctx.font = '500 16px sans-serif';
  ctx.fillText('React 19 + WebGL', 256, 154);

  // Color token swatches
  const tokens = ['#050505', '#1a1a1a', '#ffffff', '#B7FF32'];
  tokens.forEach((hex, idx) => {
    ctx.fillStyle = hex;
    drawRoundedRect(ctx, 256 + idx * 48, 188, 38, 38, 8);
    ctx.fill();
    ctx.strokeStyle = '#333333';
    ctx.stroke();
  });

  return finalizeTexture(canvas, anisotropy);
}
