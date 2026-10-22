import { SHOP, SWEETS, SWEET_GROUPS, GLOSSARY } from './data.js';
import { $, $$, esc, initNav, initReveal, waLink } from './common.js';
import { illustration } from './illustrations.js';

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const COLORS = ['saff', 'pist', 'rose', 'cream'];

// ─── Hero: Die Vitrine (3D-Theke) ────────────────────────────
// Reihenfolge der Tabletts von links nach rechts.
// glb = echtes 3D-Modell (Higgsfield), sonst nachgebautes Modell (model)
const TRAYS = [
  // Ganzes Blech in der Theke; Antippen öffnet das Stück-Fenster (piece)
  { id: 'knafeh-nabulsi', name: 'Künefe', model: 'blech', blech: 'assets/img/theke/kunefe-blech.jpg',
    piece: {
      image: 'assets/img/teller/knafeh-nabulsi.jpg',   // Standbild (das Drehvideo hat geruckelt)
      spin: null,                                     // Drehansicht weiterhin möglich: { dir, count, ext }
      prices: [['Knafeh Nabulsi (fein)', '24 € / kg'], ['Knafeh bin Narein (grob)', '18 € / kg']],
      priceShort: 'fein 24 € / kg · grob 18 € / kg',
      order: 'Hallo Syrian Star, ich möchte gerne Künefe bestellen:',
    } },
  { id: 'baklava', model: 'photoFlat', photo: { src: 'assets/img/theke/baklava-tablett.jpg', crop: [75, 56, 1192, 800] } },
  { id: 'mabrumeh', model: 'photoPyramid', photo: { src: 'assets/img/theke/mabrumeh-tablett.jpg', crop: [72, 52, 1192, 802], grid: [11, 8], levels: [[9, 6], [7, 4], [5, 2]] } },
  { id: 'halawet', model: 'halawet', glb: 'assets/models/halawet.glb', glbTray: 'silver', glbFit: { size: 0.36 }, glbGrid: [4, 6], glbSpin: false },
  { id: 'nest', model: 'nest' },
  { id: 'barazek', model: 'barazek', glb: 'assets/models/barazek.glb', glbFit: { size: 0.22, squash: 0.32 } },
  { id: 'maamoul', model: 'maamoul', glb: 'assets/models/maamoul.glb', glbTray: 'silver', glbFit: { size: 0.21 } },
  { id: 'ballourieh', model: 'ballourieh' },
].map((t) => ({ ...SWEETS.find((s) => s.id === t.id), ...t }));

// ─── Stück-Fenster: einzelnes Stück groß, per Ziehen drehbar (Bildfolge aus einem 360°-Video) ───
const pieceModal = { frames: [], idx: 0, raf: 0 };

function openPiece(t) {
  const m = $('#pieceModal'), img = $('#pmImg'), media = $('#pmMedia'), hint = $('#pmHint');
  const P = t.piece;
  $('#pmAr').textContent = t.ar;
  $('#pmName').textContent = t.name;
  $('#pmDe').textContent = t.de;
  $('#pmText').textContent = t.text;
  $('#pmIng').innerHTML = (t.zutaten || []).map((z) => `<span>${esc(z)}</span>`).join('');
  $('#pmAll').textContent = t.allergens ? `Allergene: ${t.allergens} – Erklärung in der Speisekarte` : '';
  $('#pmPrices').innerHTML = (P.prices || []).map(([n, p]) => `<li><div><strong>${esc(n)}</strong></div><b>${esc(p)}</b></li>`).join('');
  $('#pmOrder').href = waLink(SHOP.phone, P.order || `Hallo Syrian Star, ich möchte ${t.name} bestellen.`);
  img.alt = `${t.name} – einzelnes Stück`;

  cancelAnimationFrame(pieceModal.raf);
  pieceModal.frames = [];
  if (P.spin) {
    // Einzelbilder des 360°-Videos; Ziehen dreht, sonst langsame Eigendrehung
    pieceModal.frames = Array.from({ length: P.spin.count }, (_, k) => `${P.spin.dir}${String(k).padStart(3, '0')}.${P.spin.ext || 'webp'}`);
    pieceModal.frames.forEach((src) => { const pre = new Image(); pre.src = src; });
    pieceModal.idx = 0;
    img.src = pieceModal.frames[0];
    hint.hidden = false;
    let last = performance.now();
    const spin = (now) => {
      pieceModal.raf = requestAnimationFrame(spin);
      if (media.classList.contains('is-dragging') || reducedMotion) { last = now; return; }
      if (now - last > 90) { last = now; showFrame(pieceModal.idx + 1); }
    };
    pieceModal.raf = requestAnimationFrame(spin);
  } else {
    img.src = P.image;
    hint.hidden = true;
  }
  m.hidden = false;
  document.body.style.overflow = 'hidden';
  $('#pmClose').focus();
}

