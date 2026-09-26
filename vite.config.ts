import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { resolve } from 'node:path';

// `npm run build` produces dist/index.html: one self-contained file, like the original release.
// The car studio is a dev-only page (npm run dev -> /studio.html).
export default defineConfig(({ command }) => ({
  plugins: command === 'build' ? [viteSingleFile({ removeViteModuleLoader: true })] : [],
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 8000,
    assetsInlineLimit: 100_000_000,
    rollupOptions: { input: { index: resolve(import.meta.dirname, 'index.html') } },
  },
  server: { host: true, port: 5173, strictPort: true },
}));
