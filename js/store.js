const FL_STORE = {
  users: 'users',
  session: 'focuslearn_session',
  currentProfile: 'user_profiles',
  profilesMap: 'focuslearn_profiles_by_user',
  progressMap: 'focuslearn_progress_by_user',
  currentProgress: 'user_progress',
  evalResults: 'EVALUACION_INICIAL_RESULTS',
  parentUploads: 'focuslearn_parent_uploads'
};

const AREA_BY_KEY = { s:'science', t:'tech', e:'eng', a:'arts', m:'math' };
const KEY_BY_AREA = { science:'s', technology:'t', engineering:'e', arts:'a', math:'m' };

const FL_EVAL_QUESTIONS = [
  { area:'science', q:'¿Qué necesita una planta para crecer?', correct:1, options:['Piedras y arena','Agua, luz y aire','Sombra y pintura','Viento y papel'] },
  { area:'science', q:'¿Cuál es la unidad básica de los seres vivos?', correct:2, options:['Molécula','Órgano','Célula','Sistema'] },
  { area:'science', q:'¿Qué estudia la astronomía?', correct:0, options:['Astros y espacio','Colores y formas','Letras y signos','Sonidos y ritmos'] },
  { area:'science', q:'¿Qué pasa cuando el agua se calienta mucho?', correct:1, options:['Se solidifica','Se evapora','Se oscurece','Se congela'] },
  { area:'science', q:'¿Qué órgano bombea la sangre?', correct:3, options:['Pulmón','Estómago','Cerebro','Corazón'] },
  { area:'technology', q:'¿Qué es un algoritmo?', correct:0, options:['Pasos ordenados','Imagen digital','Comida rápida','Canción corta'] },
  { area:'technology', q:'¿Para qué sirve una contraseña?', correct:2, options:['Decorar pantalla','Imprimir textos','Proteger cuenta','Subir volumen'] },
  { area:'technology', q:'¿Qué dispositivo permite escribir en la computadora?', correct:1, options:['Parlante','Teclado','Monitor','Cargador'] },
  { area:'technology', q:'¿Qué es internet?', correct:3, options:['Mesa de trabajo','Lápiz digital','Batería externa','Red de datos'] },
  { area:'technology', q:'¿Qué hace un programa?', correct:0, options:['Sigue órdenes','Dibuja solo','Come datos','Duerme archivos'] },
  { area:'engineering', q:'¿Qué busca la ingeniería?', correct:2, options:['Copiar dibujos','Guardar poemas','Crear soluciones','Romper objetos'] },
  { area:'engineering', q:'¿Qué debe tener un puente seguro?', correct:1, options:['Mucho color','Buena base','Solo papel','Poco apoyo'] },
  { area:'engineering', q:'¿Qué es un circuito?', correct:0, options:['Camino eléctrico','Animal pequeño','Pintura seca','Sonido fuerte'] },
  { area:'engineering', q:'¿Qué material suele ser fuerte para construir?', correct:3, options:['Algodón','Cartón','Plástico','Acero'] },
  { area:'engineering', q:'¿Por qué se prueban los prototipos?', correct:2, options:['Para esconderlos','Para venderlos','Para mejorarlos','Para borrarlos'] },
  { area:'arts', q:'¿Qué expresa el arte?', correct:1, options:['Datos exactos','Ideas y emoción','Claves secretas','Cables sueltos'] },
  { area:'arts', q:'¿Qué es una composición visual?', correct:3, options:['Regla numérica','Ruido fuerte','Archivo simple','Orden visual'] },
  { area:'arts', q:'¿Qué se usa para crear ritmo en una imagen?', correct:0, options:['Formas repetidas','Silencio total','Carga eléctrica','Clave privada'] },
  { area:'arts', q:'¿Qué hace un color cálido?', correct:2, options:['Apaga tonos','Congela formas','Da energía','Calcula sumas'] },
  { area:'arts', q:'¿Qué es la perspectiva?', correct:1, options:['Tipo de tecla','Ver profundidad','Batería llena','Parte celular'] },
  { area:'math', q:'¿Qué representa una fracción?', correct:0, options:['Partes iguales','Color primario','Planeta lejano','Melodía suave'] },
  { area:'math', q:'¿Cuánto es 5 + 7?', correct:2, options:['10','11','12','13'] },
  { area:'math', q:'¿Qué figura tiene tres lados?', correct:1, options:['Cuadrado','Triángulo','Círculo','Pentágono'] },
  { area:'math', q:'¿Qué indica el denominador?', correct:3, options:['Partes tomadas','Número final','Total pintado','Partes totales'] },
  { area:'math', q:'¿Qué es un porcentaje?', correct:0, options:['Parte de 100','Tipo de letra','Clase de célula','Formato de video'] }
];

let flEvalStep = 0;
let flEvalAnswers = {};
let flEvalTimes = [];
let flEvalStartedAt = 0;

