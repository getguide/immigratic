#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// Path to the Vercel function config
const configPath = '.vercel/output/functions/_render.func/.vc-config.json';

try {
  if (fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    
    // Update runtime to nodejs20.x if it's nodejs18.x
    if (config.runtime === 'nodejs18.x') {
      config.runtime = 'nodejs20.x';
      fs.writeFileSync(configPath, JSON.stringify(config, null, '\t'));
      console.log('✅ Fixed runtime from nodejs18.x to nodejs20.x');
    } else {
      console.log('✅ Runtime is already correct:', config.runtime);
    }
  } else {
    console.log('⚠️ Config file not found, skipping runtime fix');
  }
} catch (error) {
  console.error('❌ Error fixing runtime:', error.message);
  process.exit(1);
}
