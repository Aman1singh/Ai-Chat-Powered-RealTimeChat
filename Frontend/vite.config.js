// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'
// import tailwindcss from '@tailwindcss/vite'
// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react(), tailwindcss()],
  
// })


import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  
  // --- ADD THIS SECTION ---
  server: {
    port: 5173, // Your frontend port
    proxy: {
      // This forwards any request starting with /api to your backend
      "/api": {
        target: "http://localhost:5001", // Your backend server URL
        changeOrigin: true,
      },
    },
  },
})