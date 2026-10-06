// ─────────────────────────────────────────────────────────────
//  Die Vitrine – 3D-Theke aus Marmor, Messing und Glas.
//  Auf jedem Tablett liegt eine Sorte. Scrollen fährt die Theke
//  entlang, Antippen hebt ein Stück heraus.
// ─────────────────────────────────────────────────────────────
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const TAU = Math.PI * 2;
const rand = (a, b) => a + Math.random() * (b - a);
const clamp01 = (v) => Math.min(1, Math.max(0, v));
const smooth = (a, b, v) => { const t = clamp01((v - a) / (b - a)); return t * t * (3 - 2 * t); };
const lerp = (a, b, t) => a + (b - a) * t;

export const SPACING = 2.4;          // Abstand der Tabletts
export const INTRO = 0.08;           // Scroll-Anteil der Begrüßung

// ── Texturen ─────────────────────────────────────────────────
function canvasTex(size, draw, { srgb = true, repeat = 1 } = {}) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  draw(c.getContext('2d'), size);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeat, repeat);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

const marbleTex = () => canvasTex(1024, (g, s) => {
  g.fillStyle = '#f3efe8'; g.fillRect(0, 0, s, s);
  const vein = (blur, alpha, w) => {
    g.filter = `blur(${blur}px)`;
    g.strokeStyle = `rgba(118,108,98,${alpha})`; g.lineWidth = w;
    g.beginPath();
    let x = rand(0, s), y = rand(0, s);
    g.moveTo(x, y);
    for (let k = 0; k < 7; k++) {
      const nx = x + rand(-260, 260), ny = y + rand(-160, 160);
      g.bezierCurveTo(x + rand(-90, 90), y + rand(-90, 90), nx + rand(-90, 90), ny + rand(-90, 90), nx, ny);
      x = nx; y = ny;
    }
    g.stroke();
  };
  for (let i = 0; i < 8; i++) vein(6, rand(0.05, 0.1), rand(8, 20));
  for (let i = 0; i < 18; i++) vein(0.6, rand(0.12, 0.3), rand(0.6, 2.2));
  g.filter = 'none';
}, { repeat: 1 });

const woodTex = () => canvasTex(512, (g, s) => {
  g.fillStyle = '#4a2f1c'; g.fillRect(0, 0, s, s);
  for (let i = 0; i < 260; i++) {
    const x = rand(0, s);
    g.strokeStyle = Math.random() > 0.5 ? `rgba(30,16,8,${rand(0.1, 0.35)})` : `rgba(120,80,48,${rand(0.08, 0.25)})`;
    g.lineWidth = rand(0.5, 3);
    g.beginPath(); g.moveTo(x, 0);
    g.bezierCurveTo(x + rand(-12, 12), s * 0.33, x + rand(-12, 12), s * 0.66, x + rand(-6, 6), s);
    g.stroke();
  }
}, { repeat: 1 });

const fiberTex = (base, hues, n = 4500) => canvasTex(512, (g, s) => {
  g.fillStyle = base; g.fillRect(0, 0, s, s);
  for (let i = 0; i < n; i++) {
    const x = rand(0, s), y = rand(0, s), a = rand(0, TAU), L = rand(8, 26);
    g.strokeStyle = hues[(Math.random() * hues.length) | 0];
    g.globalAlpha = rand(0.5, 1); g.lineWidth = rand(0.8, 2); g.lineCap = 'round';
    g.beginPath(); g.moveTo(x, y);
    g.quadraticCurveTo(x + Math.cos(a + 1) * L * 0.5, y + Math.sin(a + 1) * L * 0.5, x + Math.cos(a) * L, y + Math.sin(a) * L);
    g.stroke();
  }
  g.globalAlpha = 1;
});

const speckleTex = (base, dots, n, rMin, rMax) => canvasTex(512, (g, s) => {
  g.fillStyle = base; g.fillRect(0, 0, s, s);
  for (let i = 0; i < n; i++) {
    g.fillStyle = dots[(Math.random() * dots.length) | 0];
    g.beginPath();
    g.ellipse(rand(0, s), rand(0, s), rand(rMin, rMax), rand(rMin, rMax) * 0.6, rand(0, TAU), 0, TAU);
    g.fill();
  }
});

