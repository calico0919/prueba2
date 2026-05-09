// Demo Paraguay Educa: límites de presentación.
// ===========================
const DEMO_MAX_LEVEL = 3;
const DEMO_MAX_XP = 300;
const DEMO_LOCK_MESSAGE = 'Hasta aquí llega esta prueba demo. Los niveles 4 y 5 estarán disponibles en la versión completa.';

function showDemoLimitMessage() {
  if (typeof flAdminLogEvent === 'function') flAdminLogEvent('demo_limit', { message: DEMO_LOCK_MESSAGE });
  showToast(DEMO_LOCK_MESSAGE, 'error');
}

function normalizeModuleProgress(key) {
  if (!currentUser) return { totalXp: 0, level: 1, subLevel: 1, maxXp: DEMO_MAX_XP, xpInsideLevel: 0 };
  currentUser.progress = currentUser.progress || {};
  currentUser.progress[key] = currentUser.progress[key] || { level: 1, xp: 0, maxXp: DEMO_MAX_XP };
  const p = currentUser.progress[key];
  const totalXp = Math.max(0, Math.min(DEMO_MAX_XP, Number(p.xp) || 0));
  const level = totalXp >= DEMO_MAX_XP ? DEMO_MAX_LEVEL : Math.floor(totalXp / 100) + 1;
  const xpInsideLevel = totalXp >= DEMO_MAX_XP ? 100 : totalXp - ((level - 1) * 100);
  const subLevel = totalXp >= DEMO_MAX_XP ? 10 : Math.floor(xpInsideLevel / PROGRESSION_RULES.xpPerSublevel) + 1;
  p.xp = totalXp;
  p.level = Math.min(DEMO_MAX_LEVEL, level);
  p.subLevel = Math.max(1, Math.min(10, subLevel));
  p.maxXp = DEMO_MAX_XP;
  p.xpInsideLevel = Math.min(100, xpInsideLevel);
  return { totalXp: p.xp, level: p.level, subLevel: p.subLevel, maxXp: p.maxXp, xpInsideLevel: p.xpInsideLevel };
}

const flDemoOriginalCompleteModeLevel = completeModeLevel;
completeModeLevel = async function(key, mode) {
  const state = normalizeModuleProgress(key);
  if (state.totalXp >= DEMO_MAX_XP || state.level >= DEMO_MAX_LEVEL && state.subLevel >= 10) {
    showDemoLimitMessage();
    return;
  }
  await flDemoOriginalCompleteModeLevel(key, mode);
  normalizeModuleProgress(key);
  flAdminSaveTestUser();
};

function renderDemoLockedPanel(title = 'Sector fuera del demo') {
  return `
    <div style="border:2px dashed var(--border);border-radius:16px;padding:24px;text-align:center;background:var(--surface);opacity:.82">
      <div style="font-size:46px;margin-bottom:10px">🔒</div>
      <div style="font-weight:900;color:var(--text);font-size:clamp(22px,4vw,36px);line-height:1.1">${title}</div>
      <p style="color:var(--text-muted);font-size:18px;margin-top:10px">${DEMO_LOCK_MESSAGE}</p>
    </div>`;
}

