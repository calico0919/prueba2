<script>
// ===========================
// DATABASE (IndexedDB)
// ===========================
let db;

function initDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('focuslearn', 2);
    req.onupgradeneeded = e => {
      const d = e.target.result;
      if (!d.objectStoreNames.contains('users')) d.createObjectStore('users', { keyPath: 'email' });
      if (!d.objectStoreNames.contains('sessions')) d.createObjectStore('sessions', { keyPath: 'id' });
    };
    req.onsuccess = e => { db = e.target.result; resolve(); };
    req.onerror = () => reject(req.error);
  });
}
function dbGet(store, key) {
  return new Promise(resolve => {
    const tx = db.transaction(store, 'readonly');
    const req = tx.objectStore(store).get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => resolve(null);
  });
}
function dbPut(store, val) {
  return new Promise(resolve => {
    const tx = db.transaction(store, 'readwrite');
    tx.objectStore(store).put(val);
    tx.oncomplete = resolve;
  });
}
function dbDelete(store, key) {
  return new Promise(resolve => {
    const tx = db.transaction(store, 'readwrite');
    tx.objectStore(store).delete(key);
    tx.oncomplete = resolve;
  });
}

// ===========================
// GLOBAL STATE
// ===========================
let currentUser = null;
let currentModule = null;
let evalStep = 0;
let evalAnswers = {};
const visitedModules = new Set();

// ===========================
// CONSTANTS
// ===========================
const MODULES = {
  s: { letter:'S', name:'Science', emoji:'🔬', color:'module-card-s', barColor:'#4CAF82', headerColor:'linear-gradient(135deg,#4CAF82,#38A169)' },
  t: { letter:'T', name:'Technology', emoji:'💻', color:'module-card-t', barColor:'#5B9BD5', headerColor:'linear-gradient(135deg,#5B9BD5,#3B82F6)' },
  e: { letter:'E', name:'Engineering', emoji:'⚙️', color:'module-card-e', barColor:'#F0A500', headerColor:'linear-gradient(135deg,#F0A500,#D97706)' },
  a: { letter:'A', name:'Arts', emoji:'🎨', color:'module-card-a', barColor:'#E06BA0', headerColor:'linear-gradient(135deg,#E06BA0,#BE185D)' },
  m: { letter:'M', name:'Maths', emoji:'📐', color:'module-card-m', barColor:'#E05252', headerColor:'linear-gradient(135deg,#E05252,#DC2626)' },
};

const EVAL_QUESTIONS = [
  { q: '¿Cómo preferís aprender cosas nuevas?', options: [
    { icon:'🖼️', label:'Con imágenes y diagramas' },
    { icon:'🎧', label:'Escuchando explicaciones' },
    { icon:'📖', label:'Leyendo y tomando notas' },
    { icon:'🎮', label:'Practicando y jugando' },
  ]},
  { q: '¿Cuánto tiempo podés concentrarte en una actividad?', options: [
    { icon:'⚡', label:'Poco tiempo (5-10 min)' },
    { icon:'⏱️', label:'Tiempo medio (15-20 min)' },
    { icon:'⏰', label:'Mucho tiempo (30+ min)' },
    { icon:'🔄', label:'Depende del tema' },
  ]},
  { q: '¿Qué área te llama más la atención?', options: [
    { icon:'🔬', label:'Ciencias y naturaleza' },
    { icon:'💻', label:'Tecnología y computadoras' },
    { icon:'🎨', label:'Arte y creatividad' },
    { icon:'📐', label:'Números y problemas' },
  ]},
];

const ACHIEVEMENTS = [
  { id:'first_login', icon:'🌟', name:'¡Bienvenido!', desc:'Creaste tu cuenta en FocusLearn' },
  { id:'science_1', icon:'🔬', name:'Científico en ciernes', desc:'Alcanzaste nivel 2 en Science' },
  { id:'tech_1', icon:'💻', name:'Tech explorer', desc:'Alcanzaste nivel 2 en Technology' },
  { id:'art_1', icon:'🎨', name:'Artista en ciernes', desc:'Alcanzaste nivel 2 en Arts' },
  { id:'math_1', icon:'📐', name:'Calculador', desc:'Alcanzaste nivel 2 en Maths' },
  { id:'streak_3', icon:'🔥', name:'Racha de 3', desc:'Entraste 3 días seguidos' },
  { id:'all_modules', icon:'🌈', name:'Explorador STEAM', desc:'Visitaste todos los módulos' },
];

const FLASHCARDS = {
  s: [
    { emoji:'🧬', word:'ADN', def:'Ácido desoxirribonucleico: la molécula que contiene la información genética de los seres vivos.' },
    { emoji:'⚛️', word:'Átomo', def:'La unidad más pequeña de un elemento que conserva las propiedades químicas de ese elemento.' },
    { emoji:'🌍', word:'Ecosistema', def:'Conjunto de seres vivos que interactúan entre sí y con su entorno físico.' },
  ],
  t: [
    { emoji:'💾', word:'Byte', def:'Unidad básica de información en computación. 8 bits forman 1 byte.' },
    { emoji:'🌐', word:'Internet', def:'Red mundial de computadoras que permite compartir información y comunicarse.' },
    { emoji:'🤖', word:'Algoritmo', def:'Conjunto de pasos ordenados para resolver un problema o realizar una tarea.' },
  ],
  e: [
    { emoji:'⚙️', word:'Engranaje', def:'Rueda dentada que transmite movimiento a otras piezas mecánicas.' },
    { emoji:'🏗️', word:'Estructura', def:'Conjunto de elementos que soportan cargas y mantienen la forma de una construcción.' },
    { emoji:'⚡', word:'Circuito', def:'Camino cerrado por donde fluye la corriente eléctrica.' },
  ],
  a: [
    { emoji:'🎨', word:'Perspectiva', def:'Técnica artística que representa la profundidad y distancia en una superficie plana.' },
    { emoji:'🖌️', word:'Pigmento', def:'Sustancia que da color a la pintura absorbiendo ciertas longitudes de onda de la luz.' },
    { emoji:'🎭', word:'Expresionismo', def:'Movimiento artístico que busca expresar emociones internas más que la realidad exterior.' },
  ],
  m: [
    { emoji:'🔢', word:'Fracción', def:'Número que representa partes iguales de un todo, expresado como numerador/denominador.' },
    { emoji:'📐', word:'Teorema', def:'Proposición matemática que puede ser demostrada a partir de axiomas o postulados.' },
    { emoji:'∞', word:'Infinito', def:'Concepto que describe algo sin límite o que no termina.' },
  ],
};

