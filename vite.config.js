import { defineConfig } from 'vite';
// three y gsap van en chunks propios: cambian poco, así el navegador los conserva en caché aunque cambie la app.
const vendor = (id) => (id.includes('node_modules/three') ? 'three' : id.includes('node_modules/gsap') ? 'gsap' : undefined);
export default defineConfig({
  base: './',
  build: { target: 'es2022', assetsInlineLimit: 0, chunkSizeWarningLimit: 900, reportCompressedSize: false,
    rollupOptions: { output: { manualChunks: vendor } } },
  server: { port: 5173 },
});
