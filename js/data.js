// ─────────────────────────────────────────────────────────────
//  Syrian Star – Inhalte
//  Alle Texte, Preise und Kontaktdaten zentral hier pflegen.
//  Preise laut Speisekarte (assets/speisekarte.pdf).
// ─────────────────────────────────────────────────────────────

export const SHOP = {
  name: 'Syrian Star',
  nameAr: 'النجمة السورية',
  street: 'Schustergasse 14',
  city: '64283 Darmstadt',
  phone: '+49 176 61717073',
  phoneHref: 'tel:+4917661717073',
  whatsapp: 'https://wa.me/4917661717073',
  phone: '4917661717073',
  email: 'syrianstar07@gmail.com',
  maps: 'https://www.google.com/maps/search/?api=1&query=Syrian+Star+Schustergasse+14+64283+Darmstadt',
  social: {
    instagram: 'https://www.instagram.com/syrian_star7/',
    tiktok: 'https://www.tiktok.com/@syrian__star',
    facebook: 'https://www.facebook.com/profile.php?id=61580677063065',
  },
  // TODO: Öffnungszeiten eintragen (waren online nicht auffindbar)
  hours: [
    ['Montag – Samstag', 'bitte ergänzen'],
    ['Sonntag', 'bitte ergänzen'],
  ],
};

// Allergene laut Karte
export const ALLERGENS = {
  A: 'Glutenhaltiges Getreide (Weizen, Grieß, Mehl)',
  B: 'Milch (inkl. Laktose, Butter, Käse, Joghurt, Sahne)',
  C: 'Schalenfrüchte (Pistazien, Mandeln, Cashew, Haselnüsse, Walnüsse)',
  D: 'Eier',
  E: 'Sesam',
  G: 'Fisch',
};

