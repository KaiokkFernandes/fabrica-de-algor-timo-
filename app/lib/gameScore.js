/**
 * gameScore.js — Gerenciador global de pontuação
 *
 * Regras:
 *  - Pontos só são adicionados na PRIMEIRA conclusão de cada round.
 *  - Replay de um round não gera pontos novos (preserva a melhor estrela).
 *  - O score acumula entre as três fases.
 *  - Todos os dados ficam em localStorage sob a chave STORAGE_KEY.
 */

const STORAGE_KEY = "fabrica_game_data";

/* ── Estrutura padrão de sessão ── */
function defaultSession() {
  return {
    sessionId: Math.random().toString(36).slice(2),
    startedAt: Date.now(),
    lastPlayedAt: Date.now(),
    totalScore: 0,
    phases: {
      "1": { rounds: {} },
      "2": { rounds: {} },
      "3": { rounds: {} },
    },
  };
}

/* ── Estrutura padrão de round ── */
function defaultRound() {
  return {
    completed: false,
    scoreEarned: 0,
    errors: 0,
    hints: 0,
    stars: 0,
    timeMs: 0,
    attempts: 0,
    firstCompletedAt: null,
    lastPlayedAt: null,
  };
}

/* ── Leitura / escrita segura ── */
function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultSession();
    const parsed = JSON.parse(raw);
    // Garante estrutura para fases que possam estar faltando
    parsed.phases = parsed.phases || {};
    ["1", "2", "3"].forEach((p) => {
      parsed.phases[p] = parsed.phases[p] || { rounds: {} };
    });
    return parsed;
  } catch {
    return defaultSession();
  }
}

function save(data) {
  try {
    data.lastPlayedAt = Date.now();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* localStorage indisponível (ex: modo privado sem espaço) */
  }
}

/* ═══════════════════════════════════════════════════════════════════
   API pública
   ═══════════════════════════════════════════════════════════════════ */

/** Retorna pontuação total acumulada de todos os rounds completados. */
export function getTotalScore() {
  return load().totalScore || 0;
}

/**
 * Retorna o total SEM contar o round informado.
 * Usado para inicializar o HUD: o jogador vê o total anterior ao round atual.
 *
 * @param {string|number} phase  "1", "2" ou "3"
 * @param {string|number} round  1-based round number
 */
export function getBaseScore(phase, round) {
  const data = load();
  const roundData = data.phases[String(phase)]?.rounds[String(round)];
  const roundContrib = roundData?.completed ? (roundData.scoreEarned || 0) : 0;
  return (data.totalScore || 0) - roundContrib;
}

/**
 * Retorna os dados de um round específico (ou null se nunca jogado).
 */
export function getRoundData(phase, round) {
  const data = load();
  return data.phases[String(phase)]?.rounds[String(round)] || null;
}

/**
 * Verifica se um round já foi completado ao menos uma vez.
 */
export function hasCompleted(phase, round) {
  return !!getRoundData(phase, round)?.completed;
}

/**
 * Registra o início de uma tentativa de round.
 * Incrementa o contador de tentativas.
 */
export function startRoundAttempt(phase, round) {
  const data = load();
  const ph = data.phases[String(phase)];
  const rd = ph.rounds[String(round)] || defaultRound();
  rd.attempts = (rd.attempts || 0) + 1;
  rd.lastPlayedAt = Date.now();
  ph.rounds[String(round)] = rd;
  save(data);
}

/**
 * Registra a conclusão de um round.
 *
 * @param {string|number} phase
 * @param {string|number} round   1-based
 * @param {object} result
 *   @param {number} result.score      Pontos brutos obtidos neste round
 *   @param {number} result.errors     Número de erros (respostas erradas)
 *   @param {number} result.hints      Número de dicas usadas
 *   @param {number} result.stars      0-3
 *   @param {number} result.timeMs     Duração em milissegundos
 *
 * @returns {{ isFirst: boolean, pointsAdded: number, totalScore: number }}
 */
export function recordRoundComplete(phase, round, { score, errors, hints, stars, timeMs }) {
  const data = load();
  const ph = data.phases[String(phase)];
  const rd = ph.rounds[String(round)] || defaultRound();

  const isFirst = !rd.completed;
  const pointsAdded = isFirst ? (score || 0) : 0;

  if (isFirst) {
    rd.completed = true;
    rd.firstCompletedAt = Date.now();
    rd.scoreEarned = score || 0;
    data.totalScore = (data.totalScore || 0) + pointsAdded;
  }

  // Atualiza sempre: melhor estrela, estatísticas da última tentativa
  rd.stars = Math.max(rd.stars || 0, stars || 0);
  rd.errors = errors || 0;
  rd.hints = hints || 0;
  rd.timeMs = timeMs || 0;
  rd.lastPlayedAt = Date.now();

  ph.rounds[String(round)] = rd;
  save(data);

  return { isFirst, pointsAdded, totalScore: data.totalScore };
}

/**
 * Retorna um snapshot completo de todos os dados para geração do relatório.
 */
export function getFullReport() {
  return load();
}

/**
 * Reseta toda a sessão (usado para "novo jogo").
 */
export function resetSession() {
  const fresh = defaultSession();
  save(fresh);
  return fresh;
}

/**
 * Calcula o tempo total jogado (soma de todos os rounds) em milissegundos.
 */
export function getTotalTimeMs() {
  const data = load();
  let total = 0;
  Object.values(data.phases).forEach((ph) => {
    Object.values(ph.rounds).forEach((rd) => {
      total += rd.timeMs || 0;
    });
  });
  return total;
}
