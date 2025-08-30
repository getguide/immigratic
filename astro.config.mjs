// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import vercel from '@astrojs/vercel/serverless';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.immigratic.com',
  output: 'hybrid', // Production deployment
  adapter: vercel({
    functionPerRoute: false
  }),
  integrations: [tailwind()],
  vite: {
    build: {
      rollupOptions: {
        output: {
          manualChunks: undefined
        }
      }
    }
  }
});