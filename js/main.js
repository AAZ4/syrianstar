import { SHOP, SWEETS, SWEET_GROUPS, GLOSSARY } from './data.js';
import { $, $$, esc, initNav, initReveal } from './common.js';
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
      image: 'assets/img/theke/kunefe-blech.jpg',      // wird durch Bild 2 (Stück auf Teller) ersetzt
      spin: null,                                       // später: { dir: 'assets/spin/kunefe/', count: 72, ext: 'webp' }
      prices: [['Knafeh Nabulsi (fein)', '24 € / kg'], ['Knafeh bin Narein (grob)', '18 € / kg']],
      order: 'Hallo Syrian Star, ich möchte gerne Künefe bestellen:',
    } },
  { id: 'baklava', model: 'baklava', glb: 'assets/models/baklava.glb', glbTray: 'silver', glbFit: { size: 0.27 }, glbGrid: [5, 4] },
  { id: 'mabrumeh', model: 'mabrumeh', glb: 'assets/models/mabrumeh.glb', glbFit: { rot: [-Math.PI / 2, 0, 0], size: 0.23 } },
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
  $('#pmPrices').innerHTML = (P.prices || []).map(([n, p]) => `<li><div><strong>${esc(n)}</strong></div><b>${esc(p)}</b></li>`).join('');
  $('#pmOrder').href = `${SHOP.whatsapp}?text=${encodeURIComponent(P.order || `Hallo Syrian Star, ich möchte ${t.name} bestellen.`)}`;
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
    media.setPointerCapture(e.pointerId);
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
    if (t.piece) { openPiece(t); return; }   // Blech: eigenes Stück-Fenster statt Info-Karte
    $('#vdAr').textContent = t.ar;
    $('#vdName').textContent = t.name;
    $('#vdDe').textContent = t.de;
    $('#vdText').textContent = t.text;
    $('#vdIng').innerHTML = t.zutaten.map((z) => `<li>${esc(z)}</li>`).join('');
    const img = $('#vdImg');
    img.hidden = !t.img;
    if (t.img) { img.src = t.img; img.alt = `${t.name} – Foto aus unserem Laden`; }
    $('#vdLex').onclick = (e) => { e.preventDefault(); api?.deselect(); openSweet(t.id); };
    detail.hidden = false;
    stage.classList.add('is-tasting');
  };
  showTray(0);

  $('#vPrev').addEventListener('click', () => api?.goTo(current - 1));
  $('#vNext').addEventListener('click', () => api?.goTo(current + 1));
  $('#vTaste').addEventListener('click', () => api?.selectFirstOf(current));
  $('#vClose').addEventListener('click', () => api?.deselect());
  addEventListener('keydown', (e) => {
    if (!api) return;
    if (e.key === 'Escape') api.deselect();
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
  };
  addEventListener('scroll', onScroll, { passive: true });
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
initPieceModal();
initVitrine();
