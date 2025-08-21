// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import vercel from '@astrojs/vercel/static';

// https://astro.build/config
export default defineConfig({
  site: 'https://immigratic.ca',
  output: 'static',
  outDir: process.env.VERCEL ? '.vercel/output/static' : 'dist',
  adapter: process.env.VERCEL ? vercel({
    webAnalytics: {
      enabled: true
    }
  }) : undefined,
  integrations: [tailwind()],
  build: {
    inlineStylesheets: 'auto'
  },
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