// ─── Orientalische Süßigkeiten – Lexikon ───
// shape = Illustration (siehe main.js), img = optionales Foto
export const SWEETS = [
  {
    id: 'mabrumeh', ar: 'مبرومة', name: 'Mabrumeh', group: 'pistazie',
    de: 'Die „Gedrehte“',
    text: 'Feine Kadayif-Teigfäden werden um ganze Pistazien gewickelt, in Butterschmalz goldbraun gebacken, mit Sirup getränkt und in Scheiben geschnitten.',
    zutaten: ['Kadayif-Teig', 'ganze Pistazien', 'Butterschmalz', 'Zuckersirup'],
    price: '43 € / kg', allergens: 'A,B,C', shape: 'roll', img: 'assets/img/teller/mabrumeh.jpg',
  },
  {
    id: 'baklava', ar: 'بقلاوة', name: 'Baklava', group: 'pistazie',
    de: 'Der Klassiker in Rauten',
    text: 'Dutzende hauchdünne Filo-Teigblätter, jede mit Butter bestrichen, geschichtet mit gemahlenen Pistazien und nach dem Backen mit Sirup übergossen.',
    zutaten: ['Filo-Teig', 'Pistazien', 'Butter', 'Zuckersirup'],
    price: '40 € / kg · Cashew 36 €', allergens: 'A,B,C', shape: 'diamond', img: 'assets/img/teller/baklava.jpg',
  },
  {
    id: 'kolwshkor', ar: 'كُل واشكُر', name: 'Kol w Shkor', group: 'pistazie',
    de: '„Iss und sag Danke“',
    text: 'Kleine, knusprige Teig-Schälchen aus Filo, randvoll gefüllt mit Pistazien – so gut, dass man sich nach jedem Bissen bedankt.',
    zutaten: ['Filo-Teig', 'Pistazien', 'Butter', 'Zuckersirup'],
    price: '40 € / kg', allergens: 'A,B,C', shape: 'cup', img: 'assets/img/teller/kolwshkor.jpg',
  },
  {
    id: 'roellchen', ar: 'أصابع', name: 'Pistazienröllchen', group: 'pistazie',
    de: 'Asabe – „Finger“',
    text: 'Fingerdünne Röllchen aus Filo-Teig mit Pistazienfüllung, knusprig gebacken und leicht gesirupt.',
    zutaten: ['Filo-Teig', 'Pistazien', 'Butter', 'Zuckersirup'],
    price: '40 € / kg', allergens: 'A,B,C', shape: 'finger', img: 'assets/img/teller/roellchen.jpg',
  },
  {
    id: 'nest', ar: 'عش البلبل', name: 'Pistaziennest', group: 'pistazie',
    de: 'Ush al-Bulbul – „Nachtigallennest“',
    text: 'Gedrehte Teigfäden werden zu kleinen Nestern geformt und mit ganzen, leuchtend grünen Pistazien gefüllt.',
    zutaten: ['Kadayif-Teig', 'ganze Pistazien', 'Butterschmalz', 'Zuckersirup'],
    price: '40 € / kg · Cashew-Nest 36 €', allergens: 'A,B,C', shape: 'nest', img: 'assets/img/teller/nest.jpg',
  },
  {
    id: 'ballourieh', ar: 'بلورية', name: 'Ballourieh', group: 'pistazie',
    de: 'Die „Kristallene“',
    text: 'Helle, kaum gebräunte Kadayif-Schichten, fest gepresst um eine dicke Pistazienschicht – weiß glänzend wie Kristall.',
    zutaten: ['heller Kadayif-Teig', 'Pistazien', 'Butterschmalz', 'Zuckersirup'],
    price: '40 € / kg · Cashew 36 €', allergens: 'A,B,C', shape: 'slab', img: 'assets/img/teller/ballourieh.jpg',
  },
  {
    id: 'harisseh', ar: 'هريسة', name: 'Harisseh', group: 'griess',
    de: 'Saftiger Grießkuchen',
    text: 'Grieß, Joghurt und Butter werden im Blech gebacken, in Rauten geschnitten und mit Sirup getränkt – außen karamellig, innen saftig.',
    zutaten: ['Grieß', 'Joghurt', 'Butter', 'Pistazien', 'Zuckersirup'],
    price: '18 € / kg', allergens: 'A,B,C', shape: 'square', img: 'assets/img/teller/harisseh.jpg',
  },
  {
    id: 'warbat', ar: 'وربات', name: 'Warbat', group: 'sahne',
    de: 'Filo-Dreiecke',
    text: 'Dreiecke aus Filo-Teig, gefüllt mit Ashta (Sahnecreme) oder Pistazien, gebacken und mit Sirup beträufelt.',
    zutaten: ['Filo-Teig', 'Ashta-Creme oder Pistazien', 'Butter', 'Zuckersirup'],
    price: '18 € / kg · mit frischer Sahne 24 € · Pistazie 40 €', allergens: 'A,B,C', shape: 'triangle', img: 'assets/img/teller/warbat.jpg',
  },
  {
    id: 'shaabiyat', ar: 'شعيبيات', name: 'Shaabiyat', group: 'sahne',
    de: 'Blätterteig-Taschen mit Creme',
    text: 'Große, blättrige Dreiecke aus Filo-Teig mit cremiger Ashta-Füllung, bestreut mit Pistazien. Ein Stück reicht – fast.',
    zutaten: ['Filo-Teig', 'Ashta-Creme', 'Butter', 'Pistazien', 'Sirup'],
    price: '3 € / Stück', allergens: 'A,B,C', shape: 'triangle', img: 'assets/img/teller/shaabiyat.jpg',
  },
  {
    id: 'halawet', ar: 'حلاوة الجبن', name: 'Halawet el Jibn', group: 'sahne',
    de: 'Die „Käsesüße“ aus Hama & Homs',
    text: 'Ein seidiger Teig aus Grieß und mildem Käse wird hauchdünn ausgerollt, mit Sahnecreme gefüllt, aufgerollt und mit Rosenwasser-Sirup und Pistazien serviert.',
    zutaten: ['Grieß', 'milder Käse', 'Ashta-Creme', 'Rosenwasser', 'Pistazien'],
    price: '18 € / kg · mit frischer Sahne 24 €', allergens: 'A,B,C', shape: 'creamroll', img: 'assets/img/teller/halawet.jpg',
  },
  {
    id: 'madlouka', ar: 'مدلوقة', name: 'Madlouka', group: 'sahne',
    de: 'Die „Ausgegossene“',
    text: 'Feiner, in Butter gerösteter Kadayif-Teig, geschichtet mit dicker Ashta-Creme und üppig mit Pistazien bestreut.',
    zutaten: ['feiner Kadayif', 'Ashta-Creme', 'Butterschmalz', 'Pistazien', 'Sirup'],
    price: '24 € / kg', allergens: 'A,B,C', shape: 'square', img: 'assets/img/teller/madlouka.jpg',
  },
  {
    id: 'namoura', ar: 'نمورة', name: 'Namoura', group: 'griess',
    de: 'Grießschnitte in Sirup',
    text: 'Goldgelb gebackener Grießkuchen, mit Sirup getränkt und mit Mandel oder Pistazie gekrönt – weich, süß, leicht körnig.',
    zutaten: ['Grieß', 'Joghurt', 'Butter', 'Nüsse', 'Zuckersirup'],
    price: '18 € / kg', allergens: 'A,B,C', shape: 'square', img: 'assets/img/teller/namoura.jpg',
  },
  {
    id: 'maamoulmad', ar: 'معمول مد', name: 'Maamoul Mad', group: 'griess',
    de: 'Maamoul vom Blech',
    text: 'Die Blech-Variante des Maamoul: zwei Schichten buttriger Grießteig mit Füllung, gebacken und in Stücke geschnitten.',
    zutaten: ['Grieß', 'Butter', 'Füllung (Creme / Nüsse)', 'Puderzucker'],
    price: '18 € / kg', allergens: 'A,B,C', shape: 'square', img: 'assets/img/teller/maamoulmad.jpg',
  },
  {
    id: 'knafeh-nabulsi', ar: 'كنافة نابلسية', name: 'Knafeh Nabulsi', group: 'sahne',
    de: 'Künefe nach Art von Nablus – fein',
    text: 'Eine dünne Kruste aus fein gemahlenem, orange gebackenem Teig (Na‘ameh) auf einer dicken Schicht weißem Nabulsi-Käse. Im runden Blech gebacken, gestürzt, warm mit Sirup übergossen und mit Pistazien bestreut – der Käse zieht lange Fäden.',
    zutaten: ['feiner Grieß-Teig (Na‘ameh)', 'Nabulsi-/Akkawi-Käse', 'Butterschmalz', 'Sirup', 'Pistazien'],
    price: '24 € / kg', allergens: 'A,B,C', shape: 'round', star: true, img: 'assets/img/teller/knafeh-nabulsi.jpg',
  },
  {
    id: 'knafeh-narein', ar: 'كنافة بين نارين', name: 'Knafeh bin Narein', group: 'sahne',
    de: '„Zwischen zwei Feuern“ – grob',
    text: 'Grobe Kadayif-Fäden oben und unten, dazwischen Käse oder Creme. Gebacken mit Hitze von oben und unten – daher der Name.',
    zutaten: ['grober Kadayif', 'Käse / Ashta', 'Butterschmalz', 'Sirup', 'Pistazien'],
    price: '18 € / kg · mit Nüssen 39 €', allergens: 'A,B,C', shape: 'round', star: true, img: 'assets/img/teller/knafeh-narein.jpg',
  },
  {
    id: 'barazek', ar: 'برازق', name: 'Barazek', group: 'trocken',
    de: 'Sesamkekse aus Damaskus',
    text: 'Hauchdünne, knusprige Kekse – eine Seite mit geröstetem Sesam, die andere mit Pistazien. Perfekt zum Tee.',
    zutaten: ['Mehl', 'Butter', 'Sesam', 'Pistazien', 'Honig / Sirup'],
    price: '18 € / kg', allergens: 'A,B,C,E', shape: 'cookie', img: 'assets/img/teller/barazek.jpg',
  },
  {
    id: 'maamoul', ar: 'معمول', name: 'Maamoul', group: 'trocken',
    de: 'Gefülltes Grießgebäck',
    text: 'In kunstvoll geschnitzten Holzformen gepresstes Grießgebäck, gefüllt mit Datteln, Pistazien oder Walnüssen – das Festgebäck zu Eid.',
    zutaten: ['Grieß', 'Butter', 'Datteln / Pistazien / Walnüsse', 'Rosenwasser'],
    price: '18 € / kg', allergens: 'A,B,C', shape: 'maamoul', img: 'assets/img/teller/maamoul.jpg',
  },
  {
    id: 'ghraybeh', ar: 'غريبة', name: 'Ghraybeh', group: 'trocken',
    de: 'Zartes Buttergebäck',
    text: 'Mürbes Gebäck aus Butter, Zucker und Mehl, das auf der Zunge zerfällt – gekrönt mit einer Pistazie. Auch mit Sahne erhältlich.',
    zutaten: ['Butterschmalz', 'Puderzucker', 'Mehl', 'Pistazie'],
    price: '18 € / kg', allergens: 'A,B,C', shape: 'ring', img: 'assets/img/teller/ghraybeh.jpg',
  },
];

