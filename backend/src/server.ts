import http from 'http';
import app from './app';
import { initSocket } from './socket';

import { execSync } from 'child_process';

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// Initialize Socket.IO
initSocket(server);

server.listen(PORT as number, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  
  // MVP Auto-Migration: Ensure database tables are instantly created on boot
  try {
    console.log('Syncing database schema...');
    execSync('npx --yes prisma db push --accept-data-loss', { stdio: 'inherit' });
    console.log('Database synced successfully!');
  } catch (err) {
    console.error('Failed to auto-sync database:', err);
  }
});
