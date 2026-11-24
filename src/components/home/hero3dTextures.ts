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

export function createBrowserScreenTexture(anisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 680;
  const ctx = canvas.getContext('2d')!;

  // Base dark surface
  ctx.fillStyle = '#070707';
  ctx.fillRect(0, 0, 1024, 680);

  // Subtle grid lines
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.035)';
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
  ctx.fillStyle = '#111111';
  ctx.fillRect(0, 0, 1024, 62);
  ctx.strokeStyle = '#232323';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 62);
  ctx.lineTo(1024, 62);
  ctx.stroke();

  // Window dots
  const dotColors = ['#3a3a3a', '#3a3a3a', '#B7FF32'];
  dotColors.forEach((c, idx) => {
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.arc(34 + idx * 24, 31, 7, 0, Math.PI * 2);
    ctx.fill();
  });

  // Address bar
  ctx.fillStyle = '#070707';
  drawRoundedRect(ctx, 140, 15, 580, 32, 10);
  ctx.fill();
  ctx.strokeStyle = '#262626';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = '#B7FF32';
  ctx.font = '600 16px monospace';
  ctx.fillText('https://', 162, 36);
  ctx.fillStyle = '#e5e5e5';
  ctx.fillText('darkvence.com/platform-v4', 240, 36);

  // Status pill top-right
  ctx.fillStyle = 'rgba(183, 255, 50, 0.14)';
  drawRoundedRect(ctx, 810, 16, 180, 30, 15);
  ctx.fill();
  ctx.strokeStyle = 'rgba(183, 255, 50, 0.45)';
  ctx.stroke();
  ctx.fillStyle = '#B7FF32';
  ctx.font = '700 14px monospace';
  ctx.fillText('LIVE · 99.98%', 842, 36);

  // Left App Navigation Rail
  ctx.fillStyle = '#0d0d0d';
  ctx.fillRect(0, 63, 210, 617);
  ctx.strokeStyle = '#1f1f1f';
  ctx.beginPath();
  ctx.moveTo(210, 63);
  ctx.lineTo(210, 680);
  ctx.stroke();

  // Brand block in sidebar
  ctx.fillStyle = '#B7FF32';
  ctx.beginPath();
  ctx.moveTo(42, 104);
  ctx.lineTo(58, 132);
  ctx.lineTo(26, 132);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = '700 20px sans-serif';
  ctx.fillText('DARKVENCE', 70, 126);

  const navLabels = ['Architecture', 'UI Systems', 'Cloud Edge', 'Analytics', 'Deployments'];
  navLabels.forEach((label, idx) => {
    const ny = 178 + idx * 54;
    if (idx === 0) {
      ctx.fillStyle = 'rgba(183, 255, 50, 0.16)';
      drawRoundedRect(ctx, 18, ny - 24, 174, 40, 10);
      ctx.fill();
      ctx.fillStyle = '#B7FF32';
    } else {
      ctx.fillStyle = '#8b8b8b';
    }
    ctx.font = '600 16px sans-serif';
    ctx.fillText(label, 34, ny);
  });

  // Main Canvas Area: Hero Web UI Showcase
  const grad = ctx.createRadialGradient(780, 160, 20, 740, 200, 360);
  grad.addColorStop(0, 'rgba(183, 255, 50, 0.18)');
  grad.addColorStop(1, 'rgba(183, 255, 50, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(212, 64, 812, 616);

  // Eyebrow badge
  ctx.fillStyle = '#141414';
  drawRoundedRect(ctx, 256, 108, 250, 32, 16);
  ctx.fill();
  ctx.strokeStyle = '#2c2c2c';
  ctx.stroke();
  ctx.fillStyle = '#B7FF32';
  ctx.font = '600 13px monospace';
  ctx.fillText('FULL-STACK CLOUD ENGINE', 278, 129);

  // Mock headline bars & text
  ctx.fillStyle = '#ffffff';
  ctx.font = '700 40px sans-serif';
  ctx.fillText('Scalable Web Systems', 256, 198);
  ctx.fillStyle = '#B7FF32';
  ctx.fillText('Built for Velocity.', 256, 246);

  // CTA button inside browser UI
  ctx.fillStyle = '#B7FF32';
  drawRoundedRect(ctx, 256, 280, 178, 44, 10);
  ctx.fill();
  ctx.fillStyle = '#050505';
  ctx.font = '700 16px sans-serif';
  ctx.fillText('Deploy Build →', 284, 308);

  // Secondary button
  ctx.fillStyle = '#131313';
  drawRoundedRect(ctx, 452, 280, 152, 44, 10);
  ctx.fill();
  ctx.strokeStyle = '#333333';
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.fillText('Inspect API', 482, 308);

  // 3 Modular UI Component Cards at bottom of Browser
  const cardData = [
    { title: 'Core Web Vitals', value: '99 / 100', sub: '0.4s FCP Edge Cache' },
    { title: 'API Throughput', value: '14.2k req/s', sub: 'Zero Cold Starts' },
    { title: 'Conversion Lift', value: '+148%', sub: 'Q4 Funnel Velocity' }
  ];
  cardData.forEach((c, idx) => {
    const cx = 256 + idx * 246;
    const cy = 370;
    ctx.fillStyle = '#111111';
    drawRoundedRect(ctx, cx, cy, 226, 146, 16);
    ctx.fill();
    ctx.strokeStyle = idx === 2 ? 'rgba(183, 255, 50, 0.55)' : '#242424';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#9a9a9a';
    ctx.font = '600 14px monospace';
    ctx.fillText(c.title.toUpperCase(), cx + 20, cy + 36);

    ctx.fillStyle = idx === 2 ? '#B7FF32' : '#ffffff';
    ctx.font = '700 32px sans-serif';
    ctx.fillText(c.value, cx + 20, cy + 84);

    ctx.fillStyle = '#737373';
    ctx.font = '500 14px sans-serif';
    ctx.fillText(c.sub, cx + 20, cy + 120);
  });

  // Bottom live deployment log bar
  ctx.fillStyle = '#0e0e0e';
  drawRoundedRect(ctx, 256, 546, 718, 92, 14);
  ctx.fill();
  ctx.strokeStyle = '#222222';
  ctx.stroke();

  ctx.fillStyle = '#B7FF32';
  ctx.font = '600 15px monospace';
  ctx.fillText('✓ EDGE PRODUCTION PIPELINE SYNCED · TYPESCRIPT + MONGODB ATLAS', 284, 598);

  return finalizeTexture(canvas, anisotropy);
}

