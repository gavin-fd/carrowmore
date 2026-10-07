import { copyFile, mkdir, writeFile } from 'node:fs/promises';
import { routes } from '../src/lib/routes.ts';

const index = new URL('../dist/index.html', import.meta.url);
const pageRoutes = Object.values(routes).filter((route) => route !== '/');

// Pages serves these routes as ordinary documents, including on a direct visit or refresh.
await Promise.all(pageRoutes.map(async (route) => {
  const directory = new URL(`../dist${route}/`, import.meta.url);
  await mkdir(directory, { recursive: true });
  await copyFile(index, new URL('index.html', directory));
}));

await Promise.all([
  copyFile(index, new URL('../dist/404.html', import.meta.url)),
  writeFile(new URL('../dist/.nojekyll', import.meta.url), ''),
]);
console.log(`Prepared static entry points for ${pageRoutes.length} application routes.`);
