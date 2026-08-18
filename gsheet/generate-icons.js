import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <!-- Background Gradient -->
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="50%" stop-color="#1e1b4b" />
      <stop offset="100%" stop-color="#090d16" />
    </linearGradient>

    <!-- Border Gradient -->
    <linearGradient id="borderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#6366f1" stop-opacity="0.8" />
      <stop offset="50%" stop-color="#3b82f6" stop-opacity="0.4" />
      <stop offset="100%" stop-color="#10b981" stop-opacity="0.8" />
    </linearGradient>

    <!-- Page Shadow -->
    <filter id="pageShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="16" stdDeviation="16" flood-color="#000000" flood-opacity="0.6" />
    </filter>

    <!-- Coin Shadow -->
    <filter id="coinShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="12" stdDeviation="14" flood-color="#000000" flood-opacity="0.65" />
    </filter>

    <!-- Coin Outer Metallic Gradient (Gold / Emerald Accent) -->
    <linearGradient id="coinOuterGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fbbf24" />
      <stop offset="50%" stop-color="#f59e0b" />
      <stop offset="100%" stop-color="#d97706" />
    </linearGradient>

    <linearGradient id="coinInnerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a" />
      <stop offset="40%" stop-color="#f59e0b" />
      <stop offset="100%" stop-color="#b45309" />
    </linearGradient>

    <linearGradient id="coinBorderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a" />
      <stop offset="100%" stop-color="#78350f" />
    </linearGradient>

    <!-- Page Header Bar Gradient -->
    <linearGradient id="pageHeaderGradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#6366f1" />
      <stop offset="100%" stop-color="#3b82f6" />
    </linearGradient>
  </defs>

  <!-- Base Icon Squircle Background -->
  <rect x="16" y="16" width="480" height="480" rx="108" fill="url(#bgGradient)" stroke="url(#borderGradient)" stroke-width="4" />

  <!-- Simplistic Document Page -->
  <g filter="url(#pageShadow)">
    <!-- Page Body -->
    <rect x="90" y="70" width="270" height="340" rx="20" fill="#ffffff" />
    
    <!-- Top Accent Bar -->
    <path d="M 90 90 C 90 79, 99 70, 110 70 L 340 70 C 351 70, 360 79, 360 90 L 360 98 L 90 98 Z" fill="url(#pageHeaderGradient)" />

    <!-- Horizontal Lines on Document -->
    <!-- Line 1: Title Line -->
    <rect x="120" y="125" width="135" height="14" rx="7" fill="#475569" />
    <!-- Line 2: Subtitle Line -->
    <rect x="120" y="150" width="90" height="10" rx="5" fill="#94a3b8" />

    <!-- Line 3 & Line 4: Stats Lines -->
    <rect x="120" y="172" width="180" height="8" rx="4" fill="#cbd5e1" />
    <rect x="120" y="188" width="150" height="8" rx="4" fill="#e2e8f0" />

    <!-- Pie Chart Section -->
    <!-- Donut / Pie Chart Slices (Center: 225, 275, R: 48) -->
    <g transform="translate(225, 275)">
      <!-- Slice 1: Indigo (45%) -->
      <path d="M 0 0 L 0 -48 A 48 48 0 0 1 48 0 Z" fill="#6366f1" />
      <!-- Slice 2: Emerald (30%) -->
      <path d="M 0 0 L 48 0 A 48 48 0 0 1 -34 34 Z" fill="#10b981" />
      <!-- Slice 3: Sky Blue (15%) -->
      <path d="M 0 0 L -34 34 A 48 48 0 0 1 -48 0 Z" fill="#38bdf8" />
      <!-- Slice 4: Amber (10%) -->
      <path d="M 0 0 L -48 0 A 48 48 0 0 1 0 -48 Z" fill="#f59e0b" />
      
      <!-- Inner Hole for Clean Doughnut/Pie Look -->
      <circle cx="0" cy="0" r="22" fill="#ffffff" />
    </g>

    <!-- Bottom Page Skeleton Lines -->
    <rect x="120" y="342" width="120" height="8" rx="4" fill="#cbd5e1" />
    <rect x="120" y="358" width="80" height="8" rx="4" fill="#e2e8f0" />
  </g>

  <!-- Bottom Right Corner Coin with Corrected Indian Rupee Symbol (₹) -->
  <g filter="url(#coinShadow)">
    <!-- Outer Coin Shadow & Body -->
    <circle cx="355" cy="355" r="92" fill="url(#coinOuterGradient)" stroke="url(#coinBorderGradient)" stroke-width="5" />
    
    <!-- Inner Coin Face -->
    <circle cx="355" cy="355" r="78" fill="url(#coinInnerGradient)" />
    
    <!-- Inner Dashed Specular Ring -->
    <circle cx="355" cy="355" r="70" fill="none" stroke="#fef08a" stroke-width="2" stroke-dasharray="8,5" opacity="0.6" />

    <!-- Corrected Rupee Symbol (₹) -->
    <g stroke="#ffffff" stroke-width="13" stroke-linecap="round" stroke-linejoin="round" fill="none">
      <!-- Top Horizontal Bar -->
      <path d="M 322 308 H 388" />
      <!-- Middle Horizontal Bar -->
      <path d="M 322 334 H 382" />
      <!-- R-Loop Curve and Diagonal Leg -->
      <path d="M 338 308 H 362 C 382 308 382 358 338 358 L 388 412" />
    </g>
  </g>
</svg>
`;

async function generate() {
  const publicDir = path.resolve('public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // Write SVG files
  fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgContent, 'utf-8');
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svgContent, 'utf-8');

  // Convert to PNGs using sharp
  const buffer = Buffer.from(svgContent);

  await sharp(buffer).resize(192, 192).toFile(path.join(publicDir, 'pwa-192x192.png'));
  await sharp(buffer).resize(512, 512).toFile(path.join(publicDir, 'pwa-512x512.png'));
  await sharp(buffer).resize(180, 180).toFile(path.join(publicDir, 'apple-touch-icon.png'));
  await sharp(buffer).resize(512, 512).toFile(path.join(publicDir, 'maskable-icon-512x512.png'));

  console.log('Successfully updated icons to document + pie chart + bottom right rupee coin: icon.svg, favicon.svg, pwa-192x192.png, pwa-512x512.png, apple-touch-icon.png, maskable-icon-512x512.png');
}

generate().catch(err => {
  console.error(err);
  process.exit(1);
});