export const SWEET_GROUPS = [
  { id: 'alle', label: 'Alle' },
  { id: 'pistazie', label: 'Mit Pistazien & Cashew' },
  { id: 'sahne', label: 'Mit Sahne & Käse' },
  { id: 'griess', label: 'Mit Grieß' },
  { id: 'trocken', label: 'Trockengebäck' },
];

// ─── Glossar ───
export const GLOSSARY = [
  ['Kadayif / Kataifi', 'كنافة', 'Hauchdünne Teigfäden aus Mehl und Wasser – die Basis für Künefe, Mabrumeh und Nester.'],
  ['Ashta', 'قشطة', 'Dicke, ungesüßte Sahnecreme, traditionell aus abgeschöpfter Milchhaut. Füllung vieler Süßspeisen.'],
  ['Ater (Sirup)', 'قطر', 'Zuckersirup mit Zitrone, oft mit Rosen- oder Orangenblütenwasser aromatisiert.'],
  ['Samneh', 'سمنة', 'Geklärte Butter (Butterschmalz). Gibt den nussigen Geschmack und die Knusprigkeit.'],
  ['Akkawi / Nabulsi', 'جبنة عكاوي', 'Milde, weiße Käsesorten, entsalzt – schmelzen weich und ziehen Fäden.'],
  ['Filo / Yufka', 'رقائق', 'Papierdünn ausgerollter Teig, der in vielen Schichten Baklava & Co. bildet.'],
  ['Aleppo-Pistazie', 'فستق حلبي', 'Kleine, besonders grüne und aromatische Pistazie aus Nordsyrien – das Markenzeichen syrischer Süßigkeiten.'],
  ['Rosen- & Orangenblütenwasser', 'ماء الورد والزهر', 'Destillierte Blütenwasser. Wenige Tropfen geben Sirup und Creme ihren typischen, blumigen Duft.'],
];

