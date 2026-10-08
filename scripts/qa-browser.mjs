import { spawn } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

// QA local. No se hacen envíos ni se abren enlaces de contacto reales.
const root = fileURLToPath(new URL('../', import.meta.url));
const artifacts = path.join(root, '.qa');
const profile = path.join(artifacts, 'edge-profile');
await mkdir(profile, { recursive: true });
const edge = spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', [
  '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
  '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank',
], { windowsHide: true, stdio: ['ignore', 'ignore', 'pipe'] });
let browserLog = '';
edge.stderr.on('data', (data) => { browserLog += data.toString(); });
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const events = [];
let socket;
let nextID = 0;
const pending = new Map();
const call = (method, params = {}) => new Promise((resolve, reject) => {
  const id = ++nextID;
  const timeout = setTimeout(() => { pending.delete(id); reject(new Error(`Timeout: ${method}`)); }, 15000);
  pending.set(id, { resolve, reject, timeout });
  socket.send(JSON.stringify({ id, method, params }));
});
const evaluate = async (expression) => {
  const result = await call('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
  return result.result.value;
};
const navigate = async () => {
  await call('Page.navigate', { url: 'http://127.0.0.1:4173/' });
  for (let count = 0; count < 50; count++) {
    if (await evaluate('document.readyState === "complete"')) break;
    await pause(100);
  }
  await evaluate('Promise.race([document.fonts.ready, new Promise(resolve => setTimeout(resolve, 2500))]).then(() => true)');
  await pause(800);
};
const checkLayout = () => evaluate(`(() => {
  const width = document.documentElement.clientWidth;
  return {
    width: innerWidth, clientWidth: width, scrollWidth: document.documentElement.scrollWidth,
    overflow: [...document.querySelectorAll('body *')].filter(el => {
      const style = getComputedStyle(el); const box = el.getBoundingClientRect();
      return style.display !== 'none' && box.width > 0 && (box.right > width + 1 || box.left < -1)
        && !el.closest('.icon-definitions') && !el.classList.contains('approach-decoration');
    }).map(el => ({ tag: el.tagName, classes: el.className?.baseVal ?? el.className, right: Math.round(el.getBoundingClientRect().right), left: Math.round(el.getBoundingClientRect().left) })),
    images: [...document.images].map(img => ({ src: img.getAttribute('src'), loaded: img.complete && img.naturalWidth > 0, alt: img.alt })),
    missingAnchors: [...document.querySelectorAll('a[href^="#"]')].filter(link => !document.getElementById(link.hash.slice(1))).map(link => link.hash),
    duplicateIds: [...document.querySelectorAll('[id]')].map(el => el.id).filter((id, index, ids) => ids.indexOf(id) !== index),
    unlabeledFields: [...document.querySelectorAll('input,select,textarea')].filter(el => !el.labels?.length && !el.getAttribute('aria-label')).map(el => el.id),
    title: document.title,
  };
})()`);
const screenshot = async (name, maxHeight = Infinity) => {
  const metrics = await call('Page.getLayoutMetrics');
  const { width, height } = metrics.cssContentSize;
  const result = await call('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { x: 0, y: 0, width, height: Math.min(height, maxHeight), scale: 1 } });
  await writeFile(path.join(artifacts, name), Buffer.from(result.data, 'base64'));
};
const revealPage = async () => {
  const height = await evaluate('document.documentElement.scrollHeight');
  for (let y = 0; y < height; y += 600) {
    await evaluate(`window.scrollTo({top: ${y}, behavior: 'instant'})`);
    await pause(70);
  }
  await evaluate("window.scrollTo({top: 0, behavior: 'instant'})");
  await pause(850);
};

try {
  let port;
  for (let count = 0; count < 100; count++) {
    try { port = Number((await readFile(path.join(profile, 'DevToolsActivePort'), 'utf8')).split('\n')[0]); } catch {}
    if (port) { try { await fetch(`http://127.0.0.1:${port}/json/version`); break; } catch { port = undefined; } }
    await pause(100);
  }
  if (!port) throw new Error('Edge no abrió el puerto de depuración.');
  const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  const target = targets.find(item => item.type === 'page');
  socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
  socket.onmessage = (event) => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      const item = pending.get(message.id); clearTimeout(item.timeout); pending.delete(message.id);
      if (message.error) item.reject(new Error(JSON.stringify(message.error))); else item.resolve(message.result);
    } else if (['Runtime.exceptionThrown', 'Log.entryAdded', 'Network.loadingFailed'].includes(message.method)) events.push(message);
  };
  await call('Page.enable'); await call('Runtime.enable'); await call('Network.enable'); await call('Log.enable');
  await call('Network.setBlockedURLs', { urls: ['*://wa.me/*', '*://api.whatsapp.com/*'] });
  await call('Page.addScriptToEvaluateOnNewDocument', { source: 'window._qaOpened=[]; window.open=(...args)=>{window._qaOpened.push(args);return null;};' });
  const report = { viewports: [], events };
  for (const width of [320, 375, 768, 1440]) {
    await call('Emulation.setDeviceMetricsOverride', { width, height: 1000, deviceScaleFactor: 1, mobile: false });
    await navigate(); await revealPage();
    report.viewports.push(await checkLayout());
    if (width === 375 || width === 1440) {
      await screenshot(`${width === 375 ? 'mobile' : 'desktop'}.png`);
      await screenshot(`${width === 375 ? 'mobile' : 'desktop'}-hero.png`, 1000);
    }
  }
  report.links = await evaluate("[...document.querySelectorAll('a[href]')].map(a=>({text:a.textContent.trim(),href:a.getAttribute('href'),target:a.target,rel:a.rel}))");
  await call('Emulation.setDeviceMetricsOverride', { width: 375, height: 850, deviceScaleFactor: 1, mobile: false });
  await navigate();
  report.menu = await evaluate(`(() => {
    const button = document.querySelector('.nav-toggle'); const nav = document.getElementById('primary-navigation');
    const result = {initial: getComputedStyle(nav).display};
    button.click(); result.open = {expanded: button.getAttribute('aria-expanded'), display: getComputedStyle(nav).display};
    document.dispatchEvent(new KeyboardEvent('keydown', {key:'Escape', bubbles:true}));
    result.escape = {expanded: button.getAttribute('aria-expanded'), display: getComputedStyle(nav).display, focus: document.activeElement === button};
    button.click(); nav.querySelector('a[href="#servicios"]').click();
    result.linkCloses = button.getAttribute('aria-expanded') === 'false'; return result;
  })()`);
  report.form = await evaluate(`(() => {
    const form = document.getElementById('contact-form');
    const submit = () => form.dispatchEvent(new Event('submit', {bubbles:true,cancelable:true}));
    form.elements.name.value='  '; form.elements.service.value='Otra consulta'; form.elements.message.value='  '; submit();
    const invalid = { opened:window._qaOpened.length, name:form.elements.name.validationMessage, message:form.elements.message.validationMessage };
    form.elements.name.value='Prueba QA'; form.elements.service.value='Sueldos y cargas sociales'; form.elements.message.value='Consulta local de prueba: acentos áéí y & símbolos.'; submit();
    return { invalid, opened:window._qaOpened, status:document.getElementById('form-status').textContent, fallback:document.getElementById('whatsapp-fallback').href, fallbackVisible:!document.getElementById('whatsapp-fallback').hidden };
  })()`);
  await call('Emulation.setEmulatedMedia', { features: [{ name:'prefers-reduced-motion', value:'reduce' }] });
  await navigate();
  report.reducedMotion = await evaluate("({matches:matchMedia('(prefers-reduced-motion: reduce)').matches,scrollBehavior:getComputedStyle(document.documentElement).scrollBehavior,hiddenReveals:[...document.querySelectorAll('[data-reveal]')].filter(el=>getComputedStyle(el).opacity==='0').length,transition:getComputedStyle(document.querySelector('.btn')).transitionDuration})");
  await call('Emulation.setScriptExecutionDisabled', { value: true });
  await navigate();
  report.noJavaScript = await evaluate("({hiddenReveals:[...document.querySelectorAll('[data-reveal]')].filter(el=>getComputedStyle(el).opacity==='0').length,navigationDisplay:getComputedStyle(document.getElementById('primary-navigation')).display,noscript:document.querySelector('noscript')?.textContent})");
  await call('Emulation.setScriptExecutionDisabled', { value: false });
  report.events = events;
  await writeFile(path.join(artifacts, 'report.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify({viewports:report.viewports,menu:report.menu,form:report.form,reducedMotion:report.reducedMotion,noJavaScript:report.noJavaScript,errors:events.filter(event=>event.method==='Runtime.exceptionThrown'||event.params.entry?.level==='error'),report:'.qa/report.json'}, null, 2));
} finally {
  await writeFile(path.join(artifacts, 'browser.log'), browserLog);
  if (socket?.readyState === WebSocket.OPEN) { try { await call('Browser.close'); } catch {} socket.close(); }
  if (edge.exitCode === null) edge.kill();
}
