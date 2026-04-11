import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteStaticCopy } from 'vite-plugin-static-copy'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: 'node_modules/leaflet/dist/images',
          dest: 'leaflet-images'
        }
      ]
    })
  ],
  server: {
    port: 5173,
    open: true
  }
})