// ===========================
// TTS ENGINE (improved from v2)
// ===========================
let synth = window.speechSynthesis;
let ttsVoice = null;
let ttsPlaying = false;
let ttsSpeed = 1.0;
let ttsUtterance = null;

function loadTTSVoices() {
  const voices = synth.getVoices();
  // Prefer female Spanish voice
  ttsVoice = voices.find(v => v.lang.startsWith('es') && /female|mujer|femenin|ana|lucía|sofia|elena|paula|isabel|carla|mónica|microsoft elena|google español/i.test(v.name))
           || voices.find(v => v.lang.startsWith('es'))
           || null;
}
if (speechSynthesis.onvoiceschanged !== undefined) speechSynthesis.onvoiceschanged = loadTTSVoices;

function ttsUpdateSpeedUI(containerId) {
  const val = document.getElementById('tts-speed-' + containerId);
  const label = document.getElementById('tts-speed-val-' + containerId);
  if (val) ttsSpeed = parseFloat(val.value);
  if (label) label.textContent = ttsSpeed.toFixed(1) + 'x';
  if (ttsPlaying) { ttsStop(); setTimeout(() => ttsPlay(containerId), 200); }
}

function ttsPlay(containerId) {
  if (!ttsVoice) loadTTSVoices();
  const textEl = document.getElementById('tts-text-' + containerId);
  if (!textEl) return;
  synth.cancel();
  ttsUtterance = new SpeechSynthesisUtterance(textEl.textContent);
  ttsUtterance.voice = ttsVoice;
  ttsUtterance.rate = ttsSpeed;
  ttsUtterance.pitch = 1.1;
  ttsUtterance.lang = 'es-ES';
  ttsUtterance.onstart = () => { ttsPlaying = true; ttsUpdateBtnUI(containerId); };
  ttsUtterance.onend = () => { ttsPlaying = false; ttsUpdateBtnUI(containerId); };
  ttsUtterance.onerror = () => { ttsPlaying = false; ttsUpdateBtnUI(containerId); };
  synth.speak(ttsUtterance);
}

function ttsToggle(containerId) {
  if (!ttsPlaying && !synth.speaking) { ttsPlay(containerId); }
  else if (synth.paused) { synth.resume(); ttsPlaying = true; ttsUpdateBtnUI(containerId); }
  else if (ttsPlaying) { synth.pause(); ttsPlaying = false; ttsUpdateBtnUI(containerId); }
}

function ttsStop() {
  synth.cancel();
  ttsPlaying = false;
  document.querySelectorAll('[id^="tts-playbtn-"]').forEach(btn => {
    btn.textContent = '▶ Reproducir';
  });
  document.querySelectorAll('[id^="tts-status-"]').forEach(s => {
    s.textContent = '✅ Listo';
  });
}

function ttsUpdateBtnUI(containerId) {
  const btn = document.getElementById('tts-playbtn-' + containerId);
  const status = document.getElementById('tts-status-' + containerId);
  if (btn) btn.textContent = ttsPlaying ? '⏸ Pausar' : (synth.speaking && synth.paused ? '▶ Reanudar' : '▶ Reproducir');
  if (status) status.textContent = ttsPlaying ? '🔊 Reproduciendo...' : (synth.speaking ? '⏸ En pausa' : '✅ Listo');
}

function buildTTSControls(containerId, text) {
  return `
    <p id="tts-text-${containerId}" style="font-size:15px;line-height:1.75;color:var(--text);margin-bottom:14px">${text}</p>
    <div class="tts-controls">
      <button class="tts-btn" id="tts-playbtn-${containerId}" onclick="ttsToggle('${containerId}')">▶ Reproducir</button>
      <button class="tts-btn stop" onclick="ttsStop()">⏹ Detener</button>
      <div class="tts-speed-wrap">
        <label>Velocidad:</label>
        <input type="range" id="tts-speed-${containerId}" min="0.5" max="2" step="0.1" value="${ttsSpeed}" oninput="ttsUpdateSpeedUI('${containerId}')">
        <span class="tts-speed-val" id="tts-speed-val-${containerId}">${ttsSpeed.toFixed(1)}x</span>
      </div>
    </div>
    <div class="tts-status" id="tts-status-${containerId}">✅ Listo para reproducir</div>
  `;
}

// ===========================
// DARK MODE (from v2)
// ===========================
function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
  const isDark = document.body.classList.contains('dark-mode');
  document.getElementById('dark-btn').textContent = isDark ? '☀️' : '🌙';
  if (currentUser) {
    currentUser.settings = currentUser.settings || {};
    currentUser.settings.darkmode = isDark;
    dbPut('users', currentUser);
    // Sync toggle in settings page
    const toggleEl = document.getElementById('toggle-darkmode');
    if (toggleEl) toggleEl.checked = isDark;
  }
}

function applyDarkMode() {
  const checked = document.getElementById('toggle-darkmode')?.checked;
  document.body.classList.toggle('dark-mode', checked);
  document.getElementById('dark-btn').textContent = checked ? '☀️' : '🌙';
  if (currentUser) {
    currentUser.settings = currentUser.settings || {};
    currentUser.settings.darkmode = checked;
    dbPut('users', currentUser);
  }
}

// ===========================
// INIT
// ===========================
window.onload = async () => {
  await initDB();
  initConditionSelectors();
  if (speechSynthesis.getVoices().length) loadTTSVoices();
  const session = await dbGet('sessions', 'current');
  if (session) {
    const user = await dbGet('users', session.email);
    if (user) {
      currentUser = user;
      enterApp();
    }
  }
  loadSettings();
};

// ===========================
// SCREEN MANAGEMENT
// ===========================
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const s = document.getElementById('screen-' + id);
  if (s) s.classList.add('active');
  document.querySelectorAll('.error-msg').forEach(e => e.classList.remove('visible'));
}

