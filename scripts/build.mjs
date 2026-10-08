import { cp, mkdir } from 'node:fs/promises';

const project = new URL('../', import.meta.url);
const output = new URL('dist/', project);
await mkdir(output, { recursive: true });
await cp(new URL('index.html', project), new URL('index.html', output));
for (const directory of ['css', 'js', 'images', 'vendor']) {
  await mkdir(new URL('assets/', output), { recursive: true });
  await cp(new URL(`assets/${directory}/`, project), new URL(`assets/${directory}/`, output), { recursive: true });
}
console.log('Sitio estático preparado en dist/. No se publicó ningún archivo.');