function showFrame(i) {
  const n = pieceModal.frames.length;
  if (!n) return;
  pieceModal.idx = ((i % n) + n) % n;
  $('#pmImg').src = pieceModal.frames[pieceModal.idx];
}

function closePiece() {
  cancelAnimationFrame(pieceModal.raf);
  $('#pieceModal').hidden = true;
  document.body.style.overflow = '';
}

function initPieceModal() {
  const m = $('#pieceModal'), media = $('#pmMedia');
  $('#pmClose').addEventListener('click', closePiece);
  m.addEventListener('click', (e) => { if (e.target === m) closePiece(); });
  addEventListener('keydown', (e) => {
    if (m.hidden) return;
    if (e.key === 'Escape') closePiece();
    if (e.key === 'ArrowRight') showFrame(pieceModal.idx + 1);
    if (e.key === 'ArrowLeft') showFrame(pieceModal.idx - 1);
  });
  let drag = null;
  media.addEventListener('pointerdown', (e) => {
    if (!pieceModal.frames.length) return;
    drag = { x: e.clientX, start: pieceModal.idx };
    media.classList.add('is-dragging');
    try { media.setPointerCapture(e.pointerId); } catch { /* z. B. bei simulierten Eingaben */ }
  });
  media.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const perFrame = (media.clientWidth / pieceModal.frames.length) * 1.2;   // einmal quer ≈ eine Umdrehung
    showFrame(drag.start - Math.round((e.clientX - drag.x) / perFrame));
  });
  const end = () => { drag = null; media.classList.remove('is-dragging'); };
  media.addEventListener('pointerup', end);
  media.addEventListener('pointercancel', end);
}