function initConditionSelectors() {
  document.querySelectorAll('#screen-conditions .condition-item').forEach(item => {
    const checkbox = item.querySelector('input[type=checkbox]');
    if (!checkbox || item.dataset.selectorReady) return;

    item.dataset.selectorReady = 'true';
    item.classList.toggle('selected', checkbox.checked);
    item.addEventListener('click', event => {
      event.preventDefault();
      checkbox.checked = !checkbox.checked;
      item.classList.toggle('selected', checkbox.checked);
    });
  });
}

// ===========================
// AUTH
// ===========================
async function handleLogin() {
  const email = document.getElementById('login-email').value.trim();
  const pass = document.getElementById('login-pass').value;
  if (!email || !pass) { showError('login-error', 'Completá todos los campos'); return; }
  const user = await dbGet('users', email);
  if (!user || user.password !== btoa(pass)) {
    showError('login-error', 'Email o contraseña incorrectos');
    return;
  }
  currentUser = user;
  await dbPut('sessions', { id: 'current', email });
  enterApp();
}

async function handleGoogleLogin() {
  const name = prompt('Simulación de Google Login\nIngresá tu nombre:');
  if (!name) return;
  const email = (name.toLowerCase().replace(/\s/g,'') + '@gmail.com');
  let user = await dbGet('users', email);
  if (!user) {
    user = createNewUser(name, email);
    await dbPut('users', user);
    currentUser = user;
    await dbPut('sessions', { id: 'current', email });
    showScreen('conditions');
  } else {
    currentUser = user;
    await dbPut('sessions', { id: 'current', email });
    enterApp();
  }
}

async function handleRegister() {
  const name = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const pass = document.getElementById('reg-pass').value;
  if (!name || !email || !pass) { showError('register-error', 'Completá todos los campos'); return; }
  if (pass.length < 6) { showError('register-error', 'La contraseña debe tener al menos 6 caracteres'); return; }
  const existing = await dbGet('users', email);
  if (existing) { showError('register-error', 'Ya existe una cuenta con ese email'); return; }
  const user = createNewUser(name, email, btoa(pass));
  await dbPut('users', user);
  currentUser = user;
  await dbPut('sessions', { id: 'current', email });
  showScreen('conditions');
}

function createNewUser(name, email, password = null) {
  return {
    email, name, password,
    createdAt: new Date().toISOString(),
    conditions: [],
    evalAnswers: {},
    progress: { s:{level:1,xp:50,maxXp:300}, t:{level:2,xp:180,maxXp:300}, e:{level:1,xp:20,maxXp:300}, a:{level:3,xp:220,maxXp:300}, m:{level:1,xp:80,maxXp:300} },
    achievements: ['first_login'],
    totalXp: 550,
    settings: { daltonismo:false, contraste:false, estimulos:false, velocidad:false, darkmode:false }
  };
}

async function handleConditions() {
  const checked = [...document.querySelectorAll('#screen-conditions input[type=checkbox]:checked')].map(i => i.value);
  currentUser.conditions = checked;
  if (checked.includes('daltonismo')) {
    document.getElementById('toggle-daltonismo').checked = true;
    currentUser.settings.daltonismo = true;
  }
  if (checked.includes('autismo') || checked.includes('down')) {
    document.getElementById('toggle-estimulos').checked = true;
    currentUser.settings.estimulos = true;
  }
  await dbPut('users', currentUser);
  startEvaluation();
}

// ===========================
// EVALUATION
// ===========================
function startEvaluation() {
  evalStep = 0;
  evalAnswers = {};
  showScreen('evaluation');
  renderEvalQuestion();
}

function renderEvalQuestion() {
  const total = EVAL_QUESTIONS.length;
  let dots = '';
  for (let i = 0; i < total; i++) {
    dots += `<div class="eval-dot ${i <= evalStep ? 'done' : ''}"></div>`;
  }
  document.getElementById('eval-progress').innerHTML = dots;

  const q = EVAL_QUESTIONS[evalStep];
  let opts = q.options.map((o, i) =>
    `<div class="eval-option ${evalAnswers[evalStep] === i ? 'selected' : ''}" onclick="selectEvalOption(${i})">
      <div class="option-icon">${o.icon}</div>
      <div>${o.label}</div>
    </div>`
  ).join('');

  document.getElementById('eval-content').innerHTML = `
    <div class="eval-question">${q.q}</div>
    <div class="eval-options">${opts}</div>
    <div style="margin-top:24px;display:flex;justify-content:flex-end">
      <button class="btn-full" style="width:auto;padding:14px 32px;" onclick="nextEval()">
        ${evalStep < total - 1 ? 'Siguiente →' : 'Finalizar ✓'}
      </button>
    </div>
  `;
}

function selectEvalOption(i) {
  evalAnswers[evalStep] = i;
  renderEvalQuestion();
}

async function nextEval() {
  if (evalAnswers[evalStep] === undefined) { showToast('Seleccioná una opción'); return; }
  if (evalStep < EVAL_QUESTIONS.length - 1) {
    evalStep++;
    renderEvalQuestion();
  } else {
    currentUser.evalAnswers = evalAnswers;
    await dbPut('users', currentUser);
    showToast('¡Perfil configurado! 🎉', 'success');
    setTimeout(() => enterApp(), 600);
  }
}

// ===========================
// ENTER APP
// ===========================
function enterApp() {
  showScreen('app');
  updateSidebar();
  renderHome();
  loadSettings();
  applyAccessibility();
  setTimeout(() => checkAchievements(null), 800);
}

function updateSidebar() {
  if (!currentUser) return;
  const initials = currentUser.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2);
  document.getElementById('sidebar-avatar').textContent = initials;
  document.getElementById('sidebar-name').textContent = currentUser.name;
  document.getElementById('sidebar-email').textContent = currentUser.email;
  document.getElementById('topbar-avatar').textContent = initials;
  document.getElementById('welcome-name').textContent = `¡Hola, ${currentUser.name.split(' ')[0]}!`;
}


