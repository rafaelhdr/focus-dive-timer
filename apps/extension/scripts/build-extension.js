#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';
import { execSync } from 'child_process';

async function buildExtension() {
  console.log('🔧 Building FocusDive Browser Extension...');
  
  try {
    // Set environment variable for extension build
    process.env.BUILD_TARGET = 'extension';
    
    // Build the project
    console.log('📦 Building with Vite...');
    execSync('npm run build', { stdio: 'inherit', env: process.env });
    
    // Copy manifest.json to dist
    console.log('📋 Copying manifest.json...');
    await fs.copy('public/manifest.json', 'dist/manifest.json');
    
    // Copy extension icons
    console.log('🎨 Copying extension icons...');
    const iconFiles = ['icon16.png', 'icon32.png', 'icon48.png', 'icon128.png'];
    for (const icon of iconFiles) {
      await fs.copy(`public/${icon}`, `dist/${icon}`);
    }
    
    // Copy other public files that might be needed
    console.log('📁 Copying additional assets...');
    if (await fs.pathExists('public/robots.txt')) {
      await fs.copy('public/robots.txt', 'dist/robots.txt');
    }
    
    console.log('✅ Extension build complete!');
    console.log('📂 Extension files are in the dist/ directory');
    console.log('🚀 Load the dist/ directory as an unpacked extension in your browser');
    
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
}

buildExtension();