'use strict';
const fs = require('node:fs');
const path = require('node:path');
const babel = require('@babel/core');
const root = path.resolve(__dirname, '..');
const out = path.join(root, 'dist');
// The generated directory is fixed inside this checkout; never package server code or secrets as static assets.
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
const staticFiles = ['data.js', 'inventory.js', 'styles.css', 'estoque.html', 'robots.txt', 'sitemap.xml', 'llms.txt',
  'hero-bg-desktop.mp4', 'hero-bg-mobile.mp4', 'hero-poster.webp'];
for (const file of staticFiles) if (fs.existsSync(path.join(root, file))) fs.copyFileSync(path.join(root, file), path.join(out, file));
fs.cpSync(path.join(root, 'assets'), path.join(out, 'assets'), { recursive: true });
for (const file of ['components', 'pages', 'admin', 'app']) {
  const result = babel.transformFileSync(path.join(root, file + '.jsx'), { presets: ['@babel/preset-react'], comments: false, compact: true });
  fs.writeFileSync(path.join(out, file + '.js'), result.code);
}
let html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
html = html.replace(/\s*<script[^>]+@babel\/standalone[^>]*><\/script>/g, '')
  .replace(/type="text\/babel" src="([^"]+)\.jsx/g, 'defer src="$1.js');
fs.writeFileSync(path.join(out, 'index.html'), html);
console.log('Build OK: static assets and compiled React; server files excluded.');
