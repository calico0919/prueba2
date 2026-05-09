const PROGRESSION_RULES = {
  xpPerCorrectAnswer: 100,
  xpPerSublevel: 10,
  sublevelsPerLevel: 10,
  maxDifficultyLevel: 5,
  maxModuleXp: 500
};

const STEAM_SUBLEVEL_TOPICS = {
  s: [
    ['Sol','Luna','Día','Noche','Día y noche','Nube','Lluvia','Árbol','Flor','¿Qué ves en el día?'],
    ['Perro','Gato','Pez','Pájaro','¿Cuál vive en el agua?','Insecto','Animal con alas','Animal con patas','Animal que nada','¿Cuál vuela?'],
    ['Planta','Agua para plantas','Planta con sol','Planta sin agua','¿Qué pasa sin agua?','Raíz','Hoja','Semilla','Planta seca','¿Qué falta?'],
    ['Regar planta','Dar sol','Elegir agua','Elegir tierra','Sol o agua','Cuidar flor','Quitar basura','Elegir sombra','Planta seca','¿Qué hacés?'],
    ['¿Por qué necesita agua?','Con agua / sin agua','Comparar plantas','Nunca llueve','Cuidar ambiente','Ahorrar agua','Planta sana','Planta débil','Explicar causa','¿Qué pasaría?']
  ],
  t: [
    ['Mouse','Teclado','Pantalla','Botón','Ícono','Tablet','Parlante','Cámara','Cable','¿Qué objeto es?'],
    ['¿Para qué sirve el mouse?','¿Para qué sirve el teclado?','Clic','Escribir','Mover puntero','Abrir app','Cerrar app','Guardar','Tocar pantalla','Elegir herramienta'],
    ['El mouse mueve el puntero','El teclado escribe','La pantalla muestra','Un botón hace algo','Un programa sigue pasos','Ordenar pasos','Inicio y final','Error simple','Reintentar','¿Qué pasó?'],
    ['Arrastrar objeto','Soltar objeto','Unir imagen','Ordenar botones','Elegir app','Guardar dibujo','Escuchar audio','Mover pieza','Completar acción','Usar herramienta'],
    ['Dibujar: mouse','Escribir: teclado','Escuchar: parlante','Foto: cámara','Ver: pantalla','Proteger cuenta','Elegir clave','Herramienta correcta','Resolver tarea','¿Cuál usás?']
  ],
  e: [
    ['Casa','Puente','Torre','Mesa','Silla','Bloque','Techo','Pared','Base','¿Qué construcción ves?'],
    ['Alto','Bajo','Grande','Pequeño','Fuerte','Débil','Pesado','Liviano','Estable','¿Cuál es alto?'],
    ['Material','Madera','Ladrillo','Metal','Papel','Construir','Sostener','Base fuerte','Casa firme','¿Con qué se construye?'],
    ['Elegir ladrillo','Elegir madera','No elegir papel mojado','Hacer base','Agregar soporte','Reparar torre','Probar puente','Elegir herramienta','Construir seguro','Material correcto'],
    ['Se cae: falta base','Se rompe: falta fuerza','Puente débil','Torre inclinada','Casa sin techo','¿Qué falta?','Mejorar diseño','Comparar estructuras','Elegir solución','Resolver caída']
  ],
  a: [
    ['Rojo','Azul','Amarillo','Verde','Negro','Blanco','Línea','Círculo','Cuadrado','¿Qué color ves?'],
    ['Identificar rojo','Identificar azul','Color claro','Color oscuro','Línea recta','Línea curva','Forma redonda','Forma cuadrada','Elegir color','¿Cuál es amarillo?'],
    ['Mezclar colores','Rojo + amarillo','Azul + amarillo','Color nuevo','Dibujar emoción','Carita feliz','Carita triste','Color caliente','Color frío','¿Qué color sale?'],
    ['Crear dibujo','Elegir fondo','Elegir personaje','Pintar escena','Ordenar formas','Hacer patrón','Decorar','Completar imagen','Crear algo','Mostrar idea'],
    ['Color y emoción','Rojo: energía','Azul: calma','Negro: misterio','Amarillo: alegría','Comparar emociones','Elegir color para sentir','Explicar color','Crear emoción','¿Qué sentís?']
  ],
  m: [
    ['Uno','Dos','Tres','Contar 1','Contar 2','Contar 3','Pocos','Muchos','Número 1-3','¿Cuántos hay?'],
    ['Cuatro','Cinco','Seis','Siete','Ocho','Nueve','Diez','Contar 1-10','Ordenar números','¿Qué número sigue?'],
    ['Más','Menos','Igual','Grande','Pequeño','Comparar grupos','Dónde hay más','Dónde hay menos','Mismo número','¿Cuál tiene más?'],
    ['Sumar con dedos','1 + 1','2 + 1','2 + 2','3 + 1','Sumar objetos','Juntar grupos','Agregar uno','Resultado visual','¿Cuánto hay?'],
    ['3 + 2','Te dan 2 más','Quitar 1','Problema corto','Resolver con dibujos','Elegir operación','Pensar respuesta','Explicar cómo','Comprobar','¿Cuántos quedan?']
  ]
};

const LEVEL_STAGE_NAMES = {
  1: 'Descubrimiento',
  2: 'Reconocimiento',
  3: 'Comprensión',
  4: 'Aplicación',
  5: 'Razonamiento'
};

const LEVEL_STAGE_PROMPTS = {
  1: ['Mostrar', 'Esto es', 'Mirá y nombrá'],
  2: ['Reconocer', 'Elegí', '¿Cuál corresponde?'],
  3: ['Comprender', 'Pensá qué pasa', '¿Por qué ocurre?'],
  4: ['Aplicar', 'Usá lo aprendido', '¿Qué harías?'],
  5: ['Razonar', 'Compará y explicá', '¿Qué pasaría?']
};

function normalizeModuleProgress(key) {
  if (!currentUser) return { totalXp: 0, level: 1, subLevel: 1, maxXp: PROGRESSION_RULES.maxModuleXp };
  currentUser.progress = currentUser.progress || {};
  currentUser.progress[key] = currentUser.progress[key] || { level: 1, xp: 0, maxXp: PROGRESSION_RULES.maxModuleXp };
  const p = currentUser.progress[key];
  const totalXp = Math.max(0, Math.min(PROGRESSION_RULES.maxModuleXp, Number(p.xp) || 0));
  const cappedForLevel = Math.min(totalXp, PROGRESSION_RULES.maxModuleXp - 1);
  const level = totalXp >= PROGRESSION_RULES.maxModuleXp
    ? PROGRESSION_RULES.maxDifficultyLevel
    : Math.floor(cappedForLevel / 100) + 1;
  const xpInsideLevel = totalXp >= PROGRESSION_RULES.maxModuleXp ? 100 : totalXp - ((level - 1) * 100);
  const subLevel = totalXp >= PROGRESSION_RULES.maxModuleXp
    ? PROGRESSION_RULES.sublevelsPerLevel
    : Math.floor(xpInsideLevel / PROGRESSION_RULES.xpPerSublevel) + 1;
  p.xp = totalXp;
  p.level = level;
  p.subLevel = Math.max(1, Math.min(PROGRESSION_RULES.sublevelsPerLevel, subLevel));
  p.maxXp = PROGRESSION_RULES.maxModuleXp;
  p.xpInsideLevel = Math.min(100, xpInsideLevel);
  return { totalXp: p.xp, level: p.level, subLevel: p.subLevel, maxXp: p.maxXp, xpInsideLevel: p.xpInsideLevel };
}

function getModuleLevel(key) {
  return normalizeModuleProgress(key).level;
}

function getModuleSubLevel(key) {
  return normalizeModuleProgress(key).subLevel;
}

function getSublevelTopic(key) {
  const state = normalizeModuleProgress(key);
  return STEAM_SUBLEVEL_TOPICS[key]?.[state.level - 1]?.[state.subLevel - 1] || 'Tema del nivel';
}

function getLearningStage(level) {
  return LEVEL_STAGE_NAMES[level] || 'Aprendizaje';
}

function getLevelCards(key) {
  const state = normalizeModuleProgress(key);
  const topic = getSublevelTopic(key);
  const prompts = LEVEL_STAGE_PROMPTS[state.level] || LEVEL_STAGE_PROMPTS[1];
  const uploaded = flRead(FL_STORE.parentUploads, []).filter(item => !item.module || item.module === key);
  const moduleDefMap = {
    s: ['🌱 La Tierra es el hogar de millones de seres vivos que dependen unos de otros para sobrevivir.', '💧 El agua es esencial para toda forma de vida: sin ella, las plantas, animales y personas no pueden existir.', '☀️ El Sol es la fuente de energía que hace posible la vida en nuestro planeta.'],
    t: ['🖥️ Una computadora procesa información siguiendo instrucciones paso a paso para resolver problemas.', '🌐 Internet conecta millones de dispositivos alrededor del mundo para compartir información al instante.', '🤖 Un algoritmo es una lista de pasos ordenados que le dice a una máquina exactamente qué hacer.'],
    e: ['⚙️ La ingeniería diseña soluciones prácticas para problemas reales usando materiales y herramientas.', '🏗️ Una estructura resiste el peso gracias a la forma en que sus partes se conectan y distribuyen la carga.', '⚡ Un circuito eléctrico es el camino cerrado por donde viaja la electricidad para encender o mover cosas.'],
    a: ['🎨 El color en el arte transmite emociones: el rojo puede significar energía y el azul puede dar calma.', '✏️ Una línea puede crear movimiento, separar espacios o guiar la mirada hacia un punto importante.', '🖼️ Una composición equilibrada hace que una obra se vea armónica y agradable a la vista.'],
    m: ['🔢 Los números nos permiten contar, ordenar y comparar cantidades en la vida cotidiana.', '➕ Sumar es juntar dos grupos para saber cuánto hay en total, como juntar manzanas en una canasta.', '📐 Las figuras geométricas están en todas partes: en las ventanas, las ruedas y los edificios.']
  };
  const defs = moduleDefMap[key] || [`Etapa ${getLearningStage(state.level)}: ${topic}.`, `Identificá ${topic} con atención.`, `Aplicá lo aprendido sobre ${topic}.`];
  const baseCards = [
    { emoji: MODULES[key].emoji, word: topic, def: defs[0] },
    { emoji: '💡', word: prompts[1], def: defs[1] },
    { emoji: '🎯', word: prompts[2], def: defs[2] }
  ];
  const extraCards = uploaded.map(item => ({ emoji:'📎', word:item.name, def:'Material subido por padres disponible para reforzar este módulo.' }));
  return [...baseCards, ...extraCards].slice(0, 5);
}

function getLevelText(map, key) {
  const state = normalizeModuleProgress(key);
  const topic = getSublevelTopic(key);
  const moduleName = MODULES[key]?.name || 'STEAM';
  const stage = getLearningStage(state.level);
  const prompt = LEVEL_STAGE_PROMPTS[state.level]?.[2] || 'Respondé';
  return `<strong>Nivel ${state.level} · ${stage} · Subnivel ${state.subLevel}/10 · ${moduleName}:</strong> ${topic}. ${state.level === 1 ? `Esto es ${topic}.` : ''} ${state.level === 2 ? `Reconocé ${topic} entre otras opciones.` : ''} ${state.level === 3 ? `Comprendé para qué sirve o qué pasa con ${topic}.` : ''} ${state.level === 4 ? `Aplicá lo aprendido con una acción simple sobre ${topic}.` : ''} ${state.level === 5 ? `Razoná y explicá con tus palabras una consecuencia relacionada con ${topic}.` : ''} ${prompt}`;
}

function flBuildEvaluationResults() {
  const byArea = { science:{ok:0,total:0}, technology:{ok:0,total:0}, engineering:{ok:0,total:0}, arts:{ok:0,total:0}, math:{ok:0,total:0} };
  const misconceptions = [];
  FL_EVAL_QUESTIONS.forEach((q, idx) => {
    byArea[q.area].total++;
    if (flEvalAnswers[idx] === q.correct) byArea[q.area].ok++;
    else misconceptions.push(q.area === 'math' ? 'porcentajes' : q.area === 'science' ? 'densidad' : q.area);
  });
  const correct = area => byArea[area].ok;
  const score = area => Math.round((correct(area) / byArea[area].total) * 10);
  const avg = flEvalTimes.reduce((a,b) => a + b, 0) / Math.max(flEvalTimes.length, 1);
  const speed = avg < 15 ? 'rápido' : avg <= 30 ? 'medio' : 'lento';
  const levelFromXp = xp => normalizePlacementFromXp(xp).levelLabel;
  const xpForArea = area => correct(area) * PROGRESSION_RULES.xpPerCorrectAnswer;
  return {
    user_id: currentUser.email,
    science: score('science'),
    technology: score('technology'),
    engineering: score('engineering'),
    arts: score('arts'),
    math: score('math'),
    correct_answers: {
      science: correct('science'),
      technology: correct('technology'),
      engineering: correct('engineering'),
      arts: correct('arts'),
      math: correct('math')
    },
    initial_xp: {
      science: xpForArea('science'),
      technology: xpForArea('technology'),
      engineering: xpForArea('engineering'),
      arts: xpForArea('arts'),
      math: xpForArea('math')
    },
    evaluation_scoring: {
      questions_per_area: 5,
      xp_per_correct_answer: PROGRESSION_RULES.xpPerCorrectAnswer,
      xp_per_sublevel: PROGRESSION_RULES.xpPerSublevel,
      sublevels_per_level: PROGRESSION_RULES.sublevelsPerLevel,
      xp_to_next_difficulty_level: 100
    },
    knowledge_by_steam: {
      S: { area:'Science', score:score('science'), xp:xpForArea('science'), placement:levelFromXp(xpForArea('science')) },
      T: { area:'Technology', score:score('technology'), xp:xpForArea('technology'), placement:levelFromXp(xpForArea('technology')) },
      E: { area:'Engineering', score:score('engineering'), xp:xpForArea('engineering'), placement:levelFromXp(xpForArea('engineering')) },
      A: { area:'Arts', score:score('arts'), xp:xpForArea('arts'), placement:levelFromXp(xpForArea('arts')) },
      M: { area:'Maths', score:score('math'), xp:xpForArea('math'), placement:levelFromXp(xpForArea('math')) }
    },
    speed,
    time_per_question: flEvalTimes,
    misconceptions: [...new Set(misconceptions)].slice(0, 4),
    levels: {
      science: levelFromXp(xpForArea('science')),
      technology: levelFromXp(xpForArea('technology')),
      engineering: levelFromXp(xpForArea('engineering')),
      arts: levelFromXp(xpForArea('arts')),
      math: levelFromXp(xpForArea('math'))
    },
    ui: {
      pace: speed === 'lento' ? '0.8x' : '1.0x',
      colors: currentUser.settings?.daltonismo ? 'daltonismo' : 'standard',
      stimuli: currentUser.settings?.estimulos ? 'reduced' : 'normal'
    },
    completed_at: new Date().toISOString()
  };
}

function normalizePlacementFromXp(xp) {
  const totalXp = Math.max(0, Math.min(PROGRESSION_RULES.maxModuleXp, Number(xp) || 0));
  if (totalXp >= PROGRESSION_RULES.maxModuleXp) {
    return { level: 5, subLevel: 10, levelLabel: 'nivel 5 · subnivel 10/10' };
  }
  const level = Math.floor(totalXp / 100) + 1;
  const inside = totalXp - ((level - 1) * 100);
  const subLevel = Math.floor(inside / PROGRESSION_RULES.xpPerSublevel) + 1;
  return { level, subLevel, levelLabel: `nivel ${level} · subnivel ${subLevel}/10` };
}

function flApplyEvaluationScoresToProgress(results) {
  if (!currentUser) return;
  const xpMap = {
    s: results.initial_xp?.science ?? 0,
    t: results.initial_xp?.technology ?? 0,
    e: results.initial_xp?.engineering ?? 0,
    a: results.initial_xp?.arts ?? 0,
    m: results.initial_xp?.math ?? 0
  };
  Object.entries(xpMap).forEach(([key, xp]) => {
    currentUser.progress[key] = currentUser.progress[key] || { level:1, xp:0, maxXp:PROGRESSION_RULES.maxModuleXp };
    currentUser.progress[key].xp = Math.max(0, Math.min(PROGRESSION_RULES.maxModuleXp, Number(xp) || 0));
    currentUser.progress[key].maxXp = PROGRESSION_RULES.maxModuleXp;
    normalizeModuleProgress(key);
  });
  currentUser.totalXp = Object.values(currentUser.progress).reduce((total, item) => total + (item.xp || 0), 0);
  flSyncProgressFromCurrentUser();
}

