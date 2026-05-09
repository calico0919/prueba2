// Bloqueo de avance: no se gana XP hasta revisar la actividad.
// ===========================
const ACTIVITY_REVIEW_STATE = {};
const VISUAL_CARD_REVIEW_STATE = {};
let COMPLETION_IN_PROGRESS = false;
let ACTIVE_ACTIVITY_REVIEW = null;

function activityReviewId(key, mode) {
  const state = normalizeModuleProgress(key);
  return `${key}:${mode}:${state.level}:${state.subLevel}`;
}

function activityIsReviewed(key, mode) {
  return !!ACTIVITY_REVIEW_STATE[activityReviewId(key, mode)];
}

function beginActivityReview(key, mode) {
  ACTIVE_ACTIVITY_REVIEW = { key, mode };
  ACTIVITY_REVIEW_STATE[activityReviewId(key, mode)] = false;
  setTimeout(() => refreshCompletionButtons(key, mode), 50);
  if (mode === 'games') {
    setTimeout(() => markActivityReviewed(key, mode, 'Tiempo mínimo de revisión completado'), 4000);
  }
}

function markActivityReviewed(key, mode, message = 'Actividad revisada. Ya podés completar.') {
  ACTIVITY_REVIEW_STATE[activityReviewId(key, mode)] = true;
  refreshCompletionButtons(key, mode);
  if (message) showToast(message, 'success');
}

function refreshCompletionButtons(key, mode) {
  const reviewed = activityIsReviewed(key, mode);
  const content = document.getElementById('content-view');
  if (!content) return;
  content.querySelectorAll('button').forEach(btn => {
    const action = btn.getAttribute('onclick') || '';
    const isCompleteButton = action.includes('completeModeLevel') || action.includes('completeVisualLevel');
    if (!isCompleteButton) return;
    btn.disabled = !reviewed || COMPLETION_IN_PROGRESS;
    btn.style.opacity = reviewed && !COMPLETION_IN_PROGRESS ? '1' : '.45';
    btn.style.cursor = reviewed && !COMPLETION_IN_PROGRESS ? 'pointer' : 'not-allowed';
    btn.title = reviewed ? '' : 'Primero revisá la actividad';
  });
}

function installActivityReviewHooks(key, mode) {
  beginActivityReview(key, mode);
  if (mode === 'visual') {
    registerVisualCardView(key);
  }
  if (mode === 'audio') {
    const play = document.getElementById('play-btn');
    if (play) {
      play.addEventListener('click', () => {
        setTimeout(() => markActivityReviewed(key, mode, 'Audio revisado. Ya podés completar.'), 4500);
      }, { once: true });
    }
  }
  if (mode === 'reading') {
    const btn = document.getElementById('submit-writing-btn');
    if (btn) btn.title = 'Primero escribí y evaluá tu respuesta';
  }
}

const gatedOriginalOpenContent = openContent;
openContent = function(key, mode) {
  const result = gatedOriginalOpenContent(key, mode);
  setTimeout(() => installActivityReviewHooks(key, mode), 80);
  return result;
};

const gatedOriginalCompleteModeLevel = completeModeLevel;
completeModeLevel = async function(key, mode) {
  if (!activityIsReviewed(key, mode)) {
    showToast('Primero terminá de revisar la actividad antes de completar.', 'error');
    refreshCompletionButtons(key, mode);
    return;
  }
  if (COMPLETION_IN_PROGRESS) return;
  COMPLETION_IN_PROGRESS = true;
  refreshCompletionButtons(key, mode);
  try {
    await gatedOriginalCompleteModeLevel(key, mode);
  } finally {
    COMPLETION_IN_PROGRESS = false;
    setTimeout(() => installActivityReviewHooks(key, mode), 120);
  }
};

const gatedOriginalCompleteVisualLevel = completeVisualLevel;
completeVisualLevel = function(key) {
  return completeModeLevel(key, 'visual');
};

const gatedOriginalSubmitWriting = submitWriting;
submitWriting = async function(key) {
  const result = await gatedOriginalSubmitWriting(key);
  const text = document.getElementById('writing-input')?.value?.trim() || '';
  if (text.length >= 10) {
    setTimeout(() => markActivityReviewed(key, 'reading', 'Respuesta revisada. Ya podés completar.'), 1500);
  }
  return result;
};

