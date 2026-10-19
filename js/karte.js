import { ALLERGENS, MENU, CAKES, SWEETS, SHOP } from './data.js';
import { $, $$, esc, initNav, initReveal, waLink } from './common.js';
import { illustration } from './illustrations.js';

const sup = (a) => (a ? `<sup>${a}</sup>` : '');
const SUESSES = MENU.find((m) => m.tab === 'Süßes');
const GETRAENKE = MENU.find((m) => m.tab === 'Getränke');

// Welches Foto gehört zu welchem Eintrag der Karte (Varianten teilen sich das Bild der Grundsorte)
const PHOTO_OF = {
  'Gemischtes (Pistazie & Cashew)': 'baklava', 'Baklava (Cashew)': 'baklava', 'Cashew-Nest': 'nest',
  'Ballourieh (Cashew)': 'ballourieh', 'Shaabiyat (pro Stück)': 'shaabiyat', 'Warbat mit frischer Sahne': 'warbat',
  'Halawet el Jibn mit frischer Sahne': 'halawet', 'Warbat mit Pistazien': 'warbat', 'Knafeh Nabulsi (fein)': 'knafeh-nabulsi',
  'Knafeh bin Narein (grob)': 'knafeh-narein', 'Knafeh mit Nüssen': 'knafeh-narein', 'Ghraybeh mit Sahne': 'ghraybeh',
};
const sweetFor = (name) => SWEETS.find((s) => s.id === PHOTO_OF[name] || s.name === name);
// Cashew-Varianten bekommen eigene Fotos (sobald vorhanden) – bis dahin eine Zeichnung statt des Pistazienfotos
const OWN_PHOTO = {
  'Baklava (Cashew)': null, 'Cashew-Nest': null, 'Ballourieh (Cashew)': null, 'Warbat mit Pistazien': null,
};

// Ein Gericht als Karte mit Foto, Name, Kurzbeschreibung und Preis
const dish = ([name, price, allergens], i) => {
  const s = sweetFor(name);
  const img = name in OWN_PHOTO ? OWN_PHOTO[name] : s?.img;
  const media = img ? `<img src="${img}" alt="" loading="lazy" width="900" height="900">` : s ? illustration(s.shape, i) : '';
  return `
    <li class="dish reveal" style="--d:${(i % 3) * 60}ms">
      <span class="dish__img ${img ? '' : 'is-drawn c-saff'}">${media}</span>
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

const SLUG = { 'Mit Pistazien': 'pistazie', 'Mit Cashewkernen': 'cashew', 'Mit Sahne & Käse': 'sahne', 'Mit Grieß': 'griess', 'Orientalisches Trockengebäck': 'trocken' };
const LABEL = { pistazie: 'Pistazie', cashew: 'Cashew', sahne: 'Sahne & Käse', griess: 'Grieß', trocken: 'Trockengebäck' };

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
      <div class="cakes">
        <div class="cakes__media reveal">
          <img class="cakes__main" src="assets/img/torte.jpg" alt="Torte von Syrian Star" loading="lazy" width="1200" height="900">
          <figure class="cakes__slice">
            <img src="assets/img/kuchen.jpg" alt="Stück Kuchen" loading="lazy" width="1200" height="900">
            <figcaption>Stück Kuchen <b>${esc(CAKES.find((c) => c[0] === 'Stück Kuchen')?.[1] || '')}</b></figcaption>
          </figure>
        </div>
        <div class="cakes__text reveal">
          <p class="eyebrow">Kuchen &amp; Torten <span lang="ar" dir="rtl">كاتو</span></p>
          <h2 class="section__title">Für Ihren <em>besonderen Tag.</em></h2>
          <p class="cakes__lead">Für Geburtstage, Feiern und besondere Anlässe – in drei Größen. Sprechen Sie uns an, wir beraten Sie gern.</p>
          <div class="cake-sizes" role="radiogroup" aria-label="Größe der Torte">
            ${CAKES.filter((c) => c[0].includes('Torte')).reverse().map(([n, p], k) => `
              <button class="cake-size ${k === 1 ? 'on' : ''}" role="radio" aria-checked="${k === 1}" data-name="${esc(n.replace(/^\S+/, (w) => w.toLowerCase()))}" data-price="${esc(p)}">
                <svg viewBox="0 0 60 60" aria-hidden="true"><circle cx="30" cy="30" r="${14 + k * 7}"/><circle cx="30" cy="30" r="${10 + k * 7}"/></svg>
                <span>${esc(n.replace(' Torte', ''))}</span>
                <b>${esc(p)}</b>
              </button>`).join('')}
          </div>
          <ol class="how">
            <li><b>1</b>Größe wählen</li>
            <li><b>2</b>Wünsche per WhatsApp schicken</li>
            <li><b>3</b>Abholen in der Schustergasse 14</li>
          </ol>
          <div class="hero__actions">
            <a class="btn btn--gold" id="cakeOrder" target="_blank" rel="noopener">Torte per WhatsApp anfragen</a>
            <a class="btn btn--ghost" href="tel:+4917661717073">Anrufen</a>
          </div>
          <p class="cakes__note">Allergene: A, B, D</p>
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

// Torten: Größe wählen → passende WhatsApp-Nachricht
function initCakes() {
  const sizes = $$('.cake-size'), order = $('#cakeOrder');
  const pick = (b) => {
    sizes.forEach((x) => { x.classList.toggle('on', x === b); x.setAttribute('aria-checked', x === b); });
    order.href = waLink(SHOP.phone, `Hallo Syrian Star, ich möchte gerne eine ${b.dataset.name} (${b.dataset.price}) bestellen. Meine Wünsche: `);
    order.textContent = `Torte anfragen · ${b.dataset.price}`;
  };
  sizes.forEach((b) => b.addEventListener('click', () => pick(b)));
  pick(sizes.find((b) => b.classList.contains('on')) || sizes[0]);
}

render();
initCakes();
initNav();
initReveal();
initCatNav();
// Direktlink (z. B. karte.html#torten) nach dem Rendern anspringen; alter Link #suesses → erste Sorte
const target = location.hash === '#suesses' ? 'pistazie' : location.hash.slice(1);
if (target) document.getElementById(target)?.scrollIntoView();