export function createCodeEditorTexture(anisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 768;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#080808';
  ctx.fillRect(0, 0, 768, 512);

  // Header
  ctx.fillStyle = '#121212';
  ctx.fillRect(0, 0, 768, 54);
  ctx.strokeStyle = '#242424';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 54);
  ctx.lineTo(768, 54);
  ctx.stroke();

  // Active tab
  ctx.fillStyle = '#080808';
  drawRoundedRect(ctx, 20, 12, 210, 42, 8);
  ctx.fill();
  ctx.fillStyle = '#B7FF32';
  ctx.fillRect(20, 12, 210, 3);
  ctx.font = '600 16px monospace';
  ctx.fillText('HeroEngine.tsx', 48, 38);

  ctx.fillStyle = '#6f6f6f';
  ctx.fillText('growthApi.ts', 260, 38);
  ctx.fillText('schema.ts', 420, 38);

  // Code lines
  const lines: { num: string; tokens: [string, string][] }[] = [
    { num: '01', tokens: [['import ', '#B7FF32'], ['{ Pipeline } ', '#ffffff'], ['from ', '#B7FF32'], ["'@darkvence/core';", '#9a9a9a']] },
    { num: '02', tokens: [] },
    { num: '03', tokens: [['export async function ', '#B7FF32'], ['launchCampaign', '#ffffff'], ['(cfg: Config) {', '#a1a1aa']] },
    { num: '04', tokens: [['  const ', '#B7FF32'], ['stack ', '#ffffff'], ['= await ', '#a1a1aa'], ['Pipeline.compile(cfg);', '#e5e5e5']] },
    { num: '05', tokens: [['  const ', '#B7FF32'], ['metrics ', '#ffffff'], ['= await ', '#a1a1aa'], ['stack.measureVitals();', '#e5e5e5']] },
    { num: '06', tokens: [] },
    { num: '07', tokens: [['  if ', '#B7FF32'], ['(metrics.lcpMs < ', '#e5e5e5'], ['700', '#B7FF32'], [') {', '#e5e5e5']] },
    { num: '08', tokens: [['    await ', '#B7FF32'], ['stack.scaleEdge(', '#ffffff'], ["'global'", '#B7FF32'], [');', '#ffffff']] },
    { num: '09', tokens: [['    return ', '#B7FF32'], ['{ status: ', '#ffffff'], ["'OPTIMIZED'", '#B7FF32'], [', roi: 4.8 };', '#ffffff']] },
    { num: '10', tokens: [['  }', '#e5e5e5']] },
    { num: '11', tokens: [['}', '#a1a1aa']] }
  ];

  // Active line highlight
  ctx.fillStyle = 'rgba(183, 255, 50, 0.08)';
  ctx.fillRect(0, 294, 768, 36);
  ctx.fillStyle = '#B7FF32';
  ctx.fillRect(0, 294, 4, 36);

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
  ctx.fillStyle = '#B7FF32';
  ctx.font = '600 15px monospace';
  ctx.fillText('● TS CHECK: 0 ERRORS   |   BUNDLE: 100% READY', 26, 490);

  return finalizeTexture(canvas, anisotropy);
}

