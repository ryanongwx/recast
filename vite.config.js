import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        // Popup UI
        popup: resolve(__dirname, 'popup.html'),
        // Background service worker (no React, plain JS)
        background: resolve(__dirname, 'src/background.js'),
        // Content script (no React, plain JS)
        content: resolve(__dirname, 'src/content.js'),
      },
      output: {
        // Keep background and content scripts as flat files
        entryFileNames: (chunk) => {
          if (chunk.name === 'background' || chunk.name === 'content') {
            return '[name].js'
          }
          return 'assets/[name]-[hash].js'
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
  // Dev server still works for popup development
  server: {
    port: 5173,
  },
})