async function initVitrine() {
  const section = $('#vitrine'), stage = $('#vitrineStage'), canvas = $('#vitrineCanvas');
  const intro = $('#vIntro'), caption = $('#vCaption'), detail = $('#vDetail');
  let api = null, current = 0;

  const showTray = (i) => {
    if (i !== 0) caption.classList.add('swiped');   // Wisch-Hinweis nach dem ersten Wechsel ausblenden
    current = i;
    detail.hidden = true; stage.classList.remove('is-tasting');
    const t = TRAYS[i];
    $('#vCount').textContent = `${String(i + 1).padStart(2, '0')} / ${String(TRAYS.length).padStart(2, '0')}`;
    $('#vAr').textContent = t.ar;
    $('#vName').textContent = t.name;
    $('#vDe').textContent = t.de;
    $('#vPrev').disabled = i === 0;
    $('#vNext').disabled = i === TRAYS.length - 1;
  };
  const showDetail = (i) => {
    if (i == null) { detail.hidden = true; stage.classList.remove('is-tasting'); return; }
    const t = TRAYS[i];
    // Für alle Gerichte dieselbe kleine Karte (ohne Scrollen); Details öffnen das große Fenster
    $('#vdAr').textContent = t.ar;
    $('#vdName').textContent = t.name;
    $('#vdDe').textContent = t.de;
    $('#vdText').textContent = t.text;
    $('#vdPrice').textContent = t.piece?.priceShort || t.price;
    const img = $('#vdImg');
    img.src = t.piece?.image || t.img || '';
    img.alt = t.name;
    img.hidden = !img.getAttribute('src');
    $('#vdOrder').href = waLink(SHOP.phone, t.piece?.order || `Hallo Syrian Star, ich möchte gerne ${t.name} bestellen.`);
    $('#vdMore').onclick = () => { showDetail(null); t.piece ? openPiece(t) : openSweet(t.id); };
    detail.hidden = false;
    stage.classList.add('is-tasting');
  };
  showTray(0);

  $('#vPrev').addEventListener('click', () => api?.goTo(current - 1));
  $('#vNext').addEventListener('click', () => api?.goTo(current + 1));
  $('#vTaste').addEventListener('click', () => api?.selectFirstOf(current));
  $('#vClose').addEventListener('click', () => showDetail(null));
  addEventListener('keydown', (e) => {
    if (!api) return;
    if (e.key === 'Escape') showDetail(null);
    const r = section.getBoundingClientRect();
    const inView = r.top < innerHeight * 0.5 && r.bottom > innerHeight * 0.5;
    if (inView && api.zoomed && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
      e.preventDefault();
      api.goTo(current + (e.key === 'ArrowRight' ? 1 : -1));
    }
  });

  try {
    const { initVitrine: init } = await import('./vitrine-scene.js');
    api = await init({ canvas, trays: TRAYS, reducedMotion, onTray: showTray, onSelect: showDetail });
    // Handy: Theke beginnt immer unterhalb des Begrüßungstexts – egal wie hoch oder schmal der Bildschirm ist
    const fitIntro = () => {
      const r = intro.getBoundingClientRect(), s = stage.getBoundingClientRect();
      api.setTopInset(r.bottom - s.top + 14);
    };
    fitIntro();
    addEventListener('resize', fitIntro);
    document.fonts?.ready.then(fitIntro);
  } catch (err) {
    console.warn('3D nicht verfügbar:', err);
    stage.classList.add('no-webgl');
    const fb = $('#vFallback');
    fb.hidden = false;
    fb.innerHTML = TRAYS.map((t) => `<a href="#sweet-${t.id}">${t.img ? `<img src="${t.img}" alt="" loading="lazy">` : ''}<b>${esc(t.name)}</b><span lang="ar" dir="rtl">${t.ar}</span></a>`).join('');
    return;
  }

  // Senkrechtes Scrollen fährt in die Theke hinein (ZOOM) und rastet dort am Gericht ein (HOLD).
  // In der Theke wird seitwärts gewischt; erst deutliches Weiterscrollen verlässt die Theke.
  const ZOOM = 0.65, HOLD_FROM = 0.15, HOLD_TO = 1.2;   // in Bildschirmhöhen ab Sektionsanfang
  const onScroll = () => {
    const r = section.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, -r.top / (innerHeight * ZOOM)));
    api.setZoom(p);
    intro.classList.toggle('is-hidden', p > 0.3);
    caption.classList.toggle('is-shown', p > 0.6);
    // Hinweis „weiter nach unten“, solange man an der Theke steht
    const off = scrollY - section.offsetTop, hold = innerHeight * ZOOM;
    down.classList.toggle('is-shown', p > 0.95 && off < hold + innerHeight * 0.25);
  };
  const down = $('#vDown');
  addEventListener('scroll', onScroll, { passive: true });

  // Bremse: Wer mit Schwung über die Theke hinweg scrollt (egal wie stark), bleibt an der Theke stehen.
  // Erst eine neue Scrollbewegung führt weiter. Gilt nur für Scrollen mit Finger, Maus oder Tastatur –
  // ein Klick auf einen Menüpunkt springt weiterhin direkt zum Ziel.
  let lastY = scrollY, lastInput = 0, locked = false;
  const markInput = () => { lastInput = performance.now(); };
  ['wheel', 'touchmove', 'keydown'].forEach((ev) => addEventListener(ev, markInput, { passive: true }));
  const lockAt = (y) => {
    locked = true;
    const root = document.documentElement;
    root.style.overflow = document.body.style.overflow = 'hidden';   // stoppt den Schwung (auch am iPhone)
    scrollTo({ top: y, behavior: 'instant' });
    setTimeout(() => {
      root.style.overflow = document.body.style.overflow = '';
      locked = false; lastY = scrollY;
    }, 650);
  };
  addEventListener('scroll', () => {
    if (locked) return;
    const y = scrollY, hold = section.offsetTop + innerHeight * ZOOM;
    const crossed = (lastY < hold - 4 && y > hold + 4) || (lastY > hold + 4 && y < hold - 4);
    if (crossed && performance.now() - lastInput < 900 && $('#pieceModal').hidden) lockAt(hold);
    else lastY = y;
  }, { passive: true });
  addEventListener('resize', onScroll);
  onScroll();

  // Einrasten: kommt das Scrollen im Bereich der Theke zur Ruhe, wird sie genau angefahren
  let touching = false, snapTimer = 0;
  const snap = () => {
    if (touching) return;
    const offset = scrollY - section.offsetTop;
    const hold = innerHeight * ZOOM;
    if (offset > innerHeight * HOLD_FROM && offset < innerHeight * HOLD_TO && Math.abs(offset - hold) > 2) {
      scrollTo({ top: section.offsetTop + hold, behavior: reducedMotion ? 'auto' : 'smooth' });
    }
  };
  const later = () => { clearTimeout(snapTimer); snapTimer = setTimeout(snap, 140); };
  if ('onscrollend' in window) addEventListener('scrollend', later);
  else addEventListener('scroll', later, { passive: true });
  addEventListener('touchstart', () => { touching = true; clearTimeout(snapTimer); }, { passive: true });
  addEventListener('touchend', () => { touching = false; if (!('onscrollend' in window)) later(); }, { passive: true });
  new IntersectionObserver(([e]) => (e.isIntersecting ? api.start() : api.stop())).observe(section);
}

