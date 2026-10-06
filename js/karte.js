import { ALLERGENS, MENU, BAKERY, CAKES } from './data.js';
import { $, $$, esc, initNav, initReveal } from './common.js';

const sup = (a) => (a ? `<sup>${a}</sup>` : '');

// Punktlisten-Blöcke (Süßes, Getränke)
const menuBlocks = (sections) => `
  <div class="menu">
    ${sections.map(s => `
      <div class="menu__block reveal">
        <h3>${esc(s.title)}${s.note ? `<small>${esc(s.note)}</small>` : ''}</h3>
        <ul>${s.items.map(([n, p, a]) => `<li><span>${esc(n)}${sup(a)}</span><i></i><b>${esc(p)}</b></li>`).join('')}</ul>
      </div>`).join('')}
  </div>`;

// Bild + Liste mit Beschreibung (Manakish, Fatayer, Pizza)
const bakeBlock = (b, flip) => `
  <article class="bake ${flip ? 'bake--flip' : ''}">
    <figure class="bake__media reveal">
      <img src="${b.img}" alt="${esc(b.title)}" loading="lazy" width="1200" height="900">
      <figcaption lang="ar" dir="rtl">${b.ar}</figcaption>
    </figure>
    <div class="bake__text reveal">
      <h2>${esc(b.title)}</h2>
      <p class="section__lead">${esc(b.lead)}</p>
      <ul class="price-list">
        ${b.items.map(([n, d, p, a]) => `<li><div><strong>${esc(n)}${sup(a)}</strong><span>${esc(d)}</span></div><b>${esc(p)}</b></li>`).join('')}
      </ul>
    </div>
  </article>`;

const CATEGORIES = [
  {
    id: 'suesses', label: 'Süßes',
    html: () => `
      <header class="section__head reveal">
        <p class="eyebrow"><span lang="ar" dir="rtl">حلويات شرقية</span></p>
        <h2 class="section__title">Orientalische <em>Süßigkeiten.</em></h2>
        <p class="section__lead">Frisch nach Gewicht – mit Aleppo-Pistazien, Cashew, Sahne oder als Trockengebäck. Gern stellen wir Ihnen eine gemischte Schale zusammen.</p>
      </header>
      <div class="collage reveal">
        <img src="assets/img/mabrumeh.jpg" alt="Mabrumeh mit Pistazien" loading="lazy">
        <img src="assets/img/halawet-el-jibn.jpg" alt="Halawet el Jibn" loading="lazy">
        <img src="assets/img/barazek.jpg" alt="Barazek" loading="lazy">
      </div>
      ${menuBlocks(MENU[0].sections)}`,
  },
  ...BAKERY.map((b, i) => ({
    id: b.title.toLowerCase(), label: b.title,
    html: () => bakeBlock(b, i % 2 === 1),
  })),
  {
    id: 'torten', label: 'Torten',
    html: () => `
      <div class="torten__grid">
        <div class="torten__media reveal">
          <img src="assets/img/torte.jpg" alt="Torte von Syrian Star" loading="lazy" width="1200" height="900">
          <img src="assets/img/kuchen.jpg" alt="Kuchenstück" loading="lazy" width="1200" height="900">
        </div>
        <div class="torten__text reveal">
          <p class="eyebrow">Kuchen &amp; Torten</p>
          <h2 class="section__title">Für Ihren <em>besonderen Tag.</em></h2>
          <p>Unsere Torten gibt es in verschiedenen Größen – ideal für Geburtstage, Feiern und besondere Anlässe. Sprechen Sie uns an, wir beraten Sie gern.</p>
          <ul class="price-list">
            ${CAKES.map(([n, p]) => `<li><div><strong>${esc(n)}${sup('A,B,D')}</strong></div><b>${esc(p)}</b></li>`).join('')}
          </ul>
          <div class="hero__actions">
            <a class="btn btn--gold" href="https://wa.me/4917661717073?text=Hallo%20Syrian%20Star%2C%20ich%20m%C3%B6chte%20eine%20Torte%20bestellen." target="_blank" rel="noopener">Torte per WhatsApp anfragen</a>
            <a class="btn btn--ghost" href="tel:+4917661717073">Anrufen</a>
          </div>
        </div>
      </div>`,
  },
  {
    id: 'getraenke', label: 'Getränke',
    html: () => `
      <header class="section__head reveal">
        <p class="eyebrow"><span lang="ar" dir="rtl">مشروبات</span></p>
        <h2 class="section__title">Dazu ein <em>Kaffee?</em></h2>
      </header>
      ${menuBlocks(MENU[4].sections)}`,
  },
];

function render() {
  $('#menuSections').innerHTML = CATEGORIES.map(c => `
    <section class="section cat" id="${c.id}" aria-label="${esc(c.label)}">
      <div class="wrap">${c.html()}</div>
    </section>`).join('');
  $('#catNav .cat-nav__inner').innerHTML = CATEGORIES.map(c => `<a class="tab" href="#${c.id}">${esc(c.label)}</a>`).join('');
  $('#allergenList').innerHTML = Object.entries(ALLERGENS).map(([k, v]) => `<li><b>${k}</b> ${esc(v)}</li>`).join('');
  $('#year').textContent = new Date().getFullYear();
}

// Aktive Kategorie in der Leiste markieren
function initCatNav() {
  const links = $$('#catNav .tab');
  const io = new IntersectionObserver((entries) => entries.forEach(e => {
    if (!e.isIntersecting) return;
    links.forEach(l => {
      const on = l.hash === `#${e.target.id}`;
      l.classList.toggle('on', on);
      if (on) l.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
    });
  }), { rootMargin: '-45% 0px -50% 0px' });
  $$('.cat').forEach(s => io.observe(s));
}

render();
initNav();
initReveal();
initCatNav();
// Direktlink (z. B. karte.html#pizza) nach dem Rendern anspringen
if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView();
