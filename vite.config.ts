import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  root: '.',
  base: '/glint-studio/',
  plugins: [react()],
  build: {
    outDir: 'dist',
  },
});
