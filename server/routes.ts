import express from 'express';
import { createServer, type Server } from 'http';
import { projectsRouter } from './controllers/projects';
import { adminRouter } from './controllers/admin';
import { leadsRouter } from './controllers/leads';
import { unitsRouter } from './controllers/units';
import { webhooksRouter } from './controllers/webhooks';
import { authRouter } from './controllers/auth';
import { requireAuth } from './middleware/auth';

// Reexportamos la instancia de db para mantener inyección y compatibilidad global
export { db } from './db';

export async function registerRoutes(app: express.Express): Promise<Server> {
  // Montaje de submódulos modulares de Express
  app.use('/api/projects', projectsRouter);
  app.use('/api/webhooks', webhooksRouter);
  app.use('/api/auth', authRouter); // Rutas de autenticación públicas
  app.use('/api/admin', requireAuth, adminRouter); // Interceptado por JWT Middleware
  app.use('/api/leads', leadsRouter);
  app.use('/api/units', unitsRouter);
  app.use('/api/webhooks', webhooksRouter);

  // 🌐 IMAGE PROXY: Saltarse las restricciones CORS de R2 para WebGL
  app.get('/api/proxy/image', async (req, res) => {
    try {
      const imageUrl = req.query.url as string;
      if (!imageUrl) return res.status(400).send('URL missing');

      const response = await fetch(imageUrl);
      if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      res.setHeader('Content-Type', response.headers.get('content-type') || 'image/webp');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Cache-Control', 'public, max-age=31536000');
      res.send(buffer);
    } catch (error) {
      console.error('Proxy error:', error);
      res.status(500).send('Error proxying image');
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