// ===========================
// NAVIGATION
// ===========================
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  const page = document.getElementById('page-' + id) || document.getElementById('page-module');
  if (page) page.classList.add('active');

  const titles = { home:'Inicio', profile:'Mi Perfil', achievements:'Logros', settings:'Ajustes', module:'Módulo', content:'Aprendizaje' };
  document.getElementById('topbar-title').textContent = titles[id] || 'FocusLearn';

  if (id === 'home') document.querySelector('[onclick="showPage(\'home\')"]').classList.add('active');
  if (id === 'profile') { document.querySelector('[onclick="showPage(\'profile\')"]').classList.add('active'); renderProfile(); }
  if (id === 'achievements') { document.querySelector('[onclick="showPage(\'achievements\')"]').classList.add('active'); renderAchievements(); }
  if (id === 'settings') { document.querySelector('[onclick="showPage(\'settings\')"]').classList.add('active'); loadSettingsUI(); }

  document.getElementById('sidebar').classList.remove('mobile-open');
}

function toggleSidebar() {
  const s = document.getElementById('sidebar');
  if (window.innerWidth <= 768) {
    s.classList.toggle('mobile-open');
  } else {
    s.classList.toggle('collapsed');
  }
}

// ===========================
// HOME
// ===========================
function renderHome() {
  if (!currentUser) return;
  renderModuleCards();
}

function renderModuleCards() {
  const keys = ['s','t','e','a','m'];
  const grid = document.getElementById('modules-grid');
  grid.innerHTML = keys.map(k => {
    const m = MODULES[k];
    return `<div class="module-card ${m.color}" onclick="openModule('${k}')">
      <span class="module-emoji">${m.emoji}</span>
      <div class="module-letter">${m.letter}</div>
      <div class="module-name">${m.name}</div>
    </div>`;
  }).join('');
}

function renderProgress() {
  const keys = ['s','t','e','a','m'];
  const list = document.getElementById('progress-list');
  list.innerHTML = keys.map(k => {
    const m = MODULES[k];
    const p = currentUser.progress[k];
    const pct = Math.round((p.xp / p.maxXp) * 100);
    return `<div class="progress-item">
      <div class="progress-icon" style="background:${m.barColor}22">${m.emoji}</div>
      <div class="progress-info">
        <div class="progress-label">${m.name} — Nivel ${p.level}</div>
        <div class="progress-bar-wrap">
          <div class="progress-bar" style="width:${pct}%;background:${m.barColor}"></div>
        </div>
        <div class="progress-xp">${p.xp} / ${p.maxXp} XP</div>
      </div>
    </div>`;
  }).join('');
}

function renderMiniChart() {
  const keys = ['s','t','e','a','m'];
  const chart = document.getElementById('mini-chart');
  const maxLevel = 5;
  chart.innerHTML = keys.map(k => {
    const m = MODULES[k];
    const p = currentUser.progress[k];
    const h = Math.round((p.level / maxLevel) * 70);
    return `<div class="bar-wrap">
      <div class="bar" style="height:${h}px;background:${m.barColor}"></div>
      <span class="bar-label">${m.letter}</span>
    </div>`;
  }).join('');
}

// ===========================
// DAILY MISSION
// ===========================
const DAILY_MISSION_KEY = 'focuslearn_daily_mission_claimed';

function getDailyMissionDate() {
  return new Date().toISOString().slice(0, 10);
}

function isDailyMissionClaimed() {
  return localStorage.getItem(DAILY_MISSION_KEY) === getDailyMissionDate();
}

function claimDailyMission() {
  if (!currentUser) { showToast('Primero completá una actividad de Science.', 'error'); return; }
  const progress = flGetProgress ? flGetProgress(currentUser.email) : null;
  const scienceCompleted = progress && progress.missions && progress.missions.daily && progress.missions.daily.science > 0;
  const hasXp = currentUser.totalXp > 0;
  if (!scienceCompleted && !hasXp) {
    openModule('s');
    showToast('Primero completá una actividad de Science para reclamar la recompensa.', 'error');
    return;
  }
  if (isDailyMissionClaimed()) {
    showToast('Ya reclamaste la recompensa de hoy. ¡Volvé mañana! 📅', 'error');
    return;
  }
  localStorage.setItem(DAILY_MISSION_KEY, getDailyMissionDate());
  if (currentUser.progress && currentUser.progress['s']) {
    currentUser.progress['s'].xp = (currentUser.progress['s'].xp || 0) + 50;
    currentUser.totalXp = (currentUser.totalXp || 0) + 50;
  }
  const btn = document.getElementById('mission-claim-btn');
  if (btn) { btn.textContent = '✓ Reclamado'; btn.disabled = true; btn.style.background = 'var(--success)'; }
  showToast('¡Misión completada! +50 XP ganados 🌟', 'success');
  spawnSparkles();
  renderHome();
}

// ===========================
// MODULE
// ===========================
function openModule(key) {
  currentModule = key;
  visitedModules.add(key);
  setTimeout(() => checkAchievements(key), 300);
  const m = MODULES[key];
  const p = currentUser.progress[key];
  document.getElementById('module-content').innerHTML = `
    <button class="back-btn" onclick="showPage('home')">← Volver</button>
    <div class="module-header" style="background:${m.headerColor}">
      <div class="module-header-icon">${m.emoji}</div>
      <div class="module-header-info">
        <h2>${m.letter} — ${m.name}</h2>
        <p>Nivel ${p.level} · ${p.xp}/${p.maxXp} XP</p>
      </div>
    </div>
    <button class="upload-material-btn" onclick="openModal('upload-modal')">
      📁 Subir material (para padres)
    </button>
    <div class="modes-title">Elegí tu modo de aprendizaje</div>
    <div class="modes-grid">
      <div class="mode-card" onclick="openContent('${key}','visual')">
        <div class="mode-icon">🖼️</div>
        <div class="mode-name">Visual</div>
        <div class="mode-desc">Flashcards con imágenes</div>
        <span class="mode-badge">Modo 1</span>
      </div>
      <div class="mode-card" onclick="openContent('${key}','audio')">
        <div class="mode-icon">🎧</div>
        <div class="mode-name">Auditivo</div>
        <div class="mode-desc">Podcast + lector TTS avanzado</div>
        <span class="mode-badge">Modo 2</span>
      </div>
      <div class="mode-card" onclick="openContent('${key}','reading')">
        <div class="mode-icon">📖</div>
        <div class="mode-name">Lectura / Escritura</div>
        <div class="mode-desc">Leer y escribir lo aprendido</div>
        <span class="mode-badge">Modo 3</span>
      </div>
      <div class="mode-card" onclick="openContent('${key}','kinesthetic')">
        <div class="mode-icon">📺</div>
        <div class="mode-name">Cinestésico</div>
        <div class="mode-desc">Videotutoriales del equipo</div>
        <span class="mode-badge">Modo 4</span>
      </div>
      <div class="mode-card" onclick="openContent('${key}','games')">
        <div class="mode-icon">🎮</div>
        <div class="mode-name">Videojuegos</div>
        <div class="mode-desc">3 juegos por módulo</div>
        <span class="mode-badge">Modo 5</span>
      </div>
    </div>
  `;
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-module').classList.add('active');
  document.getElementById('topbar-title').textContent = m.name;
}