const pricesOf = (s) => s.price.split(' · ').map((part, k) => {
  const m = part.match(/^(.*?)\s*(\d[\d,]*\s*€.*)$/);
  return [k === 0 || !m?.[1] ? s.name : `${s.name} – ${m[1]}`, m ? m[2] : part];
});

function openSweet(id) {
  const s = SWEETS.find((x) => x.id === id);
  if (!s) return;
  openPiece({ ...s, piece: { image: s.img, prices: pricesOf(s) } });
}

// ─── Lexikon ─────────────────────────────────────────────────
function renderSweets() {
  const grid = $('#sweetGrid');
  $$('[data-count-sweets]').forEach((el) => { el.textContent = SWEETS.length; });
  grid.innerHTML = SWEETS.map((s, i) => `
    <article class="sweet reveal" id="sweet-${s.id}" data-group="${s.group}" style="--d:${(i % 3) * 60}ms">
      <div class="sweet__inner" role="button" tabindex="0" aria-pressed="false" aria-label="${esc(s.name)} – umdrehen">
        <div class="sweet__face sweet__front">
          <span class="sweet__art c-${COLORS[i % COLORS.length]}">
            ${s.img ? `<img src="${s.img}" alt="" loading="lazy">` : illustration(s.shape, i)}
            ${s.star ? '<span class="badge">Spezialität</span>' : ''}
          </span>
          <span class="sweet__meta">
            <span class="sweet__ar" lang="ar" dir="rtl">${s.ar}</span>
            <span class="sweet__name">${esc(s.name)}</span>
            <span class="sweet__de">${esc(s.de)}</span>
          </span>
          <span class="sweet__flip" aria-hidden="true">↻</span>
        </div>
        <div class="sweet__face sweet__back">
          <span class="sweet__ar" lang="ar" dir="rtl">${s.ar}</span>
          <span class="sweet__name">${esc(s.name)}</span>
          <p>${esc(s.text)}</p>
          <span class="ingredients">${s.zutaten.map((z) => `<span>${esc(z)}</span>`).join('')}</span>
          <span class="sweet__foot">
            <small>Allergene: ${s.allergens}</small>
            <button class="sweet__order" data-id="${s.id}">Preise &amp; bestellen</button>
          </span>
        </div>
      </div>
    </article>`).join('');

  const flip = (inner) => {
    const on = inner.parentElement.classList.toggle('flipped');
    inner.setAttribute('aria-pressed', on);
  };
  grid.addEventListener('click', (e) => {
    const order = e.target.closest('.sweet__order');
    if (order) { e.stopPropagation(); openSweet(order.dataset.id); return; }
    const inner = e.target.closest('.sweet__inner');
    if (inner) flip(inner);
  });
  grid.addEventListener('keydown', (e) => {
    const inner = e.target.closest('.sweet__inner');
    if (inner && e.target === inner && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); flip(inner); }
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
    grid.scrollTo({ left: 0 });
    updateBar();
  });

  // Handy: Karten liegen nebeneinander und werden gewischt – Leiste zeigt, wo man ist
  const visible = () => $$('.sweet', grid).filter((c) => !c.hidden);
  const current = () => {
    const cards = visible();
    const mid = grid.scrollLeft + grid.clientWidth / 2;
    let k = 0, best = Infinity;   // Karte, deren Mitte der Bildschirmmitte am nächsten ist
    cards.forEach((c, j) => { const d = Math.abs(c.offsetLeft + c.clientWidth / 2 - mid); if (d < best) { best = d; k = j; } });
    return { cards, k };
  };
  function updateBar() {
    const { cards, k } = current();
    $('#sweetCount').textContent = `${k + 1} / ${cards.length}`;
    $('#sweetProgress').style.width = `${((k + 1) / cards.length) * 100}%`;
    $('#sweetPrev').disabled = k === 0;
    $('#sweetNext').disabled = k === cards.length - 1;
  }
  const go = (d) => {
    const { cards, k } = current();
    const c = cards[Math.max(0, Math.min(cards.length - 1, k + d))];
    grid.scrollTo({ left: c.offsetLeft - (grid.clientWidth - c.clientWidth) / 2, behavior: reducedMotion ? 'auto' : 'smooth' });
  };
  $('#sweetPrev').addEventListener('click', () => go(-1));
  $('#sweetNext').addEventListener('click', () => go(1));
  grid.addEventListener('scroll', updateBar, { passive: true });
  updateBar();
}

