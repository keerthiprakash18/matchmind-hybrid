import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Keep localhost origin stable: Firebase App Check debug tokens are browser-origin scoped.
// The successfully tested local development URL uses 127.0.0.1:5174.
// Never commit or embed debug tokens in source code.
export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 5174,
    strictPort: true
  }
});
