import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    // Firebase Hosting rewrites /api to a Cloud Function in production. The dev
    // server has no such rewrite, so without this the open-data console on
    // /developers would fetch index.html and fail to parse it as JSON.
    proxy: {
      '/api': {
        target: 'https://reloop-melbourne-78b45.web.app',
        changeOrigin: true,
      },
    },
  },
})
