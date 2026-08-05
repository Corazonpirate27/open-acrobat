import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  base: './', // Ensures CSS, JS, and worker assets load properly in Electron and relative file environments
  plugins: [
    tailwindcss(),
  ],
  server: {
    port: 5173,
    host: true,
  },
});
