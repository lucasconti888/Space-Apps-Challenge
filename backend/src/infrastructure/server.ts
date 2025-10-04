import http from 'http';
import { env } from './env';
import app from './app';
import { logger } from './logger';

function startServer() {
  const server = http.createServer(app);

  app.get('/health', (req, res) => {
    logger.info('Health check requested');
    res.send('OK');
  });

  process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err);
    process.exit(1);
  });

  process.on('unhandledRejection', (reason) => {
    console.error('⚠️ Unhandled Rejection:', reason);
  });

  const shutdown = () => {
    console.log('\n🛑 Shutting down gracefully...');
    server.close(() => {
      console.log('✅ HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  server.listen(env.port, () => {
    logger.info(`🚀 Server running on port ${env.port}`);
  });
}

startServer();