export function createMobileAppTexture(anisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 440;
  canvas.height = 880;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#070707';
  ctx.fillRect(0, 0, 440, 880);

  // Dynamic Island notch
  ctx.fillStyle = '#000000';
  drawRoundedRect(ctx, 148, 22, 144, 34, 17);
  ctx.fill();
  ctx.strokeStyle = '#222222';
  ctx.stroke();

  // App header
  ctx.fillStyle = '#ffffff';
  ctx.font = '700 26px sans-serif';
  ctx.fillText('DARKVENCE', 32, 108);
  ctx.fillStyle = '#B7FF32';
  ctx.font = '600 14px monospace';
  ctx.fillText('MOBILE GROWTH OS', 32, 134);

  // Hero KPI tile
  ctx.fillStyle = '#121212';
  drawRoundedRect(ctx, 28, 168, 384, 194, 24);
  ctx.fill();
  ctx.strokeStyle = 'rgba(183, 255, 50, 0.45)';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#9ca3af';
  ctx.font = '600 15px monospace';
  ctx.fillText('MONTHLY REVENUE IMPACT', 52, 206);
  ctx.fillStyle = '#B7FF32';
  ctx.font = '700 54px sans-serif';
  ctx.fillText('+284%', 52, 274);
  ctx.fillStyle = '#d4d4d8';
  ctx.font = '500 17px sans-serif';
  ctx.fillText('Native iOS & Android App', 52, 326);

  // Mini sparkline chart box
  ctx.fillStyle = '#111111';
  drawRoundedRect(ctx, 28, 392, 384, 220, 24);
  ctx.fill();
  ctx.strokeStyle = '#242424';
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = '600 18px sans-serif';
  ctx.fillText('Active Sessions', 52, 434);

  const pts: [number, number][] = [
    [54, 570],
    [114, 548],
    [174, 558],
    [234, 512],
    [294, 488],
    [354, 452],
    [386, 434]
  ];
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
    ctx.fillStyle = '#ffffff';
    ctx.font = '600 16px sans-serif';
    ctx.fillText(label, 52, ry + 33);
    ctx.fillStyle = '#B7FF32';
    ctx.font = '700 16px monospace';
    ctx.fillText('ACTIVE', 330, ry + 33);
  });

  return finalizeTexture(canvas, anisotropy);
}

