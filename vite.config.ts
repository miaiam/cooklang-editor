import { defineConfig } from 'vite';
import wasm from 'vite-plugin-wasm';

export default defineConfig({
  plugins: [wasm()],
  base: process.env.NODE_ENV === 'production' ? '/cooklang-editor/' : '/',
});
