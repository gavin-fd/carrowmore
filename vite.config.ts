import { fileURLToPath, URL } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';
import { ICON_NAMES } from './src/components/icon-names.ts';

/**
 * Material Symbols is roughly 750 KB as a full variable font, and Google Fonts
 * will subset it to named glyphs. The stylesheet link is generated from the
 * same list <Icon> is typed against, so an icon cannot be used without being
 * loaded, and nothing is loaded that is not used. About 5 KB.
 */
function materialSymbols(): Plugin {
  const href =
    'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,300..400,0,0' +
    `&icon_names=${[...ICON_NAMES].sort().join(',')}&display=block`;

  return {
    name: 'material-symbols',
    transformIndexHtml: () => [{ tag: 'link', attrs: { rel: 'stylesheet', href }, injectTo: 'head' }],
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), materialSymbols()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  build: {
    rolldownOptions: {
      output: {
        // Cached separately because they change at different rates: libraries
        // rarely, the derived evidence when derive.ts re-runs, the app most.
        codeSplitting: {
          groups: [
            { name: 'vendor', test: /node_modules/ },
            { name: 'evidence', test: /src\/data\/generated/ },
          ],
        },
      },
    },
  },
});
