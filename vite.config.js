import path from 'path';
import checker from 'vite-plugin-checker';
import { loadEnv, defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { fileURLToPath, URL } from 'node:url';
import { VitePWA } from 'vite-plugin-pwa';
import dotenv from 'dotenv';

dotenv.config();
const APP_NAME = process.env.WEBSITE_NAME || 'CIS INTEK';

// ----------------------------------------------------------------------

const PORT = 3031;

const env = loadEnv('all', process.cwd());

export default defineConfig({
  // base: env.VITE_BASE_PATH,
  plugins: [
    react(),
    checker({
      eslint: {
        lintCommand: 'eslint "./src/**/*.{js,jsx,ts,tsx}"',
      },
      overlay: {
        position: 'tl',
        initialIsOpen: false,
      },
    }),
    // PWA
    VitePWA({
      useCredentials: true,
      workbox: {
        maximumFileSizeToCacheInBytes: 7000000, // 7MB
      },
      includeAssets: ['icon512_maskable.png', 'icon512_rounded.png', 'favicon.ico'],
      manifest: {
        name: APP_NAME,
        short_name: APP_NAME,
        theme_color: '#8936FF',
        description: 'Customer Information System | INTEK',
        icons: [
          {
            purpose: 'maskable',
            sizes: '512x512',
            src: 'icon512_maskable.png',
            type: 'image/png',
          },
          {
            purpose: 'any',
            sizes: '512x512',
            src: 'icon512_rounded.png',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: [
      {
        find: '@utils',
        replacement: path.join(process.cwd(), 'src', 'utils'),
      },
      {
        find: '@components',
        replacement: path.join(process.cwd(), 'src', 'components'),
      },
      {
        find: '@assets',
        replacement: path.join(process.cwd(), 'src', 'assets'),
      },
      {
        find: '@auth',
        replacement: path.join(process.cwd(), 'src', 'auth'),
      },
      {
        find: '@hooks',
        replacement: path.join(process.cwd(), 'src', 'hooks'),
      },
      {
        find: '@layouts',
        replacement: path.join(process.cwd(), 'src', 'layouts'),
      },
      {
        find: '@pages',
        replacement: path.join(process.cwd(), 'src', 'pages'),
      },
      {
        find: '@routes',
        replacement: path.join(process.cwd(), 'src', 'routes'),
      },
      {
        find: '@models',
        replacement: path.join(process.cwd(), 'src', 'models'),
      },
      {
        find: '@themes',
        replacement: path.join(process.cwd(), 'src', 'themes'),
      },
      {
        find: '@commons',
        replacement: path.join(process.cwd(), 'src', 'commons'),
      },
      {
        find: '@repositories',
        replacement: path.join(process.cwd(), 'src', 'repositories'),
      },
      {
        find: '@stores',
        replacement: path.join(process.cwd(), 'src', 'stores'),
      },
      {
        find: '@',
        replacement: path.join(process.cwd(), 'src'),
      },
      {
        find: /^~(.+)/,
        replacement: path.join(process.cwd(), 'node_modules/$1'),
      },
      {
        find: /^src(.+)/,
        replacement: path.join(process.cwd(), 'src/$1'),
      },
    ],
  },
  server: {
    port: PORT,
    host: true,
    proxy: {
      // '/api': 'http://103.124.197.246/api',
      '/api/ktp/ocr': {
        target: 'http://localhost:9000/go_ocr/v1/ktp/request',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/ktp\/ocr/, ''),
      },
      '/api/network-monitoring': {
        // target: 'http://localhost:3000/',
        target: 'https://cis.intek.my.id/api/network-monitoring',

        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/network-monitoring/, ''),
      },
      '/api/v3': {
        // target: 'http://localhost:4000/v3',
        target: 'https://cis.intek.my.id/api/v3',

        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/v3/, ''),
      },
      '/api': {
        target: 'http://localhost:4000/v2',
        // target: 'https://cis1.intek.my.id/api',

        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/public': {
        // target: 'http://localhost:3000/public',
        target: 'http://localhost:4000/public',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/public/, ''),
      },
      '/invoice': {
        target: 'http://localhost:4000/invoice',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/invoice/, ''),
      },
      '/payment': {
        target: 'http://localhost:4000/payment',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/payment/, ''),
      },
      '/ws': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        ws: true,
        rewrite: (path) => path.replace(/^\/ws/, ''),
      },
    },
  },
  preview: { port: PORT, host: true },
});
