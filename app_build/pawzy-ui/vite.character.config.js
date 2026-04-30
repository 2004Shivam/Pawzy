import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite config for the CHARACTER widget window
export default defineConfig({
  plugins: [react()],
  root: 'src/character',
  build: {
    outDir: '../../dist/character',
    emptyOutDir: true,
  },
  publicDir: '../../public',
  server: {
    port: 5173,
  },
  base: './',
});