// ─── Künefe: Punkte im Foto und Liste zeigen nacheinander die Schichten ───
function initAnatomy() {
  const root = $('#anatomy');
  if (!root) return;
  const dots = $$('.hotspot', root), layers = $$('.layer', root);
  let i = 0, timer = 0, auto = !reducedMotion;
  const show = (n) => {
    i = n;
    dots.forEach((d, k) => d.classList.toggle('on', k === n));
    layers.forEach((l, k) => l.classList.toggle('on', k === n));
  };
  const next = () => show((i + 1) % layers.length);
  const pick = (e) => {
    const el = e.target.closest('[data-i]');
    if (!el) return;
    auto = false; clearInterval(timer);   // wer selbst tippt, steuert ab jetzt selbst
    show(+el.dataset.i);
  };
  root.addEventListener('click', pick);
  layers.forEach((l) => l.addEventListener('mouseenter', pick));
  new IntersectionObserver(([e]) => {
    clearInterval(timer);
    if (e.isIntersecting && auto) timer = setInterval(next, 3800);
  }, { threshold: 0.4 }).observe(root);
  show(0);
}

// ─── Schale zusammenstellen → WhatsApp-Nachricht ───
function initSchale() {
  const picker = $('#picker'), plate = $('#boxPlate'), order = $('#boxOrder');
  const chosen = new Set();
  let size = '500 g';
  const sorts = SWEETS.filter((s) => s.price.includes('/ kg'));
  picker.innerHTML = sorts.map((s) => `
    <button class="pick" aria-pressed="false" data-id="${s.id}">
      <span class="pick__img">${s.img ? `<img src="${s.img}" alt="" loading="lazy">` : ''}</span>
      <span class="pick__name">${esc(s.name)}</span>
    </button>`).join('');

  const update = () => {
    const list = sorts.filter((s) => chosen.has(s.id));
    plate.innerHTML = list.length
      ? list.map((s) => `<span class="box__item">${s.img ? `<img src="${s.img}" alt="">` : ''}${esc(s.name)}</span>`).join('')
      : '<span class="box__empty">Noch leer – tippen Sie auf Ihre Lieblingssorten.</span>';
    const text = `Hallo Syrian Star, ich möchte gerne eine gemischte Schale (${size}) vorbestellen mit: ${list.map((s) => s.name).join(', ')}.`;
    order.href = list.length ? waLink(SHOP.phone, text) : '';
    order.setAttribute('aria-disabled', !list.length);
    order.textContent = list.length ? `${size} mit ${list.length} ${list.length === 1 ? 'Sorte' : 'Sorten'} vorbestellen` : 'Per WhatsApp vorbestellen';
  };
  picker.addEventListener('click', (e) => {
    const b = e.target.closest('.pick');
    if (!b) return;
    const on = !chosen.has(b.dataset.id);
    on ? chosen.add(b.dataset.id) : chosen.delete(b.dataset.id);
    b.setAttribute('aria-pressed', on);
    update();
  });
  $('#sizes').addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    size = b.dataset.size;
    $$('#sizes button').forEach((x) => { x.classList.toggle('on', x === b); x.setAttribute('aria-checked', x === b); });
    update();
  });
  order.addEventListener('click', (e) => { if (!chosen.size) e.preventDefault(); });
  update();
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
initAnatomy();
initSchale();
renderGlossary();
renderContact();
initNav();
initReveal();
initPieceModal();
initVitrine();
