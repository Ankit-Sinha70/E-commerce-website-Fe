import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from "path"
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import basicSsl from '@vitejs/plugin-basic-ssl';
import imagemin from 'vite-plugin-imagemin'; // Import imagemin plugin

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default defineConfig({
  plugins: [react(),  tailwindcss(), basicSsl(), imagemin({
    gifsicle: { optimizationLevel: 7, interlaced: false },
    optipng: { optimizationLevel: 7 },
    mozjpeg: { quality: 20 },
    pngquant: { quality: [0.8, 0.9], speed: 4 },
    svgo: { plugins: [{ name: 'removeViewBox' }, { name: 'removeEmptyAttrs' }] },
  })], // Add imagemin() to plugins with configuration
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    https: true
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('react')) return 'react-vendor';
            if (id.includes('redux')) return 'redux-vendor';
            if (id.includes('react-router-dom')) return 'react-router-vendor';
            if (id.includes('lucide-react')) return 'lucide-vendor';
            return 'vendor';
          }
        },
      },
    },
    chunkSizeWarningLimit: 3000, 
  },
});