export const CAKES = [
  ['Große Torte', '55 €'],
  ['Mittlere Torte', '45 €'],
  ['Kleine Torte', '35 €'],
  ['Stück Kuchen', '4 €'],
];

// ─── Komplette Karte (Tabs) ───
export const MENU = [
  {
    tab: 'Süßes', sections: [
      { title: 'Mit Pistazien', note: 'pro kg', items: [
        ['Mabrumeh', '43 €', 'A,B,C'], ['Kol w Shkor', '40 €', 'A,B,C'], ['Baklava', '40 €', 'A,B,C'],
        ['Pistazienröllchen', '40 €', 'A,B,C'], ['Pistaziennest', '40 €', 'A,B,C'], ['Ballourieh', '40 €', 'A,B,C'],
        ['Warbat mit Pistazien', '40 €', 'A,B,C'], ['Gemischtes (Pistazie & Cashew)', '38 €', 'A,B,C'],
      ]},
      { title: 'Mit Cashewkernen', note: 'pro kg', items: [
        ['Baklava (Cashew)', '36 €', 'A,B,C'], ['Cashew-Nest', '36 €', 'A,B,C'], ['Ballourieh (Cashew)', '36 €', 'A,B,C'],
      ]},
      { title: 'Mit Sahne & Käse', note: 'pro kg', items: [
        ['Shaabiyat (pro Stück)', '3 €', 'A,B,C'], ['Warbat', '18 €', 'A,B,C'], ['Warbat mit frischer Sahne', '24 €', 'A,B,C'],
        ['Madlouka', '24 €', 'A,B,C'],
        ['Halawet el Jibn', '18 €', 'A,B,C'], ['Halawet el Jibn mit frischer Sahne', '24 €', 'A,B,C'],
        ['Knafeh Nabulsi (fein)', '24 €', 'A,B,C'], ['Knafeh bin Narein (grob)', '18 €', 'A,B,C'],
        ['Knafeh mit Nüssen', '39 €', 'A,B,C'], ['Ghraybeh mit Sahne', '18 €', 'A,B,C'],
      ]},
      { title: 'Mit Grieß', note: 'pro kg', items: [
        ['Harisseh', '18 €', 'A,B,C'], ['Namoura', '18 €', 'A,B,C'], ['Maamoul Mad', '18 €', 'A,B,C'],
      ]},
      { title: 'Orientalisches Trockengebäck', note: 'pro kg', items: [
        ['Barazek', '18 €', 'A,B,C,E'], ['Maamoul', '18 €', 'A,B,C'], ['Ghraybeh', '18 €', 'A,B,C'],
      ]},
    ],
  },
  {
    tab: 'Torten', sections: [
      { title: 'Kuchen & Torten', note: 'Für Geburtstage, Feiern und besondere Anlässe', items: CAKES.map(c => [c[0], c[1], 'A,B,D']) },
    ],
  },
  {
    tab: 'Getränke', sections: [
      { title: 'Heiße Getränke', items: [
        ['Espresso', '3 €'], ['Doppelter Espresso', '4,50 €'], ['Amerikanischer Kaffee', '2,50 €'], ['Klassischer Kaffee', '2,50 €'],
        ['Cappuccino', '3 €'], ['Latte Macchiato', '3 €'], ['Latte Kaffee', '3 €'], ['Crema Kaffee', '3 €'],
        ['Ristretto', '3 €'], ['Klarer Kaffee', '3 €'], ['Olé Kaffee', '3 €'], ['Tee', '1 €'],
      ]},
      { title: 'Kalte Getränke', note: 'inkl. Pfand', items: [
        ['Cola 0,33 l', '2 €'], ['Cola Zero 0,33 l', '2 €'], ['Fanta 0,33 l', '2 €'], ['Sprite 0,33 l', '2 €'],
        ['Uludağ 0,33 l', '2 €'], ['Ayran 0,25 l', '1,50 €'], ['Capri-Sun 0,2 l', '1,50 €'], ['Mineralwasser still 0,5 l', '1,50 €'],
      ]},
    ],
  },
];
