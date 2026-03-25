/// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
  },
});

<<<<<<< HEAD
=======

>>>>>>> 16d71163fc03febef69e6b7246d7344f430e2936
