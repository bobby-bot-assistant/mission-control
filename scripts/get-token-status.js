#!/usr/bin/env node

// Script to get token status from OpenClaw
// This will be called by the Next.js API

const { exec } = require('child_process');
const path = require('path');

// Try to find openclaw command
const possiblePaths = [
  'openclaw',
  '/usr/local/bin/openclaw',
  path.join(process.env.HOME, '.npm-global/bin/openclaw'),
  '/opt/homebrew/bin/openclaw'
];

function tryOpenclaw(openclaw) {
  return new Promise((resolve) => {
    exec(`${openclaw} status 2>/dev/null`, (error, stdout, stderr) => {
      if (error) {
        resolve(null);
        return;
      }
      
      // Parse the output looking for context line
      const lines = stdout.split('\n');
      for (const line of lines) {
        // Look for: 📚 Context: 40k/200k (20%)
        const match = line.match(/Context:\s*(\d+)k\/(\d+)k\s*\((\d+)%\)/);
        if (match) {
          resolve({
            current: parseInt(match[1]) * 1000,
            max: parseInt(match[2]) * 1000,
            percentage: parseInt(match[3])
          });
          return;
        }
      }
      resolve(null);
    });
  });
}

async function main() {
  // Try each possible path
  for (const openclaw of possiblePaths) {
    const result = await tryOpenclaw(openclaw);
    if (result) {
      console.log(JSON.stringify(result));
      return;
    }
  }
  
  // If nothing worked, return defaults
  console.log(JSON.stringify({
    current: 0,
    max: 200000,
    percentage: 0,
    error: 'Could not find openclaw command'
  }));
}

main();