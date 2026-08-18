import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.resolve(__dirname, 'dist');
const rootHtmlSrc = path.resolve(__dirname, 'index.html');
const rootHtmlDist = path.resolve(distDir, 'index.html');

// Ensure dist directory exists
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Clean any root-level stray files that do not belong to the root portal
const allowedRootEntries = new Set(['index.html', '404.html', 'gsheet', 'dc_expense_manager']);
if (fs.existsSync(distDir)) {
  const entries = fs.readdirSync(distDir);
  for (const entry of entries) {
    if (!allowedRootEntries.has(entry) && !entry.startsWith('.')) {
      const fullPath = path.join(distDir, entry);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        fs.rmSync(fullPath, { recursive: true, force: true });
      } else {
        fs.unlinkSync(fullPath);
      }
    }
  }
}

// Copy root index.html to dist/index.html
if (fs.existsSync(rootHtmlSrc)) {
  fs.copyFileSync(rootHtmlSrc, rootHtmlDist);
} else {
  console.error('❌ [build-root] Root index.html not found!');
  process.exit(1);
}

// Copy 404.html to dist/404.html if present
const notFoundSrc = path.resolve(__dirname, '404.html');
const notFoundDist = path.resolve(distDir, '404.html');
if (fs.existsSync(notFoundSrc)) {
  fs.copyFileSync(notFoundSrc, notFoundDist);
}

console.log('✅ [build-root] Successfully packaged dist/ with root portal, 404 handler, and frontend sub-apps');
