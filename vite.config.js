import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/fast2sms': {
        target: 'https://www.fast2sms.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/fast2sms/, '/dev/bulkV2'),
      },
      '/api/smsmobile': {
        target: 'https://api.smsmobileapi.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/smsmobile/, '/sendsms/'),
      },
    },
  },
})