// ===========================
// CONTENT MODES
// ===========================
let currentCard = 0;

function openContent(key, mode) {
  currentModule = key;
  ttsStop();
  const m = MODULES[key];
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-content').classList.add('active');
  document.getElementById('topbar-title').textContent = getModeTitle(mode);

  let html = `<button class="back-btn" onclick="openModule('${key}')">← Volver a ${m.name}</button>`;

  if (mode === 'visual') {
    const cards = FLASHCARDS[key] || FLASHCARDS.s;
    currentCard = 0;
    html += renderFlashcards(cards, key);
  } else if (mode === 'audio') {
    html += renderPodcast(key);
  } else if (mode === 'reading') {
    html += renderReadingWriting(key);
  } else if (mode === 'kinesthetic') {
    html += renderKinesthetic(key);
  } else if (mode === 'games') {
    html += renderGames(key);
  }

  document.getElementById('content-view').innerHTML = html;
  if (speechSynthesis.getVoices().length === 0) {
    setTimeout(loadTTSVoices, 500);
  }
}

function getModeTitle(mode) {
  return { visual:'Flashcards 🖼️', audio:'Podcast 🎧', reading:'Lectura/Escritura 📖', kinesthetic:'Videotutoriales 📺', games:'Videojuegos 🎮' }[mode] || 'Contenido';
}

function renderFlashcards(cards, key) {
  const c = cards[0];
  return `
    <div class="flashcard-container">
      <p style="color:var(--text-muted);font-size:14px;margin-bottom:16px">Hacé clic en la tarjeta para ver la definición</p>
      <div class="flashcard" id="fc" onclick="document.getElementById('fc').classList.toggle('flipped')">
        <div class="flashcard-inner">
          <div class="card-face card-front">
            <div class="card-emoji">${c.emoji}</div>
            <div class="card-word">${c.word}</div>
          </div>
          <div class="card-face card-back">
            <div class="card-word" style="color:var(--primary);font-size:22px;margin-bottom:12px">${c.word}</div>
            <div class="card-def">${c.def}</div>
          </div>
        </div>
      </div>
      <div class="flashcard-nav">
        <button class="fc-btn" onclick="prevCard('${key}')">←</button>
        <span class="fc-count" id="fc-count">1 / ${cards.length}</span>
        <button class="fc-btn" onclick="nextCard('${key}')">→</button>
      </div>
      <button onclick="addXP('${key}', 20);showToast('¡Tarjeta completada! +20 XP 🎉','success')" style="margin-top:20px;background:var(--primary);color:white;border:none;padding:12px 24px;border-radius:100px;font-family:'Nunito',sans-serif;font-weight:700;cursor:pointer;">✓ Completar tarjeta</button>
    </div>`;
}

function nextCard(key) {
  const cards = (typeof getLevelCards === 'function') ? getLevelCards(key) : (FLASHCARDS[key] || FLASHCARDS.s);
  currentCard = (currentCard + 1) % cards.length;
  updateCard(cards, key);
}
function prevCard(key) {
  const cards = (typeof getLevelCards === 'function') ? getLevelCards(key) : (FLASHCARDS[key] || FLASHCARDS.s);
  currentCard = (currentCard - 1 + cards.length) % cards.length;
  updateCard(cards, key);
}
function updateCard(cards, key) {
  const c = cards[currentCard];
  const fc = document.getElementById('fc');
  if (!fc) return;
  fc.classList.remove('flipped');
  const emojiEl = fc.querySelector('.card-emoji');
  if (emojiEl) emojiEl.textContent = c.emoji;
  const frontWord = fc.querySelector('.card-front .card-word');
  if (frontWord) frontWord.textContent = c.word;
  const back = fc.querySelector('.card-back');
  if (back) {
    const backWord = back.querySelector('.card-word');
    const backDef = back.querySelector('.card-def');
    if (backWord) backWord.textContent = c.word;
    if (backDef) backDef.textContent = c.def;
  }
  document.getElementById('fc-count').textContent = `${currentCard+1} / ${cards.length}`;
}

function renderPodcast(key) {
  const m = MODULES[key];
  const texts = {
    s: 'Los seres vivos están compuestos por células, la unidad fundamental de la vida. Cada célula contiene ADN con la información genética necesaria para el desarrollo y funcionamiento del organismo. Las células se dividen para crecer y repararse.',
    t: 'Los algoritmos son conjuntos de instrucciones paso a paso que resuelven problemas específicos. En informática, son la base de todo programa y aplicación que usamos a diario en computadoras y teléfonos.',
    e: 'La ingeniería combina ciencia y matemáticas para diseñar estructuras y sistemas. Los puentes, edificios y máquinas son ejemplos de soluciones de ingeniería a problemas del mundo real.',
    a: 'El arte es una forma de expresión humana que comunica emociones e ideas. A través de la pintura, la escultura, la música y otras formas, los artistas crean experiencias únicas para el espectador.',
    m: 'Las matemáticas son el lenguaje universal de la ciencia. Los números, figuras geométricas y ecuaciones nos ayudan a describir y comprender el mundo que nos rodea con precisión.',
  };
  const ttsId = 'podcast-' + key;
  return `
    <div class="podcast-player">
      <div class="podcast-cover" style="background:${m.barColor}">${m.emoji}</div>
      <div class="podcast-title">Episodio: ${m.name}</div>
      <div class="podcast-episode">Introducción al módulo · 8 min</div>
      <div class="podcast-progress">
        <div class="podcast-progress-fill" id="pod-progress"></div>
      </div>
      <div class="podcast-time"><span>2:48</span><span>8:00</span></div>
      <div class="podcast-controls">
        <button class="pod-btn" onclick="showToast('⏮ Anterior')">⏮</button>
        <button class="pod-btn play" id="play-btn" onclick="togglePlay()">▶</button>
        <button class="pod-btn" onclick="showToast('⏭ Siguiente')">⏭</button>
      </div>
    </div>
    <div class="tts-section">
      <p style="font-weight:800;margin-bottom:12px;color:var(--text)">📢 Lector de texto (TTS) — Voz femenina</p>
      ${buildTTSControls(ttsId, texts[key])}
      <button onclick="addXP('${key}',25);showToast('¡Episodio completado! +25 XP 🎉','success')" style="margin-top:14px;background:var(--success);color:white;border:none;padding:10px 20px;border-radius:100px;font-family:'Nunito',sans-serif;font-weight:700;cursor:pointer;">✓ Completado +25XP</button>
    </div>`;
}

