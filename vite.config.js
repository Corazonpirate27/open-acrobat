import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ command }) => ({
  base: command === 'serve' ? '/' : './',
  plugins: [
    tailwindcss(),
  ],
  server: {
    port: 5173,
    host: true,
  },
}));
