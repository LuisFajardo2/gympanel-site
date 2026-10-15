import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import vm from 'node:vm';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = (file) => readFileSync(resolve(root, file), 'utf8');
const pages = readdirSync(root).filter((file) => file.endsWith('.html'));

test('all local links, anchors and assets resolve', () => {
  for (const page of pages) {
    const html = read(page);
    const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
    assert.equal(new Set(ids).size, ids.length, `${page}: duplicate IDs`);
    for (const [, href] of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
      if (/^(?:https?:|mailto:|data:|\/\/)/.test(href)) continue;
      const [path, hash] = href.split('#');
      const target = path.split('?')[0] || page;
      const absolute = resolve(dirname(resolve(root, page)), target);
      assert.ok(existsSync(absolute), `${page}: missing ${href}`);
      if (hash) {
        assert.ok(readFileSync(absolute, 'utf8').includes(`id="${hash}"`), `${page}: missing anchor ${href}`);
      }
    }
  }
});

test('plan enquiries have the approved prices, limits and official WhatsApp destination', () => {
  const html = read('planes.html');
  const expected = { Starter: ['S/39', 'S/59', '350', '30 días', '3 meses'], Regular: ['S/59', '350'], Pro: ['S/130', '900'] };
  const links = [...html.matchAll(/<a[^>]*data-plan="([^"]+)"[^>]*href="([^"]+)"[^>]*>/g)];
  assert.equal(links.length, 3);
  for (const [tag, plan, href] of links) {
    assert.ok(expected[plan], `Unknown plan ${plan}`);
    const url = new URL(href);
    assert.equal(url.origin + url.pathname, 'https://wa.me/51907984384');
    const message = url.searchParams.get('text');
    for (const text of expected[plan]) assert.ok(message.includes(text), `${plan}: missing ${text}`);
    assert.match(tag, /rel="[^\"]*noopener/);
  }
});

test('commercial content distinguishes the temporary offer and final regular prices', () => {
  const plans = read('planes.html');
  for (const required of ['S/39', 'S/59', 'S/130', '350 miembros activos', '900 miembros activos', '30 días', '3 meses de pago', 'Primeros', 'no aplica al Pro', 'ni se acumula con pagos adelantados']) {
    assert.ok(plans.toLowerCase().includes(required.toLowerCase()), `Missing ${required}`);
  }
  for (const page of ['index.html', 'planes.html', 'terminos.html']) {
    assert.match(read(page), /precios finales|precios publicados son finales/i, page);
    assert.match(read(page), /S\/130/, page);
  }
  for (const page of pages) assert.doesNotMatch(read(page), /400\s*(?:<[^>]+>\s*)*miembros/i, page);
  assert.match(plans, /Atención presencial opcional/);
  assert.match(read('soporte.html'), /No está incluida en la mensualidad/);
  assert.doesNotMatch(plans, /data-lucide|Tweak|Vista preliminar|data-gp-logo/);
});

test('page renders price information without relying on JavaScript', () => {
  const plans = read('planes.html');
  assert.equal((plans.match(/<article class="gp-plan\b/g) || []).length, 3);
  assert.equal((plans.match(/<details>/g) || []).length, 5);
  assert.match(plans, /href="pricing.css"/);
  assert.doesNotMatch(read('pricing.css'), /\.gp-\.gp-/);
  assert.match(plans, /class="brand-mark"><img src="assets\/gympanel-logo.png"/);
});

test('mobile navigation supports opening and Escape with restored focus', () => {
  const listeners = {};
  const attrs = {};
  let open = false;
  let focused = false;
  const menu = { addEventListener: (name, cb) => { listeners[name] = cb; }, setAttribute: (name, value) => { attrs[name] = value; }, focus: () => { focused = true; } };
  const nav = { classList: { toggle: () => (open = !open), contains: () => open, remove: () => { open = false; } }, querySelectorAll: () => [] };
  const document = { querySelector: (selector) => selector === '.menu-button' ? menu : nav, querySelectorAll: () => [], addEventListener: (name, cb) => { listeners[name] = cb; } };
  vm.runInNewContext(read('script.js'), { document });
  listeners.click();
  assert.equal(attrs['aria-expanded'], 'true');
  assert.equal(attrs['aria-label'], 'Cerrar navegación');
  listeners.keydown({ key: 'Escape' });
  assert.equal(open, false);
  assert.equal(attrs['aria-expanded'], 'false');
  assert.equal(focused, true);
});
