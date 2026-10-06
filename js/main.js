import { SHOP, SWEETS, SWEET_GROUPS, GLOSSARY } from './data.js';
import { $, $$, esc, initNav, initReveal } from './common.js';
import { illustration } from './illustrations.js';

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp01 = (v) => Math.min(1, Math.max(0, v));
const smooth = (a, b, v) => { const t = clamp01((v - a) / (b - a)); return t * t * (3 - 2 * t); };
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const COLORS = ['saff', 'pist', 'rose', 'cream'];

// ─── Hero: 8-Zack-Stern aus Kacheln, der sich zum Raster auffaltet ───
// Reihenfolge = Reihenfolge der Spitzen im Uhrzeigersinn
const PETALS = [
  { id: 'knafeh-nabulsi', name: 'Künefe', bg: 'saff' },
  { id: 'mabrumeh' },
  { id: 'baklava', bg: 'pist' },
  { id: 'halawet' },
  { id: 'shaabiyat', bg: 'rose' },
  { id: 'barazek' },
  { id: 'ballourieh', bg: 'deep' },
  { id: 'maamoul', bg: 'cream' },
];

function initStar() {
  const hero = $('#starHero'), stage = $('#starStage'), star = $('#star');
  const copy = $('#heroCopy'), head = $('#gridHead'), core = $('#starCore'), cue = $('#scrollCue');
  const items = PETALS.map((p) => ({ ...SWEETS.find((s) => s.id === p.id), ...p }));

  star.innerHTML = items.map((s, i) => `
    <a class="petal ${s.img ? 'petal--img' : `petal--${s.bg}`}" href="#sweet-${s.id}" data-id="${s.id}" tabindex="-1">
      <span class="petal__box">
        ${s.img ? `<img src="${s.img}" alt="">` : `<span class="petal__art">${illustration(s.shape, `p${i}`)}</span>`}
        <span class="petal__label">
          <span lang="ar" dir="rtl">${s.ar}</span>
          <b>${esc(s.name)}</b>
          <small>${esc(s.de)}</small>
        </span>
      </span>
    </a>`).join('');
  const petals = $$('.petal', star), boxes = petals.map((p) => p.firstElementChild);

  let W = 1, H = 1, target = 0, prog = 0, raf = 0, running = false;
  const measure = () => { const r = stage.getBoundingClientRect(); W = r.width; H = r.height; };

  const u = (a) => [Math.cos(a), Math.sin(a)];
  const C8 = Math.cos(Math.PI / 8);

  function layout(p, time) {
    const small = W < 860;
    // Stern
    const cx = small ? W / 2 : W * 0.7;
    const cy = small ? H * 0.27 : H * 0.53;
    const Rt = small ? Math.min(W * 0.36, H * 0.17) : Math.min(W * 0.26, H * 0.4);
    const a = Rt / (2 * C8);
    const rot = -Math.PI / 2 + (reducedMotion ? 0 : time * 0.00005) * (1 - p);
    // Raster
    const cols = small ? 2 : 4, rows = small ? 4 : 2, gap = small ? 10 : 14;
    const maxW = Math.min(W - 32, 1240);
    const gx = (W - maxW) / 2, gy = small ? H * 0.25 : H * 0.3;
    const gw = maxW, gh = small ? H * 0.72 : H * 0.64;
    const cw = (gw - gap * (cols - 1)) / cols, ch = (gh - gap * (rows - 1)) / rows;

    petals.forEach((el, i) => {
      const th = rot + (i * Math.PI) / 4;
      const [ux, uy] = u(th), [lx, ly] = u(th - Math.PI / 8), [rx, ry] = u(th + Math.PI / 8);
      let rh = [[cx, cy], [cx + a * lx, cy + a * ly], [cx + 2 * a * C8 * ux, cy + 2 * a * C8 * uy], [cx + a * rx, cy + a * ry]];
      // kleine Fuge zwischen den Rauten
      const mx = rh.reduce((s, q) => s + q[0], 0) / 4, my = rh.reduce((s, q) => s + q[1], 0) / 4;
      rh = rh.map(([x, y]) => [mx + (x - mx) * 0.94, my + (y - my) * 0.94]);

      const col = i % cols, row = Math.floor(i / cols);
      const x0 = gx + col * (cw + gap), y0 = gy + row * (ch + gap);
      const rect = [[x0, y0], [x0 + cw, y0], [x0 + cw, y0 + ch], [x0, y0 + ch]];
      // Ecken so zuordnen, dass sich die Kachel möglichst wenig verdreht
      let best = 0, bestD = Infinity;
      for (let k = 0; k < 4; k++) {
        let d = 0;
        for (let j = 0; j < 4; j++) { const q = rect[(j + k) % 4]; d += Math.hypot(rh[j][0] - q[0], rh[j][1] - q[1]); }
        if (d < bestD) { bestD = d; best = k; }
      }
      const e = easeInOut(clamp01((p - i * 0.025) / 0.72));
      const fly = Math.sin(e * Math.PI) * Rt * 0.2;
      const pts = rh.map((q, j) => {
        const r2 = rect[(j + best) % 4];
        return [q[0] + (r2[0] - q[0]) * e + ux * fly, q[1] + (r2[1] - q[1]) * e + uy * fly];
      });
      el.style.clipPath = `polygon(${pts.map(([x, y]) => `${x.toFixed(1)}px ${y.toFixed(1)}px`).join(',')})`;
      const xs = pts.map((q) => q[0]), ys = pts.map((q) => q[1]);
      const bx = Math.min(...xs), by = Math.min(...ys);
      Object.assign(boxes[i].style, {
        left: `${bx}px`, top: `${by}px`,
        width: `${Math.max(...xs) - bx}px`, height: `${Math.max(...ys) - by}px`,
      });
    });

    stage.style.setProperty('--grid', smooth(0.82, 1, p).toFixed(3));
    stage.classList.toggle('is-grid', p > 0.95);
    copy.style.opacity = 1 - smooth(0, 0.3, p);
    copy.style.transform = `translateY(${-p * 90}px)`;
    copy.style.visibility = p > 0.32 ? 'hidden' : 'visible';
    head.style.opacity = smooth(0.62, 0.92, p);
    head.style.transform = `translateY(${(1 - smooth(0.62, 0.92, p)) * 30}px)`;
    Object.assign(core.style, {
      left: `${cx}px`, top: `${cy}px`,
      opacity: 1 - smooth(0, 0.18, p),
      transform: `translate(-50%, -50%) scale(${1 - smooth(0, 0.2, p) * 0.5}) rotate(${rot + Math.PI / 2}rad)`,
    });
    cue.style.opacity = 1 - smooth(0, 0.06, p);
  }

  function frame(time) {
    raf = requestAnimationFrame(frame);
    prog += (target - prog) * 0.14;
    layout(prog, time);
  }
  const onScroll = () => {
    const r = hero.getBoundingClientRect();
    target = clamp01(-r.top / (r.height - innerHeight));
  };

  measure();
  onScroll();
  prog = target;
  layout(prog, performance.now());
  addEventListener('resize', () => { measure(); onScroll(); });
  addEventListener('scroll', onScroll, { passive: true });
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting && !running) { running = true; raf = requestAnimationFrame(frame); }
    if (!e.isIntersecting && running) { running = false; cancelAnimationFrame(raf); }
  }).observe(hero);

  // Kachel antippen → passende Karte im Lexikon öffnen
  star.addEventListener('click', (e) => {
    const a = e.target.closest('.petal');
    if (!a) return;
    e.preventDefault();
    openSweet(a.dataset.id);
  });
}

