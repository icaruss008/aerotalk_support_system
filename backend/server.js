// This is a bridge file to ensure compatibility with hosting platforms 
// or commands that strictly look for "node server.js" at the root level.
// It simply imports and runs the compiled TypeScript code from the /dist folder.

const fs = require('fs');
const path = require('path');

const distPath = path.join(__dirname, 'dist', 'server.js');

if (!fs.existsSync(distPath)) {
  console.error("❌ Error: The production build is missing!");
  console.error("Please run 'npm run build' first to compile the TypeScript code into the /dist directory.");
  process.exit(1);
}

// Pass execution to the compiled server
require('./dist/server.js');
