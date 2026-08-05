import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  base: process.env.ELECTRON_BUILD === 'true' ? './' : '/',
  plugins: [
    tailwindcss(),
  ],
  server: {
    port: 5173,
    host: true,
  },
});