// Preisschild-artiges Namensschild
function labelTex(name, ar) {
  return canvasTex(512, (g, s) => {
    g.fillStyle = '#fffaf0'; g.fillRect(0, 0, s, s);
    g.strokeStyle = '#b08a3e'; g.lineWidth = 10; g.strokeRect(14, 14, s - 28, s - 28);
    g.lineWidth = 2; g.strokeRect(32, 32, s - 64, s - 64);
    g.fillStyle = '#2b2118'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = '600 92px "Cormorant Garamond", Georgia, serif';
    g.fillText(name, s / 2, s * 0.42, s - 90);
    g.fillStyle = '#8a6a2c';
    g.font = '500 70px "Reem Kufi", sans-serif';
    g.fillText(ar, s / 2, s * 0.7, s - 90);
  });
}

// ── Szene ────────────────────────────────────────────────────
export async function initVitrine({ canvas, trays, onTray, onSelect, onHover, reducedMotion = false }) {
  const N = trays.length;
  const isSmall = () => window.innerWidth < 760;
  const lowPower = isSmall();

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, lowPower ? 1.6 : 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.92;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.03).texture;
  scene.environmentIntensity = 0.45;

  const camera = new THREE.PerspectiveCamera(34, 1, 0.05, 80);

  // Licht
  scene.add(new THREE.HemisphereLight(0xfff6e8, 0x8a6a4a, 0.55));
  const key = new THREE.DirectionalLight(0xfff1dc, 2.4);
  key.castShadow = true;
  key.shadow.mapSize.set(lowPower ? 1024 : 2048, lowPower ? 1024 : 2048);
  Object.assign(key.shadow.camera, { left: -3.2, right: 3.2, top: 2.5, bottom: -2.5, near: 0.5, far: 20 });
  key.shadow.bias = -0.0004;
  key.shadow.normalBias = 0.015;
  key.shadow.radius = 5;
  scene.add(key, key.target);
  const inner = new THREE.PointLight(0xffd9a0, 5, 4.5, 1.5);
  scene.add(inner);

  // ── Theke ──
  const x0 = -1.5, x1 = (N - 1) * SPACING + 1.5, L = x1 - x0, xc = (x0 + x1) / 2;
  const marbleMap = marbleTex();
  marbleMap.repeat.set(L / 4, 0.5);
  const marble = new THREE.MeshPhysicalMaterial({ map: marbleMap, roughness: 0.22, clearcoat: 0.7, clearcoatRoughness: 0.12 });
  const woodMap = woodTex();
  woodMap.repeat.set(L / 2.2, 1);
  const wood = new THREE.MeshStandardMaterial({ map: woodMap, roughness: 0.55 });
  const brass = new THREE.MeshStandardMaterial({ color: 0xc89b4a, metalness: 1, roughness: 0.28 });
  const silver = new THREE.MeshStandardMaterial({ color: 0xd8d8d6, metalness: 1, roughness: 0.22 });

  const add = (geo, mat, x, y, z, { cast = false, receive = true } = {}) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.castShadow = cast; m.receiveShadow = receive;
    scene.add(m);
    return m;
  };
  add(new THREE.BoxGeometry(L, 0.06, 2.0), marble, xc, -0.03, 0);                       // Marmorplatte
  add(new THREE.BoxGeometry(L, 1.55, 1.85), wood, xc, -0.06 - 0.775, -0.02);              // Holzsockel
  add(new THREE.BoxGeometry(L + 0.04, 0.035, 0.04), brass, xc, -0.075, 0.93);             // Messingkante oben
  add(new THREE.BoxGeometry(L + 0.04, 0.035, 0.04), brass, xc, -1.55, 0.93);              // Messingkante unten
  for (let x = x0 + 1.2; x < x1; x += SPACING) add(new THREE.BoxGeometry(0.03, 1.45, 0.03), brass, x, -0.82, 0.935);
  add(new THREE.BoxGeometry(L, 0.02, 0.06), marble, xc, -0.01, 1.0);                      // vordere Marmorkante

  // Gebogene Frontscheibe
  const R = 1.08, gcy = 0.0, gcz = -0.08;
  const glassGeo = new THREE.PlaneGeometry(L, 1, 1, 28);
  const gp = glassGeo.attributes.position;
  for (let i = 0; i < gp.count; i++) {
    const a = (gp.getY(i) + 0.5) * (Math.PI / 2);
    gp.setXYZ(i, gp.getX(i) + xc, gcy + Math.sin(a) * R, gcz + Math.cos(a) * R);
  }
  glassGeo.computeVertexNormals();
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff, roughness: 0.04, metalness: 0, transparent: true, opacity: 0.12,
    clearcoat: 1, clearcoatRoughness: 0.03, side: THREE.DoubleSide, depthWrite: false, envMapIntensity: 1.6,
  });
  const glass = new THREE.Mesh(glassGeo, glassMat);
  glass.renderOrder = 2;
  scene.add(glass);
  const topGlass = add(new THREE.PlaneGeometry(L, 0.95), glassMat, xc, R, gcz - 0.47, { receive: false });
  topGlass.rotation.x = -Math.PI / 2;
  topGlass.renderOrder = 2;
  // Messingrahmen der Scheibe
  const arcPts = Array.from({ length: 24 }, (_, i) => { const a = (i / 23) * (Math.PI / 2); return new THREE.Vector3(0, gcy + Math.sin(a) * R, gcz + Math.cos(a) * R); });
  const arcGeo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(arcPts), 32, 0.016, 8, false);
  for (let x = x0; x <= x1 + 0.01; x += SPACING * 2) {
    const m = new THREE.Mesh(arcGeo, brass); m.position.x = Math.min(x, x1); scene.add(m);
  }
  const rail = new THREE.CylinderGeometry(0.018, 0.018, L, 12);
  rail.rotateZ(Math.PI / 2);
  add(rail, brass, xc, R, gcz);
  add(rail, brass, xc, 0.01, gcz + R);
  add(rail, brass, xc, R, gcz - 0.95);
  // Lichtleiste
  add(new THREE.BoxGeometry(L, 0.015, 0.04), new THREE.MeshStandardMaterial({ color: 0xfff3dc, emissive: 0xffe2b0, emissiveIntensity: 2.2 }), xc, R - 0.02, gcz - 0.75);

  // ── Materialien der Süßigkeiten ──
  const M = {
    golden: new THREE.MeshPhysicalMaterial({ color: 0xc98a32, roughness: 0.45, clearcoat: 0.8, clearcoatRoughness: 0.2 }),
    goldenDark: new THREE.MeshPhysicalMaterial({ color: 0x9c5a1c, roughness: 0.42, clearcoat: 0.9, clearcoatRoughness: 0.15 }),
    fiber: new THREE.MeshPhysicalMaterial({ map: fiberTex('#b0681e', ['#d98e30', '#9c5614', '#e8a548', '#7f430e']), roughness: 0.5, clearcoat: 0.7, clearcoatRoughness: 0.25 }),
    fiberOrange: new THREE.MeshPhysicalMaterial({ map: fiberTex('#c4520e', ['#ec7418', '#d45e10', '#f8903a', '#a8420c', '#ffa850']), roughness: 0.6, clearcoat: 0.3, clearcoatRoughness: 0.35 }),
    fiberPale: new THREE.MeshPhysicalMaterial({ map: fiberTex('#efe2c4', ['#fff6e2', '#e3d1a8', '#f6ead0', '#d8c294'], 3000), roughness: 0.4, clearcoat: 0.8, clearcoatRoughness: 0.15 }),
    pist: new THREE.MeshStandardMaterial({ map: speckleTex('#7fae36', ['#9cc64c', '#6b9a2c', '#b6d469', '#5e8a28', '#7a4f52'], 1400, 3, 9), roughness: 0.6 }),
    cream: new THREE.MeshPhysicalMaterial({ map: speckleTex('#f7efe0', ['#8fbf3f', '#7aa836'], 90, 2, 5), roughness: 0.38, clearcoat: 0.5, sheen: 0.6, sheenColor: new THREE.Color(0xffffff) }),
    creamFill: new THREE.MeshPhysicalMaterial({ color: 0xfbf3df, roughness: 0.5, sheen: 0.4 }),
    cheese: new THREE.MeshPhysicalMaterial({ color: 0xf3e6c4, roughness: 0.4, clearcoat: 0.4 }),
    sesame: new THREE.MeshStandardMaterial({ map: speckleTex('#cf9a4c', ['#f6e3b8', '#ead19a', '#fff2d2'], 2600, 2, 5), roughness: 0.55 }),
    sugar: new THREE.MeshStandardMaterial({ map: speckleTex('#dcae6c', ['rgba(255,255,255,.75)', 'rgba(255,250,240,.6)'], 3500, 1, 4), roughness: 0.75 }),
  };
  const pistBits = new THREE.DodecahedronGeometry(0.018, 0);

  // ── Tabletts ──
  const pieceRoots = [];          // alle anklickbaren Stücke
  const trayGroups = [];

  function makeTray(kind, mat = silver) {
    const g = new THREE.Group();
    if (kind === 'round') {
      const prof = [[0, 0], [0.86, 0], [0.9, 0.01], [0.93, 0.06], [0.91, 0.065], [0.87, 0.02], [0, 0.02]].map(([x, y]) => new THREE.Vector2(x, y));
      const m = new THREE.Mesh(new THREE.LatheGeometry(prof, 64), mat);
      m.receiveShadow = true; m.castShadow = true; g.add(m);
    } else {
      const w = 1.85, d = 1.2;
      const base = new THREE.Mesh(new THREE.BoxGeometry(w, 0.02, d), mat);
      base.position.y = 0.01; base.receiveShadow = true; g.add(base);
      for (const [sx, sz, lx, lz] of [[0, d / 2, w, 0.02], [0, -d / 2, w, 0.02], [w / 2, 0, 0.02, d], [-w / 2, 0, 0.02, d]]) {
        const rim = new THREE.Mesh(new THREE.BoxGeometry(lx, 0.06, lz), mat);
        rim.position.set(sx, 0.03, sz); rim.castShadow = true; g.add(rim);
      }
    }
    return g;
  }

  // Stück registrieren
  const piece = (tray, obj, x, z, ry = 0) => {
    obj.position.set(x, 0.022, z);
    obj.rotation.y = ry;
    obj.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; o.userData.root = obj; } });
    obj.userData = { home: obj.position.clone(), homeRot: obj.rotation.clone(), tray: tray.userData.index, lift: 0 };
    tray.add(obj);
    pieceRoots.push(obj);
    return obj;
  };
  const grid = (cols, rows, w, d, cb) => {
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      cb((c - (cols - 1) / 2) * (w / cols), (r - (rows - 1) / 2) * (d / rows), r, c);
    }
  };
  const sprinkle = (group, count, radius, y) => {
    const m = new THREE.InstancedMesh(pistBits, M.pist, count);
    const o = new THREE.Object3D();
    for (let i = 0; i < count; i++) {
      const a = rand(0, TAU), d = Math.sqrt(Math.random()) * radius;
      o.position.set(Math.cos(a) * d, y, Math.sin(a) * d);
      o.rotation.set(rand(0, TAU), rand(0, TAU), rand(0, TAU));
      o.scale.setScalar(rand(0.6, 1.3));
      o.updateMatrix(); m.setMatrixAt(i, o.matrix);
    }
    m.castShadow = true;
    group.add(m);
  };

  // Sorte → Geometrie
  const BUILDERS = {
    kunefe(tray) {
      const t = makeTray('round', brass); tray.add(t);
      const body = new THREE.Group();
      const k = new THREE.Mesh(new THREE.CylinderGeometry(0.84, 0.84, 0.09, 64), [M.fiberOrange, M.fiberOrange, M.fiberOrange]);
      k.position.y = 0.045; body.add(k);
      sprinkle(body, lowPower ? 120 : 220, 0.35, 0.095);
      piece(tray, body, 0, 0);
      // ein herausgeschnittenes, quadratisches Stück auf einem Teller davor
      const sq = new THREE.Group();
      const layers = [[M.fiberOrange, 0.035], [M.cheese, 0.03], [M.fiberOrange, 0.03]];
      let y = 0;
      for (const [mat, h] of layers) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.3, h, 0.3), mat); b.position.y = y + h / 2; y += h; sq.add(b); }
      sprinkle(sq, 30, 0.1, y + 0.005);
      const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.22, 0.02, 40), new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.15, clearcoat: 1 }));
      plate.position.set(0.75, 0.01, 0.48); plate.receiveShadow = true; tray.add(plate);
      piece(tray, sq, 0.75, 0.48, 0.4);
    },
    baklava(tray) {
      tray.add(makeTray('rect'));
      const s = new THREE.Shape(); const dx = 0.13, dz = 0.1;
      s.moveTo(0, dz); s.lineTo(dx, 0); s.lineTo(0, -dz); s.lineTo(-dx, 0); s.lineTo(0, dz);
      const geo = new THREE.ExtrudeGeometry(s, { depth: 0.07, bevelEnabled: true, bevelThickness: 0.008, bevelSize: 0.008, bevelSegments: 2 });
      geo.rotateX(-Math.PI / 2);
      const dot = new THREE.SphereGeometry(0.035, 12, 8); dot.scale(1, 0.4, 1);
      grid(6, 5, 1.6, 1.0, (x, z, r, c) => {
        const g = new THREE.Group();
        g.add(new THREE.Mesh(geo, [M.goldenDark, M.golden]));
        const d = new THREE.Mesh(dot, M.pist); d.position.y = 0.085; g.add(d);
        piece(tray, g, x + (r % 2 ? dx * 0.95 : 0), z);
      });
    },
    mabrumeh(tray) {
      tray.add(makeTray('rect', brass));
      const geo = new THREE.CylinderGeometry(0.11, 0.11, 0.11, 28);
      grid(6, 4, 1.62, 1.0, (x, z) => {
        const g = new THREE.Group();
        const m = new THREE.Mesh(geo, [M.fiber, M.pist, M.fiber]); m.position.y = 0.055; g.add(m);
        piece(tray, g, x + rand(-0.01, 0.01), z + rand(-0.01, 0.01), rand(0, TAU));
      });
    },
    halawet(tray) {
      tray.add(makeTray('rect'));
      const geo = new THREE.CapsuleGeometry(0.075, 0.26, 6, 20); geo.rotateZ(Math.PI / 2);
      const cap = new THREE.CircleGeometry(0.06, 20);
      grid(4, 5, 1.6, 1.05, (x, z) => {
        const g = new THREE.Group();
        const m = new THREE.Mesh(geo, M.cream); m.position.y = 0.075; g.add(m);
        for (const sx of [-1, 1]) { const c = new THREE.Mesh(cap, M.creamFill); c.position.set(sx * 0.205, 0.075, 0); c.rotation.y = sx * Math.PI / 2; g.add(c); }
        piece(tray, g, x, z, 0.12);
      });
    },
    barazek(tray) {
      tray.add(makeTray('rect', brass));
      const geo = new THREE.CylinderGeometry(0.12, 0.12, 0.022, 32);
      for (let r = 0; r < 3; r++) for (let c = 0; c < 6; c++) {
        const g = new THREE.Group();
        const m = new THREE.Mesh(geo, [M.golden, M.sesame, M.golden]); m.position.y = 0.011; g.add(m);
        const o = piece(tray, g, -0.72 + c * 0.24 + rand(-0.01, 0.01), -0.32 + r * 0.33, 0);
        o.rotation.x = -0.32; o.position.y = 0.05; o.userData.home.y = 0.05; o.userData.homeRot.x = -0.32;
      }
    },
    maamoul(tray) {
      tray.add(makeTray('rect'));
      const geo = new THREE.SphereGeometry(0.11, 36, 18, 0, TAU, 0, Math.PI / 2);
      const p = geo.attributes.position;
      for (let i = 0; i < p.count; i++) {
        const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
        const a = Math.atan2(z, x), f = 1 + 0.07 * Math.cos(a * 14) * (y / 0.11) * (1 - y / 0.14);
        p.setXYZ(i, x * f, y * 0.9, z * f);
      }
      geo.computeVertexNormals();
      grid(6, 4, 1.62, 1.0, (x, z) => {
        const g = new THREE.Group(); g.add(new THREE.Mesh(geo, M.sugar));
        piece(tray, g, x, z, rand(0, TAU));
      });
    },
    nest(tray) {
      tray.add(makeTray('rect', brass));
      const ring = new THREE.TorusGeometry(0.09, 0.042, 12, 28); ring.rotateX(Math.PI / 2);
      const fill = new THREE.SphereGeometry(0.075, 18, 10); fill.scale(1, 0.55, 1);
      grid(6, 4, 1.62, 1.0, (x, z) => {
        const g = new THREE.Group();
        const r = new THREE.Mesh(ring, M.fiber); r.position.y = 0.042; g.add(r);
        const f = new THREE.Mesh(fill, M.pist); f.position.y = 0.06; g.add(f);
        piece(tray, g, x, z, rand(0, TAU));
      });
    },
    ballourieh(tray) {
      tray.add(makeTray('rect'));
      grid(4, 4, 1.62, 1.0, (x, z) => {
        const g = new THREE.Group();
        for (const [mat, y, h] of [[M.fiberPale, 0, 0.04], [M.pist, 0.04, 0.035], [M.fiberPale, 0.075, 0.04]]) {
          const b = new THREE.Mesh(new THREE.BoxGeometry(0.32, h, 0.19), mat); b.position.y = y + h / 2; g.add(b);
        }
        piece(tray, g, x, z, rand(-0.04, 0.04));
      });
    },
  };

  await document.fonts?.ready;
  trays.forEach((t, i) => {
    const tray = new THREE.Group();
    tray.userData.index = i;
    tray.position.set(i * SPACING, 0, -0.05);
    (BUILDERS[t.model] || BUILDERS.baklava)(tray);
    scene.add(tray);
    trayGroups.push(tray);
    // Namensschild
    const card = new THREE.Mesh(new THREE.PlaneGeometry(0.32, 0.32), new THREE.MeshStandardMaterial({ map: labelTex(t.name, t.ar), roughness: 0.6 }));
    card.position.set(i * SPACING - 0.78, 0.13, 0.82);
    card.rotation.x = -0.38;
    card.castShadow = true;
    scene.add(card);
    const stand = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.1, 0.02), brass);
    stand.position.set(i * SPACING - 0.78, 0.05, 0.79);
    scene.add(stand);
  });

  // ── Zustand ──
  let width = 1, height = 1, target = 0, prog = 0, running = false, raf = 0;
  let selected = null, hovered = null, current = -1;
  const pointer = { x: 0, y: 0, sx: 0, sy: 0 };
  const clock = new THREE.Clock();
  const tmp = new THREE.Vector3(), dir = new THREE.Vector3();

  function resize() {
    const r = canvas.parentElement.getBoundingClientRect();
    width = Math.max(1, r.width); height = Math.max(1, r.height);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  const fOf = (p) => clamp01((p - INTRO) / (1 - INTRO)) * (N - 1);

  function frame() {
    if (!running) return;
    raf = requestAnimationFrame(frame);
    const dt = Math.min(clock.getDelta(), 0.05), t = clock.elapsedTime;
    prog += (target - prog) * Math.min(1, dt * 6);

    // Kamera fährt die Theke entlang und verweilt an jedem Tablett
    const f = fOf(prog), i = Math.floor(f), frac = f - i;
    const fx = Math.min(N - 1, i + smooth(0.2, 0.8, frac));
    const idx = Math.round(f);
    if (idx !== current) { current = idx; onTray?.(idx); if (selected && selected.userData.tray !== idx) deselect(); }

    const intro = 1 - smooth(0, INTRO, prog);
    const small = isSmall();
    const aspect = width / height;
    const back = small ? Math.max(1, 1.0 / aspect) : Math.max(1, 1.45 / aspect);
    pointer.sx += (pointer.x - pointer.sx) * 0.05;
    pointer.sy += (pointer.y - pointer.sy) * 0.05;
    const cx = fx * SPACING + pointer.sx * 0.15 - intro * 1.2;
    camera.position.set(
      cx,
      lerp(1.75, 1.9, intro) * (small ? 1.1 : 1) - pointer.sy * 0.08,
      lerp(3.5, 5.6, intro) * back,
    );
    tmp.set(cx + intro * (small ? 1.4 : -0.6), lerp(0.0, 0.15, intro), -0.05);
    camera.lookAt(tmp);
    camera.setViewOffset(width, height, 0, small ? height * lerp(0.13, -0.08, intro) : -height * 0.16 * intro, width, height);

    key.position.set(cx + 1.5, 6, 4.5);
    key.target.position.set(cx, 0, 0);
    inner.position.set(cx, 0.85, 0.1);

    // Hover-Effekt
    for (const p of pieceRoots) {
      if (p === selected) continue;
      const want = p === hovered ? 1 : 0;
      p.userData.lift += (want - p.userData.lift) * 0.2;
      if (p.userData.lift > 0.001 || p.position.distanceToSquared(p.userData.home) > 1e-6 || Math.abs(p.scale.x - 1) > 1e-3) {
        p.position.lerp(p.userData.home, 0.2);
        p.position.y = p.userData.home.y + p.userData.lift * 0.05;
        p.quaternion.slerp(new THREE.Quaternion().setFromEuler(p.userData.homeRot), 0.2);
        p.scale.lerp(tmp.set(1, 1, 1), 0.2);
      }
    }

    // ausgewähltes Stück schwebt vor die Kamera und dreht sich
    if (selected) {
      camera.getWorldDirection(dir);
      tmp.copy(camera.position).addScaledVector(dir, small ? 1.15 : 1.25);
      tmp.y -= small ? 0.02 : 0.05;
      if (!small) tmp.x -= 0.28;
      selected.parent.worldToLocal(tmp);
      selected.position.lerp(tmp, 0.12);
      selected.rotation.y += dt * (reducedMotion ? 0.2 : 0.9);
      selected.rotation.x += (0.35 - selected.rotation.x) * 0.1;
      const s = pieceScale(selected);
      selected.scale.lerp(tmp.set(s, s, s), 0.12);
    }

    renderer.render(scene, camera);
  }

  // Zielgröße eines Stücks beim Vorzeigen (große Künefe kleiner skalieren)
  const box = new THREE.Box3();
  function pieceScale(p) {
    if (p.userData.scaleCache) return p.userData.scaleCache;
    const sc = p.scale.clone(); p.scale.set(1, 1, 1);
    box.setFromObject(p); p.scale.copy(sc);
    const size = box.getSize(new THREE.Vector3()).length();
    return (p.userData.scaleCache = Math.min(3, 0.55 / size));
  }

  function select(p) {
    if (selected === p) return;
    if (selected) deselect();
    selected = p;
    onSelect?.(p.userData.tray);
  }
  function deselect() {
    if (!selected) return;
    selected = null;
    onSelect?.(null);
  }

  // ── Zeiger / Raycasting ──
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  const hit = (e) => {
    const r = canvas.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const hits = ray.intersectObjects(pieceRoots, true);
    return hits.length ? hits[0].object.userData.root : null;
  };
  let down = null;
  canvas.addEventListener('pointerdown', (e) => { down = { x: e.clientX, y: e.clientY }; });
  canvas.addEventListener('pointerup', (e) => {
    if (!down || Math.hypot(e.clientX - down.x, e.clientY - down.y) > 8) return;
    const p = hit(e);
    if (p) select(p); else deselect();
  });
  canvas.addEventListener('pointermove', (e) => {
    pointer.x = (e.clientX / innerWidth) * 2 - 1;
    pointer.y = (e.clientY / innerHeight) * 2 - 1;
    if (e.pointerType !== 'mouse') return;
    const p = hit(e);
    hovered = p && p !== selected ? p : null;
    canvas.style.cursor = hovered ? 'pointer' : '';
    onHover?.(hovered ? hovered.userData.tray : null);
  });
  canvas.addEventListener('pointerleave', () => { hovered = null; });

  resize();
  addEventListener('resize', resize);

  return {
    setProgress(v) { target = clamp01(v); },
    progressFor(i) { return INTRO + (1 - INTRO) * (i / (N - 1)); },
    selectFirstOf(i) { const p = pieceRoots.find((q) => q.userData.tray === i); if (p) select(p); },
    deselect,
    start() { if (running) return; running = true; clock.getDelta(); frame(); },
    stop() { running = false; cancelAnimationFrame(raf); },
    resize,
  };
}