function renderKinesthetic(key) {
  const m = MODULES[key];
  const state = normalizeModuleProgress(key);
  const content = getRichModeContent(key);
  const isLocked = state.totalXp >= DEMO_MAX_XP;
  const videoDescriptions = {
    s: 'Este videotutorial de Ciencias te guía a través de experimentos y observaciones del mundo natural. Mirá con atención cómo los científicos investigan y exploran la naturaleza paso a paso.',
    t: 'Este videotutorial de Tecnología explica cómo funcionan los dispositivos y programas que usamos a diario. Observá los pasos para entender cómo la tecnología resuelve problemas.',
    e: 'Este videotutorial de Ingeniería muestra cómo diseñar y construir estructuras y soluciones. Prestá atención a los materiales, las pruebas y las mejoras que hacen los ingenieros.',
    a: 'Este videotutorial de Arte te enseña técnicas de expresión visual. Seguí cada paso del proceso creativo y animáte a reproducir la actividad con materiales que tengas en casa.',
    m: 'Este videotutorial de Matemáticas explica conceptos numéricos con ejemplos visuales y concretos. Pausá cuando necesites y repetí los ejercicios para practicar.'
  };
  const activityInstructions = {
    s: `Mirá el video y luego realizá esta actividad: observá un objeto natural cerca tuyo (una planta, un insecto, el cielo) y describí 3 cosas que notás. ¿Qué ves? ¿Qué forma tiene? ¿De qué color es? Dibujalo o escribilo.`,
    t: `Mirá el video y luego realizá esta actividad: buscá un objeto tecnológico en tu casa (reloj, calculadora, teléfono). ¿Para qué sirve? ¿Qué partes tiene? ¿Cómo crees que funciona? Contáselo a alguien.`,
    e: `Mirá el video y luego realizá esta actividad: construí algo con materiales que tengas (bloques, papel, cartón). Probá si aguanta peso. ¿Qué le cambiarías para que sea más fuerte?`,
    a: `Mirá el video y luego realizá esta actividad: dibujá o pintá algo usando la técnica que mostraron. Podés usar lápices, fibras o lo que tengas. Lo importante es que lo disfrutes.`,
    m: `Mirá el video y luego realizá esta actividad: usando objetos de casa (botones, monedas, frijoles), practicá contar, comparar y agrupar. Podés inventar un problema matemático simple.`
  };
  return `
    <div style="max-width:820px;margin:0 auto;display:grid;gap:18px">
      <div style="border-radius:16px;overflow:hidden;box-shadow:var(--shadow-lg);background:var(--surface2);display:flex;align-items:center;justify-content:center;text-align:center;padding:28px">
        <div style="max-width:680px">
          <div style="font-size:58px;margin-bottom:12px">${m.emoji}</div>
          <p style="font-weight:900;color:var(--text);font-size:clamp(26px,4vw,44px);line-height:1.14">Videotutorial · ${m.name}</p>
          <p style="font-weight:700;color:var(--text-muted);font-size:18px;margin-top:10px;line-height:1.4">${videoDescriptions[key] || 'Videotutorial educativo para este módulo.'}</p>
          <p style="color:var(--text-muted);margin-top:12px;font-size:16px;font-weight:800">Nivel ${state.level} · Subnivel ${state.subLevel}/10 · Demo hasta Nivel 3</p>
          <button onclick="toggleKinestheticDemo('${key}')" style="margin-top:18px;background:var(--primary);color:white;border:none;padding:12px 24px;border-radius:100px;font-family:'Nunito',sans-serif;font-weight:800;cursor:pointer;">
            📺 Ver actividad
          </button>
        </div>
      </div>
      <div id="kinesthetic-demo-${key}" style="display:none;border:1px solid var(--border);border-radius:16px;background:var(--surface);padding:24px;box-shadow:var(--shadow)">
        <div style="font-size:22px;font-weight:900;color:var(--text);margin-bottom:10px">📋 Actividad práctica — ${m.name}</div>
        <p style="color:var(--text);font-size:18px;line-height:1.6;font-weight:700">
          ${activityInstructions[key] || 'Seguí las instrucciones del video y completá la actividad guiada.'}
        </p>
        <div style="margin-top:18px;border-radius:14px;background:var(--surface2);padding:18px;color:var(--text-muted);font-size:16px;font-weight:800">
          📹 Espacio para video o guía visual de la actividad. (Disponible en versión completa.)
        </div>
        <button onclick="${isLocked ? 'showDemoLimitMessage()' : `completeModeLevel('${key}','kinesthetic')`}" style="margin-top:18px;background:${isLocked ? 'var(--text-muted)' : 'var(--success)'};color:white;border:none;padding:12px 24px;border-radius:100px;font-family:'Nunito',sans-serif;font-weight:800;cursor:pointer;">
          ${isLocked ? 'Demo completado' : '✓ Completar actividad'}
        </button>
      </div>
    </div>`;
}

function toggleKinestheticDemo(key) {
  const panel = document.getElementById(`kinesthetic-demo-${key}`);
  if (!panel) return;
  panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
  flAdminLogEvent('open_kinesthetic_activity', { key, moduleName: MODULES[key]?.name });
}

function renderGames(key) {
  const state = normalizeModuleProgress(key);
  const isLocked = state.totalXp >= DEMO_MAX_XP;
  return `
    <div class="games-grid">
      <div class="game-card">
        <div class="game-icon">🎮</div>
        <div class="game-name">Minijuego 1 disponible</div>
        <div class="game-desc" style="font-size:clamp(24px,4vw,40px);line-height:1.1;font-weight:900;color:var(--text)">Espacio listo para insertar el juego demo.</div>
        <p style="color:var(--text-muted);font-size:18px;margin-top:12px">Nivel ${state.level} · Subnivel ${state.subLevel}/10</p>
        <button class="play-game-btn" style="font-size:18px;padding:14px 22px" onclick="${isLocked ? 'showDemoLimitMessage()' : `completeModeLevel('${key}','games')`}">
          ${isLocked ? 'Demo completado' : 'Completar Minijuego 1'}
        </button>
      </div>
      <div class="game-card" style="opacity:.72">
        <div class="game-icon">🔒</div>
        <div class="game-name">Minijuego 2 bloqueado</div>
        <div class="game-desc">Este sector está fuera del demo.</div>
        <button class="play-game-btn" style="background:var(--text-muted)" onclick="showDemoLimitMessage()">Bloqueado</button>
      </div>
    </div>`;
}

const flDemoOriginalRenderModuleCards = renderModuleCards;
renderModuleCards = function() {
  flDemoOriginalRenderModuleCards();
  document.querySelectorAll('.module-card').forEach(card => {
    const level = card.querySelector('.module-level');
    if (level && !level.textContent.includes('Demo')) level.textContent += ' · Demo hasta Nivel 3';
  });
};

const flDemoOriginalRenderProgress = renderProgress;
renderProgress = function() {
  flDemoOriginalRenderProgress();
  document.querySelectorAll('.progress-xp').forEach(el => {
    el.textContent = el.textContent.replace(/\/\s*500 XP/g, '/ 300 XP');
  });
};

// ===========================
// Panel de observación Admin con contraseña.
// ===========================
const ADMIN_PANEL_PASSWORD = 'paraguayeduca';
const ADMIN_OBS_KEY = 'focuslearn_admin_observation_log';
const ADMIN_OBS_STARTED_KEY = 'focuslearn_admin_observation_started_at';

