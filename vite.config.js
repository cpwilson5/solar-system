import { defineConfig } from 'vite';

export default defineConfig({
  root: 'src',
  base: '/solar-system/',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
  server: {
    port: 5173 // You can keep or change the port
  }
}); 