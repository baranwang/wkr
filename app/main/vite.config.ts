import { defineConfig } from 'vite';
import { node } from '../../electron-vendors.config.json';
import { join } from 'path';
import { builtinModules } from 'module';

const PACKAGE_ROOT = __dirname;
const isDevelopment = process.env.MODE === 'development';

export default defineConfig({
  mode: process.env.MODE,
  root: PACKAGE_ROOT,
  envDir: process.cwd(),
  resolve: {
    alias: [
      { find: new RegExp('^/@/'), replacement: `${join(PACKAGE_ROOT, 'src')}/` },
    ]
  },
  build: {
    sourcemap: isDevelopment ? 'inline' : false,
    target: `node${node}`,
    outDir: 'dist',
    assetsDir: '.',
    minify: isDevelopment ? false : 'esbuild',
    lib: {
      entry: 'src/index.ts',
      formats: ['cjs'],
    },
    rollupOptions: {
      external: ['electron', 'wechaty', ...builtinModules],
      output: {
        entryFileNames: '[name].cjs',
      },
    },
    emptyOutDir: true,
    brotliSize: false,
  },
});
