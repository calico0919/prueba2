// FOCUSLEARN ADMIN: modo prueba local, sin base de datos.
// ===========================
const ADMIN_TEST_EMAIL = 'prueba@focuslearn.local';
const ADMIN_TEST_NAME = 'Paraguay Educa';

function flAdminBaseProgress() {
  return {
    s:{level:1,subLevel:1,xp:0,maxXp:PROGRESSION_RULES.maxModuleXp},
    t:{level:1,subLevel:1,xp:0,maxXp:PROGRESSION_RULES.maxModuleXp},
    e:{level:1,subLevel:1,xp:0,maxXp:PROGRESSION_RULES.maxModuleXp},
    a:{level:1,subLevel:1,xp:0,maxXp:PROGRESSION_RULES.maxModuleXp},
    m:{level:1,subLevel:1,xp:0,maxXp:PROGRESSION_RULES.maxModuleXp}
  };
}

function flAdminCreateTestUser() {
  return {
    email: ADMIN_TEST_EMAIL,
    name: ADMIN_TEST_NAME,
    password: '',
    createdAt: new Date().toISOString(),
    conditions: [],
    evalAnswers: {},
    progress: flAdminBaseProgress(),
    achievements: [],
    totalXp: 0,
    settings: { daltonismo:false, contraste:false, estimulos:false, velocidad:false, darkmode:false }
  };
}

function flAdminSaveTestUser() {
  localStorage.setItem(FL_STORE.session, ADMIN_TEST_EMAIL);
  flSaveUser(currentUser);
  flSaveProfile(flCreateProfile(ADMIN_TEST_EMAIL, currentUser.conditions || []));
  flSyncProgressFromCurrentUser();
}

function flAdminLoadTestUser() {
  const stored = flGetUsers().find(u => flNormalizeEmail(u.email || u.id) === ADMIN_TEST_EMAIL);
  currentUser = stored || flAdminCreateTestUser();
  currentUser.email = ADMIN_TEST_EMAIL;
  currentUser.name = ADMIN_TEST_NAME;
  currentUser.progress = currentUser.progress || flAdminBaseProgress();
  ['s','t','e','a','m'].forEach(key => {
    currentUser.progress[key] = currentUser.progress[key] || { level:1, subLevel:1, xp:0, maxXp:PROGRESSION_RULES.maxModuleXp };
    currentUser.progress[key].maxXp = PROGRESSION_RULES.maxModuleXp;
    normalizeModuleProgress(key);
  });
  currentUser.achievements = currentUser.achievements || [];
  currentUser.totalXp = Object.values(currentUser.progress).reduce((sum, item) => sum + (item.xp || 0), 0);
  currentUser.settings = currentUser.settings || { daltonismo:false, contraste:false, estimulos:false, velocidad:false, darkmode:false };
  flAdminSaveTestUser();
}

function flAdminClearRunData() {
  [
    FL_STORE.users,
    FL_STORE.profilesMap,
    FL_STORE.currentProfile,
    FL_STORE.progressMap,
    FL_STORE.currentProgress,
    FL_STORE.session,
    FL_STORE.evalResults
  ].forEach(key => localStorage.removeItem(key));
}

function resetAdminTestProfile() {
  if (!confirm('¿Reiniciar XP, niveles, logros y progreso para el siguiente niño?')) return;
  flAdminClearRunData();
  currentUser = flAdminCreateTestUser();
  flAdminSaveTestUser();
  document.body.classList.remove('dark-mode','alto-contraste','reducir-estimulos','daltonismo');
  showToast('Perfil de prueba reiniciado. Listo para un nuevo niño.', 'success');
  updateSidebar();
  renderHome();
  showPage('home');
}

async function initDB() { return true; }
async function dbGet() { return null; }
async function dbPut() { return true; }

async function handleLogin() {
  flAdminLoadTestUser();
  enterApp();
}

async function handleRegister() {
  flAdminLoadTestUser();
  enterApp();
}

async function handleGoogleLogin() {
  flAdminLoadTestUser();
  enterApp();
}

async function logout() {
  resetAdminTestProfile();
}

const flAdminOriginalRenderProfile = renderProfile;
renderProfile = function() {
  flAdminOriginalRenderProfile();
  const stats = document.getElementById('profile-stats');
  if (!stats || document.getElementById('admin-reset-profile-btn')) return;
  stats.insertAdjacentHTML('afterend', `
    <div style="margin-top:18px;display:flex;justify-content:center">
      <button id="admin-reset-profile-btn" onclick="resetAdminTestProfile()" style="background:var(--accent);color:white;border:none;padding:10px 18px;border-radius:8px;font-family:'Nunito',sans-serif;font-weight:700;font-size:14px;cursor:pointer;">
        Reiniciar prueba
      </button>
    </div>
  `);
};

// ===========================
