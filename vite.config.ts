/**
 * ========================================================
 * Template Name: Vela — React Admin Dashboard Template
 * Author: elsayedB
 * License: You must have a valid license purchased only from ThemeForest
 * ========================================================
 */

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // Acesso pelo celular:
  // - mesma rede: http://<ip-do-pc>:5173
  // - fora de casa: cloudflared tunnel --url http://localhost:5173
  server: {
    host: true,
    allowedHosts: ['.trycloudflare.com'],
  },
})
