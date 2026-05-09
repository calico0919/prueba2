// ===========================
// AI.JS — Integración con la API de Claude
// Reemplaza la evaluación simulada de submitWriting
// ===========================

/**
 * Evalúa la respuesta escrita del alumno usando Claude.
 * Llamada desde renderReadingWriting (modo lectura/escritura).
 */
async function submitWriting(key) {
  const input = document.getElementById('writing-input');
  const feedbackBox = document.getElementById('writing-feedback');
  const btn = document.getElementById('submit-writing-btn');

  if (!input || !feedbackBox || !btn) return;

  const text = input.value.trim();
  const minChars = 10;
  if (text.length < minChars) {
    showToast('Escribí al menos ' + minChars + ' caracteres');
    return;
  }

  // Get context about what they were studying
  const state = (typeof normalizeModuleProgress === 'function') ? normalizeModuleProgress(key) : { level: 1, subLevel: 1 };
  const moduleName = (typeof MODULES !== 'undefined' && MODULES[key]) ? MODULES[key].name : key.toUpperCase();
  const content = (typeof getRichModeContent === 'function') ? getRichModeContent(key) : null;
  const topic = content ? (content.reading || content.topic || content.idea || moduleName) : moduleName;

  // Show loading state
  feedbackBox.className = 'feedback-box feedback-result';
  feedbackBox.innerHTML = '<span class="loading-spinner"></span> Evaluando tu respuesta con IA...';
  btn.disabled = true;
  btn.textContent = 'Procesando...';

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: `Eres un tutor educativo para niños en una plataforma STEAM llamada FocusLearn. 
Tu tarea es evaluar la respuesta escrita de un alumno de forma breve, alentadora y clara.
El alumno estudió el módulo de ${moduleName} (Nivel ${state.level}, Subnivel ${state.subLevel}).
El tema específico fue: "${topic}".

IMPORTANTE: El usuario puede ser un niño con necesidades especiales de aprendizaje (autismo, dislexia, síndrome de Down u otras). 
Usá un lenguaje muy simple, positivo y concreto. Evitá abstracciones.

Respondé SOLO en formato JSON (sin backticks, sin texto extra) con esta estructura:
{
  "score": <número del 1 al 10>,
  "nivel": "<Muy bueno | Bueno | En desarrollo>",
  "feedback": "<2 oraciones de feedback concreto y alentador>",
  "siguiente_paso": "<1 sugerencia práctica muy simple>"
}`,
        messages: [{
          role: 'user',
          content: `El alumno escribió esta respuesta sobre "${topic}":\n\n"${text}"\n\nEvaluala.`
        }]
      })
    });

    if (!response.ok) {
      throw new Error('API error: ' + response.status);
    }

    const data = await response.json();
    const rawText = data.content?.map(b => b.text || '').join('') || '';

    // Parse JSON response, stripping any markdown fences if present
    let result;
    try {
      const clean = rawText.replace(/```json|```/g, '').trim();
      result = JSON.parse(clean);
    } catch (_) {
      // If JSON parse fails, create a fallback result
      result = {
        score: 7,
        nivel: 'Bueno',
        feedback: '¡Buen intento! Se entiende tu idea principal.',
        siguiente_paso: 'Revisá las flashcards para reforzar los conceptos.'
      };
    }

    // Render feedback
    const score = Math.max(1, Math.min(10, Number(result.score) || 7));
    const nivel = result.nivel || 'Bueno';
    const scoreColor = score >= 8 ? 'var(--success)' : score >= 6 ? 'var(--warning)' : 'var(--accent)';
    const emoji = score >= 8 ? '🌟' : score >= 6 ? '👍' : '💪';

    feedbackBox.className = 'feedback-box feedback-result';
    feedbackBox.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
        <strong style="font-size:18px">${emoji} Puntaje: <span style="color:${scoreColor}">${score}/10</span></strong>
        <span style="background:#e0e7ff;color:#3730a3;padding:3px 12px;border-radius:999px;font-size:13px;font-weight:700">${nivel}</span>
      </div>
      <p style="margin-bottom:8px;line-height:1.5">💬 <strong>Feedback:</strong> ${result.feedback || ''}</p>
      <p style="color:var(--text-muted);font-size:13px;line-height:1.5">📌 <strong>Siguiente paso:</strong> ${result.siguiente_paso || ''}</p>
    `;

    // Award XP and mark activity reviewed
    if (typeof addXP === 'function') addXP(key, 50);
    input.disabled = true;
    btn.textContent = `✓ Evaluado: ${score}/10`;
    btn.style.background = 'var(--success)';
    btn.disabled = false;
    btn.onclick = () => {
      if (typeof completeModeLevel === 'function') completeModeLevel(key, 'reading');
    };
    showToast('Evaluación lista. +50 pts 🎉', 'success');
    if (typeof spawnSparkles === 'function') spawnSparkles();

  } catch (err) {
    console.error('Claude API error:', err);
    feedbackBox.className = 'feedback-box feedback-result error-result';
    feedbackBox.innerHTML = `
      <p>⚠️ No se pudo conectar con la IA. Revisá tu conexión e intentá de nuevo.</p>
      <p style="font-size:12px;color:var(--text-muted);margin-top:6px">${err.message}</p>
    `;
    btn.disabled = false;
    btn.textContent = '📝 Intentar de nuevo';
  }
}