const gatedOriginalToggleKinestheticDemo = toggleKinestheticDemo;
toggleKinestheticDemo = function(key) {
  const result = gatedOriginalToggleKinestheticDemo(key);
  setTimeout(() => markActivityReviewed(key, 'kinesthetic', 'Actividad guiada revisada. Ya podés completar.'), 2500);
  return result;
};

document.addEventListener('click', (event) => {
  if (event.target.closest('#fc') && ACTIVE_ACTIVITY_REVIEW?.mode === 'visual') {
    setTimeout(() => registerVisualCardView(ACTIVE_ACTIVITY_REVIEW.key), 500);
  }
});

function visualReviewId(key) {
  const state = normalizeModuleProgress(key);
  return `${key}:visual:${state.level}:${state.subLevel}`;
}

function registerVisualCardView(key) {
  const id = visualReviewId(key);
  const cards = getLevelCards(key);
  VISUAL_CARD_REVIEW_STATE[id] = VISUAL_CARD_REVIEW_STATE[id] || new Set();
  VISUAL_CARD_REVIEW_STATE[id].add(currentCard);
  const seen = VISUAL_CARD_REVIEW_STATE[id].size;
  if (seen >= cards.length) {
    markActivityReviewed(key, 'visual', 'Viste todas las flashcards. Ya podés completar.');
  } else {
    refreshCompletionButtons(key, 'visual');
    showToast(`Flashcard ${seen}/${cards.length} revisada`, 'success');
  }
}

const visualGateOriginalNextCard = nextCard;
nextCard = function(key) {
  const result = visualGateOriginalNextCard(key);
  if (ACTIVE_ACTIVITY_REVIEW?.key === key && ACTIVE_ACTIVITY_REVIEW?.mode === 'visual') {
    setTimeout(() => registerVisualCardView(key), 80);
  }
  return result;
};

const visualGateOriginalPrevCard = prevCard;
prevCard = function(key) {
  const result = visualGateOriginalPrevCard(key);
  if (ACTIVE_ACTIVITY_REVIEW?.key === key && ACTIVE_ACTIVITY_REVIEW?.mode === 'visual') {
    setTimeout(() => registerVisualCardView(key), 80);
  }
  return result;
};

// Demo: se oculta la subida de material porque no se usa en la presentación.
function hideParentUploadForDemo() {
  if (document.getElementById('hide-parent-upload-demo-style')) return;
  document.head.insertAdjacentHTML('beforeend', `
    <style id="hide-parent-upload-demo-style">
      .upload-material-btn,
      #upload-modal { display:none !important; }
    </style>
  `);
}

// Reinicio con resumen visible: primero guarda la prueba, luego permite limpiar.
const directResetAdminTestProfile = resetAdminTestProfile;

