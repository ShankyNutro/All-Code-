/* chemistic.js — Part 3: Core JS Engine for Chemistic
   Save as chemistic.js
   ----------------------------------------------------
   This script wires the UI, builds the periodic table,
   runs the intro, handles commands, animates ASCII atoms,
   and provides a simple Labs combine heuristic and AI stub.
*/

/* -------------------- DOM ready -------------------- */
document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Elements ---------- */
  const intro = document.getElementById('intro');
  const bootLinesEl = document.getElementById('bootLines');
  const tiles = document.getElementById('tiles');
  const tileTerminal = document.getElementById('tileTerminal');
  const tileAI = document.getElementById('tileAI');
  const tileLabs = document.getElementById('tileLabs');
  const skipBtn = document.getElementById('skipIntro');
  const scanRing = document.getElementById('scanRing');

  const app = document.getElementById('app');
  const output = document.getElementById('output');
  const ptable = document.getElementById('ptable');

  const cmdInput = document.getElementById('cmd');
  const runBtn = document.getElementById('runCmd');

  const testMenuWrap = document.getElementById('testMenuWrap');
  const asciiAnim = document.getElementById('asciiAnim');
  const panelTitle = document.getElementById('panelTitle');
  const ename = document.getElementById('ename');
  const znum = document.getElementById('znum');
  const zsym = document.getElementById('zsym');
  const zcfg = document.getElementById('zcfg');
  const zshells = document.getElementById('zshells');
  const zval = document.getElementById('zval');
  const subshells = document.getElementById('subshells');
  const pauseBtn = document.getElementById('pauseBtn');
  const copyBtn = document.getElementById('copyBtn');
  const exportBtn = document.getElementById('exportBtn');
  const led = document.getElementById('led');

  const labsPanel = document.getElementById('labsPanel');
  const closeLabs = document.getElementById('closeLabs');
  const labInput = document.getElementById('labInput');
  const labCombine = document.getElementById('labCombine');
  const labClear = document.getElementById('labClear');
  const labExport = document.getElementById('labExport');
  const labResult = document.getElementById('labResult');

  const aiInput = document.getElementById('aiInput');
  const aiOutput = document.getElementById('aiOutput');
  const askBtn = document.getElementById('askBtn');
  const clearAI = document.getElementById('clearAI');

  /* ---------- Atomic data (118 elements) ---------- */
  // Symbols and names — canonical 1..118
  const symbols = ['H','He','Li','Be','B','C','N','O','F','Ne','Na','Mg','Al','Si','P','S','Cl','Ar','K','Ca','Sc','Ti','V','Cr','Mn','Fe','Co','Ni','Cu','Zn','Ga','Ge','As','Se','Br','Kr','Rb','Sr','Y','Zr','Nb','Mo','Tc','Ru','Rh','Pd','Ag','Cd','In','Sn','Sb','Te','I','Xe','Cs','Ba','La','Ce','Pr','Nd','Pm','Sm','Eu','Gd','Tb','Dy','Ho','Er','Tm','Yb','Lu','Hf','Ta','W','Re','Os','Ir','Pt','Au','Hg','Tl','Pb','Bi','Po','At','Rn','Fr','Ra','Ac','Th','Pa','U','Np','Pu','Am','Cm','Bk','Cf','Es','Fm','Md','No','Lr','Rf','Db','Sg','Bh','Hs','Mt','Ds','Rg','Cn','Nh','Fl','Mc','Lv','Ts','Og'];
  const names = ['Hydrogen','Helium','Lithium','Beryllium','Boron','Carbon','Nitrogen','Oxygen','Fluorine','Neon','Sodium','Magnesium','Aluminium','Silicon','Phosphorus','Sulfur','Chlorine','Argon','Potassium','Calcium','Scandium','Titanium','Vanadium','Chromium','Manganese','Iron','Cobalt','Nickel','Copper','Zinc','Gallium','Germanium','Arsenic','Selenium','Bromine','Krypton','Rubidium','Strontium','Yttrium','Zirconium','Niobium','Molybdenum','Technetium','Ruthenium','Rhodium','Palladium','Silver','Cadmium','Indium','Tin','Antimony','Tellurium','Iodine','Xenon','Caesium','Barium','Lanthanum','Cerium','Praseodymium','Neodymium','Promethium','Samarium','Europium','Gadolinium','Terbium','Dysprosium','Holmium','Erbium','Thulium','Ytterbium','Lutetium','Hafnium','Tantalum','Tungsten','Rhenium','Osmium','Iridium','Platinum','Gold','Mercury','Thallium','Lead','Bismuth','Polonium','Astatine','Radon','Francium','Radium','Actinium','Thorium','Protactinium','Uranium','Neptunium','Plutonium','Americium','Curium','Berkelium','Californium','Einsteinium','Fermium','Mendelevium','Nobelium','Lawrencium','Rutherfordium','Dubnium','Seaborgium','Bohrium','Hassium','Meitnerium','Darmstadtium','Roentgenium','Copernicium','Nihonium','Flerovium','Moscovium','Livermorium','Tennessine','Oganesson'];

  /* ---------- Build periodic table grid ---------- */
  function buildPTable() {
    // Clear first
    ptable.innerHTML = '';
    for (let i = 0; i < 118; i++) {
      const div = document.createElement('div');
      div.className = 'element';
      div.dataset.z = i + 1;
      div.tabIndex = 0;
      div.innerHTML = `<div class="num" style="font-size:10px;color:var(--muted)">${i+1}</div><div class="sym">${symbols[i]}</div><div style="font-size:10px;color:var(--muted);margin-top:4px">${names[i]}</div>`;
      div.addEventListener('click', () => runCommand(String(i+1)));
      div.addEventListener('keydown', (e) => { if (e.key === 'Enter') runCommand(String(i+1)); });
      ptable.appendChild(div);
    }
  }

  buildPTable();

  /* ---------- Intro typing sequence ---------- */
  const bootLines = [
    'Chemistic — Orvyn Scientific Deck',
    'Loading Elemental Registry: ██████████ 100%',
    'Building Orbital Database: ██████████ 100%',
    'Initializing Diagnostics: OK',
    'Booting Assistant: OK',
    '',
    'Choose: terminal · AI · labs'
  ];

  function typeBoot(i = 0) {
    if (i >= bootLines.length) {
      // show ring pulse and reveal tiles
      scanRing && scanRing.classList && scanRing.classList.add('visible');
      const tileEls = tiles.querySelectorAll('.tile');
      tileEls.forEach((t, idx) => setTimeout(() => t.classList.add('visible'), idx * 120));
      return;
    }
    let s = 0, line = bootLines[i];
    function step() {
      bootLinesEl.innerText = bootLines.slice(0, i).join('\n') + (i ? '\n' : '') + line.slice(0, s);
      s++;
      if (s <= line.length) setTimeout(step, 8 + Math.random()*12);
      else setTimeout(() => typeBoot(i+1), 120 + Math.random()*200);
    }
    step();
  }

  // clicking tiles or skip hooks
  skipBtn && skipBtn.addEventListener('click', () => finishIntro());
  tileTerminal && tileTerminal.addEventListener('click', () => finishIntro('terminal'));
  tileAI && tileAI.addEventListener('click', () => finishIntro('ai'));
  tileLabs && tileLabs.addEventListener('click', () => finishIntro('labs'));

  function finishIntro(target) {
    // fade out intro
    intro.style.transition = 'opacity .45s, transform .45s';
    intro.style.opacity = 0;
    intro.style.transform = 'translateY(-10px) scale(.995)';
    setTimeout(() => {
      try { intro.remove(); } catch(e){ intro.style.display='none'; }
      showApp(target);
    }, 480);
  }

  // start typing
  typeBoot();

  /* ---------- Orbital physics: Aufbau and exceptions ---------- */
  const orbitals = [
    ['1s',2],['2s',2],['2p',6],['3s',2],['3p',6],
    ['4s',2],['3d',10],['4p',6],
    ['5s',2],['4d',10],['5p',6],
    ['6s',2],['4f',14],['5d',10],['6p',6],
    ['7s',2],['5f',14],['6d',10],['7p',6]
  ];

  // Known electron configuration exceptions (common)
  const exceptions = {
    24: {'4s':1,'3d':5},  // Cr
    29: {'4s':1,'3d':10}, // Cu
    46: {'5s':0,'4d':10},
    47: {'5s':1,'4d':10},
    64: {'6s':2,'5d':1,'4f':7},
    78: {'6s':1,'5d':9},
    79: {'6s':1,'5d':10}
  };

  function orbitalCapacity(o) {
    for (const [orb,cap] of orbitals) if (orb === o) return cap;
    return 0;
  }

  function totalElectrons(cfg) {
    return Object.values(cfg).reduce((a,b) => a + (parseInt(b)||0), 0);
  }

  function buildConfiguration(Z) {
    // Z: atomic number (1..118)
    let rem = Z;
    const cfg = {};
    for (const [orb,cap] of orbitals) {
      if (rem <= 0) break;
      const take = Math.min(cap, rem);
      cfg[orb] = take;
      rem -= take;
    }
    if (exceptions[Z]) {
      Object.keys(exceptions[Z]).forEach(o => cfg[o] = exceptions[Z][o]);
      // adjust if total mismatches
      let total = totalElectrons(cfg);
      if (total !== Z) {
        let diff = Z - total;
        if (diff > 0) {
          // try to add electrons to available orbitals (low -> high)
          const keys = Object.keys(cfg);
          for (let k of keys) {
            if (diff <= 0) break;
            const cap = orbitalCapacity(k), can = cap - (cfg[k]||0);
            if (can > 0) {
              const add = Math.min(can, diff);
              cfg[k] = (cfg[k]||0) + add;
              diff -= add;
            }
          }
        } else if (diff < 0) {
          // remove extras from highest orbitals
          let left = -diff;
          const keys = Object.keys(cfg).reverse();
          for (let k of keys) {
            if (left <= 0) break;
            const remv = Math.min(cfg[k]||0, left);
            cfg[k] -= remv;
            left -= remv;
          }
        }
      }
    }
    return cfg;
  }

  function formatOrbitalConfig(cfg) {
    const parts = [];
    for (const [orb] of orbitals) {
      if (cfg[orb]) parts.push(`${orb}${cfg[orb]}`);
    }
    return parts.join(' ');
  }

  function shellsFromConfig(cfg) {
    const shells = {};
    Object.keys(cfg).forEach(orb => {
      const n = parseInt(orb[0],10);
      shells[n] = (shells[n]||0) + cfg[orb];
    });
    const arr = [];
    for (let i=1;i<=7;i++) arr.push(shells[i]||0);
    while (arr.length && arr[arr.length-1]===0) arr.pop();
    return arr;
  }

  function valenceApprox(cfg) {
    const shells = shellsFromConfig(cfg);
    if (shells.length === 0) return {valenceShell:0, includeD:0};
    const highest = shells.length;
    const val = shells[highest-1];
    const dOrb = `${highest-1}d`; // count d in penultimate shell (for transition metals)
    const dCount = cfg[dOrb] || 0;
    return {valenceShell:val, includeD:dCount};
  }

  /* ---------- ASCII Bohr-style animator ---------- */
  let current = null;
  let raf = null;

  function asciiGrid(sym, shells, angles) {
    const shellsCount = Math.max(1, shells.length);
    const size = shellsCount * 4 + 5;
    const cx = Math.floor(size/2), cy = cx;
    const grid = Array.from({length:size}, ()=> Array(size).fill(' '));
    grid[cy][cx] = '⊙'; // nucleus

    // draw shells dots
    for (let s = 0; s < shells.length; s++) {
      const r = (s+1)*2;
      for (let a = 0; a < 40; a++) {
        const ang = (a/40) * Math.PI * 2;
        const x = Math.round(cx + Math.cos(ang)*r);
        const y = Math.round(cy + Math.sin(ang)*r);
        if (grid[y] && typeof grid[y][x] !== 'undefined' && grid[y][x] === ' ') grid[y][x] = '.';
      }
    }

    let idx = 0;
    for (let s = 0; s < shells.length; s++) {
      const r = (s+1)*2;
      const count = shells[s];
      for (let e = 0; e < count; e++) {
        const ang = angles[idx] || (2*Math.PI*(e/count));
        const x = Math.round(cx + Math.cos(ang)*r);
        const y = Math.round(cy + Math.sin(ang)*r);
        const isValence = (s === shells.length-1);
        const ch = isValence ? '×' : '●';
        if (grid[y] && typeof grid[y][x] !== 'undefined') grid[y][x] = ch;
        idx++;
      }
    }
    return grid.map(r => r.join('')).join('\n');
  }

  function staticAscii(sym, shells) {
    const angles = [];
    for (let s=0;s<shells.length;s++){
      const count = shells[s];
      for (let e=0;e<count;e++) angles.push(2*Math.PI*(e/count));
    }
    return asciiGrid(sym, shells, angles);
  }

  function renderFrame() {
    if (!current || !current.running) {
      asciiAnim.innerText = current ? staticAscii(current.sym, current.shells) : '';
      return;
    }
    const now = performance.now();
    const dt = (current._lastTime) ? (now - current._lastTime)/1000 : 0.033;
    current._lastTime = now;
    const speedBase = 1.2;
    let idx = 0;
    for (let s=0; s<current.shells.length; s++) {
      const count = current.shells[s];
      const shellFactor = 1/(s+1);
      for (let e=0;e<count;e++){
        current.angles[idx] += dt * speedBase * (0.6 + 0.6*shellFactor) * (0.8 + 0.4*Math.sin(idx));
        current.angles[idx] %= (Math.PI*2);
        idx++;
      }
    }
    asciiAnim.innerText = asciiGrid(current.sym, current.shells, current.angles);
  }

  function startAnimationFor(Z) {
    const idx = Z - 1;
    const sym = symbols[idx], name = names[idx];
    const cfg = buildConfiguration(Z);
    const cfgStr = formatOrbitalConfig(cfg);
    const shells = shellsFromConfig(cfg);
    const val = valenceApprox(cfg);
    const angles = [];
    for (let s=0; s<shells.length; s++){
      const count = shells[s];
      for (let e=0;e<count;e++) angles.push(2*Math.PI*(e/count) + (Math.random()-0.5)*0.3);
    }

    current = {Z, sym, name, cfg, cfgStr, shells, val, angles, running:true, _lastTime: performance.now()};
    panelTitle.innerText = `TEST MENU — ${name}`;
    ename.innerText = `${name} (${sym})`;
    znum.innerText = Z;
    zsym.innerText = sym;
    zcfg.innerText = cfgStr;
    zshells.innerText = '[' + shells.join(', ') + ']';
    zval.innerText = `${val.valenceShell}` + (val.includeD ? ` (+${val.includeD}d)` : '');
    subshells.innerText = cfgStr;

    testMenuWrap.style.display = 'grid';
    led.style.opacity = 1;
    asciiAnim.innerText = asciiGrid(sym, shells, angles);

    if (!raf) {
      (function loop(t){
        renderFrame();
        raf = requestAnimationFrame(loop);
      })(performance.now());
    }
  }

  function stopAnimation() {
    if (current) current.running = false;
    if (raf) { cancelAnimationFrame(raf); raf = null; }
    led.style.opacity = 0.3;
  }

  pauseBtn && pauseBtn.addEventListener('click', () => {
    if (!current) return;
    current.running = !current.running;
    pauseBtn.innerText = current.running ? 'PAUSE' : 'RESUME';
  });

  copyBtn && copyBtn.addEventListener('click', async () => {
    if (!asciiAnim.innerText) return;
    try {
      await navigator.clipboard.writeText(asciiAnim.innerText);
      log('[SYSTEM] ASCII copied to clipboard.');
    } catch (e) {
      log('[SYSTEM] Copy failed: ' + e.message);
    }
  });

  exportBtn && exportBtn.addEventListener('click', () => {
    const txt = asciiAnim.innerText || '';
    const blob = new Blob([txt], {type: 'text/plain'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${current ? (symbols[current.Z-1]+'_'+current.Z) : 'chemistic'}.txt`;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
    log('[SYSTEM] Exported ASCII .txt');
  });

  /* ---------- Terminal & Command engine ---------- */
  let history = [];
  let hIndex = -1;

  function log(msg) {
    output.innerText = (output.innerText ? output.innerText + '\n' : '') + msg;
    const term = document.getElementById('terminal');
    if (term) term.scrollTop = term.scrollHeight;
  }

  function parseQuery(q) {
    if (!q) return -1;
    q = String(q).trim();
    if (/^[0-9]+$/.test(q)) {
      const z = parseInt(q,10);
      if (z >= 1 && z <= 118) return z-1;
      return -1;
    }
    const sidx = symbols.findIndex(s => s.toLowerCase() === q.toLowerCase());
    if (sidx !== -1) return sidx;
    const nidx = names.findIndex(n => n.toLowerCase() === q.toLowerCase());
    return nidx;
  }

  function runCommand(raw) {
    if (!raw) return;
    history.unshift(raw);
    hIndex = -1;
    const r = raw.trim();
    const low = r.toLowerCase();
    log('USER@CHEMISTIC> ' + r);

    if (low === 'help') { log('Commands: search <name|symbol|Z> · cfg <Z> · labs <H,O> · ai <prompt> · clear'); return; }
    if (low === 'clear') {
      output.innerText = '';
      asciiAnim.innerText = '';
      testMenuWrap.style.display = 'none';
      current = null;
      stopAnimation();
      log('[SYSTEM] Cleared.');
      return;
    }
    if (low.startsWith('search ')) {
      const q = r.slice(7).trim();
      const idx = parseQuery(q);
      if (idx === -1) { log('ERROR: No element found for: ' + q); return; }
      startAnimationFor(idx+1);
      return;
    }
    if (low.startsWith('cfg ')) {
      const q = r.slice(4).trim();
      const idx = parseQuery(q);
      if (idx === -1) { log('ERROR: No element found: ' + q); return; }
      const cfg = buildConfiguration(idx+1);
      log(`CFG ${idx+1}: ${formatOrbitalConfig(cfg)}`);
      return;
    }
    if (low.startsWith('labs ')) {
      const q = r.slice(5).trim();
      openLabs(q);
      return;
    }
    if (low.startsWith('ai ')) {
      const q = r.slice(3).trim();
      aiInput.value = q;
      askAI();
      return;
    }

    // fallback: try parse as element
    const idx = parseQuery(raw);
    if (idx === -1) { log('ERROR: No element found for: ' + raw); return; }
    startAnimationFor(idx+1);
  }

  runBtn && runBtn.addEventListener('click', () => { runCommand(cmdInput.value); cmdInput.value=''; cmdInput.focus(); });
  cmdInput && cmdInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); runCommand(cmdInput.value); cmdInput.value=''; }
    else if (e.key === 'ArrowUp') { if (history.length && hIndex < history.length-1) { hIndex++; cmdInput.value = history[hIndex]; } }
    else if (e.key === 'ArrowDown') { if (hIndex > 0) { hIndex--; cmdInput.value = history[hIndex]; } else { hIndex = -1; cmdInput.value = ''; } }
  });

  /* ---------- Labs logic (Molecular Forge) ---------- */

  function openLabs(prefill='') {
    labsPanel.style.display = 'block';
    labInput.value = prefill || '';
    labInput.focus();
  }

  closeLabs && closeLabs.addEventListener('click', () => { labsPanel.style.display = 'none'; });

  function elementExists(sym) {
    return symbols.indexOf(sym) !== -1;
  }

  function elemIndex(sym) {
    return symbols.indexOf(sym);
  }

  function combineElements(elemSymbols) {
    // elemSymbols: array of symbol strings e.g. ['Na','Cl']
    const elems = elemSymbols.map(s => s.trim()).filter(Boolean);
    if (elems.length < 2) return {error:'Need at least two elements.'};

    const upp = elems.map(e => e.length <= 2 ? e.toUpperCase() : e[0].toUpperCase() + e.slice(1).toLowerCase());
    for (const s of upp) if (!elementExists(s)) return {error:`Unknown element: ${s}`};

    // compute valence approx using valenceApprox(buildConfiguration(Z))
    const vals = upp.map(s => {
      const idx = elemIndex(s); const Z = idx+1;
      const cfg = buildConfiguration(Z); const v = valenceApprox(cfg);
      let assumed = v.valenceShell;
      // fallback heuristics
      if (assumed === 0) assumed = 1;
      if (assumed > 8) assumed = 8;
      return {sym:s,Z:idx+1,valence:assumed,name:names[idx]};
    });

    // simple isMetal heuristic
    function isMetal(Z){
      if (Z>=57 && Z<=71) return true; // lanthanides
      if (Z>=89 && Z<=103) return true; // actinides
      const nm = ['H','He','C','N','O','F','Ne','P','S','Cl','Ar','Se','Br','Kr','I','Xe','At','Rn','Og'];
      const s = symbols[Z-1];
      if (nm.indexOf(s) !== -1) return false;
      if (Z <= 12) return true;
      if (Z >= 21 && Z <= 31) return true;
      return false;
    }

    let hasMetal = vals.some(v=> isMetal(v.Z));
    let hasNonmetal = vals.some(v=> !isMetal(v.Z));

    // ionic prefer when clear metal + nonmetal and two participants
    if (upp.length === 2 && hasMetal && hasNonmetal) {
      let metal = vals.find(v => isMetal(v.Z));
      let nonm = vals.find(v => !isMetal(v.Z));
      let a = metal.valence, b = nonm.valence;
      const gcd = (x,y)=> y===0?x:gcd(y,x%y);
      let g = gcd(a,b);
      let m = b/g, n = a/g;
      const formula = `${metal.sym}${m>1?m:''}${nonm.sym}${n>1?n:''}`;
      return {formula, type:'Ionic (heuristic)', notes:`Balanced by valence: ${metal.sym}(${a}) : ${nonm.sym}(${b}) => ratio ${m}:${n}`};
    }

    // covalent naive
    const valsOnly = vals.map(v => v.valence);
    let minVal = Math.min(...valsOnly);
    if (!minVal || !isFinite(minVal)) minVal = 1;
    let ratios = valsOnly.map(v => Math.round(v/minVal));
    for (let i=0;i<ratios.length;i++) if (ratios[i] < 1) ratios[i] = 1;
    let formula = '';
    for (let i=0;i<upp.length;i++) formula += `${upp[i]}${ratios[i]>1?ratios[i]:''}`;
    return {formula, type:'Covalent heuristic', notes:`Naive ratio from valences: ${vals.map((v,i)=>v.sym+':'+ratios[i]).join(', ')}`};
  }

  labCombine && labCombine.addEventListener('click', () => {
    const val = labInput.value.trim();
    if (!val) return;
    // allow comma or space separated
    const parts = val.includes(',') ? val.split(',').map(s=>s.trim()) : val.split(/\s+/).map(s=>s.trim());
    const res = combineElements(parts);
    if (res.error) labResult.innerText = res.error;
    else labResult.innerText = `Result: ${res.formula}\nType: ${res.type}\nNotes: ${res.notes}`;
  });

  labClear && labClear.addEventListener('click', () => { labInput.value = ''; labResult.innerText = ''; });
  labExport && labExport.addEventListener('click', () => {
    const blob = new Blob([labResult.innerText || ''], {type:'text/plain'});
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download='chemistic_compound.txt'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    log('Exported lab result .txt');
  });

  /* ---------- AI integration (stub + instructions) ---------- */
  // IMPORTANT: Do NOT include your secret API key in client-side JS in production.
  // For safe usage, run a tiny proxy server that accepts a prompt and forwards to OpenAI with your key.
  // This function is a client-side demo that will only work if you add a key here (not recommended).
  const OPENAI_API_KEY_PLACEHOLDER = 'REPLACE_WITH_SECRET_KEY';

  async function callAI_viaClient(prompt) {
    // Not recommended: client-side key. Only for quick local testing.
    const key = OPENAI_API_KEY_PLACEHOLDER;
    if (!key || key.startsWith('REPLACE')) {
      aiOutput.innerText = '[AI] No API key present. Use a server proxy or add your key in chemistic.js (local only).';
      return;
    }
    aiOutput.innerText = '[AI] querying...';
    try {
      const resp = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {'Content-Type':'application/json', 'Authorization': 'Bearer '+key},
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{role:'user', content: prompt}],
          max_tokens: 600
        })
      });
      if (!resp.ok) { const t = await resp.text(); aiOutput.innerText = '[AI] Error: ' + t; return; }
      const j = await resp.json();
      const txt = j?.choices?.[0]?.message?.content || JSON.stringify(j,null,2);
      aiOutput.innerText = txt;
    } catch (err) {
      aiOutput.innerText = '[AI] Request failed: ' + err.message;
    }
  }

  // Example safe proxy usage (recommended) - user should implement server-side route /api/ai
  async function callAI_viaProxy(prompt) {
    aiOutput.innerText = '[AI] requesting proxy...';
    try {
      const resp = await fetch('/api/ai', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({prompt})
      });
      if (!resp.ok) { const t = await resp.text(); aiOutput.innerText = '[AI] Proxy error: ' + t; return; }
      const j = await resp.json();
      aiOutput.innerText = j.response || JSON.stringify(j);
    } catch (err) {
      aiOutput.innerText = '[AI] Proxy request failed: ' + err.message;
    }
  }

  askBtn && askBtn.addEventListener('click', () => askAI());
  clearAI && clearAI.addEventListener('click', () => aiOutput.innerText = '');

  function askAI() {
    const p = aiInput.value.trim();
    if (!p) return;
    aiOutput.innerText = '[AI] preparing...';
    // Try proxy first (if available)
    callAI_viaProxy(p).catch(()=>callAI_viaClient(p));
  }

  /* ---------- App show ---------- */
  function showApp(target) {
    // reveal main app and run initial boot logs
    app.classList.remove('hidden');
    app.setAttribute('aria-hidden','false');
    setTimeout(() => {
      log('Chemistic — Boot complete.');
      // default action: search neon (Z=10)
      if (!target || target === 'terminal') setTimeout(()=> runCommand('search neon'), 900);
      if (target === 'labs') openLabs();
      if (target === 'ai') { aiInput.focus(); }
    }, 180);
  }

  // expose openLabs to global for old references
  window.openLabs = openLabs;

  /* ---------- Small utilities ---------- */
  function downloadText(filename, text) {
    const blob = new Blob([text], {type:'text/plain'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  }

  // make accessible: clicking element in table opens animation
  ptable.addEventListener('click', (ev) => {
    const el = ev.target.closest('.element');
    if (!el) return;
    const z = parseInt(el.dataset.z, 10);
    if (!isNaN(z)) runCommand(String(z));
  });

  // safety: keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      // close labs if open
      if (labsPanel && labsPanel.style.display === 'block') labsPanel.style.display = 'none';
    }
    // Ctrl+k to focus command
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault(); cmdInput.focus();
    }
  });

}); // DOMContentLoaded