function flRead(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function flWrite(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function flNormalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function flGetUsers() {
  return flRead(FL_STORE.users, []);
}

function flSaveUser(user) {
  const users = flGetUsers();
  const idx = users.findIndex(u => flNormalizeEmail(u.id || u.email) === flNormalizeEmail(user.email));
  const stored = {
    id: user.email,
    name: user.name,
    email: user.email,
    password: user.password,
    created_at: user.createdAt || user.created_at || new Date().toISOString()
  };
  if (idx >= 0) users[idx] = stored;
  else users.push(stored);
  flWrite(FL_STORE.users, users);
}

function flGetProfile(email) {
  const profiles = flRead(FL_STORE.profilesMap, {});
  return profiles[flNormalizeEmail(email)] || null;
}

function flSaveProfile(profile) {
  const profiles = flRead(FL_STORE.profilesMap, {});
  profiles[flNormalizeEmail(profile.user_id)] = profile;
  flWrite(FL_STORE.profilesMap, profiles);
  flWrite(FL_STORE.currentProfile, profile);
}

function flGetProgress(email) {
  const progressMap = flRead(FL_STORE.progressMap, {});
  return progressMap[flNormalizeEmail(email)] || null;
}

function flSaveProgress(progress) {
  const progressMap = flRead(FL_STORE.progressMap, {});
  progressMap[flNormalizeEmail(progress.user_id)] = progress;
  flWrite(FL_STORE.progressMap, progressMap);
  flWrite(FL_STORE.currentProgress, progress);
}

function flCreateProfile(email, conditions = []) {
  const learning = conditions.filter(c => !['daltonismo','baja-vision'].includes(c));
  const perception = conditions.filter(c => ['daltonismo','baja-vision'].includes(c));
  return {
    user_id: email,
    learning_disorders: learning,
    perception_disorders: perception,
    steam_scores: { science:0, tech:0, eng:0, arts:0, math:0 },
    speed_preference: 'normal',
    ui_settings: {
      daltonismo: perception.includes('daltonismo'),
      altoContraste: false,
      reducirEstimulos: learning.includes('autismo') || learning.includes('down'),
      velocidadLenta: false,
      modoOscuro: false
    }
  };
}

function flCreateProgress(email) {
  return {
    user_id: email,
    modules: {
      science: { activities_completed:0, points:50, level:1 },
      tech: { activities_completed:0, points:180, level:2 },
      eng: { activities_completed:0, points:20, level:1 },
      arts: { activities_completed:0, points:220, level:3 },
      math: { activities_completed:0, points:80, level:1 }
    },
    missions: {
      daily: { science:0, target:1 },
      weekly: { total_activities:0, target:5 }
    },
    total_points: 550,
    total_level: 8
  };
}

function flSyncLocalUser() {
  if (!currentUser) return;
  flSaveUser(currentUser);
  let profile = flGetProfile(currentUser.email) || flCreateProfile(currentUser.email, currentUser.conditions || []);
  profile.ui_settings = {
    daltonismo: !!currentUser.settings?.daltonismo,
    altoContraste: !!currentUser.settings?.contraste,
    reducirEstimulos: !!currentUser.settings?.estimulos,
    velocidadLenta: !!currentUser.settings?.velocidad,
    modoOscuro: !!currentUser.settings?.darkmode
  };
  flSaveProfile(profile);
  flSyncProgressFromCurrentUser();
}

function flSyncProgressFromCurrentUser() {
  if (!currentUser) return;
  const progress = flGetProgress(currentUser.email) || flCreateProgress(currentUser.email);
  const pairs = { s:'science', t:'tech', e:'eng', a:'arts', m:'math' };
  Object.entries(pairs).forEach(([key, area]) => {
    const p = currentUser.progress?.[key] || { xp:0, level:1 };
    progress.modules[area] = {
      activities_completed: progress.modules[area]?.activities_completed || 0,
      points: p.xp || 0,
      level: p.level || 1
    };
  });
  progress.total_points = currentUser.totalXp || 0;
  progress.total_level = Object.values(currentUser.progress || {}).reduce((sum, p) => sum + (p.level || 0), 0);
  flSaveProgress(progress);
}

function flApplyStoredProgressToUser() {
  if (!currentUser) return;
  const progress = flGetProgress(currentUser.email);
  if (!progress) return;
  const pairs = { science:'s', tech:'t', eng:'e', arts:'a', math:'m' };
  Object.entries(pairs).forEach(([area, key]) => {
    if (!currentUser.progress?.[key]) return;
    currentUser.progress[key].level = progress.modules[area]?.level || currentUser.progress[key].level;
    currentUser.progress[key].xp = progress.modules[area]?.points || currentUser.progress[key].xp;
  });
  currentUser.totalXp = progress.total_points || currentUser.totalXp;
}

// AUTH con localStorage
async function handleLogin() {
  const email = flNormalizeEmail(document.getElementById('login-email').value);
  const pass = document.getElementById('login-pass').value;
  if (!email || !pass) { showError('login-error', 'Completá todos los campos'); return; }

  let user = flGetUsers().find(u => flNormalizeEmail(u.email || u.id) === email);
  let fullUser = await dbGet('users', email);
  if (!fullUser && user) {
    fullUser = createNewUser(user.name, user.email, user.password);
  }
  const storedPass = user?.password || fullUser?.password;
  if (!fullUser || (storedPass !== btoa(pass) && storedPass !== pass)) {
    showError('login-error', 'Usuario o contraseña incorrectos');
    return;
  }

  currentUser = fullUser;
  currentUser.password = storedPass;
  flApplyStoredProgressToUser();
  localStorage.setItem(FL_STORE.session, email);
  await dbPut('users', currentUser);
  await dbPut('sessions', { id:'current', email });
  flSyncLocalUser();
  enterApp();
}

async function handleRegister() {
  const name = document.getElementById('reg-name').value.trim();
  const email = flNormalizeEmail(document.getElementById('reg-email').value);
  const pass = document.getElementById('reg-pass').value;
  if (!name || !email || !pass) { showError('register-error', 'Completá todos los campos'); return; }
  if (pass.length < 6) { showError('register-error', 'La contraseña debe tener al menos 6 caracteres'); return; }
  if (flGetUsers().some(u => flNormalizeEmail(u.email || u.id) === email) || await dbGet('users', email)) {
    showError('register-error', 'Ya existe una cuenta con ese email');
    return;
  }

  currentUser = createNewUser(name, email, btoa(pass));
  localStorage.setItem(FL_STORE.session, email);
  await dbPut('users', currentUser);
  await dbPut('sessions', { id:'current', email });
  flSyncLocalUser();
  showScreen('conditions');
}

async function handleGoogleLogin() {
  const name = prompt('Simulación de Google Login\nIngresá tu nombre:');
  if (!name) return;
  const email = flNormalizeEmail(name.replace(/\s/g,'') + '@gmail.com');
  let stored = flGetUsers().find(u => flNormalizeEmail(u.email || u.id) === email);
  currentUser = await dbGet('users', email) || createNewUser(name, email, stored?.password || btoa('google-demo'));
  await dbPut('users', currentUser);
  localStorage.setItem(FL_STORE.session, email);
  await dbPut('sessions', { id:'current', email });
  flSyncLocalUser();
  stored ? enterApp() : showScreen('conditions');
}

function createNewUser(name, email, password = null) {
  return {
    email: flNormalizeEmail(email),
    name,
    password: password || btoa('focuslearn123'),
    createdAt: new Date().toISOString(),
    conditions: [],
    evalAnswers: {},
    progress: {
      s:{level:1,xp:50,maxXp:300},
      t:{level:2,xp:180,maxXp:300},
      e:{level:1,xp:20,maxXp:300},
      a:{level:3,xp:220,maxXp:300},
      m:{level:1,xp:80,maxXp:300}
    },
    achievements: ['first_login'],
    totalXp: 550,
    settings: { daltonismo:false, contraste:false, estimulos:false, velocidad:false, darkmode:false }
  };
}

async function handleConditions() {
  const checked = [...document.querySelectorAll('#screen-conditions input[type=checkbox]:checked')].map(i => i.value);
  currentUser.conditions = checked;
  currentUser.settings = currentUser.settings || {};
  currentUser.settings.daltonismo = checked.includes('daltonismo');
  currentUser.settings.estimulos = checked.includes('autismo') || checked.includes('down');
  const profile = flCreateProfile(currentUser.email, checked);
  flSaveProfile(profile);
  flSyncLocalUser();
  await dbPut('users', currentUser);
  showToast('Vamos a conocer tu nivel STEAM inicial', 'success');
  startEvaluation();
}

// Evaluación inicial: aparece siempre después de configurar perfil.
// Mide conocimiento inicial en cada sigla STEAM con 5 preguntas por área.
function startEvaluation() {
  flEvalStep = 0;
  flEvalAnswers = {};
  flEvalTimes = [];
  flEvalStartedAt = Date.now();
  showScreen('evaluation');
  renderEvalQuestion();
}

function renderEvalQuestion() {
  const total = FL_EVAL_QUESTIONS.length;
  document.getElementById('eval-progress').innerHTML = Array.from({ length: total }, (_, i) =>
    `<div class="eval-dot ${i <= flEvalStep ? 'done' : ''}"></div>`
  ).join('');

  const q = FL_EVAL_QUESTIONS[flEvalStep];
  const opts = q.options.map((label, i) =>
    `<div class="eval-option ${flEvalAnswers[flEvalStep] === i ? 'selected' : ''}" role="button" tabindex="0" aria-label="${label}" onclick="selectEvalOption(${i})">
      <div class="option-icon">${i === 0 ? '🔹' : i === 1 ? '🔸' : i === 2 ? '⭐' : '✅'}</div>
      <div>${label}</div>
    </div>`
  ).join('');

  document.getElementById('eval-content').innerHTML = `
    <div class="eval-question">${flEvalStep + 1}. ${q.q}</div>
    <div class="eval-options">${opts}</div>
    <div style="margin-top:24px;display:flex;justify-content:flex-end">
      <button class="btn-full" style="width:auto;padding:14px 32px;" onclick="nextEval()">
        ${flEvalStep < total - 1 ? 'Siguiente →' : 'Finalizar ✓'}
      </button>
    </div>
  `;
}

function selectEvalOption(i) {
  flEvalAnswers[flEvalStep] = i;
  renderEvalQuestion();
}

async function nextEval() {
  if (flEvalAnswers[flEvalStep] === undefined) { showToast('Seleccioná una opción'); return; }
  flEvalTimes[flEvalStep] = Math.max(1, Math.round((Date.now() - flEvalStartedAt) / 1000));

  if (flEvalStep < FL_EVAL_QUESTIONS.length - 1) {
    flEvalStep++;
    flEvalStartedAt = Date.now();
    renderEvalQuestion();
    return;
  }

  const results = flBuildEvaluationResults();
  currentUser.evalAnswers = flEvalAnswers;
  currentUser.evaluationResults = results;
  flApplyEvaluationScoresToProgress(results);
  const profile = flGetProfile(currentUser.email) || flCreateProfile(currentUser.email, currentUser.conditions || []);
  profile.steam_scores = {
    science: results.science,
    tech: results.technology,
    eng: results.engineering,
    arts: results.arts,
    math: results.math
  };
  profile.speed_preference = results.speed.includes('lento') ? 'slow' : 'normal';
  flSaveProfile(profile);
  flWrite(FL_STORE.evalResults, results);
  flSyncLocalUser();
  await dbPut('users', currentUser);
  showToast('¡Perfil configurado! 🎉', 'success');
  setTimeout(() => enterApp(), 700);
}

function flBuildEvaluationResults() {
  const byArea = { science:{ok:0,total:0}, technology:{ok:0,total:0}, engineering:{ok:0,total:0}, arts:{ok:0,total:0}, math:{ok:0,total:0} };
  const misconceptions = [];
  FL_EVAL_QUESTIONS.forEach((q, idx) => {
    byArea[q.area].total++;
    if (flEvalAnswers[idx] === q.correct) byArea[q.area].ok++;
    else misconceptions.push(q.area === 'math' ? 'porcentajes' : q.area === 'science' ? 'densidad' : q.area);
  });
  const score = area => Math.round((byArea[area].ok / byArea[area].total) * 10);
  const avg = flEvalTimes.reduce((a,b) => a + b, 0) / Math.max(flEvalTimes.length, 1);
  const speed = avg < 15 ? 'rápido' : avg <= 30 ? 'medio' : 'lento';
  const level = n => n >= 8 ? 'avanzado' : n >= 5 ? 'medio-alto' : 'básico';
  const knowledgeBySteam = {
    S: { area: 'Science', score: score('science'), level: level(score('science')) },
    T: { area: 'Technology', score: score('technology'), level: level(score('technology')) },
    E: { area: 'Engineering', score: score('engineering'), level: level(score('engineering')) },
    A: { area: 'Arts', score: score('arts'), level: level(score('arts')) },
    M: { area: 'Maths', score: score('math'), level: level(score('math')) }
  };
  const results = {
    user_id: currentUser.email,
    science: score('science'),
    technology: score('technology'),
    engineering: score('engineering'),
    arts: score('arts'),
    math: score('math'),
    knowledge_by_steam: knowledgeBySteam,
    speed,
    time_per_question: flEvalTimes,
    misconceptions: [...new Set(misconceptions)].slice(0, 4),
    levels: {},
    ui: {
      pace: speed === 'lento' ? '0.8x' : '1.0x',
      colors: currentUser.settings?.daltonismo ? 'daltonismo' : 'standard',
      stimuli: currentUser.settings?.estimulos ? 'reduced' : 'normal'
    },
    completed_at: new Date().toISOString()
  };
  results.levels = {
    science: level(results.science),
    technology: level(results.technology),
    engineering: level(results.engineering),
    arts: level(results.arts),
    math: level(results.math)
  };
  return results;
}

function flApplyEvaluationScoresToProgress(results) {
  if (!currentUser) return;
  const scoreMap = {
    s: results.science,
    t: results.technology,
    e: results.engineering,
    a: results.arts,
    m: results.math
  };
  Object.entries(scoreMap).forEach(([key, score]) => {
    const normalizedScore = Math.max(0, Math.min(10, Number(score) || 0));
    const level = Math.max(1, Math.min(5, Math.ceil(normalizedScore / 2) || 1));
    const xp = normalizedScore * 30;
    currentUser.progress[key] = currentUser.progress[key] || { level:1, xp:0, maxXp:300 };
    currentUser.progress[key].level = level;
    currentUser.progress[key].xp = xp;
    currentUser.progress[key].maxXp = 300;
  });
  currentUser.totalXp = Object.values(currentUser.progress).reduce((total, item) => total + (item.xp || 0), 0);
  flSyncProgressFromCurrentUser();
}

// TTS avanzado con voz española preferente y velocidades discretas
function loadTTSVoices() {
  const voices = synth.getVoices();
  ttsVoice = voices.find(v => /^es/i.test(v.lang) && /monica|mónica|elena|paulina|paula|lucia|lucía|sofia|sofía|female|mujer/i.test(v.name))
    || voices.find(v => /^es/i.test(v.lang))
    || null
    || null;
}

function flDefaultTTSSpeed() {
  const profile = currentUser ? flGetProfile(currentUser.email) : null;
  const disorders = [...(profile?.learning_disorders || []), ...(profile?.perception_disorders || []), ...(currentUser?.conditions || [])].map(x => String(x).toLowerCase());
  return currentUser?.settings?.velocidad || disorders.includes('dislexia') || disorders.includes('daltonismo') ? 0.8 : 1;
}

function ttsUpdateSpeedUI(containerId) {
  const val = document.getElementById('tts-speed-' + containerId);
  const label = document.getElementById('tts-speed-val-' + containerId);
  if (val) ttsSpeed = parseFloat(val.value);
  if (label) label.textContent = ttsSpeed.toFixed(1) + 'x';
  if (ttsPlaying || synth.paused) {
    ttsStop();
    setTimeout(() => ttsPlay(containerId), 180);
  }
}

function ttsPlay(containerId) {
  if (!ttsVoice) loadTTSVoices();
  const textEl = document.getElementById('tts-text-' + containerId);
  if (!textEl) return;
  synth.cancel();
  ttsUtterance = new SpeechSynthesisUtterance(textEl.textContent);
  if (ttsVoice) ttsUtterance.voice = ttsVoice;
  ttsUtterance.rate = ttsSpeed || flDefaultTTSSpeed();
  ttsUtterance.pitch = 1.05;
  ttsUtterance.lang = ttsVoice?.lang || 'es-ES';
  ttsUtterance.onstart = () => { ttsPlaying = true; ttsUpdateBtnUI(containerId); };
  ttsUtterance.onend = () => { ttsPlaying = false; ttsUpdateBtnUI(containerId); };
  ttsUtterance.onerror = () => { ttsPlaying = false; ttsUpdateBtnUI(containerId); };
  synth.speak(ttsUtterance);
}

function ttsToggle(containerId) {
  if (!synth.speaking) ttsPlay(containerId);
  else if (synth.paused) { synth.resume(); ttsPlaying = true; ttsUpdateBtnUI(containerId); }
  else { synth.pause(); ttsPlaying = false; ttsUpdateBtnUI(containerId); }
}

function ttsStop() {
  synth.cancel();
  ttsPlaying = false;
  document.querySelectorAll('[id^="tts-playbtn-"]').forEach(btn => { btn.textContent = '▶ Reproducir'; });
  document.querySelectorAll('[id^="tts-status-"]').forEach(s => { s.textContent = '✅ Listo para reproducir'; });
}

function ttsUpdateBtnUI(containerId) {
  const btn = document.getElementById('tts-playbtn-' + containerId);
  const status = document.getElementById('tts-status-' + containerId);
  if (btn) btn.textContent = ttsPlaying ? '⏸ Pausar' : (synth.speaking && synth.paused ? '▶ Reanudar' : '▶ Reproducir');
  if (status) status.textContent = ttsPlaying ? '🔊 Reproduciendo...' : (synth.speaking && synth.paused ? '⏸ En pausa' : '✅ Listo para reproducir');
}

function buildTTSControls(containerId, text) {
  ttsSpeed = flDefaultTTSSpeed();
  const speeds = [0.5, 0.8, 1, 1.2, 1.5, 2];
  return `
    <p id="tts-text-${containerId}" style="font-size:15px;line-height:1.75;color:var(--text);margin-bottom:14px">${text}</p>
    <div class="tts-controls">
      <button class="tts-btn" id="tts-playbtn-${containerId}" aria-label="Reproducir o pausar lectura" onclick="ttsToggle('${containerId}')">▶ Reproducir</button>
      <button class="tts-btn stop" aria-label="Detener lectura" onclick="ttsStop()">⏹ Detener</button>
      <div class="tts-speed-wrap">
        <label for="tts-speed-${containerId}">Velocidad:</label>
        <select id="tts-speed-${containerId}" aria-label="Velocidad de lectura" onchange="ttsUpdateSpeedUI('${containerId}')" style="padding:8px 10px;border:1px solid var(--border);border-radius:10px;background:var(--surface);color:var(--text);font-family:'Nunito',sans-serif;font-weight:700">
          ${speeds.map(v => `<option value="${v}" ${v === ttsSpeed ? 'selected' : ''}>${v}x</option>`).join('')}
        </select>
        <span class="tts-speed-val" id="tts-speed-val-${containerId}">${ttsSpeed.toFixed(1)}x</span>
      </div>
    </div>
    <div class="tts-status" id="tts-status-${containerId}">✅ Listo para reproducir</div>
  `;
}

function renderFlashcards(cards, key) {
  const uploaded = flRead(FL_STORE.parentUploads, []).filter(item => !item.module || item.module === key);
  const extraCards = uploaded.map(item => ({ emoji:'📎', word:item.name, def:'Material subido por padres disponible para reforzar este módulo.' }));
  const allCards = [...(cards || FLASHCARDS[key] || FLASHCARDS.s), ...extraCards].slice(0, 5);
  const c = allCards[0];
  return `
    <div class="flashcard-container">
      <p style="color:var(--text-muted);font-size:14px;margin-bottom:16px">Hacé clic en la tarjeta para ver la definición</p>
      <div class="flashcard" id="fc" role="button" tabindex="0" aria-label="Flashcard ${c.word}" onclick="document.getElementById('fc').classList.toggle('flipped')">
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
        <button class="fc-btn" aria-label="Flashcard anterior" onclick="prevCard('${key}')">← Anterior</button>
        <span class="fc-count" id="fc-count">1 / ${allCards.length}</span>
        <button class="fc-btn" aria-label="Siguiente flashcard" onclick="nextCard('${key}')">Siguiente →</button>
      </div>
      <button onclick="addXP('${key}', 50);showToast('¡Actividad visual completada! +50 pts 🎉','success')" style="margin-top:20px;background:var(--primary);color:white;border:none;padding:12px 24px;border-radius:100px;font-family:'Nunito',sans-serif;font-weight:700;cursor:pointer;">✓ Completar actividad</button>
    </div>`;
}

function flCardsFor(key) {
  // Siempre usa getLevelCards para tener definiciones únicas por carta
  if (typeof getLevelCards === 'function') return getLevelCards(key);
  const uploaded = flRead(FL_STORE.parentUploads, []).filter(item => !item.module || item.module === key);
  return [...(FLASHCARDS[key] || FLASHCARDS.s), ...uploaded.map(item => ({ emoji:'📎', word:item.name, def:'Material subido por padres disponible para reforzar este módulo.' }))].slice(0, 5);
}

function nextCard(key) {
  const cards = flCardsFor(key);
  currentCard = (currentCard + 1) % cards.length;
  updateCard(cards, key);
}

function prevCard(key) {
  const cards = flCardsFor(key);
  currentCard = (currentCard - 1 + cards.length) % cards.length;
  updateCard(cards, key);
}

function renderReadingWriting(key) {
  const texts = {
    s: '<strong>Las células</strong> son la unidad básica de la vida. Todos los seres vivos están formados por células. Tienen membrana, citoplasma y material genético.',
    t: '<strong>Los algoritmos</strong> son instrucciones ordenadas para resolver un problema. Tienen entrada, proceso y salida.',
    e: '<strong>Las estructuras</strong> en ingeniería se diseñan para soportar cargas y resolver necesidades reales de forma segura.',
    a: '<strong>La composición</strong> en arte organiza colores, formas y espacios para comunicar ideas y emociones.',
    m: '<strong>Las fracciones</strong> representan partes iguales de un todo. El numerador indica partes tomadas y el denominador las partes totales.'
  };
  return `
    <div class="reading-writing">
      <div class="material-text">${texts[key]}</div>
      <div class="writing-area">
        <div class="writing-label">✏️ Escribí lo que entendiste con tus palabras:</div>
        <textarea id="writing-input" aria-label="Respuesta escrita del alumno" placeholder="Escribí aquí tu resumen..."></textarea>
        <br>
        <button class="submit-writing" id="submit-writing-btn" aria-label="Evaluar mi respuesta" onclick="submitWriting('${key}')">
          📝 Evaluar mi respuesta
        </button>
        <div id="writing-feedback"></div>
      </div>
    </div>`;
}

function submitWriting(key) {
  const text = document.getElementById('writing-input').value.trim();
  const feedbackBox = document.getElementById('writing-feedback');
  const btn = document.getElementById('submit-writing-btn');
  if (text.length < 10) { showToast('Escribí al menos 10 caracteres'); return; }

  feedbackBox.className = 'feedback-box feedback-result';
  feedbackBox.innerHTML = '<span class="loading-spinner"></span> Analizando tu respuesta con IA simulada...';
  btn.disabled = true;
  btn.textContent = 'Procesando...';

  setTimeout(() => {
    const score = Math.floor(Math.random() * 5) + 6;
    const nivel = score >= 8 ? 'Muy bueno' : score >= 6 ? 'Bueno' : 'En desarrollo';
    const result = {
      score,
      comprension: nivel === 'Muy bueno' ? 'Muy buena' : nivel,
      feedback: score >= 8
        ? '¡Excelente trabajo! Captaste la idea principal y la explicaste con claridad. También usaste tus propias palabras, eso ayuda mucho a aprender.'
        : 'Buen trabajo. Se entiende la idea general y vas por buen camino. Podés mejorar agregando un ejemplo concreto del tema.',
      siguiente_paso: 'Revisá las flashcards visuales para reforzar los conceptos clave y luego intentá explicar el tema en voz alta.'
    };
    feedbackBox.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
        <strong>Puntaje: ${result.score}/10</strong>
        <span style="background:#e0e7ff;color:#3730a3;padding:3px 10px;border-radius:999px;font-size:12px;font-weight:700">${nivel}</span>
      </div>
      <p style="margin-bottom:6px">💬 <strong>Feedback:</strong> ${result.feedback}</p>
      <p style="color:var(--text-muted);font-size:13px">📌 <strong>Siguiente paso:</strong> ${result.siguiente_paso}</p>
      <pre style="margin-top:10px;white-space:pre-wrap;font-size:12px;color:var(--text-muted)">${JSON.stringify(result, null, 2)}</pre>
    `;
    addXP(key, 50);
    document.getElementById('writing-input').disabled = true;
    btn.textContent = `✓ Evaluado: ${result.score}/10`;
    btn.style.background = 'var(--success)';
    showToast('Evaluación lista. +50 pts 🎉', 'success');
    spawnSparkles();
  }, 1400);
}

function renderKinesthetic(key) {
  const m = MODULES[key];
  setTimeout(() => addXP(key, 50), 300);
  return `
    <div style="max-width:700px;margin:0 auto">
      <div style="border-radius:16px;overflow:hidden;box-shadow:var(--shadow-lg);background:var(--surface2);aspect-ratio:16/9;display:flex;align-items:center;justify-content:center;text-align:center;padding:24px">
        <div>
          <div style="font-size:58px;margin-bottom:12px">${m.emoji}</div>
          <p style="font-weight:800;color:var(--text);font-size:20px">📹 Video en preparación - Próximamente</p>
          <p style="color:var(--text-muted);margin-top:8px">La visita queda registrada como progreso del modo cinestésico.</p>
        </div>
      </div>
    </div>`;
}

function renderGames(key) {
  return `
    <div class="hidden" style="max-width:620px;margin:0 auto;text-align:center">
      <div class="game-card">
        <div class="game-icon">🎮</div>
        <div class="game-name">Modo videojuegos en desarrollo</div>
        <div class="game-desc">Esta sección queda preparada para implementarse después.</div>
      </div>
    </div>`;
}

async function addXP(key, amount) {
  if (!currentUser || !currentUser.progress?.[key]) return;
  const p = currentUser.progress[key];
  p.xp += amount;
  currentUser.totalXp = (currentUser.totalXp || 0) + amount;
  while (p.xp >= p.maxXp) {
    p.xp -= p.maxXp;
    p.level++;
    p.maxXp = Math.round(p.maxXp * 1.3);
    showToast(`¡Subiste a Nivel ${p.level} en ${MODULES[key].name}! 🎉`, 'success');
    checkAchievements(key);
  }
  const progress = flGetProgress(currentUser.email) || flCreateProgress(currentUser.email);
  const area = AREA_BY_KEY[key];
  if (area && progress.modules[area]) {
    progress.modules[area].activities_completed += 1;
    progress.modules[area].points += amount;
    progress.modules[area].level = p.level;
    if (key === 's') progress.missions.daily.science = Math.min(progress.missions.daily.science + 1, progress.missions.daily.target);
    progress.missions.weekly.total_activities += 1;
  }
  progress.total_points = currentUser.totalXp;
  progress.total_level = Object.values(currentUser.progress).reduce((sum, item) => sum + item.level, 0);
  flSaveProgress(progress);
  await dbPut('users', currentUser);
  flSyncLocalUser();
  renderHome();
}

function loadSettingsUI() {
  if (!currentUser) return;
  const profile = flGetProfile(currentUser.email);
  const s = currentUser.settings || {};
  document.getElementById('toggle-daltonismo').checked = !!(s.daltonismo || profile?.ui_settings?.daltonismo);
  document.getElementById('toggle-contraste').checked = !!(s.contraste || profile?.ui_settings?.altoContraste);
  document.getElementById('toggle-estimulos').checked = !!(s.estimulos || profile?.ui_settings?.reducirEstimulos);
  document.getElementById('toggle-velocidad').checked = !!(s.velocidad || profile?.ui_settings?.velocidadLenta);
  document.getElementById('toggle-darkmode').checked = !!(s.darkmode || profile?.ui_settings?.modoOscuro);
}

async function saveSettings() {
  if (!currentUser) return;
  currentUser.settings = {
    daltonismo: document.getElementById('toggle-daltonismo').checked,
    contraste: document.getElementById('toggle-contraste').checked,
    estimulos: document.getElementById('toggle-estimulos').checked,
    velocidad: document.getElementById('toggle-velocidad').checked,
    darkmode: document.getElementById('toggle-darkmode')?.checked || false
  };
  const profile = flGetProfile(currentUser.email) || flCreateProfile(currentUser.email, currentUser.conditions || []);
  profile.ui_settings = {
    daltonismo: currentUser.settings.daltonismo,
    altoContraste: currentUser.settings.contraste,
    reducirEstimulos: currentUser.settings.estimulos,
    velocidadLenta: currentUser.settings.velocidad,
    modoOscuro: currentUser.settings.darkmode
  };
  profile.speed_preference = currentUser.settings.velocidad ? 'slow' : 'normal';
  flSaveProfile(profile);
  await dbPut('users', currentUser);
}

function applyAccessibility() {
  saveSettings();
  const body = document.body;
  body.classList.toggle('daltonismo', document.getElementById('toggle-daltonismo')?.checked);
  body.classList.toggle('alto-contraste', document.getElementById('toggle-contraste')?.checked);
  body.classList.toggle('reducir-estimulos', document.getElementById('toggle-estimulos')?.checked);
  if (document.getElementById('toggle-velocidad')?.checked) ttsSpeed = 0.8;
}

async function logout() {
  ttsStop();
  currentUser = null;
  localStorage.removeItem(FL_STORE.session);
  await dbDelete('sessions', 'current');
  document.body.className = '';
  showScreen('landing');
  showToast('Sesión cerrada');
}

function handleFileUpload() {
  const file = document.getElementById('file-input').files[0];
  if (!file) { showToast('Seleccioná un archivo'); return; }
  const uploads = flRead(FL_STORE.parentUploads, []);
  uploads.push({ name:file.name, module:currentModule, uploaded_at:new Date().toISOString() });
  flWrite(FL_STORE.parentUploads, uploads);
  closeModal('upload-modal');
  showToast(`✓ "${file.name}" subido y disponible en Modo Visual`, 'success');
}

function flUpdateMissionUI() {
  if (!currentUser) return;
  const progress = flGetProgress(currentUser.email) || flCreateProgress(currentUser.email);
  const desc = document.getElementById('mission-desc');
  const count = document.getElementById('mission-progress');
  if (desc) desc.textContent = `Completá 1 actividad de Science (${progress.missions.daily.science} / ${progress.missions.daily.target})`;
  if (count) count.textContent = `${progress.missions.daily.science} / ${progress.missions.daily.target}`;
}

// Información progresiva: 5 niveles de contenido para cada sigla STEAM.
const STEAM_LEVEL_INFO = {
  s: [
    { title:'Nivel 1 · Observar', goal:'Reconocer seres vivos, materia, agua, luz y cambios simples.', concepts:'Sentidos, plantas, animales, estados del agua y cuidado del ambiente.', activity:'Mirar una imagen y decir qué cambia, qué vive y qué necesita energía.' },
    { title:'Nivel 2 · Comparar', goal:'Comparar objetos y seres vivos usando características visibles.', concepts:'Tamaño, forma, temperatura, hábitat, alimentación y ciclo de vida.', activity:'Ordenar tarjetas de animales, plantas o materiales según una propiedad.' },
    { title:'Nivel 3 · Explicar', goal:'Explicar causas sencillas en fenómenos naturales.', concepts:'Evaporación, crecimiento, fuerza, energía, célula y ecosistema.', activity:'Responder “por qué pasa” usando una frase corta y una imagen de apoyo.' },
    { title:'Nivel 4 · Investigar', goal:'Hacer pequeñas hipótesis y comprobarlas con datos simples.', concepts:'Experimento, variable, medición, registro, evidencia y conclusión.', activity:'Completar una mini tabla con observación, predicción y resultado.' },
    { title:'Nivel 5 · Conectar', goal:'Relacionar ciencia con problemas reales del entorno.', concepts:'Salud, ambiente, reciclaje, energía, clima y soluciones sostenibles.', activity:'Proponer una acción para cuidar el ambiente o mejorar un hábito saludable.' }
  ],
  t: [
    { title:'Nivel 1 · Usar', goal:'Identificar herramientas digitales y su función básica.', concepts:'Pantalla, teclado, mouse, botones, íconos, archivos y seguridad simple.', activity:'Elegir qué herramienta sirve para escribir, escuchar, dibujar o buscar.' },
    { title:'Nivel 2 · Ordenar', goal:'Comprender instrucciones paso a paso.', concepts:'Secuencia, algoritmo, inicio, pausa, error, repetir y finalizar.', activity:'Ordenar tarjetas para lograr una tarea como encender, escribir o guardar.' },
    { title:'Nivel 3 · Crear', goal:'Armar soluciones digitales simples con bloques o instrucciones.', concepts:'Comando, condición, bucle, entrada, salida y depuración.', activity:'Crear una secuencia para que un personaje avance hasta una meta.' },
    { title:'Nivel 4 · Proteger', goal:'Reconocer hábitos de seguridad digital.', concepts:'Contraseña, privacidad, datos personales, permiso, enlace seguro y respeto online.', activity:'Decidir si una acción digital es segura, dudosa o peligrosa.' },
    { title:'Nivel 5 · Diseñar', goal:'Pensar tecnología como solución para una necesidad.', concepts:'Usuario, problema, prototipo, prueba, mejora y accesibilidad.', activity:'Diseñar una app o herramienta que ayude a aprender mejor.' }
  ],
  e: [
    { title:'Nivel 1 · Construir', goal:'Reconocer formas, materiales y estructuras simples.', concepts:'Puente, torre, base, soporte, peso, equilibrio y resistencia.', activity:'Elegir qué forma o material conviene para sostener un objeto.' },
    { title:'Nivel 2 · Probar', goal:'Comprender que una construcción puede mejorar con pruebas.', concepts:'Prototipo, falla, mejora, estabilidad, carga y seguridad.', activity:'Comparar dos estructuras y elegir cuál resiste mejor.' },
    { title:'Nivel 3 · Resolver', goal:'Diseñar una solución para un problema concreto.', concepts:'Necesidad, restricción, material, mecanismo, circuito y herramienta.', activity:'Dibujar una solución para cruzar, mover, proteger o sostener algo.' },
    { title:'Nivel 4 · Optimizar', goal:'Mejorar una solución usando menos material o más seguridad.', concepts:'Eficiencia, costo, fuerza, tensión, energía y precisión.', activity:'Cambiar una parte del prototipo para hacerlo más fuerte o simple.' },
    { title:'Nivel 5 · Innovar', goal:'Crear una solución útil, segura y explicable.', concepts:'Diseño final, impacto, usuario, mantenimiento, sostenibilidad y documentación.', activity:'Presentar una idea con problema, solución, materiales y prueba.' }
  ],
  a: [
    { title:'Nivel 1 · Explorar', goal:'Reconocer colores, sonidos, formas y emociones.', concepts:'Color, línea, textura, ritmo, emoción, contraste y espacio.', activity:'Elegir colores o sonidos para representar alegría, calma o sorpresa.' },
    { title:'Nivel 2 · Combinar', goal:'Crear composiciones simples con intención.', concepts:'Figura, fondo, patrón, repetición, equilibrio y armonía.', activity:'Ordenar elementos visuales para que la imagen se entienda mejor.' },
    { title:'Nivel 3 · Expresar', goal:'Comunicar una idea personal usando recursos artísticos.', concepts:'Mensaje, símbolo, personaje, escena, estilo y narración visual.', activity:'Crear una mini obra que cuente una emoción o una historia.' },
    { title:'Nivel 4 · Analizar', goal:'Observar obras y explicar decisiones artísticas.', concepts:'Perspectiva, composición, foco, tono, movimiento y técnica.', activity:'Responder qué quiso comunicar una obra y qué elementos ayudan.' },
    { title:'Nivel 5 · Producir', goal:'Diseñar una pieza artística con propósito y revisión.', concepts:'Boceto, versión final, audiencia, identidad visual, crítica y mejora.', activity:'Crear una pieza para explicar un tema STEAM a otros niños.' }
  ],
  m: [
    { title:'Nivel 1 · Contar', goal:'Reconocer números, cantidades, formas y patrones básicos.', concepts:'Número, suma, resta, figura, tamaño, orden y secuencia.', activity:'Contar objetos, completar patrones y comparar cantidades.' },
    { title:'Nivel 2 · Representar', goal:'Usar dibujos, bloques o símbolos para resolver problemas.', concepts:'Recta numérica, tabla, grupo, doble, mitad, medida y posición.', activity:'Resolver una situación con dibujos antes de usar números.' },
    { title:'Nivel 3 · Calcular', goal:'Aplicar operaciones y relaciones en problemas cotidianos.', concepts:'Multiplicación, división, fracción, porcentaje, perímetro y tiempo.', activity:'Elegir la operación correcta para compras, medidas o repartos.' },
    { title:'Nivel 4 · Razonar', goal:'Explicar estrategias y detectar errores.', concepts:'Estimación, patrón avanzado, equivalencia, proporción, área y datos.', activity:'Comparar dos soluciones y explicar cuál tiene más sentido.' },
    { title:'Nivel 5 · Modelar', goal:'Usar matemáticas para analizar situaciones reales.', concepts:'Gráficos, probabilidad, escala, promedio, tendencia y predicción.', activity:'Leer datos de una tabla y tomar una decisión basada en evidencia.' }
  ]
};

function renderSteamLevelInfo(key) {
  const levels = STEAM_LEVEL_INFO[key] || [];
  if (!levels.length) return '';
  return `
    <div class="section-title">Ruta de aprendizaje · 5 niveles</div>
    <div class="steam-levels">
      ${levels.map((level, index) => `
        <div class="level-card">
          <div class="level-letter" style="color:${MODULES[key].barColor}">${index + 1}</div>
          <div class="level-area">${level.title}</div>
          <div class="level-xp" style="line-height:1.55;color:var(--text)">
            <strong>Meta:</strong> ${level.goal}<br>
            <strong>Conceptos:</strong> ${level.concepts}<br>
            <strong>Actividad:</strong> ${level.activity}
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function openModule(key) {
  currentModule = key;
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
        <div class="mode-desc">Modo en desarrollo</div>
        <span class="mode-badge">Modo 5</span>
      </div>
    </div>
  `;
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-module').classList.add('active');
  document.getElementById('topbar-title').textContent = m.name;
}

// Contenido visual progresivo: cada módulo tiene 5 niveles con flashcards propias.
const LEVEL_FLASHCARDS = {
  s: {
    1: [
      { emoji:'🌱', word:'Ser vivo', def:'Un ser vivo nace, crece, necesita energía y responde a su entorno.' },
      { emoji:'💧', word:'Agua', def:'El agua ayuda a plantas, animales y personas a vivir y mantenerse sanos.' },
      { emoji:'☀️', word:'Luz', def:'La luz permite ver y ayuda a las plantas a fabricar alimento.' }
    ],
    2: [
      { emoji:'🐝', word:'Hábitat', def:'Lugar donde vive un ser vivo y encuentra alimento, agua y refugio.' },
      { emoji:'🦋', word:'Ciclo de vida', def:'Etapas por las que pasa un ser vivo desde que nace hasta que se reproduce.' },
      { emoji:'🍃', word:'Adaptación', def:'Característica que ayuda a un ser vivo a sobrevivir mejor en su ambiente.' }
    ],
    3: [
      { emoji:'🧫', word:'Célula', def:'Unidad básica de los seres vivos. Funciona como una pequeña fábrica de vida.' },
      { emoji:'🧬', word:'ADN', def:'Molécula que guarda instrucciones para formar y hacer funcionar a los seres vivos.' },
      { emoji:'🌍', word:'Ecosistema', def:'Conjunto de seres vivos y elementos del ambiente que interactúan entre sí.' }
    ],
    4: [
      { emoji:'🔎', word:'Hipótesis', def:'Idea que se puede probar mediante observación o experimento.' },
      { emoji:'📏', word:'Medición', def:'Uso de números o instrumentos para registrar datos de un fenómeno.' },
      { emoji:'📊', word:'Evidencia', def:'Dato u observación que ayuda a comprobar una explicación científica.' }
    ],
    5: [
      { emoji:'♻️', word:'Sostenibilidad', def:'Uso responsable de recursos para cuidar la vida actual y futura.' },
      { emoji:'🌡️', word:'Clima', def:'Patrones de temperatura, lluvia y viento de una región durante mucho tiempo.' },
      { emoji:'🧪', word:'Solución científica', def:'Respuesta basada en evidencia para mejorar un problema real.' }
    ]
  },
  t: {
    1: [
      { emoji:'🖥️', word:'Pantalla', def:'Parte del dispositivo donde vemos textos, imágenes, videos y botones.' },
      { emoji:'⌨️', word:'Teclado', def:'Herramienta que permite escribir letras, números y símbolos.' },
      { emoji:'🖱️', word:'Cursor', def:'Marca que muestra dónde hacemos clic o dónde vamos a escribir.' }
    ],
    2: [
      { emoji:'➡️', word:'Secuencia', def:'Orden correcto de pasos para completar una tarea.' },
      { emoji:'🤖', word:'Algoritmo', def:'Lista de pasos claros para resolver un problema.' },
      { emoji:'🔁', word:'Repetir', def:'Hacer una misma acción varias veces siguiendo una instrucción.' }
    ],
    3: [
      { emoji:'🧩', word:'Comando', def:'Instrucción que le dice a una computadora qué debe hacer.' },
      { emoji:'🔀', word:'Condición', def:'Regla que decide qué acción hacer según lo que ocurra.' },
      { emoji:'🐞', word:'Error', def:'Falla que impide que un programa funcione como esperamos.' }
    ],
    4: [
      { emoji:'🔐', word:'Contraseña', def:'Clave privada que protege cuentas y datos personales.' },
      { emoji:'🛡️', word:'Privacidad', def:'Cuidado de la información personal para que no se comparta sin permiso.' },
      { emoji:'🔗', word:'Enlace seguro', def:'Dirección confiable que ayuda a navegar sin riesgos.' }
    ],
    5: [
      { emoji:'👤', word:'Usuario', def:'Persona que usa una herramienta digital y necesita que sea clara.' },
      { emoji:'🛠️', word:'Prototipo', def:'Primera versión de una idea que se prueba y mejora.' },
      { emoji:'♿', word:'Accesibilidad', def:'Diseño que permite que más personas puedan usar una tecnología.' }
    ]
  },
  e: {
    1: [
      { emoji:'🏗️', word:'Estructura', def:'Conjunto de partes que sostiene peso y mantiene una forma.' },
      { emoji:'⚖️', word:'Equilibrio', def:'Estado en el que una construcción no se cae hacia ningún lado.' },
      { emoji:'🧱', word:'Material', def:'Sustancia que se usa para construir, como madera, metal o cartón.' }
    ],
    2: [
      { emoji:'📦', word:'Prototipo', def:'Modelo de prueba para ver si una solución funciona.' },
      { emoji:'💥', word:'Falla', def:'Problema que muestra qué parte de una solución debe mejorar.' },
      { emoji:'🔧', word:'Mejora', def:'Cambio que hace una construcción más útil, fuerte o segura.' }
    ],
    3: [
      { emoji:'🎯', word:'Necesidad', def:'Problema real que una solución de ingeniería intenta resolver.' },
      { emoji:'⚙️', word:'Mecanismo', def:'Conjunto de piezas que producen movimiento o cumplen una función.' },
      { emoji:'⚡', word:'Circuito', def:'Camino cerrado por donde puede circular electricidad.' }
    ],
    4: [
      { emoji:'📉', word:'Eficiencia', def:'Lograr un buen resultado usando menos material, tiempo o energía.' },
      { emoji:'🪢', word:'Tensión', def:'Fuerza que aparece cuando algo se estira o se hala.' },
      { emoji:'🎚️', word:'Precisión', def:'Cuidado para que una medida o pieza quede lo más exacta posible.' }
    ],
    5: [
      { emoji:'💡', word:'Innovación', def:'Idea nueva o mejorada que resuelve un problema de forma útil.' },
      { emoji:'🌎', word:'Impacto', def:'Efecto que una solución produce en personas, ambiente o comunidad.' },
      { emoji:'📋', word:'Documentación', def:'Registro de materiales, pasos y resultados de un proyecto.' }
    ]
  },
  a: {
    1: [
      { emoji:'🎨', word:'Color', def:'Elemento visual que puede transmitir emociones e ideas.' },
      { emoji:'〰️', word:'Línea', def:'Trazo que puede crear formas, movimiento o dirección.' },
      { emoji:'🟦', word:'Forma', def:'Figura visible que ayuda a organizar una composición.' }
    ],
    2: [
      { emoji:'🖼️', word:'Figura y fondo', def:'Relación entre lo principal de una imagen y el espacio que lo rodea.' },
      { emoji:'🔁', word:'Patrón', def:'Elemento que se repite y crea orden visual.' },
      { emoji:'⚖️', word:'Equilibrio', def:'Distribución visual que hace que una obra se sienta estable.' }
    ],
    3: [
      { emoji:'💬', word:'Mensaje', def:'Idea que una obra quiere comunicar a quien la observa.' },
      { emoji:'⭐', word:'Símbolo', def:'Imagen o forma que representa una idea más grande.' },
      { emoji:'🎭', word:'Personaje', def:'Figura que puede expresar acciones, emociones o historias.' }
    ],
    4: [
      { emoji:'👁️', word:'Perspectiva', def:'Forma de mostrar profundidad y distancia en una imagen.' },
      { emoji:'🎯', word:'Foco', def:'Parte de una obra que atrae primero la mirada.' },
      { emoji:'🌊', word:'Movimiento', def:'Sensación visual de dirección, acción o ritmo.' }
    ],
    5: [
      { emoji:'✏️', word:'Boceto', def:'Primer dibujo o plan antes de crear la versión final.' },
      { emoji:'🪪', word:'Identidad visual', def:'Colores, formas y estilo que hacen reconocible una idea o marca.' },
      { emoji:'🗣️', word:'Crítica', def:'Comentario respetuoso que ayuda a mejorar una obra.' }
    ]
  },
  m: {
    1: [
      { emoji:'🔢', word:'Cantidad', def:'Número de objetos o elementos que hay en un grupo.' },
      { emoji:'➕', word:'Suma', def:'Operación que junta cantidades para obtener un total.' },
      { emoji:'🔺', word:'Figura', def:'Forma geométrica como círculo, triángulo o cuadrado.' }
    ],
    2: [
      { emoji:'📍', word:'Recta numérica', def:'Línea donde los números se ordenan de menor a mayor.' },
      { emoji:'🧮', word:'Mitad', def:'Una de dos partes iguales de un todo.' },
      { emoji:'📏', word:'Medida', def:'Número que indica tamaño, distancia, peso o tiempo.' }
    ],
    3: [
      { emoji:'✖️', word:'Multiplicación', def:'Suma repetida de una misma cantidad.' },
      { emoji:'🍕', word:'Fracción', def:'Parte de un todo dividido en partes iguales.' },
      { emoji:'⏱️', word:'Tiempo', def:'Magnitud que permite ordenar y medir duración de acciones.' }
    ],
    4: [
      { emoji:'≈', word:'Estimación', def:'Cálculo aproximado que ayuda a responder rápido.' },
      { emoji:'⚖️', word:'Equivalencia', def:'Relación entre dos valores que representan lo mismo.' },
      { emoji:'📐', word:'Área', def:'Medida de la superficie que ocupa una figura.' }
    ],
    5: [
      { emoji:'📊', word:'Gráfico', def:'Representación visual de datos para entenderlos mejor.' },
      { emoji:'🎲', word:'Probabilidad', def:'Posibilidad de que ocurra un evento.' },
      { emoji:'📈', word:'Promedio', def:'Valor que resume un grupo de números.' }
    ]
  }
};

function getModuleLevel(key) {
  return Math.max(1, Math.min(5, currentUser?.progress?.[key]?.level || 1));
}

function getLevelCards(key) {
  const uploaded = flRead(FL_STORE.parentUploads, []).filter(item => !item.module || item.module === key);
  const level = getModuleLevel(key);
  const baseCards = LEVEL_FLASHCARDS[key]?.[level] || FLASHCARDS[key] || FLASHCARDS.s;
  const extraCards = uploaded.map(item => ({ emoji:'📎', word:item.name, def:'Material subido por padres disponible para reforzar este módulo.' }));
  return [...baseCards, ...extraCards].slice(0, 5);
}

function renderFlashcards(cards, key) {
  const level = getModuleLevel(key);
  const allCards = getLevelCards(key);
  const c = allCards[0];
  const isLastLevel = level >= 5;
  return `
    <div class="flashcard-container">
      <p style="color:var(--text-muted);font-size:14px;margin-bottom:16px">
        Nivel ${level} de 5 · Hacé clic en la tarjeta para ver la definición
      </p>
      <div class="flashcard" id="fc" role="button" tabindex="0" aria-label="Flashcard ${c.word}" onclick="document.getElementById('fc').classList.toggle('flipped')">
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
        <button class="fc-btn" aria-label="Flashcard anterior" onclick="prevCard('${key}')">← Anterior</button>
        <span class="fc-count" id="fc-count">1 / ${allCards.length}</span>
        <button class="fc-btn" aria-label="Siguiente flashcard" onclick="nextCard('${key}')">Siguiente →</button>
      </div>
      <button onclick="completeVisualLevel('${key}')" style="margin-top:20px;background:var(--primary);color:white;border:none;padding:12px 24px;border-radius:100px;font-family:'Nunito',sans-serif;font-weight:700;cursor:pointer;">
        ${isLastLevel ? '✓ Completar nivel final' : '✓ Completar y pasar al nivel ' + (level + 1)}
      </button>
    </div>`;
}

function flCardsFor(key) {
  return getLevelCards(key);
}

async function completeVisualLevel(key) {
  if (!currentUser?.progress?.[key]) return;
  const p = currentUser.progress[key];
  const currentLevel = getModuleLevel(key);
  p.xp += 50;
  currentUser.totalXp = (currentUser.totalXp || 0) + 50;
  if (currentLevel < 5) {
    p.level = currentLevel + 1;
    showToast(`¡Pasaste a Nivel ${p.level} en ${MODULES[key].name}! +50 XP 🎉`, 'success');
  } else {
    showToast(`¡Completaste el nivel final de ${MODULES[key].name}! +50 XP 🌟`, 'success');
  }
  const progress = flGetProgress(currentUser.email) || flCreateProgress(currentUser.email);
  const area = AREA_BY_KEY[key];
  if (area && progress.modules[area]) {
    progress.modules[area].activities_completed += 1;
    progress.modules[area].points += 50;
    progress.modules[area].level = p.level;
    if (key === 's') progress.missions.daily.science = Math.min(progress.missions.daily.science + 1, progress.missions.daily.target);
    progress.missions.weekly.total_activities += 1;
  }
  progress.total_points = currentUser.totalXp;
  progress.total_level = Object.values(currentUser.progress).reduce((sum, item) => sum + item.level, 0);
  flSaveProgress(progress);
  await dbPut('users', currentUser);
  flSyncLocalUser();
  currentCard = 0;
  document.getElementById('content-view').innerHTML = `<button class="back-btn" onclick="openModule('${key}')">← Volver a ${MODULES[key].name}</button>` + renderFlashcards(null, key);
  renderHome();
  spawnSparkles();
}

const LEVEL_AUDIO_TEXTS = {
  s: {
    1:'Nivel 1 de Science. Hoy escuchamos sobre los seres vivos. Un ser vivo nace, crece, necesita agua o alimento y responde a lo que pasa a su alrededor.',
    2:'Nivel 2 de Science. Los seres vivos viven en hábitats. Un hábitat ofrece alimento, agua, refugio y condiciones para sobrevivir.',
    3:'Nivel 3 de Science. Las células son unidades pequeñas que forman a los seres vivos. Dentro de ellas ocurren procesos importantes para la vida.',
    4:'Nivel 4 de Science. Investigar significa observar, hacer una hipótesis, medir datos y usar evidencia para llegar a una conclusión.',
    5:'Nivel 5 de Science. La ciencia ayuda a resolver problemas reales, como cuidar el ambiente, ahorrar energía y proteger la salud.'
  },
  t: {
    1:'Nivel 1 de Technology. La tecnología incluye herramientas como pantallas, teclados y programas que nos ayudan a crear, aprender y comunicarnos.',
    2:'Nivel 2 de Technology. Un algoritmo es una serie de pasos claros. Si los pasos están en buen orden, la tarea se completa mejor.',
    3:'Nivel 3 de Technology. Programar es dar instrucciones. Usamos comandos, condiciones y repeticiones para resolver problemas.',
    4:'Nivel 4 de Technology. La seguridad digital protege datos personales. Una contraseña fuerte y privada ayuda a cuidar una cuenta.',
    5:'Nivel 5 de Technology. Diseñar tecnología significa pensar en el usuario, probar prototipos y mejorar la accesibilidad.'
  },
  e: {
    1:'Nivel 1 de Engineering. Una estructura sostiene peso y mantiene una forma. Para construir bien necesitamos equilibrio y materiales adecuados.',
    2:'Nivel 2 de Engineering. Un prototipo es una prueba. Si falla, nos muestra qué parte debemos mejorar.',
    3:'Nivel 3 de Engineering. La ingeniería busca resolver necesidades usando materiales, mecanismos, circuitos y herramientas.',
    4:'Nivel 4 de Engineering. Optimizar significa lograr una solución fuerte y segura usando menos recursos o energía.',
    5:'Nivel 5 de Engineering. Innovar es crear una solución útil, explicar cómo funciona y pensar en su impacto.'
  },
  a: {
    1:'Nivel 1 de Arts. El arte usa color, línea, forma y textura para expresar emociones e ideas.',
    2:'Nivel 2 de Arts. Una composición organiza figura, fondo, patrones y equilibrio para que una imagen se entienda.',
    3:'Nivel 3 de Arts. Una obra puede comunicar un mensaje usando símbolos, personajes, escenas y estilo.',
    4:'Nivel 4 de Arts. Analizar arte es observar perspectiva, foco, movimiento y técnica para entender la intención.',
    5:'Nivel 5 de Arts. Producir arte implica hacer bocetos, crear una versión final, recibir crítica y mejorar.'
  },
  m: {
    1:'Nivel 1 de Maths. Las matemáticas empiezan con cantidades, sumas, restas, figuras y patrones simples.',
    2:'Nivel 2 de Maths. Representar un problema con dibujos, rectas numéricas o bloques ayuda a entenderlo.',
    3:'Nivel 3 de Maths. Calcular permite resolver situaciones con multiplicación, división, fracciones, porcentajes y tiempo.',
    4:'Nivel 4 de Maths. Razonar significa explicar estrategias, estimar respuestas y detectar errores.',
    5:'Nivel 5 de Maths. Modelar es usar datos, gráficos, promedios y probabilidad para tomar decisiones.'
  }
};

const LEVEL_READING_TEXTS = {
  s: {
    1:'<strong>Nivel 1 · Science:</strong> Un ser vivo nace, crece y necesita energía. Las plantas necesitan agua, luz y aire. Los animales necesitan alimento, agua y un lugar seguro.',
    2:'<strong>Nivel 2 · Science:</strong> Un hábitat es el lugar donde vive un ser vivo. Allí encuentra refugio, alimento y condiciones para sobrevivir. Cada especie se adapta a su ambiente.',
    3:'<strong>Nivel 3 · Science:</strong> La célula es la unidad básica de la vida. Algunas células forman tejidos y órganos. El ADN guarda instrucciones para el funcionamiento del organismo.',
    4:'<strong>Nivel 4 · Science:</strong> En una investigación se observa, se hace una hipótesis, se miden datos y se revisa evidencia. Así se puede explicar mejor un fenómeno.',
    5:'<strong>Nivel 5 · Science:</strong> La ciencia se conecta con problemas reales. Puede ayudar a cuidar el ambiente, entender el clima, mejorar la salud y crear soluciones sostenibles.'
  },
  t: {
    1:'<strong>Nivel 1 · Technology:</strong> La tecnología son herramientas creadas para ayudar. Una pantalla muestra información, un teclado permite escribir y un programa sigue instrucciones.',
    2:'<strong>Nivel 2 · Technology:</strong> Una secuencia es un orden de pasos. Un algoritmo organiza esos pasos para completar una tarea o resolver un problema.',
    3:'<strong>Nivel 3 · Technology:</strong> Programar es crear instrucciones para una computadora. Los comandos hacen acciones, las condiciones deciden y los bucles repiten.',
    4:'<strong>Nivel 4 · Technology:</strong> La seguridad digital cuida la información personal. Es importante usar contraseñas privadas y pensar antes de abrir enlaces.',
    5:'<strong>Nivel 5 · Technology:</strong> El diseño tecnológico empieza con una necesidad. Luego se crea un prototipo, se prueba, se mejora y se adapta al usuario.'
  },
  e: {
    1:'<strong>Nivel 1 · Engineering:</strong> Una estructura debe sostener peso y mantener equilibrio. Los materiales influyen en la resistencia de una construcción.',
    2:'<strong>Nivel 2 · Engineering:</strong> Un prototipo permite probar una idea. Si una parte falla, esa información sirve para mejorar la solución.',
    3:'<strong>Nivel 3 · Engineering:</strong> La ingeniería resuelve necesidades reales. Puede usar mecanismos, circuitos, herramientas y materiales para crear soluciones.',
    4:'<strong>Nivel 4 · Engineering:</strong> Optimizar una solución significa hacerla más segura, fuerte o simple usando menos material, energía o tiempo.',
    5:'<strong>Nivel 5 · Engineering:</strong> Una innovación debe ser útil y explicable. También se analiza su impacto en personas, ambiente y comunidad.'
  },
  a: {
    1:'<strong>Nivel 1 · Arts:</strong> El arte usa colores, líneas, formas y texturas. Estos elementos pueden expresar calma, alegría, sorpresa o tensión.',
    2:'<strong>Nivel 2 · Arts:</strong> Una composición visual organiza figura, fondo, patrones y equilibrio. Eso ayuda a guiar la mirada.',
    3:'<strong>Nivel 3 · Arts:</strong> Una obra puede contar una historia. Los símbolos, personajes y escenas ayudan a comunicar un mensaje.',
    4:'<strong>Nivel 4 · Arts:</strong> Analizar una obra significa mirar el foco, la perspectiva, el movimiento y las decisiones del artista.',
    5:'<strong>Nivel 5 · Arts:</strong> Crear una pieza final requiere boceto, intención, revisión y mejora. La crítica respetuosa ayuda a crecer.'
  },
  m: {
    1:'<strong>Nivel 1 · Maths:</strong> Las cantidades se pueden contar, ordenar y comparar. Las figuras y patrones ayudan a reconocer relaciones.',
    2:'<strong>Nivel 2 · Maths:</strong> Dibujar un problema ayuda a resolverlo. También se pueden usar rectas numéricas, bloques, tablas o medidas.',
    3:'<strong>Nivel 3 · Maths:</strong> Las operaciones ayudan a resolver problemas cotidianos. Las fracciones muestran partes iguales de un todo.',
    4:'<strong>Nivel 4 · Maths:</strong> Razonar es explicar cómo se resolvió un problema. También implica estimar y revisar si la respuesta tiene sentido.',
    5:'<strong>Nivel 5 · Maths:</strong> Los datos pueden representarse con gráficos. El promedio y la probabilidad ayudan a analizar situaciones reales.'
  }
};

function getLevelText(map, key) {
  const level = getModuleLevel(key);
  return map[key]?.[level] || map[key]?.[1] || '';
}

async function completeModeLevel(key, mode) {
  if (!currentUser?.progress?.[key]) return;
  const p = currentUser.progress[key];
  const currentLevel = getModuleLevel(key);
  p.xp += 50;
  currentUser.totalXp = (currentUser.totalXp || 0) + 50;
  if (currentLevel < 5) {
    p.level = currentLevel + 1;
    showToast(`¡Pasaste a Nivel ${p.level} en ${MODULES[key].name}! +50 XP 🎉`, 'success');
  } else {
    showToast(`¡Completaste el nivel final de ${MODULES[key].name}! +50 XP 🌟`, 'success');
  }

  const progress = flGetProgress(currentUser.email) || flCreateProgress(currentUser.email);
  const area = AREA_BY_KEY[key];
  if (area && progress.modules[area]) {
    progress.modules[area].activities_completed += 1;
    progress.modules[area].points += 50;
    progress.modules[area].level = p.level;
    if (key === 's') progress.missions.daily.science = Math.min(progress.missions.daily.science + 1, progress.missions.daily.target);
    progress.missions.weekly.total_activities += 1;
  }
  progress.total_points = currentUser.totalXp;
  progress.total_level = Object.values(currentUser.progress).reduce((sum, item) => sum + item.level, 0);
  flSaveProgress(progress);
  await dbPut('users', currentUser);
  flSyncLocalUser();
  renderHome();
  spawnSparkles();

  if (mode === 'visual') {
    currentCard = 0;
    document.getElementById('content-view').innerHTML = `<button class="back-btn" onclick="openModule('${key}')">← Volver a ${MODULES[key].name}</button>` + renderFlashcards(null, key);
  } else if (mode === 'audio') {
    ttsStop();
    document.getElementById('content-view').innerHTML = `<button class="back-btn" onclick="openModule('${key}')">← Volver a ${MODULES[key].name}</button>` + renderPodcast(key);
  } else if (mode === 'reading') {
    document.getElementById('content-view').innerHTML = `<button class="back-btn" onclick="openModule('${key}')">← Volver a ${MODULES[key].name}</button>` + renderReadingWriting(key);
  } else if (mode === 'kinesthetic') {
    document.getElementById('content-view').innerHTML = `<button class="back-btn" onclick="openModule('${key}')">← Volver a ${MODULES[key].name}</button>` + renderKinesthetic(key);
  }
}

function completeVisualLevel(key) {
  completeModeLevel(key, 'visual');
}

function renderPodcast(key) {
  const m = MODULES[key];
  const level = getModuleLevel(key);
  const text = getLevelText(LEVEL_AUDIO_TEXTS, key);
  const isLastLevel = level >= 5;
  const ttsId = 'podcast-' + key;
  return `
    <div class="podcast-player">
      <div class="podcast-cover" style="background:${m.barColor}">${m.emoji}</div>
      <div class="podcast-title">Nivel ${level} de 5 · ${m.name}</div>
      <div class="podcast-episode">Audio adaptado al nivel actual</div>
      <div class="podcast-progress">
        <div class="podcast-progress-fill" id="pod-progress"></div>
      </div>
      <div class="podcast-time"><span>0:00</span><span>Lectura TTS</span></div>
      <div class="podcast-controls">
        <button class="pod-btn" onclick="showToast('⏮ Volvé al nivel anterior desde el progreso')">⏮</button>
        <button class="pod-btn play" id="play-btn" onclick="ttsToggle('${ttsId}')">▶</button>
        <button class="pod-btn" onclick="showToast('Completá este audio para avanzar')">⏭</button>
      </div>
    </div>
    <div class="tts-section">
      <p style="font-weight:800;margin-bottom:12px;color:var(--text)">📢 Lector auditivo · Nivel ${level}</p>
      ${buildTTSControls(ttsId, text)}
      <button onclick="completeModeLevel('${key}','audio')" style="margin-top:14px;background:var(--success);color:white;border:none;padding:10px 20px;border-radius:100px;font-family:'Nunito',sans-serif;font-weight:700;cursor:pointer;">
        ${isLastLevel ? '✓ Completar nivel final' : '✓ Completar audio y pasar al nivel ' + (level + 1)}
      </button>
    </div>`;
}

function renderReadingWriting(key) {
  const level = getModuleLevel(key);
  const text = getLevelText(LEVEL_READING_TEXTS, key);
  return `
    <div class="reading-writing">
      <div class="material-text">${text}</div>
      <div class="writing-area">
        <div class="writing-label">✏️ Nivel ${level} de 5 · Escribí lo que entendiste con tus palabras:</div>
        <textarea id="writing-input" aria-label="Respuesta escrita del alumno" placeholder="Escribí aquí tu resumen..."></textarea>
        <br>
        <button class="submit-writing" id="submit-writing-btn" aria-label="Evaluar mi respuesta" onclick="submitWriting('${key}')">
          📝 Evaluar mi respuesta
        </button>
        <div id="writing-feedback"></div>
      </div>
    </div>`;
}

function submitWriting(key) {
  const text = document.getElementById('writing-input').value.trim();
  const feedbackBox = document.getElementById('writing-feedback');
  const btn = document.getElementById('submit-writing-btn');
  if (text.length < 10) { showToast('Escribí al menos 10 caracteres'); return; }

  feedbackBox.className = 'feedback-box feedback-result';
  feedbackBox.innerHTML = '<span class="loading-spinner"></span> Analizando tu respuesta con IA simulada...';
  btn.disabled = true;
  btn.textContent = 'Procesando...';

  setTimeout(() => {
    const score = Math.floor(Math.random() * 5) + 6;
    const nivel = score >= 8 ? 'Muy bueno' : score >= 6 ? 'Bueno' : 'En desarrollo';
    const result = {
      score,
      comprension: nivel === 'Muy bueno' ? 'Muy buena' : nivel,
      feedback: score >= 8
        ? '¡Excelente trabajo! Captaste la idea principal del nivel y explicaste con claridad.'
        : 'Buen trabajo. Se entiende la idea general. Podés mejorar agregando un ejemplo del contenido del nivel.',
      siguiente_paso: 'Completá esta actividad para desbloquear el siguiente nivel del mismo módulo.'
    };
    feedbackBox.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
        <strong>Puntaje: ${result.score}/10</strong>
        <span style="background:#e0e7ff;color:#3730a3;padding:3px 10px;border-radius:999px;font-size:12px;font-weight:700">${nivel}</span>
      </div>
      <p style="margin-bottom:6px">💬 <strong>Feedback:</strong> ${result.feedback}</p>
      <p style="color:var(--text-muted);font-size:13px">📌 <strong>Siguiente paso:</strong> ${result.siguiente_paso}</p>
      <pre style="margin-top:10px;white-space:pre-wrap;font-size:12px;color:var(--text-muted)">${JSON.stringify(result, null, 2)}</pre>
    `;
    document.getElementById('writing-input').disabled = true;
    btn.textContent = '✓ Evaluado · avanzar nivel';
    btn.disabled = false;
    btn.onclick = () => completeModeLevel(key, 'reading');
    btn.style.background = 'var(--success)';
    showToast('Evaluación lista. Tocá el botón para avanzar de nivel.', 'success');
  }, 1400);
}

function openContent(key, mode) {
  currentModule = key;
  ttsStop();
  const m = MODULES[key];
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-content').classList.add('active');
  document.getElementById('topbar-title').textContent = getModeTitle(mode);

  let html = `<button class="back-btn" onclick="openModule('${key}')">← Volver a ${m.name}</button>`;
  if (mode === 'visual') {
    currentCard = 0;
    html += renderFlashcards(null, key);
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

function renderKinesthetic(key) {
  const m = MODULES[key];
  const level = getModuleLevel(key);
  const isLastLevel = level >= 5;
  return `
    <div style="max-width:700px;margin:0 auto">
      <div style="border-radius:16px;overflow:hidden;box-shadow:var(--shadow-lg);background:var(--surface2);aspect-ratio:16/9;display:flex;align-items:center;justify-content:center;text-align:center;padding:24px">
        <div>
          <div style="font-size:58px;margin-bottom:12px">${m.emoji}</div>
          <p style="font-weight:800;color:var(--text);font-size:20px">📹 Nivel ${level} de 5 · Video en preparación</p>
          <p style="color:var(--text-muted);margin-top:8px">La actividad cinestésica valdrá lo mismo que Visual, Auditivo y Lectura/Escritura.</p>
          <button onclick="completeModeLevel('${key}','kinesthetic')" style="margin-top:18px;background:var(--primary);color:white;border:none;padding:12px 24px;border-radius:100px;font-family:'Nunito',sans-serif;font-weight:700;cursor:pointer;">
            ${isLastLevel ? '✓ Completar nivel final' : '✓ Completar actividad y pasar al nivel ' + (level + 1)}
          </button>
        </div>
      </div>
    </div>`;
}