export function createAnalyticsTexture(anisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 896;
  canvas.height = 580;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#090909';
  ctx.fillRect(0, 0, 896, 580);

  // Header bar
  ctx.fillStyle = '#121212';
  ctx.fillRect(0, 0, 896, 68);
  ctx.strokeStyle = '#232323';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 68);
  ctx.lineTo(896, 68);
  ctx.stroke();

  ctx.fillStyle = '#B7FF32';
  ctx.font = '700 16px monospace';
  ctx.fillText('GROWTH & SEO TELEMETRY', 32, 40);

  ctx.fillStyle = '#1b1b1b';
  drawRoundedRect(ctx, 690, 17, 174, 34, 12);
  ctx.fill();
  ctx.fillStyle = '#B7FF32';
  ctx.font = '700 15px monospace';
  ctx.fillText('ROAS · 4.8x', 724, 40);

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
    ctx.strokeStyle = idx === 0 ? 'rgba(183, 255, 50, 0.4)' : '#242424';
    ctx.stroke();

    ctx.fillStyle = '#9ca3af';
    ctx.font = '600 14px monospace';
    ctx.fillText(m.label, x + 20, 130);
    ctx.fillStyle = idx === 0 ? '#B7FF32' : '#ffffff';
    ctx.font = '700 34px sans-serif';
    ctx.fillText(m.val, x + 20, 178);
  });

  // Growth Curve Area Chart Box
  ctx.fillStyle = '#0e0e0e';
  drawRoundedRect(ctx, 32, 228, 832, 318, 18);
  ctx.fill();
  ctx.strokeStyle = '#222222';
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = '600 18px sans-serif';
  ctx.fillText('Compound Acquisition Velocity', 60, 268);
  ctx.fillStyle = '#B7FF32';
  ctx.font = '600 15px monospace';
  ctx.fillText('SEO + META CAPI + GOOGLE PMAX', 536, 268);

  // Horizontal dashed guide lines
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
  ctx.lineWidth = 1;
  [330, 390, 450, 505].forEach((gy) => {
    ctx.beginPath();
    ctx.moveTo(60, gy);
    ctx.lineTo(836, gy);
    ctx.stroke();
  });

  // Upward Growth Curve
  const curvePts: [number, number][] = [
    [68, 494],
    [168, 476],
    [268, 454],
    [368, 444],
    [468, 398],
    [568, 376],
    [668, 336],
    [768, 304],
    [826, 286]
  ];

  // Fill under curve
  const areaGrad = ctx.createLinearGradient(0, 286, 0, 515);
  areaGrad.addColorStop(0, 'rgba(183, 255, 50, 0.32)');
  areaGrad.addColorStop(1, 'rgba(183, 255, 50, 0)');
  ctx.fillStyle = areaGrad;
  ctx.beginPath();
  ctx.moveTo(curvePts[0][0], 515);
  curvePts.forEach(([px, py]) => ctx.lineTo(px, py));
  ctx.lineTo(curvePts[curvePts.length - 1][0], 515);
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

  // Highlight terminal point
  const [tx, ty] = curvePts[curvePts.length - 1];
  ctx.fillStyle = '#B7FF32';
  ctx.beginPath();
  ctx.arc(tx, ty, 9, 0, Math.PI * 2);
  ctx.fill();

  return finalizeTexture(canvas, anisotropy);
}

export function createSeoCardTexture(anisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 480;
  canvas.height = 300;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#0b0b0b';
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

  ctx.fillStyle = '#0b0b0b';
  ctx.fillRect(0, 0, 480, 280);

  ctx.fillStyle = '#9ca3af';
  ctx.font = '700 15px monospace';
  ctx.fillText('PERFORMANCE MARKETING', 28, 44);

  ctx.fillStyle = '#B7FF32';
  ctx.font = '700 46px sans-serif';
  ctx.fillText('-38% CPA', 28, 120);

  ctx.fillStyle = '#ffffff';
  ctx.font = '500 18px sans-serif';
  ctx.fillText('Server-Side Attribution Active', 28, 164);

  // Bar meter
  const barVals = [0.42, 0.56, 0.68, 0.78, 0.92, 1.0];
  barVals.forEach((v, idx) => {
    const bx = 28 + idx * 70;
    const bh = Math.round(52 * v);
    ctx.fillStyle = idx >= 4 ? '#B7FF32' : '#262626';
    drawRoundedRect(ctx, bx, 242 - bh, 50, bh, 6);
    ctx.fill();
  });

  return finalizeTexture(canvas, anisotropy);
}