function buildDemoSummaryForFamily() {
  const stats = flAdminDemoStats();
  const meta = getCurrentDemoMeta();
  const log = stats.log || [];
  const modeCounts = log.filter(e => e.type === 'open_content').reduce((acc, e) => {
    const mode = e.detail?.mode || 'sin modo';
    acc[mode] = (acc[mode] || 0) + 1;
    return acc;
  }, {});
  const supportCounts = log.filter(e => e.type === 'observer_note').reduce((acc, e) => {
    const note = e.detail?.note || 'observación';
    acc[note] = (acc[note] || 0) + 1;
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
    modesUsed: stats.modesUsed,
    modeCounts,
    supportCounts,
    preferredMode,
    completedActivities: stats.completed,
    demoLimitHits: stats.limitHits,
    totalXp: currentUser?.totalXp || 0,
    progress,
    recommendation: preferredMode === 'No observado'
      ? 'Todavía no hay un modo preferido claro. Conviene repetir la prueba explorando al menos dos módulos.'
      : `Respondió mejor con el modo ${preferredMode}. Para próximas sesiones conviene iniciar desde ese formato y luego combinarlo con otro modo.`
  };
}

function saveDemoSummary(summary) {
  const runs = readDemoRuns();
  runs.push(summary);
  saveDemoRuns(runs);
  flAdminLogEvent('demo_finished', { totalXp: summary.totalXp, preferredMode: summary.preferredMode });
  return runs.length;
}

function renderDemoFinalSummary(summary, count) {
  document.getElementById('demo-final-overlay')?.remove();
  const modeRows = Object.entries(summary.modeCounts || {}).map(([mode, amount]) =>
    `<div style="display:flex;justify-content:space-between;border-bottom:1px solid var(--border);padding:7px 0"><span>${mode}</span><strong>${amount}</strong></div>`
  ).join('') || '<p style="color:var(--text-muted)">No se registraron modos.</p>';
  const supportRows = Object.entries(summary.supportCounts || {}).map(([note, amount]) =>
    `<div style="display:flex;justify-content:space-between;border-bottom:1px solid var(--border);padding:7px 0"><span>${note}</span><strong>${amount}</strong></div>`
  ).join('') || '<p style="color:var(--text-muted)">Sin observaciones rápidas.</p>';
  document.body.insertAdjacentHTML('beforeend', `
    <div id="demo-final-overlay" style="position:fixed;inset:0;background:rgba(0,0,0,.58);z-index:10001;display:flex;align-items:center;justify-content:center;padding:20px">
      <div style="background:var(--surface);color:var(--text);width:min(900px,96vw);max-height:90vh;overflow:auto;border-radius:22px;box-shadow:var(--shadow-lg);padding:26px">
        <div style="font-size:30px;font-weight:900;margin-bottom:6px">Resumen final de prueba</div>
        <p style="color:var(--text-muted);font-size:15px;margin-bottom:18px">Prueba guardada #${count} · ${summary.child.code || 'Sin código'} · ${summary.child.age || 'Edad no indicada'} años</p>
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
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:14px;margin-bottom:14px">
          <div class="card"><strong>Uso por modo</strong><div style="margin-top:8px">${modeRows}</div></div>
          <div class="card"><strong>Observaciones rápidas</strong><div style="margin-top:8px">${supportRows}</div></div>
        </div>
        <div style="display:flex;gap:10px;justify-content:flex-end;flex-wrap:wrap">
          <button onclick="exportDemoRuns()" style="background:var(--primary);color:white;border:none;padding:11px 18px;border-radius:8px;font-weight:900;cursor:pointer">Exportar historial</button>
          <button onclick="finishResetAfterSummary()" style="background:var(--accent);color:white;border:none;padding:11px 18px;border-radius:8px;font-weight:900;cursor:pointer">Reiniciar para siguiente niño</button>
          <button onclick="document.getElementById('demo-final-overlay')?.remove()" style="background:var(--surface2);color:var(--text);border:1px solid var(--border);padding:11px 18px;border-radius:8px;font-weight:900;cursor:pointer">Cerrar sin reiniciar</button>
        </div>
      </div>
    </div>
  `);
}

function showFinalSummaryBeforeReset() {
  const summary = buildDemoSummaryForFamily();
  const count = saveDemoSummary(summary);
  renderDemoFinalSummary(summary, count);
}

function finishResetAfterSummary() {
  document.getElementById('demo-final-overlay')?.remove();
  resetDemoStateWithoutPrompt();
  flAdminResetObservationLog();
  showDemoWelcome();
}

function resetDemoStateWithoutPrompt() {
  flAdminClearRunData();
  currentUser = flAdminCreateTestUser();
  flAdminSaveTestUser();
  document.body.classList.remove('dark-mode','alto-contraste','reducir-estimulos','daltonismo');
  showToast('Perfil de prueba reiniciado. Listo para un nuevo niño.', 'success');
  updateSidebar();
  renderHome();
  showPage('home');
}

function finalizeDemoRun() {
  showFinalSummaryBeforeReset();
}

resetAdminTestProfile = function() {
  if ((currentUser?.totalXp || 0) > 0 || flAdminReadLog().length > 0) {
    showFinalSummaryBeforeReset();
    return;
  }
  directResetAdminTestProfile();
  flAdminResetObservationLog();
};


// ===========================
// STEAM SYSTEM V2.0: contenido curricular importado desde el documento base.
// Niveles 1 a 3 completos; niveles superiores conservan el contenido anterior si existe.
// ===========================
