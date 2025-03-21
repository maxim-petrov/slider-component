import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tokensPlugin from './scripts/viteTokensPlugin.js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tokensPlugin(),
    react()
  ],
})