let podPlaying = false;
let podInterval;
function togglePlay() {
  podPlaying = !podPlaying;
  document.getElementById('play-btn').textContent = podPlaying ? '⏸' : '▶';
  if (podPlaying) {
    let pct = 35;
    podInterval = setInterval(() => {
      pct = Math.min(pct + 0.5, 100);
      const el = document.getElementById('pod-progress');
      if (el) el.style.width = pct + '%';
      else clearInterval(podInterval);
    }, 100);
  } else {
    clearInterval(podInterval);
  }
}

function renderReadingWriting(key) {
  const texts = {
    s: '<strong>Las células</strong> son la unidad básica de la vida. Todos los seres vivos están formados por células. Existen organismos unicelulares (formados por una sola célula) y pluricelulares (formados por muchas células). Las células tienen una membrana que las protege, un citoplasma donde ocurren las reacciones químicas, y un núcleo que contiene el ADN.',
    t: '<strong>Los algoritmos</strong> son secuencias de instrucciones bien definidas que permiten resolver un problema. Todo programa de computadora es, en esencia, un algoritmo. Los algoritmos tienen: entrada (datos que recibe), proceso (operaciones que realiza) y salida (resultado que produce).',
    e: '<strong>Las estructuras</strong> en ingeniería son sistemas diseñados para soportar cargas. Existen estructuras de barras, de cables y de superficies. El diseño estructural busca equilibrar resistencia, rigidez y economía de materiales.',
    a: '<strong>La composición</strong> en arte es la organización de elementos visuales en una obra. Incluye el equilibrio, la proporción, el ritmo y la armonía. Una buena composición guía la mirada del espectador por toda la obra.',
    m: '<strong>Las fracciones</strong> representan partes iguales de un todo. El número de arriba se llama numerador e indica cuántas partes tomamos. El número de abajo se llama denominador e indica en cuántas partes iguales está dividido el todo.',
  };
  return `
    <div class="reading-writing">
      <div class="material-text">${texts[key]}</div>
      <div class="writing-area">
        <div class="writing-label">✏️ Escribí lo que entendiste con tus palabras:</div>
        <textarea id="writing-input" placeholder="Escribí aquí tu resumen..."></textarea>
        <br>
        <button class="submit-writing" id="submit-writing-btn" onclick="submitWriting('${key}')">
          Enviar y evaluar ✓
        </button>
        <div id="writing-feedback"></div>
      </div>
    </div>`;
}

