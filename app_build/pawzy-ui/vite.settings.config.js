import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  root: 'src/settings',
  build: {
    outDir: '../../dist/settings',
    emptyOutDir: true,
  },
  base: './',
});