function flAdminReadLog() {
  return flRead(ADMIN_OBS_KEY, []);
}

function flAdminWriteLog(log) {
  flWrite(ADMIN_OBS_KEY, log);
}

function flAdminLogEvent(type, detail = {}) {
  const log = flAdminReadLog();
  log.push({
    type,
    detail,
    at: new Date().toISOString(),
    module: currentModule || null,
    xp: currentUser?.totalXp || 0
  });
  flAdminWriteLog(log.slice(-300));
}

function flAdminResetObservationLog() {
  localStorage.setItem(ADMIN_OBS_STARTED_KEY, new Date().toISOString());
  flAdminWriteLog([]);
}

function flAdminEnsureObservationStart() {
  if (!localStorage.getItem(ADMIN_OBS_STARTED_KEY)) flAdminResetObservationLog();
}

function flAdminDemoStats() {
  const log = flAdminReadLog();
  const started = localStorage.getItem(ADMIN_OBS_STARTED_KEY) || new Date().toISOString();
  const elapsedSeconds = Math.max(0, Math.round((Date.now() - new Date(started).getTime()) / 1000));
  const modulesVisited = [...new Set(log.filter(e => e.type === 'open_module').map(e => e.detail?.moduleName || e.detail?.key))];
  const modesUsed = [...new Set(log.filter(e => e.type === 'open_content').map(e => e.detail?.mode))];
  const completed = log.filter(e => e.type === 'complete_activity').length;
  const limitHits = log.filter(e => e.type === 'demo_limit').length;
  return { started, elapsedSeconds, modulesVisited, modesUsed, completed, limitHits, log };
}

function openAdminPanel() {
  const pass = prompt('Contraseña Admin');
  if (pass !== ADMIN_PANEL_PASSWORD) {
    showToast('Contraseña incorrecta', 'error');
    return;
  }
  renderAdminPanel();
}

function closeAdminPanel() {
  document.getElementById('admin-panel-overlay')?.remove();
}

function renderAdminPanel() {
  const stats = flAdminDemoStats();
  const progressRows = ['s','t','e','a','m'].map(key => {
    const m = MODULES[key];
    const state = normalizeModuleProgress(key);
    return `<div style="display:flex;justify-content:space-between;gap:12px;border-bottom:1px solid var(--border);padding:8px 0">
      <strong>${m.letter} · ${m.name}</strong>
      <span>Nivel ${state.level} · ${state.subLevel}/10 · ${state.totalXp}/${state.maxXp} XP</span>
    </div>`;
  }).join('');
  closeAdminPanel();
  document.body.insertAdjacentHTML('beforeend', `
    <div id="admin-panel-overlay" style="position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px">
      <div style="background:var(--surface);color:var(--text);border-radius:18px;box-shadow:var(--shadow-lg);width:min(920px,96vw);max-height:90vh;overflow:auto;padding:24px">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:16px;margin-bottom:18px">
          <div>
            <div style="font-size:26px;font-weight:900">Panel Admin · Demo Paraguay Educa</div>
            <div style="color:var(--text-muted);font-size:14px">Observación local de la prueba actual</div>
          </div>
          <button onclick="closeAdminPanel()" style="background:var(--accent);color:white;border:none;padding:10px 16px;border-radius:8px;font-weight:800;cursor:pointer">Cerrar</button>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin-bottom:18px">
          <div class="card"><strong>Tiempo</strong><div style="font-size:24px;font-weight:900">${Math.floor(stats.elapsedSeconds / 60)}m ${stats.elapsedSeconds % 60}s</div></div>
          <div class="card"><strong>Módulos</strong><div style="font-size:24px;font-weight:900">${stats.modulesVisited.length}</div></div>
          <div class="card"><strong>Modos</strong><div style="font-size:24px;font-weight:900">${stats.modesUsed.length}</div></div>
          <div class="card"><strong>Completadas</strong><div style="font-size:24px;font-weight:900">${stats.completed}</div></div>
          <div class="card"><strong>Límite demo</strong><div style="font-size:24px;font-weight:900">${stats.limitHits}</div></div>
        </div>
        <div class="card" style="margin-bottom:16px">
          <div style="font-size:18px;font-weight:900;margin-bottom:8px">Progreso actual</div>
          ${progressRows}
        </div>
        <div class="card" style="margin-bottom:16px">
          <div style="font-size:18px;font-weight:900;margin-bottom:8px">Últimas acciones</div>
          ${stats.log.slice(-12).reverse().map(e => `<div style="font-size:14px;color:var(--text-muted);padding:5px 0;border-bottom:1px solid var(--border)">${new Date(e.at).toLocaleTimeString()} · ${e.type} · ${JSON.stringify(e.detail)}</div>`).join('') || '<p style="color:var(--text-muted)">Todavía no hay acciones registradas.</p>'}
        </div>
        <div style="display:flex;gap:10px;flex-wrap:wrap">
          <button onclick="exportAdminObservation()" style="background:var(--primary);color:white;border:none;padding:11px 18px;border-radius:8px;font-weight:800;cursor:pointer">Exportar JSON</button>
          <button onclick="flAdminResetObservationLog();renderAdminPanel()" style="background:var(--surface2);color:var(--text);border:1px solid var(--border);padding:11px 18px;border-radius:8px;font-weight:800;cursor:pointer">Limpiar observación</button>
        </div>
      </div>
    </div>
  `);
}

