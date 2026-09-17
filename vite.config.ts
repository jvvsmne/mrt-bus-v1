import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import busHandler from './api/bus.js';
import healthHandler from './api/health.js';
import mrtHandler from './api/mrt.js';

function apiServerlessPlugin(): Plugin {
  return {
    name: 'api-serverless-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/')) {
          return next();
        }

        const url = new URL(req.url, `http://${req.headers.host || 'localhost:3000'}`);
        const pathname = url.pathname;

        let handler: any = null;
        if (pathname === '/api/bus' || pathname === '/api/bus.js') {
          handler = busHandler;
        } else if (pathname === '/api/health' || pathname === '/api/health.js') {
          handler = healthHandler;
        } else if (pathname === '/api/mrt' || pathname === '/api/mrt.js') {
          handler = mrtHandler;
        }

        if (!handler) {
          return next();
        }

        try {
          (req as any).query = Object.fromEntries(url.searchParams.entries());

          if (!(res as any).status) {
            (res as any).status = function (code: number) {
              res.statusCode = code;
              return res;
            };
          }
          if (!(res as any).json) {
            (res as any).json = function (data: any) {
              if (!res.headersSent) {
                res.setHeader('Content-Type', 'application/json');
              }
              res.end(JSON.stringify(data));
              return res;
            };
          }

          await handler(req, res);
        } catch (err) {
          next(err);
        }
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), apiServerlessPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