async function completeModeLevel(key, mode) {
  if (!currentUser?.progress?.[key]) return;
  const before = normalizeModuleProgress(key);
  const p = currentUser.progress[key];
  const earned = PROGRESSION_RULES.xpPerSublevel;
  p.xp = Math.min(PROGRESSION_RULES.maxModuleXp, (p.xp || 0) + earned);
  currentUser.totalXp = Object.values(currentUser.progress).reduce((total, item) => total + (item.xp || 0), 0);
  const after = normalizeModuleProgress(key);

  if (before.level !== after.level) {
    showToast(`¡Pasaste a Nivel ${after.level} en ${MODULES[key].name}! +${earned} XP 🎉`, 'success');
  } else if (after.totalXp >= PROGRESSION_RULES.maxModuleXp) {
    showToast(`¡Completaste el nivel final de ${MODULES[key].name}! +${earned} XP 🌟`, 'success');
  } else {
    showToast(`Subnivel ${after.subLevel}/10 completado en ${MODULES[key].name}. +${earned} XP`, 'success');
  }

  const progress = flGetProgress(currentUser.email) || flCreateProgress(currentUser.email);
  const area = AREA_BY_KEY[key];
  if (area && progress.modules[area]) {
    progress.modules[area].activities_completed += 1;
    progress.modules[area].points = p.xp;
    progress.modules[area].level = p.level;
    progress.modules[area].sub_level = p.subLevel;
    if (key === 's') progress.missions.daily.science = Math.min(progress.missions.daily.science + 1, progress.missions.daily.target);
    progress.missions.weekly.total_activities += 1;
  }
  progress.total_points = currentUser.totalXp;
  progress.total_level = Object.values(currentUser.progress).reduce((sum, item) => sum + (item.level || 0), 0);
  flSaveProgress(progress);
  await dbPut('users', currentUser);
  flSyncLocalUser();
  renderHome();
  spawnSparkles();

  const back = `<button class="back-btn" onclick="openModule('${key}')">← Volver a ${MODULES[key].name}</button>`;
  if (mode === 'visual') {
    currentCard = 0;
    document.getElementById('content-view').innerHTML = back + renderFlashcards(null, key);
  } else if (mode === 'audio') {
    ttsStop();
    document.getElementById('content-view').innerHTML = back + renderPodcast(key);
  } else if (mode === 'reading') {
    document.getElementById('content-view').innerHTML = back + renderReadingWriting(key);
  } else if (mode === 'kinesthetic') {
    document.getElementById('content-view').innerHTML = back + renderKinesthetic(key);
  } else if (mode === 'games') {
    document.getElementById('content-view').innerHTML = back + renderGames(key);
  }
}

function completeVisualLevel(key) {
  completeModeLevel(key, 'visual');
}

function renderModuleCards() {
  const keys = ['s','t','e','a','m'];
  const grid = document.getElementById('modules-grid');
  grid.innerHTML = keys.map(k => {
    const m = MODULES[k];
    const state = normalizeModuleProgress(k);
    return `<div class="module-card ${m.color}" onclick="openModule('${k}')">
      <span class="module-emoji">${m.emoji}</span>
      <div class="module-letter">${m.letter}</div>
      <div class="module-name">${m.name}</div>
      <div class="module-level">Nivel ${state.level} · ${state.subLevel}/10</div>
    </div>`;
  }).join('');
}

function renderProgress() {
  const keys = ['s','t','e','a','m'];
  const list = document.getElementById('progress-list');
  if (!list) return;
  list.innerHTML = keys.map(k => {
    const m = MODULES[k];
    const state = normalizeModuleProgress(k);
    const pct = Math.round((state.totalXp / state.maxXp) * 100);
    return `<div class="progress-item">
      <div class="progress-icon" style="background:${m.barColor}22">${m.emoji}</div>
      <div class="progress-info">
        <div class="progress-label">${m.name} — Nivel ${state.level} · Subnivel ${state.subLevel}/10</div>
        <div class="progress-bar-wrap">
          <div class="progress-bar" style="width:${pct}%;background:${m.barColor}"></div>
        </div>
        <div class="progress-xp">${state.totalXp} / ${state.maxXp} XP</div>
      </div>
    </div>`;
  }).join('');
}

