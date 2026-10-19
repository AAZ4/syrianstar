import { ALLERGENS, MENU, CAKES, SWEETS } from './data.js';
import { $, $$, esc, initNav, initReveal } from './common.js';

const sup = (a) => (a ? `<sup>${a}</sup>` : '');
const SUESSES = MENU.find((m) => m.tab === 'Süßes');
const GETRAENKE = MENU.find((m) => m.tab === 'Getränke');

// Welches Foto gehört zu welchem Eintrag der Karte (Varianten teilen sich das Bild der Grundsorte)
const PHOTO_OF = {
  'Gemischtes (Pistazie & Cashew)': 'baklava', 'Baklava (Cashew)': 'baklava', 'Cashew-Nest': 'nest',
  'Ballourieh (Cashew)': 'ballourieh', 'Shaabiyat (pro Stück)': 'shaabiyat', 'Warbat mit frischer Sahne': 'warbat',
  'Halawet el Jibn mit frischer Sahne': 'halawet', 'Knafeh Nabulsi (fein)': 'knafeh-nabulsi',
  'Knafeh bin Narein (grob)': 'knafeh-narein', 'Knafeh mit Nüssen': 'knafeh-narein', 'Ghraybeh mit Sahne': 'ghraybeh',
};
const sweetFor = (name) => SWEETS.find((s) => s.id === PHOTO_OF[name] || s.name === name);

// Ein Gericht als Karte mit Foto, Name, Kurzbeschreibung und Preis
const dish = ([name, price, allergens], i) => {
  const s = sweetFor(name);
  return `
    <li class="dish reveal" style="--d:${(i % 3) * 60}ms">
      <span class="dish__img">${s?.img ? `<img src="${s.img}" alt="" loading="lazy" width="900" height="900">` : ''}</span>
      <span class="dish__body">
        ${s ? `<span class="dish__ar" lang="ar" dir="rtl">${s.ar}</span>` : ''}
        <strong>${esc(name)}${sup(allergens)}</strong>
        ${s ? `<span class="dish__de">${esc(s.de)}</span>` : ''}
      </span>
      <b class="dish__price">${esc(price)}</b>
    </li>`;
};

// Punktlisten-Blöcke (Getränke)
const menuBlocks = (sections) => `
  <div class="menu">
    ${sections.map(s => `
      <div class="menu__block reveal">
        <h3>${esc(s.title)}${s.note ? `<small>${esc(s.note)}</small>` : ''}</h3>
        <ul>${s.items.map(([n, p, a]) => `<li><span>${esc(n)}${sup(a)}</span><i></i><b>${esc(p)}</b></li>`).join('')}</ul>
      </div>`).join('')}
  </div>`;

const SLUG = { 'Mit Pistazien': 'pistazie', 'Mit Cashewkernen': 'cashew', 'Mit Sahne & Käse': 'sahne', 'Orientalisches Trockengebäck': 'trocken' };
const LABEL = { pistazie: 'Pistazie', cashew: 'Cashew', sahne: 'Sahne & Käse', trocken: 'Trockengebäck' };

const CATEGORIES = [
  ...SUESSES.sections.map((sec) => ({
    id: SLUG[sec.title], label: LABEL[SLUG[sec.title]],
    html: () => `
      <header class="dishes__head reveal">
        <h2>${esc(sec.title)}</h2>
        ${sec.note ? `<small>Preise ${esc(sec.note)}</small>` : ''}
      </header>
      <ul class="dishes">${sec.items.map(dish).join('')}</ul>`,
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
      ${menuBlocks(GETRAENKE.sections)}`,
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
// Direktlink (z. B. karte.html#torten) nach dem Rendern anspringen; alter Link #suesses → erste Sorte
const target = location.hash === '#suesses' ? 'pistazie' : location.hash.slice(1);
if (target) document.getElementById(target)?.scrollIntoView();
