import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { realpath, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = await realpath(fileURLToPath(new URL('../', import.meta.url)));
const host = '127.0.0.1';
const port = 4173;
const mimeTypes = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.mjs', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.webp', 'image/webp'],
  ['.avif', 'image/avif'],
  ['.ico', 'image/x-icon'],
  ['.woff', 'font/woff'],
  ['.woff2', 'font/woff2'],
  ['.txt', 'text/plain; charset=utf-8'],
]);

const isInsideRoot = (filePath) => {
  const relative = path.relative(root, filePath);
  return relative === '' || (!relative.startsWith(`..${path.sep}`)
    && relative !== '..' && !path.isAbsolute(relative));
};

const hasPrivateSegment = (segments) => segments.some((segment) =>
  segment.startsWith('.') || segment.toLowerCase() === 'node_modules');

const respond = (request, response, statusCode, message) => {
  response.writeHead(statusCode, { 'Content-Type': 'text/plain; charset=utf-8' });
  response.end(request.method === 'HEAD' ? undefined : message);
};

const server = createServer(async (request, response) => {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.setHeader('Allow', 'GET, HEAD');
    respond(request, response, 405, 'Método no permitido.');
    return;
  }

  let pathname;
  try {
    pathname = decodeURIComponent(new URL(request.url, `http://${host}:${port}`).pathname)
      .replaceAll('\\', '/');
  } catch {
    respond(request, response, 400, 'Ruta inválida.');
    return;
  }

  const segments = pathname.split('/').filter(Boolean);
  if (pathname.includes('\0') || pathname.includes(':')
      || hasPrivateSegment(segments)) {
    respond(request, response, 403, 'Acceso no permitido.');
    return;
  }

  try {
    let filePath = path.resolve(root, `.${pathname}`);
    if (!isInsideRoot(filePath)) {
      respond(request, response, 403, 'Acceso no permitido.');
      return;
    }

    let fileStat = await stat(filePath);
    if (fileStat.isDirectory()) {
      filePath = path.join(filePath, 'index.html');
      fileStat = await stat(filePath);
    }

    const resolvedPath = await realpath(filePath);
    const resolvedSegments = path.relative(root, resolvedPath).split(path.sep);
    if (!fileStat.isFile() || !isInsideRoot(resolvedPath) || hasPrivateSegment(resolvedSegments)) {
      respond(request, response, 403, 'Acceso no permitido.');
      return;
    }

    response.writeHead(200, {
      'Content-Type': mimeTypes.get(path.extname(filePath).toLowerCase()) || 'application/octet-stream',
      'Content-Length': fileStat.size,
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    });

    if (request.method === 'HEAD') {
      response.end();
      return;
    }

    const stream = createReadStream(resolvedPath);
    stream.on('error', () => response.destroy());
    stream.pipe(response);
  } catch (error) {
    const isMissing = error.code === 'ENOENT' || error.code === 'ENOTDIR';
    respond(request, response, isMissing ? 404 : 500,
      isMissing ? 'Archivo no encontrado.' : 'No se pudo leer el archivo.');
  }
});

server.on('error', (error) => {
  console.error(error.code === 'EADDRINUSE'
    ? `El puerto ${port} está ocupado. Cerrá el servidor anterior y volvé a intentar.`
    : 'No se pudo iniciar el servidor local.');
  process.exitCode = 1;
});

server.listen(port, host, () => {
  console.log(`Sitio disponible en http://${host}:${port}`);
  console.log('Presioná Ctrl+C para detener el servidor.');
});
