import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  root: path.resolve(__dirname, 'src'),
  publicDir: path.resolve(__dirname, 'public'),
  plugins: [
    tailwindcss(),
  ],
})