async function submitWriting(key) {
  const text = document.getElementById('writing-input').value.trim();
  const feedbackBox = document.getElementById('writing-feedback');
  const btn = document.getElementById('submit-writing-btn');
  if (text.length < 20) { showToast('Escribí al menos 20 caracteres'); return; }

  // Show loading spinner (from v2)
  feedbackBox.className = 'feedback-result';
  feedbackBox.innerHTML = '<span class="loading-spinner"></span> Analizando tu respuesta...';
  btn.disabled = true;

  await new Promise(r => setTimeout(r, 1500)); // simulate evaluation

  const score = Math.min(100, Math.round(text.length / 3));
  const nivel = score >= 70 ? 'Muy bueno' : score >= 45 ? 'Bueno' : 'En desarrollo';
  const msg = score >= 70
    ? '¡Excelente trabajo! Captaste la idea principal con claridad y usaste palabras precisas.'
    : score >= 45
    ? 'Buen intento. Incluí más detalles sobre el "por qué" para mejorar tu explicación.'
    : 'Seguí practicando. Intentá incluir las ideas principales del texto.';

  feedbackBox.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
      <strong>Puntaje: ${score}/100</strong>
      <span style="background:#e0e7ff;color:#3730a3;padding:3px 10px;border-radius:999px;font-size:12px;font-weight:700">${nivel}</span>
    </div>
    <p style="margin-bottom:6px">💬 <strong>Feedback:</strong> ${msg}</p>
    <p style="color:var(--text-muted);font-size:13px">📌 <strong>Siguiente paso:</strong> Revisá las flashcards visuales para reforzar conceptos clave.</p>
  `;

  addXP(key, 30);
  document.getElementById('writing-input').disabled = true;
  btn.textContent = `✓ Evaluado: ${score}/100`;
  btn.style.background = 'var(--success)';
  showToast(`¡Muy bien! Puntuación: ${score}/100 · +30 XP 🎉`, 'success');
  spawnSparkles();
}

function renderKinesthetic(key) {
  const m = MODULES[key];
  const videos = {
    s: 'https://www.youtube.com/embed/VjUSOaDEVhc',
    t: 'https://www.youtube.com/embed/Cr6PTM6xChg',
    e: 'https://www.youtube.com/embed/Qo-4MFaX0mI',
    a: 'https://www.youtube.com/embed/3pJDuHhMhbE',
    m: 'https://www.youtube.com/embed/Ougn7xr9RBg',
  };
  return `
    <div style="max-width:700px;margin:0 auto">
      <p style="color:var(--text-muted);margin-bottom:20px">📺 Videotutorial producido por el equipo de <strong>${m.name}</strong></p>
      <div style="border-radius:16px;overflow:hidden;box-shadow:var(--shadow-lg);background:#000;aspect-ratio:16/9;display:flex;align-items:center;justify-content:center">
        <iframe width="100%" height="100%" src="${videos[key]}" frameborder="0" allowfullscreen style="display:block"></iframe>
      </div>
      <div style="margin-top:20px;background:var(--surface);border-radius:16px;padding:24px;box-shadow:var(--shadow)">
        <p style="font-weight:800;margin-bottom:8px;color:var(--text)">Sobre este video</p>
        <p style="color:var(--text-muted);font-size:14px;line-height:1.6">Este videotutorial cubre los conceptos fundamentales de ${m.name}. Observá atentamente cada paso y tomá nota de los puntos más importantes.</p>
        <button onclick="addXP('${key}',35);showToast('¡Video completado! +35 XP 🎉','success');spawnSparkles()" style="margin-top:16px;background:var(--primary);color:white;border:none;padding:12px 24px;border-radius:100px;font-family:'Nunito',sans-serif;font-weight:700;cursor:pointer;">✓ Marcar como visto</button>
      </div>
    </div>`;
}

function renderGames(key) {
  const m = MODULES[key];
  const gameSets = {
    s: [{ icon:'🧪', name:'Laboratorio virtual', desc:'Realizá experimentos seguros en tu pantalla' },
        { icon:'🔭', name:'Explorador del cosmos', desc:'Descubrí planetas y estrellas del universo' },
        { icon:'🧬', name:'Puzzle genético', desc:'Arma cadenas de ADN y aprende genética' }],
    t: [{ icon:'🤖', name:'Programá tu robot', desc:'Enseñale a tu robot a moverse con código' },
        { icon:'🌐', name:'Constructor web', desc:'Construí tu primera página web arrastrando bloques' },
        { icon:'🔐', name:'Hackea el laberinto', desc:'Resolvé acertijos de lógica computacional' }],
    e: [{ icon:'🏗️', name:'Arquitecto junior', desc:'Diseñá estructuras que soporten el peso máximo' },
        { icon:'⚡', name:'Circuitos locos', desc:'Conectá componentes para encender la ciudad' },
        { icon:'🚀', name:'Lanzador espacial', desc:'Calculá la trayectoria perfecta del cohete' }],
    a: [{ icon:'🎨', name:'Estudio de pintura', desc:'Creá obras maestras con colores y formas' },
        { icon:'🎵', name:'Compositor digital', desc:'Componé melodías arrastrando notas musicales' },
        { icon:'📸', name:'Fotógrafo artístico', desc:'Encuadrá la foto perfecta con reglas de composición' }],
    m: [{ icon:'🔢', name:'Cazador de números', desc:'Atrapá operaciones matemáticas antes que caigan' },
        { icon:'📐', name:'Geometría 3D', desc:'Construí figuras geométricas en el espacio' },
        { icon:'💰', name:'Tienda de fracciones', desc:'Administrá una tienda usando fracciones y porcentajes' }],
  };
  const games = gameSets[key] || gameSets.s;
  return `
    <p style="color:var(--text-muted);margin-bottom:20px">🎮 3 juegos disponibles en <strong>${m.name}</strong></p>
    <div class="games-grid">
      ${games.map(g => `
        <div class="game-card">
          <div class="game-icon">${g.icon}</div>
          <div class="game-name">${g.name}</div>
          <div class="game-desc">${g.desc}</div>
          <button class="play-game-btn" onclick="launchGame('${key}','${g.name}')">▶ Jugar</button>
        </div>`).join('')}
    </div>`;
}

function launchGame(key, name) {
  addXP(key, 40);
  showToast(`¡Iniciando ${name}! +40 XP 🎮`, 'success');
  spawnSparkles();
}

// ===========================
// XP & LEVELS
// ===========================
async function addXP(key, amount) {
  if (!currentUser) return;
  const p = currentUser.progress[key];
  p.xp += amount;
  currentUser.totalXp = (currentUser.totalXp || 0) + amount;
  while (p.xp >= p.maxXp) {
    p.xp -= p.maxXp;
    p.level++;
    p.maxXp = Math.round(p.maxXp * 1.3);
    showToast(`¡Subiste a Nivel ${p.level} en ${MODULES[key].name}! 🎉`, 'success');
    spawnSparkles();
    checkAchievements(key);
  }
  await dbPut('users', currentUser);
  renderHome();
}

function showMcAchievement(achievement) {
  const toast = document.getElementById('mc-achievement-toast');
  const iconEl = document.getElementById('mc-ach-icon');
  const nameEl = document.getElementById('mc-ach-name');
  if (!toast || !iconEl || !nameEl) return;
  iconEl.textContent = achievement.icon;
  nameEl.textContent = achievement.name;
  toast.classList.add('show');
  spawnSparkles();
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 4000);
}

function checkAchievements(key) {
  if (!currentUser) return;
  currentUser.achievements = currentUser.achievements || [];
  const unlocked = currentUser.achievements;
  const gained = [];

  // first_login: siempre al entrar
  if (!unlocked.includes('first_login')) {
    unlocked.push('first_login');
    gained.push('first_login');
  }

  // módulo-nivel 2
  const map = { s:'science_1', t:'tech_1', a:'art_1', m:'math_1' };
  if (key && map[key]) {
    const ach = map[key];
    if (!unlocked.includes(ach) && (currentUser.progress[key]?.level || 0) >= 2) {
      unlocked.push(ach);
      gained.push(ach);
    }
  }

  // all_modules: visitó todos
  if (!unlocked.includes('all_modules') && typeof visitedModules !== 'undefined') {
    const allKeys = ['s','t','e','a','m'];
    if (allKeys.every(k => visitedModules.has(k))) {
      unlocked.push('all_modules');
      gained.push('all_modules');
    }
  }

  // Mostrar animación Minecraft para cada logro nuevo
  gained.forEach((id, i) => {
    const a = ACHIEVEMENTS.find(x => x.id === id);
    if (a) setTimeout(() => showMcAchievement(a), i * 4500);
  });
}

// ===========================
// PROFILE
// ===========================
function renderProfile() {
  if (!currentUser) return;
  const initials = currentUser.name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);
  document.getElementById('profile-avatar').textContent = initials;
  document.getElementById('profile-name').textContent = currentUser.name;
  document.getElementById('profile-email').textContent = currentUser.email;

  // Name edit button is in HTML directly (✏️ button next to profile-name)

  const totalLevel = Object.values(currentUser.progress).reduce((a,b) => a + b.level, 0);
  document.getElementById('profile-stats').innerHTML = `
    <div class="profile-stat"><div class="profile-stat-value">${currentUser.totalXp || 0}</div><div class="profile-stat-label">XP Total</div></div>
    <div class="profile-stat"><div class="profile-stat-value">${totalLevel}</div><div class="profile-stat-label">Nivel total</div></div>
    <div class="profile-stat"><div class="profile-stat-value">${currentUser.achievements.length}</div><div class="profile-stat-label">Logros</div></div>
  `;

  const keys = ['s','t','e','a','m'];
  document.getElementById('steam-levels').innerHTML = keys.map(k => {
    const m = MODULES[k];
    const p = currentUser.progress[k];
    return `<div class="level-card">
      <div class="level-letter" style="color:${m.barColor}">${m.letter}</div>
      <div class="level-area">${m.name}</div>
      <div class="level-badge" style="background:${m.barColor}">Nivel ${p.level}</div>
      <div class="level-xp">${p.xp} / ${p.maxXp} XP</div>
    </div>`;
  }).join('');

  document.getElementById('profile-progress').innerHTML = keys.map(k => {
    const m = MODULES[k];
    const p = currentUser.progress[k];
    const pct = Math.round((p.xp / p.maxXp) * 100);
    return `<div class="card" style="margin-bottom:12px">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px">
        <span style="font-size:24px">${m.emoji}</span>
        <span style="font-weight:800;color:var(--text)">${m.name}</span>
        <span style="color:var(--text-muted);font-size:13px">Nivel ${p.level}</span>
      </div>
      <div class="progress-bar-wrap" style="height:12px">
        <div class="progress-bar" style="width:${pct}%;background:${m.barColor}"></div>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--text-muted);margin-top:4px">
        <span>${p.xp} XP</span><span>${p.maxXp} XP</span>
      </div>
    </div>`;
  }).join('');
}

// ===========================
// ACHIEVEMENTS
// ===========================
function renderAchievements() {
  const unlocked = currentUser?.achievements || [];
  document.getElementById('achievements-grid').innerHTML = ACHIEVEMENTS.map(a => {
    const isUnlocked = unlocked.includes(a.id);
    return `<div class="achievement-card ${isUnlocked ? '' : 'locked'}">
      <div class="ach-icon">${a.icon}</div>
      <div class="ach-name">${a.name}</div>
      <div class="ach-desc">${a.desc}</div>
      ${isUnlocked ? '<span class="ach-unlocked">✓ Desbloqueado</span>' : '<span class="ach-locked-label">🔒 Bloqueado</span>'}
    </div>`;
  }).join('');
}

// ===========================
// SETTINGS
// ===========================
function loadSettingsUI() {
  if (!currentUser) return;
  const s = currentUser.settings || {};
  document.getElementById('toggle-daltonismo').checked = !!s.daltonismo;
  document.getElementById('toggle-contraste').checked = !!s.contraste;
  document.getElementById('toggle-estimulos').checked = !!s.estimulos;
  document.getElementById('toggle-velocidad').checked = !!s.velocidad;
  document.getElementById('toggle-darkmode').checked = !!s.darkmode;
}

function loadSettings() {
  if (!currentUser) return;
  loadSettingsUI();
  applyAccessibility();
  if (currentUser.settings?.darkmode) {
    document.body.classList.add('dark-mode');
    document.getElementById('dark-btn').textContent = '☀️';
  }
}

async function saveSettings() {
  if (!currentUser) return;
  currentUser.settings = {
    daltonismo: document.getElementById('toggle-daltonismo').checked,
    contraste: document.getElementById('toggle-contraste').checked,
    estimulos: document.getElementById('toggle-estimulos').checked,
    velocidad: document.getElementById('toggle-velocidad').checked,
    darkmode: document.getElementById('toggle-darkmode')?.checked || false,
  };
  await dbPut('users', currentUser);
}

function applyAccessibility() {
  saveSettings();
  const body = document.body;
  body.classList.toggle('daltonismo', document.getElementById('toggle-daltonismo')?.checked);
  body.classList.toggle('alto-contraste', document.getElementById('toggle-contraste')?.checked);
  body.classList.toggle('reducir-estimulos', document.getElementById('toggle-estimulos')?.checked);
}

// ===========================
// HELPERS
// ===========================
function showError(id, msg) {
  const el = document.getElementById(id);
  el.textContent = msg;
  el.classList.add('visible');
}

function showToast(msg, type = '') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast show' + (type ? ' ' + type : '');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 3000);
}

function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

function handleFileUpload() {
  const file = document.getElementById('file-input').files[0];
  if (!file) { showToast('Seleccioná un archivo'); return; }
  closeModal('upload-modal');
  showToast(`✓ "${file.name}" subido y adaptando a los modos...`, 'success');
  setTimeout(() => showToast('✓ Material adaptado y disponible 🎉', 'success'), 2000);
}

function spawnSparkles() {
  const emojis = ['⭐','🌟','✨','🎉','💫'];
  for (let i = 0; i < 8; i++) {
    setTimeout(() => {
      const el = document.createElement('div');
      el.className = 'sparkle';
      el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      el.style.left = (20 + Math.random() * 60) + 'vw';
      el.style.top = (20 + Math.random() * 40) + 'vh';
      el.style.setProperty('--tx', (Math.random() * 100 - 50) + 'px');
      el.style.setProperty('--ty', (-(Math.random() * 100 + 50)) + 'px');
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 900);
    }, i * 80);
  }
}

async function logout() {
  ttsStop();
  currentUser = null;
  await dbDelete('sessions', 'current');
  document.body.className = '';
  showScreen('landing');
  showToast('Sesión cerrada');
}

// Keyboard enter support
document.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    const active = document.querySelector('.screen.active');
    if (active?.id === 'screen-login') handleLogin();
    if (active?.id === 'screen-register') handleRegister();
  }
});

// Mobile sidebar overlay close
document.addEventListener('click', e => {
  const sidebar = document.getElementById('sidebar');
  if (sidebar?.classList.contains('mobile-open') && !sidebar.contains(e.target)) {
    sidebar.classList.remove('mobile-open');
  }
});
</script>
<script>
// ==========================================================
// FOCUSLEARN V3 - FUNCIONALIDAD OFFLINE CON LOCALSTORAGE
// Mantiene el diseño actual y agrega lógica modular.
// ==========================================================