function exportAdminObservation() {
  const data = {
    profile: ADMIN_TEST_NAME,
    exported_at: new Date().toISOString(),
    stats: flAdminDemoStats(),
    progress: currentUser?.progress || {}
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `focuslearn-demo-${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function ensureAdminFloatingButton() {
  document.getElementById('admin-floating-btn')?.remove();
}

const SETTINGS_LOCK_PASSWORD = 'BTIADMIN2026';
let settingsUnlocked = false;

function closeSettingsLock() {
  document.getElementById('settings-lock-overlay')?.remove();
}

function openSettingsLock() {
  closeSettingsLock();
  document.body.insertAdjacentHTML('beforeend', `
    <div id="settings-lock-overlay" style="position:fixed;inset:0;background:rgba(0,0,0,.62);z-index:9997;display:flex;align-items:center;justify-content:center;padding:20px">
      <div style="background:var(--surface);color:var(--text);width:min(440px,94vw);border-radius:20px;box-shadow:var(--shadow-lg);padding:26px;text-align:center">
        <div style="font-size:52px;margin-bottom:10px">🔒</div>
        <div style="font-size:26px;font-weight:900;margin-bottom:8px">Ajustes bloqueados</div>
        <p style="color:var(--text-muted);font-size:15px;line-height:1.4;margin-bottom:18px">
          Este sector es solo para adultos o equipo técnico durante el demo.
        </p>
        <input id="settings-lock-password" type="password" autocomplete="off" placeholder="Contraseña" aria-label="Contraseña de ajustes" onkeydown="if(event.key==='Enter') unlockSettings()" style="width:100%;padding:14px 16px;border:2px solid var(--border);border-radius:12px;font-family:'Nunito',sans-serif;font-size:18px;margin-bottom:12px;background:var(--surface2);color:var(--text);text-align:center">
        <div id="settings-lock-error" style="min-height:22px;color:var(--danger);font-weight:800;font-size:14px;margin-bottom:10px"></div>
        <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">
          <button onclick="unlockSettings()" style="background:var(--primary);color:white;border:none;padding:11px 18px;border-radius:8px;font-family:'Nunito',sans-serif;font-weight:900;cursor:pointer">Entrar a Ajustes</button>
          <button onclick="closeSettingsLock();showPage('home')" style="background:var(--surface2);color:var(--text);border:1px solid var(--border);padding:11px 18px;border-radius:8px;font-family:'Nunito',sans-serif;font-weight:900;cursor:pointer">Cancelar</button>
        </div>
      </div>
    </div>
  `);
  setTimeout(() => document.getElementById('settings-lock-password')?.focus(), 50);
}

function unlockSettings() {
  const input = document.getElementById('settings-lock-password');
  const error = document.getElementById('settings-lock-error');
  if (!input || input.value !== SETTINGS_LOCK_PASSWORD) {
    if (error) error.textContent = 'Contraseña incorrecta';
    showToast('Contraseña incorrecta', 'error');
    return;
  }
  settingsUnlocked = true;
  closeSettingsLock();
  showPage('settings');
}

const flObsOriginalShowPage = showPage;
showPage = function(id) {
  if (id === 'settings' && !settingsUnlocked) {
    flAdminLogEvent('settings_lock', { status: 'blocked' });
    openSettingsLock();
    return;
  }
  if (id !== 'settings') settingsUnlocked = false;
  flAdminLogEvent('show_page', { page: id });
  const result = flObsOriginalShowPage(id);
  if (id !== 'settings') applyPresentationMode();
  return result;
};

const flObsOriginalOpenModule = openModule;
openModule = function(key) {
  flAdminLogEvent('open_module', { key, moduleName: MODULES[key]?.name });
  return flObsOriginalOpenModule(key);
};

const flObsOriginalOpenContent = openContent;
openContent = function(key, mode) {
  flAdminLogEvent('open_content', { key, moduleName: MODULES[key]?.name, mode });
  return flObsOriginalOpenContent(key, mode);
};

const flObsOriginalCompleteModeLevel = completeModeLevel;
completeModeLevel = async function(key, mode) {
  const before = normalizeModuleProgress(key);
  if (before.totalXp >= DEMO_MAX_XP) flAdminLogEvent('demo_limit', { key, mode });
  await flObsOriginalCompleteModeLevel(key, mode);
  const after = normalizeModuleProgress(key);
  if (after.totalXp > before.totalXp) {
    flAdminLogEvent('complete_activity', { key, moduleName: MODULES[key]?.name, mode, xpGained: after.totalXp - before.totalXp, level: after.level, subLevel: after.subLevel });
  }
};

const flObsOriginalResetAdminTestProfile = resetAdminTestProfile;
resetAdminTestProfile = function() {
  flObsOriginalResetAdminTestProfile();
  flAdminResetObservationLog();
};

// ===========================
// Demo completo: bienvenida, ficha, modo presentación y resumen final.
// ===========================
const DEMO_RUNS_KEY = 'focuslearn_demo_finished_runs';
const DEMO_META_KEY = 'focuslearn_demo_current_meta';
const DEMO_PRESENTATION_KEY = 'focuslearn_demo_presentation_mode';

function readDemoRuns() {
  return flRead(DEMO_RUNS_KEY, []);
}

function saveDemoRuns(runs) {
  flWrite(DEMO_RUNS_KEY, runs);
}

function getCurrentDemoMeta() {
  return flRead(DEMO_META_KEY, {
    code: '',
    age: '',
    device: 'Tablet',
    reading: 'Requiere acompañamiento',
    expectedMode: 'Visual',
    notes: ''
  });
}

function saveCurrentDemoMeta(meta) {
  flWrite(DEMO_META_KEY, meta);
}

function isPresentationMode() {
  return localStorage.getItem(DEMO_PRESENTATION_KEY) === 'true';
}

function setPresentationMode(value) {
  localStorage.setItem(DEMO_PRESENTATION_KEY, value ? 'true' : 'false');
  const settingsIsOpen = document.getElementById('page-settings')?.classList.contains('active');
  if (settingsIsOpen && value) {
    document.body.classList.remove('presentation-mode');
    showToast('Modo presentación guardado. Se activará al salir de Ajustes.', 'success');
    return;
  }
  applyPresentationMode();
  showToast(value ? 'Modo presentación activado' : 'Modo presentación desactivado', 'success');
}

function applyPresentationMode() {
  document.body.classList.toggle('presentation-mode', isPresentationMode());
  if (!document.getElementById('presentation-mode-style')) {
    document.head.insertAdjacentHTML('beforeend', `
      <style id="presentation-mode-style">
        body.presentation-mode #admin-floating-btn { display:none !important; }
        #presentation-exit-btn { display:none; }
        body.presentation-mode #presentation-exit-btn { display:block !important; }
        body.presentation-mode #sidebar { display:none !important; }
        body.presentation-mode .main-content { margin-left:0 !important; width:100% !important; }
        body.presentation-mode .topbar { left:0 !important; padding-left:24px; }
        body.presentation-mode #sidebar-email,
        body.presentation-mode #profile-email { display:none !important; }
        body.presentation-mode .progress-xp { visibility:hidden; }
        body.presentation-mode .module-level { font-size:0 !important; }
        body.presentation-mode .module-level::after { content:'Demo Paraguay Educa'; font-size:13px; }
      </style>
    `);
  }
  ensurePresentationExitButton();
  const exitBtn = document.getElementById('presentation-exit-btn');
  if (exitBtn) exitBtn.style.display = isPresentationMode() ? 'block' : 'none';
}

function ensureDemoBadge() {
  if (document.getElementById('demo-badge')) return;
  document.body.insertAdjacentHTML('beforeend', `
    <div id="demo-badge" style="position:fixed;left:18px;bottom:18px;z-index:9996;background:var(--primary);color:white;border-radius:999px;padding:10px 15px;font-family:'Nunito',sans-serif;font-weight:900;box-shadow:var(--shadow);font-size:14px">
      Demo Paraguay Educa
    </div>
  `);
}

function ensurePresentationExitButton() {
  if (document.getElementById('presentation-exit-btn')) return;
  document.body.insertAdjacentHTML('beforeend', `
    <button id="presentation-exit-btn" onclick="setPresentationMode(false);showPage('home')" aria-label="Salir del modo presentación" style="position:fixed;right:18px;top:18px;z-index:10002;background:var(--accent);color:white;border:none;border-radius:999px;padding:10px 16px;font-family:'Nunito',sans-serif;font-weight:900;box-shadow:var(--shadow-lg);cursor:pointer;display:none">
      Salir presentación
    </button>
  `);
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && isPresentationMode()) {
    setPresentationMode(false);
    showPage('home');
  }
});

function showDemoWelcome() {
  if (document.getElementById('demo-welcome-overlay')) return;
  document.body.insertAdjacentHTML('beforeend', `
    <div id="demo-welcome-overlay" style="position:fixed;inset:0;background:linear-gradient(135deg,rgba(79,70,229,.94),rgba(16,185,129,.92));z-index:10000;display:flex;align-items:center;justify-content:center;padding:22px">
      <div style="width:min(760px,94vw);text-align:center;color:white">
        <div style="font-family:'Baloo 2',sans-serif;font-size:clamp(44px,8vw,86px);font-weight:900;line-height:.95;margin-bottom:14px">Demo Paraguay Educa</div>
        <p style="font-size:clamp(22px,4vw,34px);font-weight:800;line-height:1.15;margin:0 auto 30px;max-width:700px">Exploración adaptativa de las 5 áreas STEAM para niños</p>
        <button onclick="openDemoProfileForm()" style="background:white;color:#4338ca;border:none;border-radius:999px;padding:16px 30px;font-family:'Nunito',sans-serif;font-weight:900;font-size:22px;cursor:pointer;box-shadow:0 18px 40px rgba(0,0,0,.22)">
          Iniciar prueba
        </button>
      </div>
    </div>
  `);
}

function openDemoProfileForm() {
  const meta = getCurrentDemoMeta();
  document.getElementById('demo-welcome-overlay')?.remove();
  document.body.insertAdjacentHTML('beforeend', `
    <div id="demo-profile-overlay" style="position:fixed;inset:0;background:rgba(0,0,0,.56);z-index:10000;display:flex;align-items:center;justify-content:center;padding:20px">
      <div style="background:var(--surface);color:var(--text);width:min(720px,96vw);border-radius:20px;box-shadow:var(--shadow-lg);padding:24px">
        <div style="font-size:28px;font-weight:900;margin-bottom:6px">Ficha rápida de prueba</div>
        <p style="color:var(--text-muted);font-size:15px;margin-bottom:18px">Estos datos quedan guardados solo en este dispositivo para el resumen del demo.</p>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px">
          <label style="font-weight:800">Código o nombre corto
            <input id="demo-meta-code" value="${meta.code || ''}" placeholder="Ej: Niño 01" style="width:100%;margin-top:6px;padding:12px;border:2px solid var(--border);border-radius:10px;background:var(--surface2);color:var(--text)">
          </label>
          <label style="font-weight:800">Edad
            <input id="demo-meta-age" value="${meta.age || ''}" placeholder="Ej: 6" style="width:100%;margin-top:6px;padding:12px;border:2px solid var(--border);border-radius:10px;background:var(--surface2);color:var(--text)">
          </label>
          <label style="font-weight:800">Dispositivo
            <select id="demo-meta-device" style="width:100%;margin-top:6px;padding:12px;border:2px solid var(--border);border-radius:10px;background:var(--surface2);color:var(--text)">
              ${['Tablet','Notebook','PC con mouse','Pantalla táctil'].map(v => `<option ${meta.device === v ? 'selected' : ''}>${v}</option>`).join('')}
            </select>
          </label>
          <label style="font-weight:800">Lectura
            <select id="demo-meta-reading" style="width:100%;margin-top:6px;padding:12px;border:2px solid var(--border);border-radius:10px;background:var(--surface2);color:var(--text)">
              ${['Lee solo','Requiere acompañamiento','Aún no lee','No observado'].map(v => `<option ${meta.reading === v ? 'selected' : ''}>${v}</option>`).join('')}
            </select>
          </label>
          <label style="font-weight:800">Modo esperado
            <select id="demo-meta-mode" style="width:100%;margin-top:6px;padding:12px;border:2px solid var(--border);border-radius:10px;background:var(--surface2);color:var(--text)">
              ${['Visual','Auditivo','Lectura/Escritura','Cinestésico','Videojuegos','No definido'].map(v => `<option ${meta.expectedMode === v ? 'selected' : ''}>${v}</option>`).join('')}
            </select>
          </label>
        </div>
        <label style="display:block;font-weight:800;margin-top:12px">Observaciones iniciales
          <textarea id="demo-meta-notes" placeholder="Ej: se distrae con sonidos, prefiere tocar, necesita ayuda..." style="width:100%;min-height:86px;margin-top:6px;padding:12px;border:2px solid var(--border);border-radius:10px;background:var(--surface2);color:var(--text)">${meta.notes || ''}</textarea>
        </label>
        <div style="display:flex;gap:10px;justify-content:flex-end;flex-wrap:wrap;margin-top:18px">
          <button onclick="document.getElementById('demo-profile-overlay')?.remove();showDemoWelcome()" style="background:var(--surface2);color:var(--text);border:1px solid var(--border);padding:11px 18px;border-radius:8px;font-weight:900;cursor:pointer">Volver</button>
          <button onclick="startDemoRunFromForm()" style="background:var(--primary);color:white;border:none;padding:11px 18px;border-radius:8px;font-weight:900;cursor:pointer">Comenzar</button>
        </div>
      </div>
    </div>
  `);
}

function startDemoRunFromForm() {
  const meta = readDemoMetaFromForm();
  saveCurrentDemoMeta(meta);
  flAdminResetObservationLog();
  flAdminLogEvent('demo_started', meta);
  document.getElementById('demo-profile-overlay')?.remove();
  showPage('home');
}

function readDemoMetaFromForm() {
  return {
    code: document.getElementById('demo-meta-code')?.value || '',
    age: document.getElementById('demo-meta-age')?.value || '',
    device: document.getElementById('demo-meta-device')?.value || 'Tablet',
    reading: document.getElementById('demo-meta-reading')?.value || 'No observado',
    expectedMode: document.getElementById('demo-meta-mode')?.value || 'No definido',
    notes: document.getElementById('demo-meta-notes')?.value || '',
    started_at: new Date().toISOString()
  };
}

function saveDemoProfileFromSettings() {
  const current = getCurrentDemoMeta();
  const meta = { ...current, ...readDemoMetaFromForm(), updated_at: new Date().toISOString() };
  saveCurrentDemoMeta(meta);
  flAdminLogEvent('demo_profile_updated', meta);
  document.getElementById('demo-profile-overlay')?.remove();
  showToast('Ficha de prueba guardada', 'success');
}

function openDemoProfileEditor() {
  openDemoProfileForm();
  const overlay = document.getElementById('demo-profile-overlay');
  if (!overlay) return;
  const title = overlay.querySelector('div[style*="font-size:28px"]');
  if (title) title.textContent = 'Editar ficha de prueba';
  const actions = overlay.querySelector('div[style*="justify-content:flex-end"]');
  if (actions) {
    actions.innerHTML = `
      <button onclick="document.getElementById('demo-profile-overlay')?.remove()" style="background:var(--surface2);color:var(--text);border:1px solid var(--border);padding:11px 18px;border-radius:8px;font-weight:900;cursor:pointer">Cancelar</button>
      <button onclick="saveDemoProfileFromSettings()" style="background:var(--primary);color:white;border:none;padding:11px 18px;border-radius:8px;font-weight:900;cursor:pointer">Guardar ficha</button>
    `;
  }
}

function injectPresentationSetting() {
  const settingsPage = document.getElementById('page-settings');
  if (!settingsPage || document.getElementById('demo-presentation-setting')) return;
  settingsPage.insertAdjacentHTML('afterbegin', `
    <div class="settings-section" id="demo-presentation-setting">
      <div class="settings-section-title">Demo Paraguay Educa</div>
      <div class="setting-item">
        <div class="setting-info">
          <div class="setting-name">Modo presentación</div>
          <div class="setting-desc">Oculta datos técnicos, correo y botón Admin durante la muestra</div>
        </div>
        <label class="toggle">
          <input type="checkbox" id="toggle-presentation-mode" onchange="setPresentationMode(this.checked)" ${isPresentationMode() ? 'checked' : ''} />
          <div class="toggle-track"></div>
        </label>
      </div>
      <div class="setting-item">
        <div class="setting-info">
          <div class="setting-name">Ficha de prueba</div>
          <div class="setting-desc">Completar o editar los datos del niño sin reiniciar el demo</div>
        </div>
        <button onclick="openDemoProfileEditor()" style="background:var(--primary);color:white;border:none;padding:10px 18px;border-radius:8px;font-family:'Nunito',sans-serif;font-weight:700;font-size:14px;cursor:pointer;">Editar ficha</button>
      </div>
    </div>
  `);
}

const demoOriginalLoadSettingsUI = loadSettingsUI;
loadSettingsUI = function() {
  demoOriginalLoadSettingsUI();
  injectPresentationSetting();
  const toggle = document.getElementById('toggle-presentation-mode');
  if (toggle) toggle.checked = isPresentationMode();
};

function buildDemoSummary() {
  const stats = flAdminDemoStats();
  const meta = getCurrentDemoMeta();
  const modes = stats.modesUsed;
  const modeCounts = stats.log.filter(e => e.type === 'open_content').reduce((acc, e) => {
    const mode = e.detail?.mode || 'unknown';
    acc[mode] = (acc[mode] || 0) + 1;
    return acc;
  }, {});
  const preferredMode = Object.entries(modeCounts).sort((a,b) => b[1] - a[1])[0]?.[0] || 'No observado';
  const progress = ['s','t','e','a','m'].reduce((acc, key) => {
    const m = MODULES[key];
    const state = normalizeModuleProgress(key);
    acc[m.name] = { xp: state.totalXp, level: state.level, subLevel: state.subLevel };
    return acc;
  }, {});
  return {
    id: `demo-${Date.now()}`,
    finished_at: new Date().toISOString(),
    child: meta,
    elapsedSeconds: stats.elapsedSeconds,
    modulesExplored: stats.modulesVisited,
    modesUsed: modes,
    preferredMode,
    completedActivities: stats.completed,
    demoLimitHits: stats.limitHits,
    totalXp: currentUser?.totalXp || 0,
    progress,
    recommendation: preferredMode === 'No observado'
      ? 'Se recomienda repetir la prueba con al menos un módulo completo.'
      : `Respondió mejor cuando usó el modo ${preferredMode}. Conviene iniciar futuras sesiones desde ese formato.`
  };
}

function finalizeDemoRun() {
  const summary = buildDemoSummary();
  const runs = readDemoRuns();
  runs.push(summary);
  saveDemoRuns(runs);
  flAdminLogEvent('demo_finished', { totalXp: summary.totalXp, preferredMode: summary.preferredMode });
  renderDemoFinalSummary(summary, runs.length);
}

function renderDemoFinalSummary(summary, count) {
  document.getElementById('demo-final-overlay')?.remove();
  document.body.insertAdjacentHTML('beforeend', `
    <div id="demo-final-overlay" style="position:fixed;inset:0;background:rgba(0,0,0,.58);z-index:10001;display:flex;align-items:center;justify-content:center;padding:20px">
      <div style="background:var(--surface);color:var(--text);width:min(860px,96vw);max-height:90vh;overflow:auto;border-radius:22px;box-shadow:var(--shadow-lg);padding:26px">
        <div style="font-size:30px;font-weight:900;margin-bottom:6px">Resumen final de prueba</div>
        <p style="color:var(--text-muted);font-size:15px;margin-bottom:18px">Prueba finalizada #${count} · ${summary.child.code || 'Sin código'} · ${summary.child.age || 'Edad no indicada'} años</p>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px;margin-bottom:18px">
          <div class="card"><strong>Tiempo</strong><div style="font-size:24px;font-weight:900">${Math.floor(summary.elapsedSeconds / 60)}m ${summary.elapsedSeconds % 60}s</div></div>
          <div class="card"><strong>XP ganado</strong><div style="font-size:24px;font-weight:900">${summary.totalXp}</div></div>
          <div class="card"><strong>Módulos</strong><div style="font-size:24px;font-weight:900">${summary.modulesExplored.length}</div></div>
          <div class="card"><strong>Modo observado</strong><div style="font-size:20px;font-weight:900">${summary.preferredMode}</div></div>
        </div>
        <div class="card" style="margin-bottom:14px">
          <strong>Recomendación</strong>
          <p style="font-size:18px;line-height:1.4;margin-top:8px">${summary.recommendation}</p>
        </div>
        <div class="card" style="margin-bottom:14px">
          <strong>Progreso por STEAM</strong>
          ${Object.entries(summary.progress).map(([name, p]) => `<div style="display:flex;justify-content:space-between;border-bottom:1px solid var(--border);padding:8px 0"><span>${name}</span><strong>${p.xp} XP · Nivel ${p.level} · ${p.subLevel}/10</strong></div>`).join('')}
        </div>
        <div style="display:flex;gap:10px;justify-content:flex-end;flex-wrap:wrap">
          <button onclick="exportDemoRuns()" style="background:var(--primary);color:white;border:none;padding:11px 18px;border-radius:8px;font-weight:900;cursor:pointer">Exportar historial</button>
          <button onclick="document.getElementById('demo-final-overlay')?.remove()" style="background:var(--accent);color:white;border:none;padding:11px 18px;border-radius:8px;font-weight:900;cursor:pointer">Cerrar</button>
        </div>
      </div>
    </div>
  `);
}

function exportDemoRuns() {
  const runs = readDemoRuns();
  const data = {
    exported_at: new Date().toISOString(),
    total_finished_tests: runs.length,
    runs
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `focuslearn-paraguay-educa-historial-${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  prepareHistoryEmail(data);
}

function prepareHistoryEmail(data) {
  const lastRun = data.runs[data.runs.length - 1];
  const totalXp = data.runs.reduce((sum, run) => sum + (run.totalXp || 0), 0);
  const subject = encodeURIComponent(`Historial FocusLearn Demo - ${new Date().toLocaleDateString()}`);
  const body = encodeURIComponent([
    'Hola,',
    '',
    'Adjunto/comparto el historial exportado del demo FocusLearn Paraguay Educa.',
    '',
    `Pruebas finalizadas: ${data.total_finished_tests}`,
    `XP histórico acumulado: ${totalXp}`,
    lastRun ? `Última prueba: ${lastRun.child?.code || 'Sin código'} · ${lastRun.child?.age || 'Edad no indicada'} años` : 'Última prueba: sin registros',
    lastRun ? `Modo observado: ${lastRun.preferredMode || 'No observado'}` : '',
    '',
    'El archivo JSON se descargó automáticamente. Adjuntalo a este correo antes de enviar.',
    '',
    'FocusLearn'
  ].filter(Boolean).join('\n'));
  window.location.href = `mailto:focuslearnmanagement@gmail.com?subject=${subject}&body=${body}`;
  showToast('Se abrió el correo. Adjuntá el JSON descargado antes de enviar.', 'success');
}

const demoOriginalRenderAdminPanel = renderAdminPanel;
renderAdminPanel = function() {
  const runs = readDemoRuns();
  const stats = flAdminDemoStats();
  const totalHistoricalXp = runs.reduce((sum, r) => sum + (r.totalXp || 0), 0);
  demoOriginalRenderAdminPanel();
  const panel = document.querySelector('#admin-panel-overlay > div');
  if (!panel || document.getElementById('demo-admin-extra')) return;
  panel.insertAdjacentHTML('beforeend', `
    <div id="demo-admin-extra" class="card" style="margin-top:16px">
      <div style="font-size:18px;font-weight:900;margin-bottom:10px">Control de demo</div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin-bottom:14px">
        <div><strong>Pruebas finalizadas</strong><div style="font-size:24px;font-weight:900">${runs.length}</div></div>
        <div><strong>XP histórico</strong><div style="font-size:24px;font-weight:900">${totalHistoricalXp}</div></div>
        <div><strong>XP actual</strong><div style="font-size:24px;font-weight:900">${currentUser?.totalXp || 0}</div></div>
      </div>
      <div style="color:var(--text-muted);font-size:14px;margin-bottom:12px">Ficha actual: ${getCurrentDemoMeta().code || 'sin código'} · ${getCurrentDemoMeta().age || 'edad no indicada'} años · ${getCurrentDemoMeta().device}</div>
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        <button onclick="finalizeDemoRun()" style="background:var(--success);color:white;border:none;padding:11px 18px;border-radius:8px;font-weight:900;cursor:pointer">Finalizar prueba</button>
        <button onclick="resetAdminTestProfile();renderAdminPanel()" style="background:var(--accent);color:white;border:none;padding:11px 18px;border-radius:8px;font-weight:900;cursor:pointer">Reiniciar demo</button>
        <button onclick="exportDemoRuns()" style="background:var(--primary);color:white;border:none;padding:11px 18px;border-radius:8px;font-weight:900;cursor:pointer">Exportar historial</button>
      </div>
    </div>
  `);
};

const demoOriginalEnterApp = enterApp;
enterApp = function() {
  demoOriginalEnterApp();
  ensureDemoBadge();
  applyPresentationMode();
};

// ===========================
