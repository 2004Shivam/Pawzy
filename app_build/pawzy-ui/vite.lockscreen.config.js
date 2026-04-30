import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite config for the LOCK SCREEN window
export default defineConfig({
  plugins: [react()],
  root: 'src/lockscreen',
  build: {
    outDir: '../../dist/lockscreen',
    emptyOutDir: true,
  },
  publicDir: '../../public',
  server: {
    port: 5174,
  },
  base: './',
});
