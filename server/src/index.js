import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { router as apiRouter } from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// CORS: if CLIENT_URL is set (comma-separated list allowed), lock to those
// origins. Otherwise allow all — that's only safe for local dev.
const allowedOrigins = env.clientUrl
  ? env.clientUrl.split(',').map((s) => s.trim()).filter(Boolean)
  : null;

app.use(
  cors({
    origin: allowedOrigins ?? true,
    credentials: false,
  })
);
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api', apiRouter);

app.use((req, res) => {
  res.status(404).json({ error: `Not found: ${req.method} ${req.path}` });
});

app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`[pub-mis] server listening on :${env.port} (${env.nodeEnv})`);
});