function openModule(key) {
  currentModule = key;
  const m = MODULES[key];
  const state = normalizeModuleProgress(key);
  document.getElementById('module-content').innerHTML = `
    <button class="back-btn" onclick="showPage('home')">← Volver</button>
    <div class="module-header" style="background:${m.headerColor}">
      <div class="module-header-icon">${m.emoji}</div>
      <div class="module-header-info">
        <h2>${m.letter} — ${m.name}</h2>
        <p>Nivel ${state.level} · Subnivel ${state.subLevel}/10 · ${state.totalXp}/${state.maxXp} XP</p>
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
        <div class="mode-desc">Actividad práctica</div>
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

function renderFlashcards(cards, key) {
  const state = normalizeModuleProgress(key);
  const allCards = getLevelCards(key);
  const c = allCards[0];
  const isFinal = state.totalXp >= PROGRESSION_RULES.maxModuleXp;
  return `
    <div class="flashcard-container">
      <p style="color:var(--text-muted);font-size:14px;margin-bottom:16px">
        Nivel ${state.level} · Subnivel ${state.subLevel}/10 · ${state.totalXp}/${state.maxXp} XP
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
        ${isFinal ? '✓ Repasar nivel final' : '✓ Completar subnivel'}
      </button>
    </div>`;
}

function renderPodcast(key) {
  const m = MODULES[key];
  const state = normalizeModuleProgress(key);
  const text = getLevelText(LEVEL_AUDIO_TEXTS, key);
  const ttsId = 'podcast-' + key;
  return `
    <div class="podcast-player">
      <div class="podcast-cover" style="background:${m.barColor}">${m.emoji}</div>
      <div class="podcast-title">Nivel ${state.level} · Subnivel ${state.subLevel}/10 · ${m.name}</div>
      <div class="podcast-episode">Audio adaptado al nivel actual</div>
      <div class="podcast-progress">
        <div class="podcast-progress-fill" id="pod-progress"></div>
      </div>
      <div class="podcast-time"><span>${state.totalXp} XP</span><span>${state.maxXp} XP</span></div>
      <div class="podcast-controls">
        <button class="pod-btn" onclick="showToast('⏮ Volvé al nivel anterior desde el progreso')">⏮</button>
        <button class="pod-btn play" id="play-btn" onclick="ttsToggle('${ttsId}')">▶</button>
        <button class="pod-btn" onclick="showToast('Completá este audio para avanzar')">⏭</button>
      </div>
    </div>
    <div class="tts-section">
      <p style="font-weight:800;margin-bottom:12px;color:var(--text)">📢 Lector auditivo · Nivel ${state.level} · Subnivel ${state.subLevel}/10</p>
      ${buildTTSControls(ttsId, text)}
      <button onclick="completeModeLevel('${key}','audio')" style="margin-top:14px;background:var(--success);color:white;border:none;padding:10px 20px;border-radius:100px;font-family:'Nunito',sans-serif;font-weight:700;cursor:pointer;">
        ✓ Completar subnivel
      </button>
    </div>`;
}

function renderReadingWriting(key) {
  const state = normalizeModuleProgress(key);
  const text = getLevelText(LEVEL_READING_TEXTS, key);
  return `
    <div class="reading-writing">
      <div class="material-text">${text}</div>
      <div class="writing-area">
        <div class="writing-label">✏️ Nivel ${state.level} · Subnivel ${state.subLevel}/10 · Escribí lo que entendiste:</div>
        <textarea id="writing-input" aria-label="Respuesta escrita del alumno" placeholder="Escribí aquí tu resumen..."></textarea>
        <br>
        <button class="submit-writing" id="submit-writing-btn" aria-label="Evaluar mi respuesta" onclick="submitWriting('${key}')">
          📝 Evaluar mi respuesta
        </button>
        <div id="writing-feedback"></div>
      </div>
    </div>`;
}

function renderKinesthetic(key) {
  const m = MODULES[key];
  const state = normalizeModuleProgress(key);
  return `
    <div style="max-width:700px;margin:0 auto">
      <div style="border-radius:16px;overflow:hidden;box-shadow:var(--shadow-lg);background:var(--surface2);aspect-ratio:16/9;display:flex;align-items:center;justify-content:center;text-align:center;padding:24px">
        <div>
          <div style="font-size:58px;margin-bottom:12px">${m.emoji}</div>
          <p style="font-weight:800;color:var(--text);font-size:20px">📹 Nivel ${state.level} · Subnivel ${state.subLevel}/10 · Video en preparación</p>
          <p style="color:var(--text-muted);margin-top:8px">Completar esta actividad suma ${PROGRESSION_RULES.xpPerSublevel} XP, igual que los otros modos.</p>
          <button onclick="completeModeLevel('${key}','kinesthetic')" style="margin-top:18px;background:var(--primary);color:white;border:none;padding:12px 24px;border-radius:100px;font-family:'Nunito',sans-serif;font-weight:700;cursor:pointer;">
            ✓ Completar subnivel
          </button>
        </div>
      </div>
    </div>`;
}

// Contenido pedagógico corto: 1 subnivel = 1 idea, misma idea en todos los modos.
const STEAM_MODE_CONTENT = {
  s: [
    [
      { idea:'El sol es una estrella en el cielo', visualFront:'El sol', visualBack:'Imagen grande del sol 🌞', audio:'El sol está en el cielo', reading:'El sol', kinesthetic:'Arrastrar sol hacia el cielo', gameQuestion:'¿Cuál ves de día?', gameOptions:['Sol','Luna'], gameAnswer:'Sol' },
      { idea:'La luna se ve de noche', visualFront:'La luna', visualBack:'Imagen grande de la luna 🌙', audio:'La luna se ve de noche', reading:'La luna', kinesthetic:'Arrastrar luna hacia la noche', gameQuestion:'¿Cuál ves de noche?', gameOptions:['Luna','Sol'], gameAnswer:'Luna' },
      { idea:'El día tiene luz', visualFront:'Día', visualBack:'Cielo con luz ☀️', audio:'De día hay luz', reading:'Día', kinesthetic:'Tocar el cielo claro', gameQuestion:'¿Dónde hay luz?', gameOptions:['Día','Noche'], gameAnswer:'Día' },
      { idea:'La noche es oscura', visualFront:'Noche', visualBack:'Cielo oscuro 🌌', audio:'La noche es oscura', reading:'Noche', kinesthetic:'Tocar el cielo oscuro', gameQuestion:'¿Dónde está oscuro?', gameOptions:['Noche','Día'], gameAnswer:'Noche' },
      { idea:'El sol aparece de día', visualFront:'Día vs noche', visualBack:'Imagen dividida: día y noche', audio:'De día vemos el sol', reading:'Día = sol', kinesthetic:'Arrastrar sol al lado correcto', gameQuestion:'Elegí el día correcto', gameOptions:['Día','Noche'], gameAnswer:'Día' },
      { idea:'Las nubes están en el cielo', visualFront:'Nube', visualBack:'Nube blanca ☁️', audio:'La nube está en el cielo', reading:'Nube', kinesthetic:'Poner nube en el cielo', gameQuestion:'¿Qué está en el cielo?', gameOptions:['Nube','Zapato'], gameAnswer:'Nube' },
      { idea:'La lluvia cae del cielo', visualFront:'Lluvia', visualBack:'Gotas cayendo 🌧️', audio:'La lluvia cae', reading:'Lluvia', kinesthetic:'Arrastrar gotas hacia abajo', gameQuestion:'¿Qué cae del cielo?', gameOptions:['Lluvia','Mesa'], gameAnswer:'Lluvia' },
      { idea:'El árbol es una planta grande', visualFront:'Árbol', visualBack:'Árbol grande 🌳', audio:'El árbol es grande', reading:'Árbol', kinesthetic:'Tocar el tronco', gameQuestion:'¿Cuál es una planta?', gameOptions:['Árbol','Silla'], gameAnswer:'Árbol' },
      { idea:'La flor es una planta', visualFront:'Flor', visualBack:'Flor de color 🌸', audio:'La flor es una planta', reading:'Flor', kinesthetic:'Tocar la flor', gameQuestion:'¿Cuál es flor?', gameOptions:['Flor','Piedra'], gameAnswer:'Flor' },
      { idea:'El sol da luz', visualFront:'Sol iluminando', visualBack:'El sol ilumina 🌞', audio:'El sol nos da luz', reading:'El sol ilumina', kinesthetic:'Activar luz tocando sol', gameQuestion:'¿Qué da luz?', gameOptions:['Sol','Luna'], gameAnswer:'Sol' }
    ],
    [
      { idea:'El perro es un animal', visualFront:'Perro', visualBack:'Perro 🐶', audio:'Esto es un perro', reading:'Perro', kinesthetic:'Tocar perro', gameQuestion:'¿Cuál es perro?', gameOptions:['Perro','Pez'], gameAnswer:'Perro' },
      { idea:'El gato es un animal', visualFront:'Gato', visualBack:'Gato 🐱', audio:'Esto es un gato', reading:'Gato', kinesthetic:'Tocar gato', gameQuestion:'¿Cuál es gato?', gameOptions:['Gato','Ave'], gameAnswer:'Gato' },
      { idea:'El pez vive en agua', visualFront:'Pez', visualBack:'Pez en agua 🐟', audio:'El pez vive en agua', reading:'Pez', kinesthetic:'Arrastrar pez al agua', gameQuestion:'¿Quién vive en agua?', gameOptions:['Pez','Perro'], gameAnswer:'Pez' },
      { idea:'El pájaro tiene alas', visualFront:'Pájaro', visualBack:'Pájaro con alas 🐦', audio:'El pájaro tiene alas', reading:'Pájaro', kinesthetic:'Tocar alas', gameQuestion:'¿Quién tiene alas?', gameOptions:['Pájaro','Gato'], gameAnswer:'Pájaro' },
      { idea:'Algunos animales viven en agua', visualFront:'Pez en agua', visualBack:'Agua + pez', audio:'El pez vive en el agua', reading:'Necesita agua', kinesthetic:'Arrastrar pez al agua', gameQuestion:'¿Cuál vive en el agua?', gameOptions:['Pez','Gato'], gameAnswer:'Pez' },
      { idea:'Un insecto es pequeño', visualFront:'Insecto', visualBack:'Insecto pequeño 🐞', audio:'El insecto es pequeño', reading:'Insecto', kinesthetic:'Tocar insecto', gameQuestion:'¿Cuál es pequeño?', gameOptions:['Insecto','Casa'], gameAnswer:'Insecto' },
      { idea:'Las alas ayudan a volar', visualFront:'Alas', visualBack:'Alas abiertas', audio:'Las alas ayudan a volar', reading:'Alas', kinesthetic:'Mover alas', gameQuestion:'¿Qué ayuda a volar?', gameOptions:['Alas','Patas'], gameAnswer:'Alas' },
      { idea:'Las patas ayudan a caminar', visualFront:'Patas', visualBack:'Animal caminando', audio:'Las patas ayudan a caminar', reading:'Patas', kinesthetic:'Tocar patas', gameQuestion:'¿Qué usa para caminar?', gameOptions:['Patas','Alas'], gameAnswer:'Patas' },
      { idea:'Nadar es moverse en agua', visualFront:'Animal nadando', visualBack:'Movimiento en agua', audio:'Nadar es moverse en agua', reading:'Nadar', kinesthetic:'Mover pez en agua', gameQuestion:'¿Dónde se nada?', gameOptions:['Agua','Cielo'], gameAnswer:'Agua' },
      { idea:'El pájaro vuela', visualFront:'Pájaro volando', visualBack:'Pájaro en el cielo', audio:'El pájaro vuela', reading:'Vuela', kinesthetic:'Arrastrar pájaro al cielo', gameQuestion:'¿Cuál vuela?', gameOptions:['Pájaro','Pez'], gameAnswer:'Pájaro' }
    ],
    [
      { idea:'Las plantas están vivas', visualFront:'Planta', visualBack:'Planta verde 🪴', audio:'La planta está viva', reading:'Planta', kinesthetic:'Tocar planta', gameQuestion:'¿Cuál está viva?', gameOptions:['Planta','Piedra'], gameAnswer:'Planta' },
      { idea:'Las plantas necesitan agua', visualFront:'Agua + planta', visualBack:'Planta regada', audio:'Las plantas necesitan agua', reading:'Agua', kinesthetic:'Arrastrar agua', gameQuestion:'¿Qué necesita?', gameOptions:['Agua','Arena seca'], gameAnswer:'Agua' },
      { idea:'Las plantas necesitan sol', visualFront:'Sol + planta', visualBack:'Planta con sol', audio:'Las plantas necesitan sol', reading:'Sol', kinesthetic:'Poner sol arriba', gameQuestion:'¿Qué ayuda a crecer?', gameOptions:['Sol','Basura'], gameAnswer:'Sol' },
      { idea:'La raíz toma agua', visualFront:'Raíz', visualBack:'Raíz bajo tierra', audio:'La raíz toma agua', reading:'Raíz', kinesthetic:'Tocar raíz', gameQuestion:'¿Qué toma agua?', gameOptions:['Raíz','Flor'], gameAnswer:'Raíz' },
      { idea:'La hoja recibe luz', visualFront:'Hoja', visualBack:'Hoja verde 🍃', audio:'La hoja recibe luz', reading:'Hoja', kinesthetic:'Tocar hoja', gameQuestion:'¿Qué recibe luz?', gameOptions:['Hoja','Piedra'], gameAnswer:'Hoja' },
      { idea:'La semilla puede crecer', visualFront:'Semilla', visualBack:'Semilla en tierra', audio:'La semilla puede crecer', reading:'Semilla', kinesthetic:'Poner semilla en tierra', gameQuestion:'¿Qué puede crecer?', gameOptions:['Semilla','Botón'], gameAnswer:'Semilla' },
      { idea:'La tierra sostiene la planta', visualFront:'Tierra', visualBack:'Planta en tierra', audio:'La tierra sostiene la planta', reading:'Tierra', kinesthetic:'Poner planta en tierra', gameQuestion:'¿Qué sostiene?', gameOptions:['Tierra','Nube'], gameAnswer:'Tierra' },
      { idea:'Cuidar una planta toma tiempo', visualFront:'Planta creciendo', visualBack:'Pequeña a grande', audio:'La planta crece con cuidado', reading:'Crece', kinesthetic:'Ordenar crecimiento', gameQuestion:'¿Qué hace la planta?', gameOptions:['Crece','Vuela'], gameAnswer:'Crece' },
      { idea:'Sin agua, la planta se seca', visualFront:'Planta seca', visualBack:'Planta triste y seca', audio:'Sin agua se seca', reading:'La planta se seca', kinesthetic:'Elegir causa', gameQuestion:'¿Qué le faltó?', gameOptions:['Agua','Pintura'], gameAnswer:'Agua' },
      { idea:'Una planta seca necesita agua', visualFront:'Planta seca', visualBack:'Agua para ayudar', audio:'La planta seca necesita agua', reading:'Necesita agua', kinesthetic:'Salvar planta', gameQuestion:'¿Cómo la ayudás?', gameOptions:['Agua','Basura'], gameAnswer:'Agua' }
    ],
    [
      { idea:'Regar ayuda a la planta', visualFront:'Regar', visualBack:'Agua sobre planta', audio:'Regar ayuda', reading:'Regar', kinesthetic:'Regar planta', gameQuestion:'¿Qué hacés?', gameOptions:['Regar','Tapar'], gameAnswer:'Regar' },
      { idea:'El sol ayuda a crecer', visualFront:'Sol cerca', visualBack:'Planta con luz', audio:'El sol ayuda', reading:'Sol ayuda', kinesthetic:'Mover planta al sol', gameQuestion:'¿Qué necesita?', gameOptions:['Sol','Sombra total'], gameAnswer:'Sol' },
      { idea:'El agua no es basura', visualFront:'Agua limpia', visualBack:'Gota limpia', audio:'Elegimos agua limpia', reading:'Agua limpia', kinesthetic:'Elegir agua', gameQuestion:'¿Qué elegís?', gameOptions:['Agua','Basura'], gameAnswer:'Agua' },
      { idea:'La tierra ayuda a sostener', visualFront:'Tierra', visualBack:'Raíz en tierra', audio:'La tierra sostiene', reading:'Tierra', kinesthetic:'Poner tierra', gameQuestion:'¿Qué sostiene?', gameOptions:['Tierra','Papel'], gameAnswer:'Tierra' },
      { idea:'Sol y agua ayudan juntos', visualFront:'Sol + agua', visualBack:'Planta sana', audio:'Sol y agua ayudan', reading:'Sol + agua', kinesthetic:'Unir sol y agua', gameQuestion:'¿Qué par ayuda?', gameOptions:['Sol y agua','Basura y ruido'], gameAnswer:'Sol y agua' },
      { idea:'Cuidar una flor es una acción', visualFront:'Cuidar flor', visualBack:'Flor feliz', audio:'Cuidamos la flor', reading:'Cuidar', kinesthetic:'Tocar flor con cuidado', gameQuestion:'¿Qué hacés?', gameOptions:['Cuidar','Romper'], gameAnswer:'Cuidar' },
      { idea:'La basura daña plantas', visualFront:'Basura lejos', visualBack:'Planta limpia', audio:'Sacamos basura', reading:'Sin basura', kinesthetic:'Quitar basura', gameQuestion:'¿Qué sacás?', gameOptions:['Basura','Agua'], gameAnswer:'Basura' },
      { idea:'Mucha sombra puede quitar luz', visualFront:'Sombra', visualBack:'Planta sin sol', audio:'La sombra tapa la luz', reading:'Sombra', kinesthetic:'Mover sombra', gameQuestion:'¿Qué tapa luz?', gameOptions:['Sombra','Agua'], gameAnswer:'Sombra' },
      { idea:'Una planta seca pide ayuda', visualFront:'Planta seca', visualBack:'Señal de ayuda', audio:'La planta seca necesita ayuda', reading:'Ayuda', kinesthetic:'Elegir ayuda', gameQuestion:'¿Qué necesita?', gameOptions:['Agua','Ruido'], gameAnswer:'Agua' },
      { idea:'Si está seca, la regamos', visualFront:'Planta seca', visualBack:'Regar planta', audio:'Si está seca, regamos', reading:'Regar', kinesthetic:'Resolver: regar', gameQuestion:'La planta está seca. ¿Qué hacés?', gameOptions:['Regar','Apagar luz'], gameAnswer:'Regar' }
    ],
    [
      { idea:'El agua viaja por la planta', visualFront:'Agua sube', visualBack:'Agua en tallo', audio:'El agua viaja por la planta', reading:'Agua viaja', kinesthetic:'Seguir camino del agua', gameQuestion:'¿Qué viaja?', gameOptions:['Agua','Arena'], gameAnswer:'Agua' },
      { idea:'Con agua la planta se ve sana', visualFront:'Con agua / sin agua', visualBack:'Comparar plantas', audio:'Con agua está sana', reading:'Planta sana', kinesthetic:'Comparar dos plantas', gameQuestion:'¿Cuál está sana?', gameOptions:['Con agua','Sin agua'], gameAnswer:'Con agua' },
      { idea:'Podemos comparar plantas', visualFront:'Dos plantas', visualBack:'Una sana y una seca', audio:'Comparamos plantas', reading:'Comparar', kinesthetic:'Unir causa y planta', gameQuestion:'¿Cuál recibió agua?', gameOptions:['Verde','Seca'], gameAnswer:'Verde' },
      { idea:'Si nunca llueve, falta agua', visualFront:'Cielo sin lluvia', visualBack:'Tierra seca', audio:'Si no llueve, falta agua', reading:'No llueve', kinesthetic:'Elegir consecuencia', gameQuestion:'Si nunca llueve, ¿qué falta?', gameOptions:['Agua','Color'], gameAnswer:'Agua' },
      { idea:'Cuidar plantas cuida el ambiente', visualFront:'Plantas y ambiente', visualBack:'Ambiente sano', audio:'Cuidar plantas ayuda al ambiente', reading:'Cuidar ambiente', kinesthetic:'Elegir acción buena', gameQuestion:'¿Qué ayuda?', gameOptions:['Cuidar','Ensuciar'], gameAnswer:'Cuidar' },
      { idea:'Ahorrar agua ayuda', visualFront:'Gota cuidada', visualBack:'Cerrar llave', audio:'Ahorrar agua ayuda', reading:'Ahorrar agua', kinesthetic:'Cerrar llave', gameQuestion:'¿Qué es mejor?', gameOptions:['Ahorrar','Desperdiciar'], gameAnswer:'Ahorrar' },
      { idea:'Una planta sana tiene señales', visualFront:'Planta sana', visualBack:'Hojas verdes', audio:'La planta sana tiene hojas verdes', reading:'Sana', kinesthetic:'Señalar hoja verde', gameQuestion:'¿Cuál señal es buena?', gameOptions:['Hoja verde','Hoja seca'], gameAnswer:'Hoja verde' },
      { idea:'Una planta débil muestra señales', visualFront:'Planta débil', visualBack:'Hojas caídas', audio:'La planta débil se cae', reading:'Débil', kinesthetic:'Señalar hoja caída', gameQuestion:'¿Cuál necesita ayuda?', gameOptions:['Débil','Sana'], gameAnswer:'Débil' },
      { idea:'Una causa explica un cambio', visualFront:'Causa', visualBack:'Sin agua → seca', audio:'La causa puede ser falta de agua', reading:'Causa', kinesthetic:'Unir causa y efecto', gameQuestion:'¿Por qué se secó?', gameOptions:['Faltó agua','Sobraron colores'], gameAnswer:'Faltó agua' },
      { idea:'Sin lluvia, las plantas sufren', visualFront:'Nunca llueve', visualBack:'Plantas secas', audio:'Si nunca llueve, las plantas sufren', reading:'Sin lluvia', kinesthetic:'Explicar con una tarjeta', gameQuestion:'¿Qué pasaría?', gameOptions:['Se secan','Vuelan'], gameAnswer:'Se secan' }
    ]
  ],
  t: [
    [
      { idea:'Esto es un mouse', visualFront:'Mouse', visualBack:'Imagen mouse 🖱️', audio:'Esto es un mouse', reading:'Mouse', kinesthetic:'Tocar mouse', gameQuestion:'Elegí el mouse', gameOptions:['Mouse','Libro'], gameAnswer:'Mouse' },
      { idea:'Esto es un teclado', visualFront:'Teclado', visualBack:'Teclas ⌨️', audio:'Esto es un teclado', reading:'Teclado', kinesthetic:'Tocar teclado', gameQuestion:'Elegí teclado', gameOptions:['Teclado','Pelota'], gameAnswer:'Teclado' },
      { idea:'Esto es una pantalla', visualFront:'Pantalla', visualBack:'Pantalla encendida', audio:'Esto es una pantalla', reading:'Pantalla', kinesthetic:'Tocar pantalla', gameQuestion:'¿Dónde ves imágenes?', gameOptions:['Pantalla','Zapato'], gameAnswer:'Pantalla' },
      { idea:'Un botón se toca', visualFront:'Botón', visualBack:'Botón grande', audio:'Tocamos el botón', reading:'Botón', kinesthetic:'Tocar botón', gameQuestion:'¿Qué se toca?', gameOptions:['Botón','Nube'], gameAnswer:'Botón' },
      { idea:'Un ícono muestra una acción', visualFront:'Ícono', visualBack:'Dibujo pequeño', audio:'El ícono muestra algo', reading:'Ícono', kinesthetic:'Tocar ícono', gameQuestion:'¿Cuál es ícono?', gameOptions:['Dibujo pequeño','Mesa'], gameAnswer:'Dibujo pequeño' },
      { idea:'La tablet se toca', visualFront:'Tablet', visualBack:'Tablet táctil', audio:'La tablet se toca', reading:'Tablet', kinesthetic:'Deslizar dedo', gameQuestion:'¿Qué se toca?', gameOptions:['Tablet','Luna'], gameAnswer:'Tablet' },
      { idea:'El parlante da sonido', visualFront:'Parlante', visualBack:'Sonido 🔊', audio:'El parlante suena', reading:'Parlante', kinesthetic:'Tocar sonido', gameQuestion:'¿Qué da sonido?', gameOptions:['Parlante','Mouse'], gameAnswer:'Parlante' },
      { idea:'La cámara toma fotos', visualFront:'Cámara', visualBack:'Foto 📷', audio:'La cámara toma fotos', reading:'Cámara', kinesthetic:'Tocar cámara', gameQuestion:'¿Qué toma fotos?', gameOptions:['Cámara','Teclado'], gameAnswer:'Cámara' },
      { idea:'Un cable conecta', visualFront:'Cable', visualBack:'Cable conectado', audio:'El cable conecta', reading:'Cable', kinesthetic:'Unir cable', gameQuestion:'¿Qué conecta?', gameOptions:['Cable','Flor'], gameAnswer:'Cable' },
      { idea:'Cada objeto tiene nombre', visualFront:'Objeto tech', visualBack:'Nombrar objeto', audio:'Nombramos el objeto', reading:'Objeto', kinesthetic:'Elegir objeto', gameQuestion:'¿Qué objeto es?', gameOptions:['Mouse','Sol'], gameAnswer:'Mouse' }
    ],
    [
      { idea:'El mouse sirve para mover', visualFront:'Mouse mueve', visualBack:'Cursor moviéndose', audio:'El mouse sirve para mover', reading:'El mouse mueve', kinesthetic:'Mover mouse', gameQuestion:'¿Qué mueve?', gameOptions:['Cursor','Agua'], gameAnswer:'Cursor' },
      { idea:'El teclado sirve para escribir', visualFront:'Teclado escribe', visualBack:'Letras en pantalla', audio:'El teclado escribe', reading:'Escribir', kinesthetic:'Tocar letras', gameQuestion:'¿Qué escribe?', gameOptions:['Teclado','Parlante'], gameAnswer:'Teclado' },
      { idea:'Un clic elige', visualFront:'Clic', visualBack:'Dedo tocando botón', audio:'Un clic elige', reading:'Clic', kinesthetic:'Hacer clic', gameQuestion:'¿Qué elige?', gameOptions:['Clic','Noche'], gameAnswer:'Clic' },
      { idea:'Escribir pone letras', visualFront:'Letras', visualBack:'Texto en pantalla', audio:'Escribir pone letras', reading:'Letras', kinesthetic:'Poner letra', gameQuestion:'¿Qué aparece?', gameOptions:['Letras','Lluvia'], gameAnswer:'Letras' },
      { idea:'El puntero se mueve', visualFront:'Puntero', visualBack:'Flecha en pantalla', audio:'El puntero se mueve', reading:'Puntero', kinesthetic:'Mover flecha', gameQuestion:'¿Qué se mueve?', gameOptions:['Puntero','Casa'], gameAnswer:'Puntero' },
      { idea:'Una app se puede abrir', visualFront:'Abrir app', visualBack:'App abierta', audio:'Abrimos una app', reading:'Abrir', kinesthetic:'Tocar app', gameQuestion:'¿Qué hacés?', gameOptions:['Abrir','Dormir'], gameAnswer:'Abrir' },
      { idea:'Una app se puede cerrar', visualFront:'Cerrar app', visualBack:'X para cerrar', audio:'Cerramos la app', reading:'Cerrar', kinesthetic:'Tocar X', gameQuestion:'¿Qué hace la X?', gameOptions:['Cerrar','Regar'], gameAnswer:'Cerrar' },
      { idea:'Guardar conserva trabajo', visualFront:'Guardar', visualBack:'Trabajo guardado', audio:'Guardar conserva', reading:'Guardar', kinesthetic:'Tocar guardar', gameQuestion:'¿Qué conserva?', gameOptions:['Guardar','Borrar'], gameAnswer:'Guardar' },
      { idea:'La pantalla táctil responde', visualFront:'Tocar pantalla', visualBack:'Dedo en pantalla', audio:'La pantalla responde al toque', reading:'Tocar', kinesthetic:'Tocar pantalla', gameQuestion:'¿Qué tocás?', gameOptions:['Pantalla','Techo'], gameAnswer:'Pantalla' },
      { idea:'Elegimos la herramienta correcta', visualFront:'Herramientas', visualBack:'Mouse o teclado', audio:'Elegimos herramienta', reading:'Herramienta', kinesthetic:'Elegir herramienta', gameQuestion:'Para escribir, ¿qué usás?', gameOptions:['Teclado','Mouse'], gameAnswer:'Teclado' }
    ],
    [
      { idea:'El mouse mueve el puntero', visualFront:'Cursor', visualBack:'Flecha movida', audio:'El mouse mueve el puntero', reading:'El mouse mueve', kinesthetic:'Arrastrar puntero', gameQuestion:'¿Qué mueve el mouse?', gameOptions:['Puntero','Flor'], gameAnswer:'Puntero' },
      { idea:'El teclado escribe palabras', visualFront:'Palabra', visualBack:'Teclas a texto', audio:'El teclado escribe palabras', reading:'Palabras', kinesthetic:'Formar palabra', gameQuestion:'¿Qué escribe?', gameOptions:['Palabras','Nubes'], gameAnswer:'Palabras' },
      { idea:'La pantalla muestra imágenes', visualFront:'Imagen', visualBack:'Imagen en pantalla', audio:'La pantalla muestra imágenes', reading:'Muestra', kinesthetic:'Señalar imagen', gameQuestion:'¿Dónde se ve?', gameOptions:['Pantalla','Cable'], gameAnswer:'Pantalla' },
      { idea:'Un botón inicia una acción', visualFront:'Botón acción', visualBack:'Botón encendido', audio:'El botón hace algo', reading:'Acción', kinesthetic:'Tocar botón', gameQuestion:'¿Qué inicia?', gameOptions:['Acción','Luna'], gameAnswer:'Acción' },
      { idea:'Un programa sigue pasos', visualFront:'Pasos', visualBack:'1, 2, 3', audio:'El programa sigue pasos', reading:'Pasos', kinesthetic:'Ordenar pasos', gameQuestion:'¿Qué sigue?', gameOptions:['Pasos','Agua'], gameAnswer:'Pasos' },
      { idea:'Ordenar pasos ayuda', visualFront:'Orden', visualBack:'Primero y después', audio:'Ordenar pasos ayuda', reading:'Orden', kinesthetic:'Ordenar tarjetas', gameQuestion:'¿Qué va primero?', gameOptions:['Inicio','Final'], gameAnswer:'Inicio' },
      { idea:'Todo tiene inicio y final', visualFront:'Inicio-final', visualBack:'Camino corto', audio:'Hay inicio y final', reading:'Inicio', kinesthetic:'Unir inicio a final', gameQuestion:'¿Dónde empezás?', gameOptions:['Inicio','Final'], gameAnswer:'Inicio' },
      { idea:'Un error se puede corregir', visualFront:'Error', visualBack:'Intentar otra vez', audio:'Un error se corrige', reading:'Error', kinesthetic:'Elegir corregir', gameQuestion:'¿Qué hacés con error?', gameOptions:['Corregir','Rendirte'], gameAnswer:'Corregir' },
      { idea:'Reintentar ayuda a aprender', visualFront:'Reintentar', visualBack:'Otra vez', audio:'Reintentar ayuda', reading:'Reintentar', kinesthetic:'Tocar reintentar', gameQuestion:'¿Qué hacés otra vez?', gameOptions:['Reintentar','Romper'], gameAnswer:'Reintentar' },
      { idea:'Pensamos qué pasó', visualFront:'¿Qué pasó?', visualBack:'Buscar causa', audio:'Pensamos qué pasó', reading:'Qué pasó', kinesthetic:'Elegir causa', gameQuestion:'Si no abre, ¿qué hacés?', gameOptions:['Revisar','Gritar'], gameAnswer:'Revisar' }
    ],
    [
      { idea:'Arrastrar mueve objetos', visualFront:'Arrastrar', visualBack:'Objeto movido', audio:'Arrastrar mueve objetos', reading:'Arrastrar', kinesthetic:'Arrastrar objeto', gameQuestion:'¿Qué mueve?', gameOptions:['Arrastrar','Leer'], gameAnswer:'Arrastrar' },
      { idea:'Soltar deja el objeto', visualFront:'Soltar', visualBack:'Objeto en lugar', audio:'Soltar deja el objeto', reading:'Soltar', kinesthetic:'Soltar objeto', gameQuestion:'¿Qué deja objeto?', gameOptions:['Soltar','Correr'], gameAnswer:'Soltar' },
      { idea:'Unir imagen con palabra', visualFront:'Unir', visualBack:'Imagen + palabra', audio:'Unimos imagen y palabra', reading:'Unir', kinesthetic:'Unir tarjetas', gameQuestion:'¿Qué va junto?', gameOptions:['Imagen y palabra','Sol y teclado'], gameAnswer:'Imagen y palabra' },
      { idea:'Ordenar botones mejora uso', visualFront:'Botones', visualBack:'Botones en orden', audio:'Ordenamos botones', reading:'Ordenar', kinesthetic:'Mover botones', gameQuestion:'¿Qué ordenás?', gameOptions:['Botones','Lluvia'], gameAnswer:'Botones' },
      { idea:'Elegir app según tarea', visualFront:'Apps', visualBack:'Dibujo o texto', audio:'Elegimos app', reading:'App', kinesthetic:'Elegir app', gameQuestion:'Para dibujar, ¿qué elegís?', gameOptions:['App de dibujo','Calculadora'], gameAnswer:'App de dibujo' },
      { idea:'Guardar dibujo protege trabajo', visualFront:'Dibujo guardado', visualBack:'Check de guardar', audio:'Guardamos el dibujo', reading:'Guardar dibujo', kinesthetic:'Tocar guardar', gameQuestion:'¿Qué protegés?', gameOptions:['Dibujo','Nube'], gameAnswer:'Dibujo' },
      { idea:'Escuchar audio usa parlante', visualFront:'Audio', visualBack:'Parlante sonando', audio:'El audio usa parlante', reading:'Audio', kinesthetic:'Subir sonido', gameQuestion:'¿Qué suena?', gameOptions:['Parlante','Teclado'], gameAnswer:'Parlante' },
      { idea:'Mover pieza completa tarea', visualFront:'Pieza', visualBack:'Pieza en lugar', audio:'Movemos la pieza', reading:'Pieza', kinesthetic:'Mover pieza', gameQuestion:'¿Qué movés?', gameOptions:['Pieza','Flor'], gameAnswer:'Pieza' },
      { idea:'Una acción termina una tarea', visualFront:'Acción final', visualBack:'Tarea lista', audio:'La acción completa', reading:'Completar', kinesthetic:'Completar acción', gameQuestion:'¿Qué queda?', gameOptions:['Tarea lista','Nada'], gameAnswer:'Tarea lista' },
      { idea:'Usar bien una herramienta resuelve', visualFront:'Herramienta', visualBack:'Tarea resuelta', audio:'La herramienta ayuda', reading:'Herramienta', kinesthetic:'Usar herramienta', gameQuestion:'¿Qué ayuda?', gameOptions:['Herramienta','Ruido'], gameAnswer:'Herramienta' }
    ],
    [
      { idea:'Para dibujar usamos mouse', visualFront:'Dibujar', visualBack:'Mouse dibujando', audio:'Para dibujar usamos mouse', reading:'Dibujar = mouse', kinesthetic:'Dibujar línea', gameQuestion:'Dibujar: ¿qué usás?', gameOptions:['Mouse','Parlante'], gameAnswer:'Mouse' },
      { idea:'Para escribir usamos teclado', visualFront:'Escribir', visualBack:'Teclado y texto', audio:'Para escribir usamos teclado', reading:'Escribir = teclado', kinesthetic:'Escribir letra', gameQuestion:'Escribir: ¿qué usás?', gameOptions:['Teclado','Cámara'], gameAnswer:'Teclado' },
      { idea:'Para escuchar usamos parlante', visualFront:'Escuchar', visualBack:'Parlante', audio:'Para escuchar usamos parlante', reading:'Escuchar = parlante', kinesthetic:'Tocar sonido', gameQuestion:'Escuchar: ¿qué usás?', gameOptions:['Parlante','Mouse'], gameAnswer:'Parlante' },
      { idea:'Para fotos usamos cámara', visualFront:'Foto', visualBack:'Cámara', audio:'Para fotos usamos cámara', reading:'Foto = cámara', kinesthetic:'Tocar cámara', gameQuestion:'Foto: ¿qué usás?', gameOptions:['Cámara','Teclado'], gameAnswer:'Cámara' },
      { idea:'Para ver usamos pantalla', visualFront:'Ver', visualBack:'Pantalla', audio:'Para ver usamos pantalla', reading:'Ver = pantalla', kinesthetic:'Señalar pantalla', gameQuestion:'Ver: ¿qué usás?', gameOptions:['Pantalla','Cable'], gameAnswer:'Pantalla' },
      { idea:'Una cuenta necesita cuidado', visualFront:'Cuenta', visualBack:'Cuenta protegida', audio:'Cuidamos la cuenta', reading:'Cuenta', kinesthetic:'Cerrar candado', gameQuestion:'¿Qué cuidás?', gameOptions:['Cuenta','Basura'], gameAnswer:'Cuenta' },
      { idea:'Una clave debe ser secreta', visualFront:'Clave', visualBack:'Candado 🔒', audio:'La clave es secreta', reading:'Clave', kinesthetic:'Tapar clave', gameQuestion:'¿Qué es secreta?', gameOptions:['Clave','Pantalla'], gameAnswer:'Clave' },
      { idea:'Elegir herramienta evita errores', visualFront:'Herramienta correcta', visualBack:'Tarea bien hecha', audio:'Elegimos bien', reading:'Correcta', kinesthetic:'Elegir herramienta', gameQuestion:'¿Qué evita errores?', gameOptions:['Elegir bien','Cerrar ojos'], gameAnswer:'Elegir bien' },
      { idea:'Resolver una tarea requiere pasos', visualFront:'Resolver', visualBack:'Paso a paso', audio:'Resolvemos con pasos', reading:'Pasos', kinesthetic:'Ordenar pasos', gameQuestion:'¿Cómo resolvés?', gameOptions:['Paso a paso','Al azar'], gameAnswer:'Paso a paso' },
      { idea:'Elegimos según la tarea', visualFront:'¿Cuál usás?', visualBack:'Herramientas', audio:'Elegimos según la tarea', reading:'Elegir', kinesthetic:'Tomar herramienta correcta', gameQuestion:'Escribir: ¿cuál usás?', gameOptions:['Teclado','Mouse'], gameAnswer:'Teclado' }
    ]
  ],
  e: [
    [
      { idea:'Esto es una casa', visualFront:'Casa', visualBack:'Imagen casa 🏠', audio:'Casa', reading:'Casa', kinesthetic:'Tocar casa', gameQuestion:'Elegí casa', gameOptions:['Casa','Pez'], gameAnswer:'Casa' },
      { idea:'Esto es un puente', visualFront:'Puente', visualBack:'Puente 🌉', audio:'Puente', reading:'Puente', kinesthetic:'Tocar puente', gameQuestion:'¿Qué cruza?', gameOptions:['Puente','Flor'], gameAnswer:'Puente' },
      { idea:'Esto es una torre', visualFront:'Torre', visualBack:'Torre alta', audio:'Torre', reading:'Torre', kinesthetic:'Tocar torre', gameQuestion:'¿Cuál es alta?', gameOptions:['Torre','Hoja'], gameAnswer:'Torre' },
      { idea:'Esto es una mesa', visualFront:'Mesa', visualBack:'Mesa', audio:'Mesa', reading:'Mesa', kinesthetic:'Tocar mesa', gameQuestion:'¿Cuál sostiene cosas?', gameOptions:['Mesa','Nube'], gameAnswer:'Mesa' },
      { idea:'Esto es una silla', visualFront:'Silla', visualBack:'Silla', audio:'Silla', reading:'Silla', kinesthetic:'Tocar silla', gameQuestion:'¿Dónde te sentás?', gameOptions:['Silla','Cable'], gameAnswer:'Silla' },
      { idea:'Un bloque sirve para construir', visualFront:'Bloque', visualBack:'Bloque de construcción', audio:'Bloque', reading:'Bloque', kinesthetic:'Poner bloque', gameQuestion:'¿Qué construye?', gameOptions:['Bloque','Agua'], gameAnswer:'Bloque' },
      { idea:'El techo cubre arriba', visualFront:'Techo', visualBack:'Techo de casa', audio:'El techo está arriba', reading:'Techo', kinesthetic:'Poner techo', gameQuestion:'¿Qué va arriba?', gameOptions:['Techo','Piso'], gameAnswer:'Techo' },
      { idea:'La pared sostiene lados', visualFront:'Pared', visualBack:'Pared de casa', audio:'La pared está al lado', reading:'Pared', kinesthetic:'Poner pared', gameQuestion:'¿Qué va al lado?', gameOptions:['Pared','Luna'], gameAnswer:'Pared' },
      { idea:'La base va abajo', visualFront:'Base', visualBack:'Base firme', audio:'La base va abajo', reading:'Base', kinesthetic:'Poner base abajo', gameQuestion:'¿Qué va abajo?', gameOptions:['Base','Techo'], gameAnswer:'Base' },
      { idea:'Una construcción tiene partes', visualFront:'Construcción', visualBack:'Casa con partes', audio:'La construcción tiene partes', reading:'Partes', kinesthetic:'Unir partes', gameQuestion:'¿Qué ves?', gameOptions:['Casa','Pez'], gameAnswer:'Casa' }
    ],
    [
      { idea:'Alto es hacia arriba', visualFront:'Alto', visualBack:'Torre alta', audio:'Esto es alto', reading:'Alto', kinesthetic:'Levantar bloque', gameQuestion:'¿Cuál es alto?', gameOptions:['Torre','Caja baja'], gameAnswer:'Torre' },
      { idea:'Bajo está cerca del piso', visualFront:'Bajo', visualBack:'Bloque bajo', audio:'Esto es bajo', reading:'Bajo', kinesthetic:'Bajar bloque', gameQuestion:'¿Cuál es bajo?', gameOptions:['Caja baja','Torre'], gameAnswer:'Caja baja' },
      { idea:'Grande ocupa más espacio', visualFront:'Grande', visualBack:'Casa grande', audio:'Grande ocupa más', reading:'Grande', kinesthetic:'Elegir grande', gameQuestion:'¿Cuál es grande?', gameOptions:['Casa grande','Casa pequeña'], gameAnswer:'Casa grande' },
      { idea:'Pequeño ocupa menos espacio', visualFront:'Pequeño', visualBack:'Casa pequeña', audio:'Pequeño ocupa menos', reading:'Pequeño', kinesthetic:'Elegir pequeño', gameQuestion:'¿Cuál es pequeño?', gameOptions:['Casa pequeña','Torre'], gameAnswer:'Casa pequeña' },
      { idea:'Fuerte resiste más', visualFront:'Fuerte', visualBack:'Puente firme', audio:'Fuerte resiste', reading:'Fuerte', kinesthetic:'Probar firmeza', gameQuestion:'¿Cuál resiste?', gameOptions:['Fuerte','Débil'], gameAnswer:'Fuerte' },
      { idea:'Débil se rompe fácil', visualFront:'Débil', visualBack:'Torre débil', audio:'Débil se rompe', reading:'Débil', kinesthetic:'Elegir refuerzo', gameQuestion:'¿Cuál necesita ayuda?', gameOptions:['Débil','Fuerte'], gameAnswer:'Débil' },
      { idea:'Pesado cuesta mover', visualFront:'Pesado', visualBack:'Bloque pesado', audio:'Pesado cuesta mover', reading:'Pesado', kinesthetic:'Empujar bloque', gameQuestion:'¿Cuál pesa más?', gameOptions:['Bloque','Pluma'], gameAnswer:'Bloque' },
      { idea:'Liviano se mueve fácil', visualFront:'Liviano', visualBack:'Pluma liviana', audio:'Liviano se mueve fácil', reading:'Liviano', kinesthetic:'Mover liviano', gameQuestion:'¿Cuál se mueve fácil?', gameOptions:['Pluma','Ladrillo'], gameAnswer:'Pluma' },
      { idea:'Estable no se cae', visualFront:'Estable', visualBack:'Torre firme', audio:'Estable no se cae', reading:'Estable', kinesthetic:'Equilibrar torre', gameQuestion:'¿Cuál no se cae?', gameOptions:['Estable','Inclinada'], gameAnswer:'Estable' },
      { idea:'Comparamos alto y bajo', visualFront:'Alto / bajo', visualBack:'Dos torres', audio:'Comparamos alto y bajo', reading:'Alto y bajo', kinesthetic:'Ordenar torres', gameQuestion:'¿Cuál es alto?', gameOptions:['Torre alta','Torre baja'], gameAnswer:'Torre alta' }
    ],
    [
      { idea:'Los materiales construyen cosas', visualFront:'Material', visualBack:'Materiales', audio:'Usamos materiales', reading:'Material', kinesthetic:'Elegir material', gameQuestion:'¿Qué usamos?', gameOptions:['Material','Nube'], gameAnswer:'Material' },
      { idea:'La madera puede construir', visualFront:'Madera', visualBack:'Tabla de madera', audio:'La madera construye', reading:'Madera', kinesthetic:'Poner madera', gameQuestion:'¿Cuál es material?', gameOptions:['Madera','Sol'], gameAnswer:'Madera' },
      { idea:'El ladrillo es fuerte', visualFront:'Ladrillo', visualBack:'Ladrillo rojo', audio:'El ladrillo es fuerte', reading:'Ladrillo', kinesthetic:'Poner ladrillo', gameQuestion:'¿Cuál es fuerte?', gameOptions:['Ladrillo','Papel'], gameAnswer:'Ladrillo' },
      { idea:'El metal resiste', visualFront:'Metal', visualBack:'Viga de metal', audio:'El metal resiste', reading:'Metal', kinesthetic:'Elegir metal', gameQuestion:'¿Qué resiste?', gameOptions:['Metal','Flor'], gameAnswer:'Metal' },
      { idea:'El papel no siempre resiste', visualFront:'Papel', visualBack:'Papel doblado', audio:'El papel es débil con agua', reading:'Papel', kinesthetic:'Comparar papel', gameQuestion:'¿Cuál se moja fácil?', gameOptions:['Papel','Metal'], gameAnswer:'Papel' },
      { idea:'Construir es unir partes', visualFront:'Construir', visualBack:'Partes unidas', audio:'Construir es unir', reading:'Construir', kinesthetic:'Unir bloques', gameQuestion:'¿Qué hacés?', gameOptions:['Construir','Borrar'], gameAnswer:'Construir' },
      { idea:'Sostener evita que caiga', visualFront:'Sostener', visualBack:'Soporte bajo mesa', audio:'Sostener ayuda', reading:'Sostener', kinesthetic:'Poner soporte', gameQuestion:'¿Qué evita caída?', gameOptions:['Soporte','Color'], gameAnswer:'Soporte' },
      { idea:'Una base fuerte ayuda', visualFront:'Base fuerte', visualBack:'Base ancha', audio:'La base fuerte ayuda', reading:'Base fuerte', kinesthetic:'Hacer base ancha', gameQuestion:'¿Qué ayuda?', gameOptions:['Base fuerte','Base floja'], gameAnswer:'Base fuerte' },
      { idea:'Una casa firme necesita partes', visualFront:'Casa firme', visualBack:'Base + paredes + techo', audio:'La casa firme tiene partes', reading:'Casa firme', kinesthetic:'Completar casa', gameQuestion:'¿Qué falta?', gameOptions:['Techo','Pez'], gameAnswer:'Techo' },
      { idea:'Elegimos material para construir', visualFront:'Material correcto', visualBack:'Ladrillo para pared', audio:'Elegimos material correcto', reading:'Material correcto', kinesthetic:'Elegir ladrillo', gameQuestion:'¿Con qué construís?', gameOptions:['Ladrillo','Agua'], gameAnswer:'Ladrillo' }
    ],
    [
      { idea:'El ladrillo sirve para pared', visualFront:'Ladrillo', visualBack:'Pared de ladrillos', audio:'El ladrillo sirve', reading:'Ladrillo', kinesthetic:'Poner ladrillo', gameQuestion:'¿Qué elegís?', gameOptions:['Ladrillo','Hoja'], gameAnswer:'Ladrillo' },
      { idea:'La madera puede sostener', visualFront:'Madera', visualBack:'Tabla firme', audio:'La madera sostiene', reading:'Madera', kinesthetic:'Poner tabla', gameQuestion:'¿Qué sostiene?', gameOptions:['Madera','Luna'], gameAnswer:'Madera' },
      { idea:'El papel mojado no sostiene', visualFront:'Papel mojado', visualBack:'Papel doblado', audio:'El papel mojado no sostiene', reading:'No papel', kinesthetic:'Quitar papel', gameQuestion:'¿Qué no elegís?', gameOptions:['Papel mojado','Ladrillo'], gameAnswer:'Papel mojado' },
      { idea:'La base va primero', visualFront:'Base primero', visualBack:'Base bajo torre', audio:'La base va primero', reading:'Base', kinesthetic:'Hacer base', gameQuestion:'¿Qué va primero?', gameOptions:['Base','Techo'], gameAnswer:'Base' },
      { idea:'El soporte ayuda a sostener', visualFront:'Soporte', visualBack:'Columna', audio:'El soporte ayuda', reading:'Soporte', kinesthetic:'Agregar soporte', gameQuestion:'¿Qué agregás?', gameOptions:['Soporte','Basura'], gameAnswer:'Soporte' },
      { idea:'Reparar es mejorar', visualFront:'Reparar', visualBack:'Torre arreglada', audio:'Reparar mejora', reading:'Reparar', kinesthetic:'Reparar torre', gameQuestion:'¿Qué hacés?', gameOptions:['Reparar','Romper'], gameAnswer:'Reparar' },
      { idea:'Probar un puente muestra si resiste', visualFront:'Probar puente', visualBack:'Auto en puente', audio:'Probamos el puente', reading:'Probar', kinesthetic:'Mover auto', gameQuestion:'¿Qué probás?', gameOptions:['Puente','Sol'], gameAnswer:'Puente' },
      { idea:'La herramienta ayuda a construir', visualFront:'Herramienta', visualBack:'Martillo simple', audio:'La herramienta ayuda', reading:'Herramienta', kinesthetic:'Elegir herramienta', gameQuestion:'¿Qué ayuda?', gameOptions:['Herramienta','Pez'], gameAnswer:'Herramienta' },
      { idea:'Construir seguro evita caídas', visualFront:'Seguro', visualBack:'Torre firme', audio:'Construir seguro ayuda', reading:'Seguro', kinesthetic:'Elegir base segura', gameQuestion:'¿Qué evita caída?', gameOptions:['Seguro','Flojo'], gameAnswer:'Seguro' },
      { idea:'El material correcto resuelve', visualFront:'Material correcto', visualBack:'Pared firme', audio:'El material correcto resuelve', reading:'Correcto', kinesthetic:'Elegir material', gameQuestion:'¿Cuál elegís?', gameOptions:['Correcto','Débil'], gameAnswer:'Correcto' }
    ],
    [
      { idea:'Una torre se cae si falta base', visualFront:'Torre cayéndose', visualBack:'Falta base', audio:'La torre se cae si falta base', reading:'Falta base', kinesthetic:'Reconstruir base', gameQuestion:'¿Qué falta?', gameOptions:['Base','Color'], gameAnswer:'Base' },
      { idea:'Algo débil necesita refuerzo', visualFront:'Refuerzo', visualBack:'Columna extra', audio:'Lo débil necesita refuerzo', reading:'Refuerzo', kinesthetic:'Agregar refuerzo', gameQuestion:'¿Qué agregás?', gameOptions:['Refuerzo','Ruido'], gameAnswer:'Refuerzo' },
      { idea:'Un puente débil puede romperse', visualFront:'Puente débil', visualBack:'Puente con grieta', audio:'El puente débil puede romperse', reading:'Puente débil', kinesthetic:'Elegir soporte', gameQuestion:'¿Qué necesita?', gameOptions:['Soporte','Pintura'], gameAnswer:'Soporte' },
      { idea:'Una torre inclinada no está estable', visualFront:'Torre inclinada', visualBack:'Torre ladeada', audio:'La torre inclinada no está estable', reading:'Inclinada', kinesthetic:'Enderezar torre', gameQuestion:'¿Cuál se cae?', gameOptions:['Inclinada','Recta'], gameAnswer:'Inclinada' },
      { idea:'Una casa sin techo no cubre', visualFront:'Casa sin techo', visualBack:'Lluvia entrando', audio:'Sin techo no cubre', reading:'Sin techo', kinesthetic:'Poner techo', gameQuestion:'¿Qué falta?', gameOptions:['Techo','Mouse'], gameAnswer:'Techo' },
      { idea:'Buscar qué falta ayuda a resolver', visualFront:'¿Qué falta?', visualBack:'Parte ausente', audio:'Buscamos qué falta', reading:'Falta', kinesthetic:'Completar parte', gameQuestion:'¿Qué hacés?', gameOptions:['Buscar falta','Ignorar'], gameAnswer:'Buscar falta' },
      { idea:'Mejorar diseño evita errores', visualFront:'Mejor diseño', visualBack:'Antes y después', audio:'Mejoramos el diseño', reading:'Mejorar', kinesthetic:'Cambiar diseño', gameQuestion:'¿Qué mejora?', gameOptions:['Diseño','Ruido'], gameAnswer:'Diseño' },
      { idea:'Comparar estructuras muestra diferencias', visualFront:'Dos estructuras', visualBack:'Firme y débil', audio:'Comparamos estructuras', reading:'Comparar', kinesthetic:'Elegir firme', gameQuestion:'¿Cuál es firme?', gameOptions:['Firme','Débil'], gameAnswer:'Firme' },
      { idea:'Elegir solución arregla problema', visualFront:'Solución', visualBack:'Problema resuelto', audio:'Elegimos solución', reading:'Solución', kinesthetic:'Elegir arreglo', gameQuestion:'¿Qué elegís?', gameOptions:['Solución','Error'], gameAnswer:'Solución' },
      { idea:'La estructura se cae si está mal hecha', visualFront:'Torre cayéndose', visualBack:'Torre mal hecha', audio:'¿Por qué se cayó?', reading:'Problema corto', kinesthetic:'Reconstruir', gameQuestion:'Resolver estructura', gameOptions:['Poner base','Quitar soporte'], gameAnswer:'Poner base' }
    ]
  ],
  a: [
    [
      { idea:'Este es el color rojo', visualFront:'Rojo', visualBack:'Color rojo 🔴', audio:'Rojo', reading:'Rojo', kinesthetic:'Tocar rojo', gameQuestion:'Elegí rojo', gameOptions:['Rojo','Azul'], gameAnswer:'Rojo' },
      { idea:'Este es el color azul', visualFront:'Azul', visualBack:'Color azul 🔵', audio:'Azul', reading:'Azul', kinesthetic:'Tocar azul', gameQuestion:'Elegí azul', gameOptions:['Azul','Rojo'], gameAnswer:'Azul' },
      { idea:'Este es el color amarillo', visualFront:'Amarillo', visualBack:'Color amarillo 🟡', audio:'Amarillo', reading:'Amarillo', kinesthetic:'Tocar amarillo', gameQuestion:'Elegí amarillo', gameOptions:['Amarillo','Negro'], gameAnswer:'Amarillo' },
      { idea:'Este es el color verde', visualFront:'Verde', visualBack:'Color verde 🟢', audio:'Verde', reading:'Verde', kinesthetic:'Tocar verde', gameQuestion:'Elegí verde', gameOptions:['Verde','Azul'], gameAnswer:'Verde' },
      { idea:'El negro es oscuro', visualFront:'Negro', visualBack:'Color negro ⚫', audio:'Negro es oscuro', reading:'Negro', kinesthetic:'Tocar negro', gameQuestion:'¿Cuál es oscuro?', gameOptions:['Negro','Blanco'], gameAnswer:'Negro' },
      { idea:'El blanco es claro', visualFront:'Blanco', visualBack:'Color blanco ⚪', audio:'Blanco es claro', reading:'Blanco', kinesthetic:'Tocar blanco', gameQuestion:'¿Cuál es claro?', gameOptions:['Blanco','Negro'], gameAnswer:'Blanco' },
      { idea:'Una línea puede dibujar', visualFront:'Línea', visualBack:'Línea recta', audio:'Una línea dibuja', reading:'Línea', kinesthetic:'Trazar línea', gameQuestion:'¿Qué trazás?', gameOptions:['Línea','Sonido'], gameAnswer:'Línea' },
      { idea:'Un círculo es redondo', visualFront:'Círculo', visualBack:'Forma redonda', audio:'El círculo es redondo', reading:'Círculo', kinesthetic:'Tocar círculo', gameQuestion:'¿Cuál es redondo?', gameOptions:['Círculo','Cuadrado'], gameAnswer:'Círculo' },
      { idea:'Un cuadrado tiene lados', visualFront:'Cuadrado', visualBack:'Forma cuadrada', audio:'El cuadrado tiene lados', reading:'Cuadrado', kinesthetic:'Tocar cuadrado', gameQuestion:'¿Cuál tiene lados?', gameOptions:['Cuadrado','Círculo'], gameAnswer:'Cuadrado' },
      { idea:'Podemos nombrar colores', visualFront:'Color', visualBack:'Color elegido', audio:'Nombramos colores', reading:'Color', kinesthetic:'Elegir color', gameQuestion:'¿Qué color ves?', gameOptions:['Rojo','Casa'], gameAnswer:'Rojo' }
    ],
    [
      { idea:'Podemos identificar rojo', visualFront:'Rojo', visualBack:'Buscar rojo', audio:'Identificamos rojo', reading:'Rojo', kinesthetic:'Señalar rojo', gameQuestion:'¿Cuál es rojo?', gameOptions:['Rojo','Azul'], gameAnswer:'Rojo' },
      { idea:'Podemos identificar azul', visualFront:'Azul', visualBack:'Buscar azul', audio:'Identificamos azul', reading:'Azul', kinesthetic:'Señalar azul', gameQuestion:'¿Cuál es azul?', gameOptions:['Azul','Amarillo'], gameAnswer:'Azul' },
      { idea:'Un color claro se ve luminoso', visualFront:'Claro', visualBack:'Color claro', audio:'El color claro se ve luminoso', reading:'Claro', kinesthetic:'Elegir claro', gameQuestion:'¿Cuál es claro?', gameOptions:['Claro','Oscuro'], gameAnswer:'Claro' },
      { idea:'Un color oscuro tiene poca luz', visualFront:'Oscuro', visualBack:'Color oscuro', audio:'El color oscuro tiene poca luz', reading:'Oscuro', kinesthetic:'Elegir oscuro', gameQuestion:'¿Cuál es oscuro?', gameOptions:['Oscuro','Claro'], gameAnswer:'Oscuro' },
      { idea:'La línea recta no se curva', visualFront:'Recta', visualBack:'Línea recta', audio:'La línea recta no se curva', reading:'Recta', kinesthetic:'Trazar recta', gameQuestion:'¿Cuál es recta?', gameOptions:['Recta','Curva'], gameAnswer:'Recta' },
      { idea:'La línea curva dobla', visualFront:'Curva', visualBack:'Línea curva', audio:'La línea curva dobla', reading:'Curva', kinesthetic:'Trazar curva', gameQuestion:'¿Cuál dobla?', gameOptions:['Curva','Recta'], gameAnswer:'Curva' },
      { idea:'La forma redonda no tiene esquinas', visualFront:'Redonda', visualBack:'Círculo', audio:'La forma redonda no tiene esquinas', reading:'Redonda', kinesthetic:'Tocar redonda', gameQuestion:'¿Cuál es redonda?', gameOptions:['Círculo','Cuadrado'], gameAnswer:'Círculo' },
      { idea:'La forma cuadrada tiene esquinas', visualFront:'Cuadrada', visualBack:'Cuadrado', audio:'La forma cuadrada tiene esquinas', reading:'Cuadrada', kinesthetic:'Tocar esquinas', gameQuestion:'¿Cuál tiene esquinas?', gameOptions:['Cuadrado','Círculo'], gameAnswer:'Cuadrado' },
      { idea:'Elegimos color para pintar', visualFront:'Elegir color', visualBack:'Paleta simple', audio:'Elegimos un color', reading:'Elegir', kinesthetic:'Tocar color', gameQuestion:'¿Qué elegís?', gameOptions:['Color','Teclado'], gameAnswer:'Color' },
      { idea:'Reconocemos el amarillo', visualFront:'Amarillo', visualBack:'Color amarillo', audio:'Reconocemos amarillo', reading:'Amarillo', kinesthetic:'Señalar amarillo', gameQuestion:'¿Cuál es amarillo?', gameOptions:['Amarillo','Azul'], gameAnswer:'Amarillo' }
    ],
    [
      { idea:'Mezclar crea colores nuevos', visualFront:'Mezclar', visualBack:'Dos colores juntos', audio:'Mezclar crea colores', reading:'Mezclar', kinesthetic:'Unir colores', gameQuestion:'¿Qué crea color nuevo?', gameOptions:['Mezclar','Borrar'], gameAnswer:'Mezclar' },
      { idea:'Rojo y amarillo hacen naranja', visualFront:'Rojo + amarillo', visualBack:'Naranja', audio:'Rojo y amarillo hacen naranja', reading:'Naranja', kinesthetic:'Mezclar rojo y amarillo', gameQuestion:'¿Qué sale?', gameOptions:['Naranja','Azul'], gameAnswer:'Naranja' },
      { idea:'Azul y amarillo hacen verde', visualFront:'Azul + amarillo', visualBack:'Verde', audio:'Azul y amarillo hacen verde', reading:'Verde', kinesthetic:'Mezclar azul y amarillo', gameQuestion:'¿Qué sale?', gameOptions:['Verde','Rojo'], gameAnswer:'Verde' },
      { idea:'Un color nuevo puede sorprender', visualFront:'Color nuevo', visualBack:'Nuevo color', audio:'Aparece un color nuevo', reading:'Nuevo', kinesthetic:'Descubrir color', gameQuestion:'¿Qué aparece?', gameOptions:['Color nuevo','Puente'], gameAnswer:'Color nuevo' },
      { idea:'Una emoción se puede dibujar', visualFront:'Emoción', visualBack:'Carita dibujada', audio:'Dibujamos una emoción', reading:'Emoción', kinesthetic:'Dibujar cara', gameQuestion:'¿Qué dibujás?', gameOptions:['Emoción','Mouse'], gameAnswer:'Emoción' },
      { idea:'La carita feliz muestra alegría', visualFront:'Feliz', visualBack:'Cara feliz 🙂', audio:'La carita feliz muestra alegría', reading:'Feliz', kinesthetic:'Elegir feliz', gameQuestion:'¿Cuál está feliz?', gameOptions:['🙂','☹️'], gameAnswer:'🙂' },
      { idea:'La carita triste muestra tristeza', visualFront:'Triste', visualBack:'Cara triste ☹️', audio:'La carita triste muestra tristeza', reading:'Triste', kinesthetic:'Elegir triste', gameQuestion:'¿Cuál está triste?', gameOptions:['☹️','🙂'], gameAnswer:'☹️' },
      { idea:'Algunos colores se sienten cálidos', visualFront:'Cálido', visualBack:'Rojo y amarillo', audio:'Rojo y amarillo son cálidos', reading:'Cálido', kinesthetic:'Elegir cálido', gameQuestion:'¿Cuál es cálido?', gameOptions:['Rojo','Azul'], gameAnswer:'Rojo' },
      { idea:'Algunos colores se sienten fríos', visualFront:'Frío', visualBack:'Azul', audio:'Azul se siente frío', reading:'Frío', kinesthetic:'Elegir frío', gameQuestion:'¿Cuál es frío?', gameOptions:['Azul','Rojo'], gameAnswer:'Azul' },
      { idea:'Mezclar cambia el resultado', visualFront:'Resultado', visualBack:'Color mezclado', audio:'Mezclar cambia el color', reading:'Resultado', kinesthetic:'Elegir resultado', gameQuestion:'¿Qué color sale?', gameOptions:['Nuevo','Igual siempre'], gameAnswer:'Nuevo' }
    ],
    [
      { idea:'Crear es hacer algo propio', visualFront:'Crear', visualBack:'Dibujo propio', audio:'Crear es hacer algo propio', reading:'Crear', kinesthetic:'Crear dibujo', gameQuestion:'¿Qué hacés?', gameOptions:['Crear','Romper'], gameAnswer:'Crear' },
      { idea:'El fondo cambia la escena', visualFront:'Fondo', visualBack:'Cielo o pasto', audio:'El fondo cambia la escena', reading:'Fondo', kinesthetic:'Elegir fondo', gameQuestion:'¿Qué elegís?', gameOptions:['Fondo','Cable'], gameAnswer:'Fondo' },
      { idea:'El personaje cuenta una idea', visualFront:'Personaje', visualBack:'Niño dibujado', audio:'El personaje cuenta algo', reading:'Personaje', kinesthetic:'Elegir personaje', gameQuestion:'¿Quién cuenta?', gameOptions:['Personaje','Número'], gameAnswer:'Personaje' },
      { idea:'Pintar completa la escena', visualFront:'Pintar', visualBack:'Escena con color', audio:'Pintar completa', reading:'Pintar', kinesthetic:'Pintar escena', gameQuestion:'¿Qué completa?', gameOptions:['Pintar','Cerrar'], gameAnswer:'Pintar' },
      { idea:'Ordenar formas crea diseño', visualFront:'Formas', visualBack:'Formas ordenadas', audio:'Ordenamos formas', reading:'Formas', kinesthetic:'Ordenar formas', gameQuestion:'¿Qué ordenás?', gameOptions:['Formas','Sonidos'], gameAnswer:'Formas' },
      { idea:'Un patrón se repite', visualFront:'Patrón', visualBack:'Rojo azul rojo azul', audio:'Un patrón se repite', reading:'Patrón', kinesthetic:'Completar patrón', gameQuestion:'¿Qué sigue?', gameOptions:['Rojo','Casa'], gameAnswer:'Rojo' },
      { idea:'Decorar agrega detalles', visualFront:'Decorar', visualBack:'Dibujo con detalles', audio:'Decorar agrega detalles', reading:'Decorar', kinesthetic:'Agregar detalle', gameQuestion:'¿Qué agregás?', gameOptions:['Detalle','Error'], gameAnswer:'Detalle' },
      { idea:'Completar imagen muestra intención', visualFront:'Completar', visualBack:'Imagen terminada', audio:'Completamos la imagen', reading:'Completar', kinesthetic:'Poner pieza final', gameQuestion:'¿Qué queda?', gameOptions:['Imagen lista','Nada'], gameAnswer:'Imagen lista' },
      { idea:'Crear algo muestra una idea', visualFront:'Idea', visualBack:'Dibujo con mensaje', audio:'Crear muestra una idea', reading:'Idea', kinesthetic:'Crear algo', gameQuestion:'¿Qué mostrás?', gameOptions:['Idea','Basura'], gameAnswer:'Idea' },
      { idea:'Podés mostrar tu idea con arte', visualFront:'Mostrar idea', visualBack:'Dibujo final', audio:'Mostramos una idea', reading:'Mostrar', kinesthetic:'Elegir obra', gameQuestion:'¿Qué muestra el arte?', gameOptions:['Idea','Teclado'], gameAnswer:'Idea' }
    ],
    [
      { idea:'Los colores expresan emociones', visualFront:'Colores + caras', visualBack:'Color = emoción', audio:'Los colores expresan emociones', reading:'Color = emoción', kinesthetic:'Elegir emoción', gameQuestion:'Crear escena', gameOptions:['Emoción','Cable'], gameAnswer:'Emoción' },
      { idea:'El rojo puede sentirse con energía', visualFront:'Rojo energía', visualBack:'Rojo fuerte', audio:'El rojo puede sentirse con energía', reading:'Rojo energía', kinesthetic:'Elegir rojo', gameQuestion:'¿Cuál tiene energía?', gameOptions:['Rojo','Gris'], gameAnswer:'Rojo' },
      { idea:'El azul puede sentirse calmado', visualFront:'Azul calma', visualBack:'Azul suave', audio:'El azul puede sentirse calmado', reading:'Azul calma', kinesthetic:'Elegir azul', gameQuestion:'¿Cuál calma?', gameOptions:['Azul','Rojo'], gameAnswer:'Azul' },
      { idea:'El negro puede dar misterio', visualFront:'Negro misterio', visualBack:'Escena oscura', audio:'El negro puede dar misterio', reading:'Negro misterio', kinesthetic:'Elegir negro', gameQuestion:'¿Cuál da misterio?', gameOptions:['Negro','Amarillo'], gameAnswer:'Negro' },
      { idea:'El amarillo puede dar alegría', visualFront:'Amarillo alegría', visualBack:'Sol feliz', audio:'El amarillo puede dar alegría', reading:'Amarillo alegría', kinesthetic:'Elegir amarillo', gameQuestion:'¿Cuál da alegría?', gameOptions:['Amarillo','Negro'], gameAnswer:'Amarillo' },
      { idea:'Podemos comparar emociones', visualFront:'Dos caras', visualBack:'Feliz y triste', audio:'Comparamos emociones', reading:'Comparar', kinesthetic:'Unir cara y color', gameQuestion:'¿Cuál es feliz?', gameOptions:['🙂','☹️'], gameAnswer:'🙂' },
      { idea:'Elegimos color según sentir', visualFront:'Sentir', visualBack:'Color elegido', audio:'Elegimos color para sentir', reading:'Sentir', kinesthetic:'Elegir color', gameQuestion:'Para calma, ¿cuál?', gameOptions:['Azul','Rojo'], gameAnswer:'Azul' },
      { idea:'Explicar color ayuda a comunicar', visualFront:'Explicar', visualBack:'Color + palabra', audio:'Explicamos el color', reading:'Explicar', kinesthetic:'Elegir palabra', gameQuestion:'¿Qué comunica?', gameOptions:['Color','Cable'], gameAnswer:'Color' },
      { idea:'Crear emoción usa color y forma', visualFront:'Crear emoción', visualBack:'Cara con color', audio:'Creamos emoción con color', reading:'Crear emoción', kinesthetic:'Armar cara', gameQuestion:'¿Qué usás?', gameOptions:['Color y forma','Ruido'], gameAnswer:'Color y forma' },
      { idea:'Un color puede cambiar cómo sentimos', visualFront:'¿Qué sentís?', visualBack:'Escena con colores', audio:'¿Qué sentís con este color?', reading:'Qué sentís', kinesthetic:'Elegir emoción', gameQuestion:'¿Qué sentís?', gameOptions:['Calma','Teclado'], gameAnswer:'Calma' }
    ]
  ],
  m: [
    [
      { idea:'Uno', visualFront:'1', visualBack:'1 objeto', audio:'Uno', reading:'1', kinesthetic:'Tocar 1', gameQuestion:'Elegí 1', gameOptions:['1','2'], gameAnswer:'1' },
      { idea:'Dos', visualFront:'2', visualBack:'2 objetos', audio:'Dos', reading:'2', kinesthetic:'Tocar 2', gameQuestion:'Elegí 2', gameOptions:['2','3'], gameAnswer:'2' },
      { idea:'Tres', visualFront:'3', visualBack:'3 objetos', audio:'Tres', reading:'3', kinesthetic:'Tocar 3', gameQuestion:'Elegí 3', gameOptions:['3','1'], gameAnswer:'3' },
      { idea:'Contar empieza en uno', visualFront:'Contar 1', visualBack:'Un objeto', audio:'Contamos uno', reading:'Uno', kinesthetic:'Tocar primer objeto', gameQuestion:'¿Dónde empezás?', gameOptions:['1','3'], gameAnswer:'1' },
      { idea:'Después de uno viene dos', visualFront:'1, 2', visualBack:'Dos objetos', audio:'Después de uno viene dos', reading:'Dos', kinesthetic:'Tocar segundo', gameQuestion:'¿Qué sigue?', gameOptions:['2','5'], gameAnswer:'2' },
      { idea:'Después de dos viene tres', visualFront:'2, 3', visualBack:'Tres objetos', audio:'Después de dos viene tres', reading:'Tres', kinesthetic:'Tocar tercero', gameQuestion:'¿Qué sigue?', gameOptions:['3','1'], gameAnswer:'3' },
      { idea:'Pocos son pocos objetos', visualFront:'Pocos', visualBack:'Dos objetos', audio:'Pocos objetos', reading:'Pocos', kinesthetic:'Elegir pocos', gameQuestion:'¿Cuál tiene pocos?', gameOptions:['2','9'], gameAnswer:'2' },
      { idea:'Muchos son varios objetos', visualFront:'Muchos', visualBack:'Muchos puntos', audio:'Muchos objetos', reading:'Muchos', kinesthetic:'Elegir muchos', gameQuestion:'¿Cuál tiene muchos?', gameOptions:['8','1'], gameAnswer:'8' },
      { idea:'Los números nombran cantidad', visualFront:'1-3', visualBack:'Números y objetos', audio:'Los números cuentan', reading:'1 2 3', kinesthetic:'Unir número y objeto', gameQuestion:'¿Cuántos hay?', gameOptions:['3','1'], gameAnswer:'3' },
      { idea:'Contamos para saber cuántos hay', visualFront:'¿Cuántos?', visualBack:'Tres objetos', audio:'Contamos cuántos hay', reading:'Cuántos', kinesthetic:'Contar objetos', gameQuestion:'¿Cuántos hay?', gameOptions:['3','2'], gameAnswer:'3' }
    ],
    [
      { idea:'Cuatro viene después de tres', visualFront:'4', visualBack:'4 objetos', audio:'Cuatro', reading:'4', kinesthetic:'Tocar 4', gameQuestion:'Elegí 4', gameOptions:['4','2'], gameAnswer:'4' },
      { idea:'Cinco viene después de cuatro', visualFront:'5', visualBack:'5 objetos', audio:'Cinco', reading:'5', kinesthetic:'Tocar 5', gameQuestion:'Elegí 5', gameOptions:['5','3'], gameAnswer:'5' },
      { idea:'Seis viene después de cinco', visualFront:'6', visualBack:'6 objetos', audio:'Seis', reading:'6', kinesthetic:'Tocar 6', gameQuestion:'Elegí 6', gameOptions:['6','4'], gameAnswer:'6' },
      { idea:'Siete viene después de seis', visualFront:'7', visualBack:'7 objetos', audio:'Siete', reading:'7', kinesthetic:'Tocar 7', gameQuestion:'Elegí 7', gameOptions:['7','5'], gameAnswer:'7' },
      { idea:'Ocho viene después de siete', visualFront:'8', visualBack:'8 objetos', audio:'Ocho', reading:'8', kinesthetic:'Tocar 8', gameQuestion:'Elegí 8', gameOptions:['8','6'], gameAnswer:'8' },
      { idea:'Nueve viene después de ocho', visualFront:'9', visualBack:'9 objetos', audio:'Nueve', reading:'9', kinesthetic:'Tocar 9', gameQuestion:'Elegí 9', gameOptions:['9','7'], gameAnswer:'9' },
      { idea:'Diez completa una decena', visualFront:'10', visualBack:'10 objetos', audio:'Diez', reading:'10', kinesthetic:'Tocar 10', gameQuestion:'Elegí 10', gameOptions:['10','1'], gameAnswer:'10' },
      { idea:'Podemos contar del 1 al 10', visualFront:'1-10', visualBack:'Fila de números', audio:'Contamos del uno al diez', reading:'1 a 10', kinesthetic:'Ordenar números', gameQuestion:'¿Qué sigue después de 9?', gameOptions:['10','6'], gameAnswer:'10' },
      { idea:'Ordenar números ayuda', visualFront:'Orden', visualBack:'1 2 3', audio:'Ordenamos números', reading:'Orden', kinesthetic:'Ordenar tarjetas', gameQuestion:'¿Qué va primero?', gameOptions:['1','5'], gameAnswer:'1' },
      { idea:'Un número sigue a otro', visualFront:'Siguiente', visualBack:'4 después de 3', audio:'Buscamos el número siguiente', reading:'Sigue', kinesthetic:'Elegir siguiente', gameQuestion:'Después de 4, ¿cuál?', gameOptions:['5','2'], gameAnswer:'5' }
    ],
    [
      { idea:'Más significa mayor cantidad', visualFront:'Más', visualBack:'Grupo grande', audio:'Más es mayor cantidad', reading:'Más', kinesthetic:'Elegir más', gameQuestion:'¿Cuál tiene más?', gameOptions:['5','2'], gameAnswer:'5' },
      { idea:'Menos significa menor cantidad', visualFront:'Menos', visualBack:'Grupo pequeño', audio:'Menos es menor cantidad', reading:'Menos', kinesthetic:'Elegir menos', gameQuestion:'¿Cuál tiene menos?', gameOptions:['2','5'], gameAnswer:'2' },
      { idea:'Igual significa misma cantidad', visualFront:'Igual', visualBack:'3 y 3', audio:'Igual es misma cantidad', reading:'Igual', kinesthetic:'Unir iguales', gameQuestion:'¿Cuál es igual a 3?', gameOptions:['3','5'], gameAnswer:'3' },
      { idea:'Grande puede tener más', visualFront:'Grande', visualBack:'Grupo grande', audio:'Grande puede tener más', reading:'Grande', kinesthetic:'Elegir grande', gameQuestion:'¿Cuál es grande?', gameOptions:['Grupo grande','Grupo pequeño'], gameAnswer:'Grupo grande' },
      { idea:'Pequeño puede tener menos', visualFront:'Pequeño', visualBack:'Grupo pequeño', audio:'Pequeño puede tener menos', reading:'Pequeño', kinesthetic:'Elegir pequeño', gameQuestion:'¿Cuál es pequeño?', gameOptions:['Grupo pequeño','Grupo grande'], gameAnswer:'Grupo pequeño' },
      { idea:'Comparamos dos grupos', visualFront:'Comparar', visualBack:'Dos grupos', audio:'Comparamos grupos', reading:'Comparar', kinesthetic:'Señalar grupos', gameQuestion:'¿Qué comparás?', gameOptions:['Grupos','Colores'], gameAnswer:'Grupos' },
      { idea:'Miramos dónde hay más', visualFront:'Dónde hay más', visualBack:'Muchos puntos', audio:'Miramos dónde hay más', reading:'Más', kinesthetic:'Tocar más', gameQuestion:'¿Dónde hay más?', gameOptions:['6','3'], gameAnswer:'6' },
      { idea:'Miramos dónde hay menos', visualFront:'Dónde hay menos', visualBack:'Pocos puntos', audio:'Miramos dónde hay menos', reading:'Menos', kinesthetic:'Tocar menos', gameQuestion:'¿Dónde hay menos?', gameOptions:['2','7'], gameAnswer:'2' },
      { idea:'Dos grupos pueden ser iguales', visualFront:'Mismo número', visualBack:'4 y 4', audio:'Dos grupos pueden ser iguales', reading:'Mismo', kinesthetic:'Unir iguales', gameQuestion:'¿Cuál es igual?', gameOptions:['4 y 4','4 y 6'], gameAnswer:'4 y 4' },
      { idea:'Comparar ayuda a decidir', visualFront:'Más o menos', visualBack:'Dos grupos', audio:'Comparar ayuda a decidir', reading:'Decidir', kinesthetic:'Elegir mayor', gameQuestion:'¿Cuál tiene más?', gameOptions:['8','5'], gameAnswer:'8' }
    ],
    [
      { idea:'Sumar junta cantidades', visualFront:'Sumar', visualBack:'Juntar objetos', audio:'Sumar es juntar', reading:'Sumar', kinesthetic:'Juntar objetos', gameQuestion:'¿Qué hacés al sumar?', gameOptions:['Juntar','Separar'], gameAnswer:'Juntar' },
      { idea:'1 + 1 son 2', visualFront:'1 + 1', visualBack:'2 objetos', audio:'Uno más uno son dos', reading:'1 + 1 = 2', kinesthetic:'Juntar 1 y 1', gameQuestion:'1 + 1 = ?', gameOptions:['2','3'], gameAnswer:'2' },
      { idea:'2 + 1 son 3', visualFront:'2 + 1', visualBack:'3 objetos', audio:'Dos más uno son tres', reading:'2 + 1 = 3', kinesthetic:'Juntar 2 y 1', gameQuestion:'2 + 1 = ?', gameOptions:['3','4'], gameAnswer:'3' },
      { idea:'2 + 2 son 4', visualFront:'2 + 2', visualBack:'4 objetos', audio:'Dos más dos son cuatro', reading:'2 + 2 = 4', kinesthetic:'Juntar 2 y 2', gameQuestion:'2 + 2 = ?', gameOptions:['4','3'], gameAnswer:'4' },
      { idea:'3 + 1 son 4', visualFront:'3 + 1', visualBack:'4 objetos', audio:'Tres más uno son cuatro', reading:'3 + 1 = 4', kinesthetic:'Agregar uno', gameQuestion:'3 + 1 = ?', gameOptions:['4','5'], gameAnswer:'4' },
      { idea:'Podemos sumar objetos', visualFront:'Objetos', visualBack:'Objetos juntos', audio:'Sumamos objetos', reading:'Objetos', kinesthetic:'Juntar grupos', gameQuestion:'¿Qué sumás?', gameOptions:['Objetos','Nubes'], gameAnswer:'Objetos' },
      { idea:'Juntar grupos aumenta cantidad', visualFront:'Juntar grupos', visualBack:'Dos grupos unidos', audio:'Juntar aumenta', reading:'Juntar', kinesthetic:'Unir grupos', gameQuestion:'¿Qué pasa?', gameOptions:['Hay más','Hay menos'], gameAnswer:'Hay más' },
      { idea:'Agregar uno cambia número', visualFront:'Agregar uno', visualBack:'3 pasa a 4', audio:'Agregar uno cambia el número', reading:'+1', kinesthetic:'Agregar ficha', gameQuestion:'3 y uno más son', gameOptions:['4','2'], gameAnswer:'4' },
      { idea:'El resultado es lo que queda', visualFront:'Resultado', visualBack:'Total final', audio:'El resultado es el total', reading:'Total', kinesthetic:'Contar total', gameQuestion:'¿Qué buscás?', gameOptions:['Total','Color'], gameAnswer:'Total' },
      { idea:'Contamos para resolver suma', visualFront:'¿Cuánto hay?', visualBack:'Objetos sumados', audio:'Contamos para resolver', reading:'Cuánto hay', kinesthetic:'Contar todo', gameQuestion:'¿Cuánto hay?', gameOptions:['5','1'], gameAnswer:'5' }
    ],
    [
      { idea:'3 + 2 son 5', visualFront:'3 + 2', visualBack:'5 objetos', audio:'Tres más dos son cinco', reading:'3 + 2 = ?', kinesthetic:'Contar 3 y 2', gameQuestion:'3 + 2 = ?', gameOptions:['5','4'], gameAnswer:'5' },
      { idea:'Si te dan 2 más, aumenta', visualFront:'2 más', visualBack:'Más objetos', audio:'Te dan dos más', reading:'+2', kinesthetic:'Agregar dos', gameQuestion:'Si agregás, ¿hay?', gameOptions:['Más','Menos'], gameAnswer:'Más' },
      { idea:'Quitar 1 baja la cantidad', visualFront:'Quitar 1', visualBack:'Un objeto menos', audio:'Quitar uno baja', reading:'-1', kinesthetic:'Quitar ficha', gameQuestion:'Si quitás, ¿hay?', gameOptions:['Menos','Más'], gameAnswer:'Menos' },
      { idea:'Un problema corto tiene datos', visualFront:'Problema', visualBack:'Datos simples', audio:'El problema tiene datos', reading:'Datos', kinesthetic:'Señalar datos', gameQuestion:'¿Qué buscás?', gameOptions:['Datos','Ruido'], gameAnswer:'Datos' },
      { idea:'Dibujar ayuda a resolver', visualFront:'Dibujos', visualBack:'Objetos dibujados', audio:'Dibujar ayuda a resolver', reading:'Dibujar', kinesthetic:'Dibujar puntos', gameQuestion:'¿Qué ayuda?', gameOptions:['Dibujar','Tapar'], gameAnswer:'Dibujar' },
      { idea:'Elegir operación es decidir', visualFront:'Operación', visualBack:'+ o -', audio:'Elegimos operación', reading:'Operación', kinesthetic:'Elegir +', gameQuestion:'Para juntar, ¿cuál?', gameOptions:['+','-'], gameAnswer:'+' },
      { idea:'Pensar respuesta toma tiempo', visualFront:'Pensar', visualBack:'Niño pensando', audio:'Pensamos la respuesta', reading:'Pensar', kinesthetic:'Pausar y elegir', gameQuestion:'¿Qué hacés antes?', gameOptions:['Pensar','Cerrar'], gameAnswer:'Pensar' },
      { idea:'Explicar cómo ayuda', visualFront:'Cómo', visualBack:'Pasos de suma', audio:'Explicamos cómo', reading:'Cómo', kinesthetic:'Ordenar pasos', gameQuestion:'¿Qué explicás?', gameOptions:['Pasos','Color'], gameAnswer:'Pasos' },
      { idea:'Comprobar revisa el resultado', visualFront:'Comprobar', visualBack:'Contar otra vez', audio:'Comprobamos el resultado', reading:'Revisar', kinesthetic:'Contar de nuevo', gameQuestion:'¿Qué hacés al final?', gameOptions:['Revisar','Dormir'], gameAnswer:'Revisar' },
      { idea:'Resolver suma encuentra resultado', visualFront:'3 + 2', visualBack:'Resultado 5', audio:'¿Cuánto es?', reading:'3 + 2 = ?', kinesthetic:'Contar', gameQuestion:'Elegí resultado', gameOptions:['5','6'], gameAnswer:'5' }
    ]
  ]
};

function getCurrentModeContent(key) {
  const state = normalizeModuleProgress(key);
  const byModule = STEAM_MODE_CONTENT[key] || STEAM_MODE_CONTENT.s;
  return byModule?.[state.level - 1]?.[state.subLevel - 1] || byModule?.[0]?.[0];
}

const RICH_STEAM_GUIDES = {
  s: {
    name: 'ciencia',
    explain: [
      'Lo observamos para empezar a entender cómo funciona la naturaleza.',
      'Lo reconocemos comparando sus señales: forma, lugar, cambio o movimiento.',
      'Lo comprendemos cuando vemos qué necesita, qué cambia y por qué ocurre.',
      'Lo aplicamos tomando una decisión para cuidar, probar o resolver algo real.',
      'Lo razonamos buscando causa y consecuencia, como hacen los científicos.'
    ],
    reading: [
      'Observá con atención. En ciencia, mirar bien es el primer paso para descubrir.',
      'Compará dos opciones y buscá la pista que te dice cuál corresponde.',
      'Pensá qué cambia y qué necesita para seguir funcionando bien.',
      'Usá la idea para resolver una situación pequeña del mundo real.',
      'Explicá con tus palabras qué pasaría y por qué.'
    ],
    action: [
      'Mueve la imagen al lugar donde ocurre y mira qué cambia.',
      'Clasifica la imagen usando una pista: agua, cielo, tierra o luz.',
      'Une la causa con el efecto para descubrir qué pasó.',
      'Elige una acción para cuidar o mejorar la situación.',
      'Compara dos escenas y señala cuál explicación tiene más sentido.'
    ]
  },
  t: {
    name: 'tecnología',
    explain: [
      'Es una herramienta creada para ayudarnos a hacer una tarea.',
      'La reconocemos por lo que permite hacer: tocar, escribir, ver, escuchar o mover.',
      'La comprendemos cuando seguimos sus pasos y vemos qué acción produce.',
      'La aplicamos eligiendo la herramienta correcta para una tarea concreta.',
      'La razonamos pensando cuál opción resuelve mejor el problema.'
    ],
    reading: [
      'Una herramienta tecnológica sirve para hacer algo más fácil o más rápido.',
      'Mirá para qué sirve y elegí la herramienta que coincide con la tarea.',
      'Cada botón o dispositivo produce una acción. Observá qué cambia.',
      'Usá la herramienta correcta y completá la tarea paso a paso.',
      'Pensá: si quiero lograr esto, ¿qué herramienta me conviene usar?'
    ],
    action: [
      'Toca la herramienta y observa qué parte responde.',
      'Arrastra la herramienta hasta la tarea que puede resolver.',
      'Ordena los pasos: primero, después y final.',
      'Usa la herramienta correcta para completar la acción.',
      'Compara dos herramientas y elige la más útil para ese problema.'
    ]
  },
  e: {
    name: 'ingeniería',
    explain: [
      'Es una construcción o una parte que ayuda a sostener algo.',
      'La reconocemos por su forma, tamaño, fuerza o posición.',
      'La comprendemos viendo qué material usa y qué parte sostiene.',
      'La aplicamos construyendo, probando y mejorando una solución.',
      'La razonamos buscando por qué algo se cae, se rompe o resiste.'
    ],
    reading: [
      'En ingeniería miramos cómo están hechas las cosas para que funcionen.',
      'Compará forma, altura y fuerza para decidir cuál estructura conviene.',
      'Los materiales importan: algunos sostienen mejor que otros.',
      'Construí una solución y probá si queda firme.',
      'Si algo falla, buscá la causa y pensá cómo mejorar el diseño.'
    ],
    action: [
      'Coloca la parte en su lugar y mira si la estructura queda completa.',
      'Ordena alto, bajo, fuerte o débil según lo que ves.',
      'Elige el material que puede sostener mejor.',
      'Construye, prueba y ajusta para que no se caiga.',
      'Reconstruye la estructura agregando la pieza que falta.'
    ]
  },
  a: {
    name: 'arte',
    explain: [
      'Es un elemento visual que usamos para crear y comunicar.',
      'Lo reconocemos por su color, forma, línea o emoción.',
      'Lo comprendemos cuando vemos cómo cambia al mezclarlo o combinarlo.',
      'Lo aplicamos creando una imagen con intención.',
      'Lo razonamos pensando qué emoción o idea transmite.'
    ],
    reading: [
      'El arte usa colores, formas y líneas para mostrar ideas.',
      'Observá el color o la forma y elegí cuál coincide.',
      'Al combinar elementos, la imagen puede cambiar su mensaje.',
      'Crea una pequeña escena usando la idea del subnivel.',
      'Pensá qué sentís al mirar la imagen y qué color ayuda a contarlo.'
    ],
    action: [
      'Toca el color o la forma y nómbralo.',
      'Elige la opción que coincide con la imagen.',
      'Mezcla o combina dos elementos y observa el resultado.',
      'Crea una escena sencilla con color, forma o patrón.',
      'Elige una emoción y usa colores para representarla.'
    ]
  },
  m: {
    name: 'matemática',
    explain: [
      'Es una forma de representar cantidad, orden o comparación.',
      'Lo reconocemos contando y mirando qué número corresponde.',
      'Lo comprendemos comparando grupos: más, menos o igual.',
      'Lo aplicamos juntando, quitando o calculando con objetos.',
      'Lo razonamos resolviendo un problema y comprobando el resultado.'
    ],
    reading: [
      'La matemática nos ayuda a saber cuántos hay y qué cambia.',
      'Contá con calma y elegí el número que coincide con la cantidad.',
      'Compará dos grupos para descubrir dónde hay más, menos o igual.',
      'Junta o quita objetos y cuenta el total final.',
      'Lee el problema, piensa la operación y revisa tu respuesta.'
    ],
    action: [
      'Toca y cuenta cada objeto una sola vez.',
      'Ordena los números o une cada número con su cantidad.',
      'Señala el grupo que tiene más, menos o la misma cantidad.',
      'Junta objetos, cuenta el total y elige el resultado.',
      'Resuelve con dibujos y comprueba contando de nuevo.'
    ]
  }
};

function getRichModeContent(key) {
  const state = normalizeModuleProgress(key);
  const content = getCurrentModeContent(key);
  const guide = RICH_STEAM_GUIDES[key] || RICH_STEAM_GUIDES.s;
  const idx = Math.max(0, Math.min(4, state.level - 1));
  const topic = content.visualFront || content.reading || content.idea;
  const definition = content.idea;
  const extendedDefinition = `${content.idea}. ${guide.explain[idx]}`;
  return {
    ...content,
    topic,
    definition,
    extendedDefinition,
    visualBack: definition,
    audio: extendedDefinition,
    reading: `${topic}. ${guide.reading[idx]}`,
    kinesthetic: `${content.kinesthetic}. ${guide.action[idx]}`
  };
}

function getLevelCards(key) {
  const state = normalizeModuleProgress(key);
  const content = getRichModeContent(key);
  const uploaded = flRead(FL_STORE.parentUploads, []).filter(item => !item.module || item.module === key);
  const baseCards = [
    { emoji: MODULES[key].emoji, word: content.visualFront, def: content.visualBack, image: content.image || '' },
    { emoji: '❓', word: '¿Qué es?', def: content.definition, image: content.image || '' },
    { emoji: '🖼️', word: 'Imagen', def: content.image ? content.definition : `Imagen de ${content.visualFront}`, image: content.image || '' }
  ];
  const extraCards = uploaded.map(item => ({ emoji:'📎', word:item.name, def:'Material subido por padres para reforzar esta misma idea.' }));
  return [...baseCards, ...extraCards].slice(0, 5);
}

function renderVisualImage(card) {
  if (!card.image) return '';
  return `<img src="${card.image}" alt="${card.word}" style="width:min(92%,360px);max-height:220px;object-fit:contain;border-radius:18px;margin:0 auto 16px;display:block">`;
}

function getLevelText(map, key) {
  const state = normalizeModuleProgress(key);
  const content = getRichModeContent(key);
  return `<strong>Nivel ${state.level} · ${getLearningStage(state.level)} · Subnivel ${state.subLevel}/10:</strong> ${content.reading}`;
}

function renderFlashcards(cards, key) {
  const state = normalizeModuleProgress(key);
  const allCards = getLevelCards(key);
  const c = allCards[currentCard] || allCards[0];
  const isFinal = state.totalXp >= PROGRESSION_RULES.maxModuleXp;
  return `
    <div class="flashcard-container">
      <p style="color:var(--text-muted);font-size:14px;margin-bottom:16px">
        Nivel ${state.level} · Subnivel ${state.subLevel}/10 · ${state.totalXp}/${state.maxXp} XP
      </p>
      <div class="flashcard" id="fc" role="button" tabindex="0" aria-label="Flashcard ${c.word}" onclick="document.getElementById('fc').classList.toggle('flipped')">
        <div class="flashcard-inner">
          <div class="card-face card-front">
            ${renderVisualImage(c)}
            <div class="card-emoji" style="font-size:76px">${c.emoji}</div>
            <div class="card-word" style="font-size:clamp(42px, 8vw, 82px);line-height:1.05">${c.word}</div>
          </div>
          <div class="card-face card-back">
            ${renderVisualImage(c)}
            <div class="card-word" style="color:var(--primary);font-size:clamp(30px, 5vw, 52px);line-height:1.05;margin-bottom:18px">${c.word}</div>
            <div class="card-def" style="font-size:clamp(22px, 3.6vw, 36px);line-height:1.16;font-weight:900;max-height:72%;overflow:auto;padding:0 8px">${c.def}</div>
          </div>
        </div>
      </div>
      <div class="flashcard-nav">
        <button class="fc-btn" aria-label="Flashcard anterior" title="Anterior" onclick="prevCard('${key}')">←</button>
        <span class="fc-count" id="fc-count">${currentCard + 1} / ${allCards.length}</span>
        <button class="fc-btn" aria-label="Siguiente flashcard" title="Siguiente" onclick="nextCard('${key}')">→</button>
      </div>
      <button onclick="completeVisualLevel('${key}')" style="margin-top:20px;background:var(--primary);color:white;border:none;padding:12px 24px;border-radius:100px;font-family:'Nunito',sans-serif;font-weight:700;cursor:pointer;">
        ${isFinal ? '✓ Repasar nivel final' : '✓ Completar subnivel'}
      </button>
    </div>`;
}

function renderPodcast(key) {
  const m = MODULES[key];
  const state = normalizeModuleProgress(key);
  const content = getRichModeContent(key);
  const text = content.audio;
  const ttsId = 'podcast-' + key;
  return `
    <div class="podcast-player">
      <div class="podcast-cover" style="background:${m.barColor}">${m.emoji}</div>
      <div class="podcast-title">Nivel ${state.level} · Subnivel ${state.subLevel}/10 · ${m.name}</div>
      <div class="podcast-episode" style="font-size:clamp(20px, 3vw, 32px);line-height:1.2;font-weight:800;color:var(--text-muted);margin-bottom:12px">
        Episodio de audio: escuchá el contenido de este subnivel y luego completá la actividad.
      </div>
      <div class="podcast-episode" style="font-size:clamp(22px, 3.5vw, 36px);line-height:1.14;font-weight:900;color:var(--text)">${text}</div>
      <div style="margin:16px 0 4px;font-size:13px;font-weight:700;color:var(--text-muted)">Progreso del audio</div>
      <div class="podcast-progress" id="pod-progress-track" style="cursor:pointer" onclick="seekPodcastProgress(event, '${ttsId}')">
        <div class="podcast-progress-fill" id="pod-progress" style="width:0%;transition:width 0.3s linear"></div>
      </div>
      <div class="podcast-time" style="margin-top:6px">
        <span id="pod-time-current">0:00</span>
        <span id="pod-time-pct">0%</span>
      </div>
      <div class="podcast-controls">
        <button class="pod-btn" onclick="ttsStop();document.getElementById('pod-progress').style.width='0%';document.getElementById('pod-time-pct').textContent='0%';" title="Reiniciar">⏮</button>
        <button class="pod-btn play" id="play-btn" onclick="podcastToggle('${ttsId}')" title="Reproducir/Pausar">▶</button>
        <button class="pod-btn" onclick="showToast('Completá este audio para avanzar')" title="Siguiente">⏭</button>
      </div>
    </div>
    <div class="tts-section">
      <p style="font-weight:800;margin-bottom:12px;color:var(--text)">📢 Lector de texto</p>
      ${buildTTSControls(ttsId, text)}
      <button onclick="completeModeLevel('${key}','audio')" style="margin-top:14px;background:var(--success);color:white;border:none;padding:10px 20px;border-radius:100px;font-family:'Nunito',sans-serif;font-weight:700;cursor:pointer;">
        ✓ Completar subnivel
      </button>
    </div>`
    + `<script>
(function(){
  let _podInterval = null;
  let _podStartTime = null;
  let _podPausedAt = 0;
  let _podEstDuration = 0;
  let _podPaused = false;
  window.seekPodcastProgress = function(e, ttsId) {
    const track = e.currentTarget;
    const rect = track.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    document.getElementById('pod-progress').style.width = (pct * 100).toFixed(1) + '%';
    document.getElementById('pod-time-pct').textContent = (pct * 100).toFixed(0) + '%';
  };
  window.podcastToggle = function(ttsId) {
    const btn = document.getElementById('play-btn');
    const textEl = document.getElementById('tts-text-' + ttsId);
    if (!textEl) return;
    const text = textEl.textContent || '';
    _podEstDuration = Math.max(4, text.split(' ').length / 2.5);
    if (!synth.speaking && !_podPaused) {
      // Start
      ttsPlay(ttsId);
      _podStartTime = Date.now();
      _podPausedAt = 0;
      clearInterval(_podInterval);
      _podInterval = setInterval(function() {
        if (!synth.speaking) { clearInterval(_podInterval); document.getElementById('pod-progress').style.width='100%'; document.getElementById('pod-time-pct').textContent='100%'; if(btn) btn.textContent='▶'; return; }
        const elapsed = _podPausedAt + (Date.now() - _podStartTime) / 1000;
        const pct = Math.min(100, (elapsed / _podEstDuration) * 100);
        const fill = document.getElementById('pod-progress');
        const pctEl = document.getElementById('pod-time-pct');
        const timeEl = document.getElementById('pod-time-current');
        if(fill) fill.style.width = pct.toFixed(1) + '%';
        if(pctEl) pctEl.textContent = pct.toFixed(0) + '%';
        if(timeEl) { const s=Math.floor(elapsed); timeEl.textContent = Math.floor(s/60)+':'+(s%60<10?'0':'')+(s%60); }
      }, 200);
      if(btn) btn.textContent = '⏸';
    } else if (synth.speaking && !synth.paused) {
      synth.pause();
      _podPausedAt += (Date.now() - _podStartTime) / 1000;
      _podPaused = true;
      clearInterval(_podInterval);
      if(btn) btn.textContent = '▶';
    } else if (synth.paused) {
      synth.resume();
      _podStartTime = Date.now();
      _podPaused = false;
      clearInterval(_podInterval);
      _podInterval = setInterval(function() {
        if (!synth.speaking) { clearInterval(_podInterval); document.getElementById('pod-progress').style.width='100%'; document.getElementById('pod-time-pct').textContent='100%'; if(btn) btn.textContent='▶'; return; }
        const elapsed = _podPausedAt + (Date.now() - _podStartTime) / 1000;
        const pct = Math.min(100, (elapsed / _podEstDuration) * 100);
        const fill = document.getElementById('pod-progress');
        const pctEl = document.getElementById('pod-time-pct');
        const timeEl = document.getElementById('pod-time-current');
        if(fill) fill.style.width = pct.toFixed(1) + '%';
        if(pctEl) pctEl.textContent = pct.toFixed(0) + '%';
        if(timeEl) { const s=Math.floor(elapsed); timeEl.textContent = Math.floor(s/60)+':'+(s%60<10?'0':'')+(s%60); }
      }, 200);
      if(btn) btn.textContent = '⏸';
    }
  };
})();
<\/script>`;
}

function renderReadingWriting(key) {
  const state = normalizeModuleProgress(key);
  const content = getRichModeContent(key);
  return `
    <div class="reading-writing">
      <div class="material-text" style="font-size:clamp(20px, 2.8vw, 32px);line-height:1.25;font-weight:900;max-width:760px;margin-left:auto;margin-right:auto"><strong>Nivel ${state.level} · Subnivel ${state.subLevel}/10:</strong> ${content.reading}</div>
      <div class="writing-area">
        <div class="writing-label">✏️ Señalá o escribí la palabra que entendiste:</div>
        <textarea id="writing-input" aria-label="Respuesta escrita del alumno" placeholder="${content.reading}" style="font-size:20px;line-height:1.45"></textarea>
        <br>
        <button class="submit-writing" id="submit-writing-btn" aria-label="Evaluar mi respuesta" onclick="submitWriting('${key}')">
          📝 Evaluar mi respuesta
        </button>
        <div id="writing-feedback"></div>
      </div>
    </div>`;
}

function renderKinesthetic(key) {
  const m = MODULES[key];
  const state = normalizeModuleProgress(key);
  const content = getRichModeContent(key);
  return `
    <div style="max-width:700px;margin:0 auto">
      <div style="border-radius:16px;overflow:hidden;box-shadow:var(--shadow-lg);background:var(--surface2);aspect-ratio:16/9;display:flex;align-items:center;justify-content:center;text-align:center;padding:24px">
        <div>
          <div style="font-size:58px;margin-bottom:12px">${m.emoji}</div>
          <p style="font-weight:900;color:var(--text);font-size:clamp(26px, 4vw, 44px);line-height:1.14">✋ ${content.kinesthetic}</p>
          <p style="color:var(--text-muted);margin-top:12px;font-size:20px;font-weight:800">Nivel ${state.level} · Subnivel ${state.subLevel}/10 · +${PROGRESSION_RULES.xpPerSublevel} XP</p>
          <button onclick="completeModeLevel('${key}','kinesthetic')" style="margin-top:18px;background:var(--primary);color:white;border:none;padding:12px 24px;border-radius:100px;font-family:'Nunito',sans-serif;font-weight:700;cursor:pointer;">
            ✓ Completar subnivel
          </button>
        </div>
      </div>
    </div>`;
}

function renderGames(key) {
  const state = normalizeModuleProgress(key);
  return `
    <div class="games-grid">
      <div class="game-card">
        <div class="game-icon">🎮</div>
        <div class="game-name">Modo videojuegos</div>
        <div class="game-desc" style="font-size:clamp(28px, 5vw, 50px);line-height:1.1;font-weight:900;color:var(--text)">En construcción</div>
        <p style="color:var(--text-muted);font-size:18px;margin-top:12px">Nivel ${state.level} · Subnivel ${state.subLevel}/10</p>
      </div>
    </div>`;
}

function answerSublevelGame(key, answer) {
  const content = getCurrentModeContent(key);
  if (answer === content.gameAnswer) {
    showToast('¡Correcto! Decisión completada.', 'success');
    completeModeLevel(key, 'games');
  } else {
    showToast('Probá otra vez con calma.', 'error');
  }
}

function renderProfile() {
  if (!currentUser) return;
  const initials = currentUser.name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);
  document.getElementById('profile-avatar').textContent = initials;
  document.getElementById('profile-name').textContent = currentUser.name;
  document.getElementById('profile-email').textContent = currentUser.email;
  const keys = ['s','t','e','a','m'];
  const totalLevel = keys.reduce((sum, key) => sum + normalizeModuleProgress(key).level, 0);
  document.getElementById('profile-stats').innerHTML = `
    <div class="profile-stat"><div class="profile-stat-value">${currentUser.totalXp || 0}</div><div class="profile-stat-label">XP Total</div></div>
    <div class="profile-stat"><div class="profile-stat-value">${totalLevel}</div><div class="profile-stat-label">Nivel total</div></div>
    <div class="profile-stat"><div class="profile-stat-value">${currentUser.achievements.length}</div><div class="profile-stat-label">Logros</div></div>
  `;
  document.getElementById('steam-levels').innerHTML = keys.map(k => {
    const m = MODULES[k];
    const state = normalizeModuleProgress(k);
    return `<div class="level-card">
      <div class="level-letter" style="color:${m.barColor}">${m.letter}</div>
      <div class="level-area">${m.name}</div>
      <div class="level-badge" style="background:${m.barColor}">Nivel ${state.level}</div>
      <div class="level-xp">Subnivel ${state.subLevel}/10 · ${state.totalXp} / ${state.maxXp} XP</div>
    </div>`;
  }).join('');
  document.getElementById('profile-progress').innerHTML = keys.map(k => {
    const m = MODULES[k];
    const state = normalizeModuleProgress(k);
    const pct = Math.round((state.totalXp / state.maxXp) * 100);
    return `<div class="card" style="margin-bottom:12px">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px">
        <span style="font-size:24px">${m.emoji}</span>
        <span style="font-weight:800;color:var(--text)">${m.name}</span>
        <span style="color:var(--text-muted);font-size:13px">Nivel ${state.level} · Subnivel ${state.subLevel}/10</span>
      </div>
      <div class="progress-bar-wrap" style="height:12px">
        <div class="progress-bar" style="width:${pct}%;background:${m.barColor}"></div>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--text-muted);margin-top:4px">
        <span>${state.totalXp} XP</span><span>${state.maxXp} XP</span>
      </div>
    </div>`;
  }).join('');
}

const flOriginalRenderHome = renderHome;
renderHome = function() {
  flOriginalRenderHome();
  flUpdateMissionUI();
};

function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
  const isDark = document.body.classList.contains('dark-mode');
  const darkBtn = document.getElementById('dark-btn');
  if (darkBtn) darkBtn.textContent = isDark ? '☀️' : '🌙';
  const toggleEl = document.getElementById('toggle-darkmode');
  if (toggleEl) toggleEl.checked = isDark;
  if (currentUser) {
    currentUser.settings = currentUser.settings || {};
    currentUser.settings.darkmode = isDark;
    saveSettings();
  }
}

function applyDarkMode() {
  const checked = document.getElementById('toggle-darkmode')?.checked;
  document.body.classList.toggle('dark-mode', checked);
  const darkBtn = document.getElementById('dark-btn');
  if (darkBtn) darkBtn.textContent = checked ? '☀️' : '🌙';
  if (currentUser) {
    currentUser.settings = currentUser.settings || {};
    currentUser.settings.darkmode = checked;
    saveSettings();
  }
}

// ===========================
