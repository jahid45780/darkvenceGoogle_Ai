import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { createApp } from './src/server/app.ts';
import { config } from './src/server/config/index.ts';
import { connectDatabase } from './src/server/db/connection.ts';
import { db } from './src/server/db/store.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  // Safe MongoDB connection and state sync prior to accepting requests
  await connectDatabase();
  await db.init();

  const app = createApp();
  const PORT = config.port;

  // Serve static assets from public directory
  app.use(express.static(path.resolve(__dirname, 'public')));

  if (process.env.NODE_ENV === 'production') {
    // Serve static client build in production
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    // Mount Vite middlewares in development
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Darkvence Fullstack Server] running on http://localhost:${PORT}`);
    console.log(`[Darkvence API] mounted at http://localhost:${PORT}/api/v1`);
  });
}

startServer().catch(err => {
  console.error('[Server Startup Failure]:', err);
  process.exit(1);
});
