import { buildApp } from './app.js';

const PORT = Number(process.env.PORT || 8686);

const app = await buildApp();

try {
  await app.listen({ port: PORT, host: '0.0.0.0' });
  console.log(`War Room backend running on http://0.0.0.0:${PORT}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
