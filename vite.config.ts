import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ isSsrBuild }) => ({
  plugins: [react(), tailwindcss()],
  build: {
    target: 'es2022',
    // one stylesheet: prerendered pages must be fully styled before any route chunk arrives
    cssCodeSplit: false,
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        // three + r3f in their own long-cacheable chunk, only fetched by routes that draw 3D
        manualChunks: isSsrBuild ? undefined : (id: string) => {
          if (/node_modules\/(three|@react-three)\//.test(id)) return 'three'
          if (/node_modules\/(gsap|lenis)\//.test(id)) return 'motion'
          if (/node_modules\/(react|react-dom|react-router|react-router-dom|scheduler|zustand)\//.test(id)) return 'react'
          return undefined
        },
      },
    },
  },
  server: { host: true, port: 5173 },
  preview: { port: 4173 },
  ssr: { noExternal: ['@react-three/drei', '@react-three/fiber'] },
}))
