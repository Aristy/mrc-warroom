import Fastify from 'fastify';
import fastifyCookie from '@fastify/cookie';
import fastifyCors from '@fastify/cors';
import fastifyMultipart from '@fastify/multipart';
import fastifyWebSocket from '@fastify/websocket';
import fastifyStatic from '@fastify/static';
import path from 'path';
import { fileURLToPath } from 'url';
import { authMiddleware } from './middleware/auth.js';
import { registerRoutes } from './routes/index.js';
import { subscribe, unsubscribe } from './ws/hub.js';
import { WS_TOPICS } from './ws/topics.js';
import type { WSTopic } from './ws/topics.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function buildApp() {
  const app = Fastify({ logger: { level: process.env.LOG_LEVEL || 'info' } });

  // Plugins
  await app.register(fastifyCookie);
  await app.register(fastifyCors, { origin: process.env.NODE_ENV === 'development' ? true : false, credentials: true });
  await app.register(fastifyMultipart, { limits: { fileSize: 50 * 1024 * 1024 } });
  await app.register(fastifyWebSocket);

  // Decorate request with user (set by auth middleware)
  app.decorateRequest('user', null);
  app.addHook('preHandler', authMiddleware);

  // WebSocket route
  app.get('/ws', { websocket: true }, (socket, request) => {
    const topicParam = (request.query as { topic?: string }).topic;
    const validTopics = Object.values(WS_TOPICS) as WSTopic[];
    const topic: WSTopic = validTopics.includes(topicParam as WSTopic) ? topicParam as WSTopic : WS_TOPICS.WAR_ROOM;

    subscribe(socket, topic);
    socket.send(JSON.stringify({ type: 'connected', topic, timestamp: new Date().toISOString() }));

    socket.on('message', (data: unknown) => {
      try {
        const raw = typeof data === 'string'
          ? data
          : Buffer.isBuffer(data)
            ? data.toString()
            : Array.isArray(data)
              ? Buffer.concat(data).toString()
              : String(data);
        const msg = JSON.parse(raw);
        if (msg.type === 'pong') return; // heartbeat response, ignore
      } catch { /* ignore malformed */ }
    });

    socket.on('close', () => unsubscribe(socket, topic));
    socket.on('error', () => unsubscribe(socket, topic));
  });

  // Health check
  app.get('/health', async (_req, reply) => reply.send({ ok: true, ts: new Date().toISOString() }));

  // API and dashboard routes
  await registerRoutes(app);

  // Serve static frontend in production
  // __dirname = backend/dist/ in compiled output → ../../ = warroom/
  const webDist = path.resolve(__dirname, '../../web/dist');
  if (process.env.NODE_ENV === 'production') {
    await app.register(fastifyStatic, { root: webDist, prefix: '/', decorateReply: false });
    app.setNotFoundHandler((_req, reply) => {
      if (_req.url.startsWith('/api') || _req.url.startsWith('/dashboard') || _req.url.startsWith('/ws')) {
        return reply.code(404).send({ error: 'Not found' });
      }
      return reply.sendFile('index.html', webDist);
    });
  }

  return app;
}
