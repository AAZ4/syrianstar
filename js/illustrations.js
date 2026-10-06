// 2D-Illustrationen der Süßigkeiten (flache SVGs im Mosaik-Stil)
export function illustration(shape, uid) {
  const g = `
    <defs>
      <linearGradient id="d${uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f3b45a"/><stop offset="1" stop-color="#b8611c"/></linearGradient>
      <linearGradient id="p${uid}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#b6d469"/><stop offset="1" stop-color="#5f8f2d"/></linearGradient>
      <linearGradient id="c${uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fffaf0"/><stop offset="1" stop-color="#e9dcc2"/></linearGradient>
      <radialGradient id="s${uid}" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#000" stop-opacity=".35"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
    </defs>
    <ellipse cx="100" cy="138" rx="72" ry="10" fill="url(#s${uid})"/>`;
  const D = `url(#d${uid})`, P = `url(#p${uid})`, C = `url(#c${uid})`;
  const crumbs = (cx, cy, rx, ry, n = 14) => Array.from({ length: n }, (_, i) => {
    const a = i * 2.4, r = Math.sqrt((i + 0.5) / n);
    return `<ellipse cx="${(cx + Math.cos(a) * rx * r).toFixed(1)}" cy="${(cy + Math.sin(a) * ry * r).toFixed(1)}" rx="3.2" ry="2.2" fill="${i % 4 ? P : '#8a5a5f'}" transform="rotate(${i * 37} ${(cx + Math.cos(a) * rx * r).toFixed(1)} ${(cy + Math.sin(a) * ry * r).toFixed(1)})"/>`;
  }).join('');
  const shapes = {
    diamond: `
      <path d="M100 40 L160 90 L100 140 L40 90Z" fill="#9c4f14"/>
      <path d="M100 32 L160 82 L100 132 L40 82Z" fill="${D}"/>
      ${[0, 1, 2, 3].map(i => `<path d="M${52 + i * 3} ${82 + i * 3} L100 ${44 + i * 3}" stroke="#ffd58a" stroke-opacity=".5" fill="none"/>`).join('')}
      <path d="M100 66 L120 82 L100 98 L80 82Z" fill="${P}"/>`,
    cup: `
      <ellipse cx="100" cy="112" rx="56" ry="20" fill="#9c4f14"/>
      <path d="M44 84 Q48 116 100 120 Q152 116 156 84Z" fill="${D}"/>
      <ellipse cx="100" cy="84" rx="56" ry="20" fill="#d98a35"/>
      <ellipse cx="100" cy="84" rx="44" ry="14" fill="${P}"/>${crumbs(100, 82, 38, 11, 18)}`,
    finger: [0, 1, 2].map(i => `
      <g transform="translate(0 ${i * 26})"><rect x="30" y="48" width="140" height="22" rx="11" fill="${D}"/>
      <path d="M40 52 h120" stroke="#ffd58a" stroke-opacity=".5"/><ellipse cx="164" cy="59" rx="8" ry="10" fill="${P}"/></g>`).join(''),
    nest: `
      <circle cx="100" cy="88" r="50" fill="#b8611c"/>
      ${Array.from({ length: 22 }, (_, i) => `<path d="M100 88 m${(Math.cos(i * 0.29 * 3) * 46).toFixed(1)} ${(Math.sin(i * 0.29 * 3) * 46).toFixed(1)} q-10 -14 6 -22" stroke="#f3b45a" stroke-width="4" fill="none" stroke-linecap="round"/>`).join('')}
      <circle cx="100" cy="88" r="28" fill="#7a3d10"/>${crumbs(100, 88, 24, 24, 16)}`,
    slab: `
      <rect x="34" y="52" width="132" height="76" rx="6" fill="${C}"/>
      <rect x="34" y="80" width="132" height="22" fill="${P}"/>
      ${Array.from({ length: 10 }, (_, i) => `<path d="M${40 + i * 13} 56 v20 M${40 + i * 13} 106 v18" stroke="#d8c8a4" stroke-width="2"/>`).join('')}`,
    square: `
      ${[0, 1, 2].map(r => [0, 1, 2].map(c => `<rect x="${44 + c * 38}" y="${44 + r * 30}" width="34" height="26" rx="3" fill="${D}"/><ellipse cx="${61 + c * 38}" cy="${57 + r * 30}" rx="6" ry="4" fill="${P}"/>`).join('')).join('')}`,
    triangle: `
      <path d="M40 124 L100 40 L160 124Z" fill="${D}"/>
      <path d="M62 112 L100 60 L138 112Z" fill="${C}"/>
      ${crumbs(100, 98, 18, 8, 8)}`,
    creamroll: `
      <rect x="34" y="62" width="132" height="56" rx="28" fill="${C}"/>
      <ellipse cx="160" cy="90" rx="16" ry="28" fill="#f4ead2" stroke="#e1d2b2"/>
      <ellipse cx="160" cy="90" rx="9" ry="17" fill="#fffef8"/>
      ${crumbs(92, 72, 52, 6, 16)}`,
    round: `
      <ellipse cx="100" cy="100" rx="78" ry="34" fill="#a0582a"/>
      <ellipse cx="100" cy="92" rx="72" ry="30" fill="#e9772a"/>
      ${Array.from({ length: 40 }, (_, i) => `<path d="M${40 + (i * 37) % 120} ${74 + (i * 13) % 36} q6 -3 12 1" stroke="#ffb550" stroke-width="2" fill="none"/>`).join('')}
      <path d="M100 92 L172 92 A72 30 0 0 1 152 112Z" fill="#f4ead2"/>
      ${crumbs(100, 90, 26, 11, 18)}`,
    cookie: `
      <ellipse cx="100" cy="92" rx="66" ry="40" fill="#c98a3c"/>
      <ellipse cx="100" cy="88" rx="66" ry="40" fill="#e9b264"/>
      ${Array.from({ length: 70 }, (_, i) => { const a = i * 2.39, r = Math.sqrt(i / 70) * 58; return `<ellipse cx="${(100 + Math.cos(a) * r).toFixed(1)}" cy="${(88 + Math.sin(a) * r * 0.6).toFixed(1)}" rx="2.6" ry="1.4" fill="#fff4dc" transform="rotate(${i * 23} ${(100 + Math.cos(a) * r).toFixed(1)} ${(88 + Math.sin(a) * r * 0.6).toFixed(1)})"/>`; }).join('')}`,
    maamoul: `
      <path d="M44 120 Q44 50 100 50 Q156 50 156 120Z" fill="${D}"/>
      ${[0, 1, 2, 3, 4].map(i => `<path d="M${60 + i * 20} 116 Q${66 + i * 17} 80 100 58" stroke="#8c4512" stroke-width="2.4" fill="none" opacity=".55"/>`).join('')}
      <rect x="40" y="116" width="120" height="8" rx="4" fill="#9c4f14"/>`,
    ring: `
      <ellipse cx="100" cy="96" rx="58" ry="32" fill="#efdcb5"/>
      <ellipse cx="100" cy="90" rx="58" ry="32" fill="${C}"/>
      <ellipse cx="100" cy="86" rx="12" ry="7" fill="${P}"/>`,
    roll: `
      <circle cx="100" cy="88" r="48" fill="${D}"/><circle cx="100" cy="88" r="34" fill="#7a3d10"/>${crumbs(100, 88, 30, 30, 20)}`,
  };
  return `<svg viewBox="0 0 200 160" aria-hidden="true">${g}${shapes[shape] || shapes.square}</svg>`;
}