function openSweet(id) {
  const card = document.getElementById(`sweet-${id}`);
  if (!card) return;
  $('#sweetFilter .chip')?.click();
  card.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'center' });
  setTimeout(() => {
    card.classList.add('flipped');
    card.querySelector('.sweet__inner')?.setAttribute('aria-pressed', 'true');
  }, reducedMotion ? 0 : 650);
}

// ─── Lexikon ─────────────────────────────────────────────────
function renderSweets() {
  const grid = $('#sweetGrid');
  grid.innerHTML = SWEETS.map((s, i) => `
    <article class="sweet reveal" id="sweet-${s.id}" data-group="${s.group}" style="--d:${(i % 4) * 60}ms">
      <button class="sweet__inner" aria-label="${esc(s.name)} – Details anzeigen" aria-pressed="false">
        <div class="sweet__face sweet__front">
          <div class="sweet__art c-${COLORS[i % COLORS.length]} ${s.img ? 'has-img' : ''}">
            ${s.img ? `<img src="${s.img}" alt="${esc(s.name)}" loading="lazy">` : illustration(s.shape, i)}
            ${s.star ? '<span class="badge">Spezialität</span>' : ''}
          </div>
          <div class="sweet__meta">
            <span class="sweet__ar" lang="ar" dir="rtl">${s.ar}</span>
            <h3>${esc(s.name)}</h3>
            <p class="sweet__de">${esc(s.de)}</p>
          </div>
          <span class="sweet__flip" aria-hidden="true">↻</span>
        </div>
        <div class="sweet__face sweet__back">
          <span class="sweet__ar" lang="ar" dir="rtl">${s.ar}</span>
          <h3>${esc(s.name)}</h3>
          <p>${esc(s.text)}</p>
          <ul class="ingredients">${s.zutaten.map((z) => `<li>${esc(z)}</li>`).join('')}</ul>
          <p class="sweet__price"><small>Allergene: ${s.allergens}</small></p>
        </div>
      </button>
    </article>`).join('');

  grid.addEventListener('click', (e) => {
    const btn = e.target.closest('.sweet__inner');
    if (!btn) return;
    const on = btn.parentElement.classList.toggle('flipped');
    btn.setAttribute('aria-pressed', on);
  });

  const filter = $('#sweetFilter');
  filter.innerHTML = SWEET_GROUPS.map((g, i) => `<button class="chip ${i === 0 ? 'on' : ''}" role="tab" aria-selected="${i === 0}" data-g="${g.id}">${g.label}</button>`).join('');
  filter.addEventListener('click', (e) => {
    const b = e.target.closest('.chip');
    if (!b) return;
    $$('.chip', filter).forEach((c) => { c.classList.toggle('on', c === b); c.setAttribute('aria-selected', c === b); });
    $$('.sweet', grid).forEach((card) => {
      card.hidden = !(b.dataset.g === 'alle' || card.dataset.group === b.dataset.g);
    });
  });
}

function renderGlossary() {
  $('#glossary').innerHTML = GLOSSARY.map(([term, ar, def], i) => `
    <div class="gloss reveal" style="--d:${(i % 2) * 60}ms"><dt><span lang="ar" dir="rtl">${ar}</span>${esc(term)}</dt><dd>${esc(def)}</dd></div>`).join('');
}

function renderContact() {
  $('#hours').innerHTML = SHOP.hours.map(([d, h]) => `<div><dt>${esc(d)}</dt><dd>${esc(h)}</dd></div>`).join('');
  $('#mapsLink').href = SHOP.maps;
  $('#year').textContent = new Date().getFullYear();
}

renderSweets();
renderGlossary();
renderContact();
initNav();
initReveal();
initStar();
