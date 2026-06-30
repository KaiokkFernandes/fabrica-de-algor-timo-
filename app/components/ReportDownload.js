"use client";

/**
 * ReportDownload — Gera um relatório detalhado para o professor.
 *
 * Abre uma nova aba com HTML estilizado para impressão.
 * O professor usa Ctrl+P → "Salvar como PDF" para baixar.
 * Sem dependências externas.
 */

// ── Helpers de formatação ─────────────────────────────────────────────────────

function fmtMs(ms) {
  if (!ms || ms <= 0) return "0s";
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function fmtDate(ts) {
  if (!ts) return "—";
  return new Date(ts).toLocaleString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function stars(n) {
  return "★".repeat(n || 0) + "☆".repeat(3 - (n || 0));
}

function pct(val, max) {
  if (!max) return "—";
  return Math.round((val / max) * 100) + "%";
}

// ── Nomes das fases e rounds ──────────────────────────────────────────────────

const PHASE_NAMES = {
  "1": "Fase 1 — Esteira de Caixas",
  "2": "Fase 2 — Despachante da Fábrica",
  "3": "Fase 3 — Lavador Industrial",
};

const ROUND_NAMES = {
  "1": {
    "1": "Aprendendo as Coordenadas",
    "2": "Mais Prateleiras",
    "3": "Prateleira sem Etiquetas",
    "4": "Endereços por Extenso",
    "5": "Vire o Mestre!",
    "6": "Mestre sem Etiquetas",
    "7": "Construa o Endereço",
    "8": "Mestre Supremo 5×5",
  },
  "2": {
    "1": "Caminhão Frigorífico",
    "2": "Caminhão Refrigerado",
    "3": "Caminhão Misto",
    "4": "Caminhão Expresso (cronômetro)",
    "5": "Dois Caminhões Simultâneos",
  },
  "3": {
    "1": "1 Andar, 3 Janelas",
    "2": "1 Andar, 5 Janelas (Repetir)",
    "3": "3 Andares, 3 Janelas",
    "4": "3 Andares — Janelas Pré-Limpas",
    "5": "4 Andares, 5 Janelas (Cronômetro)",
  },
};

const MAX_PTS = {
  "1": { "1": 200, "2": 400, "3": 500, "4": 600, "5": 900, "6": 900, "7": 750, "8": 1200 },
  "2": { "1": 150, "2": 200, "3": 200, "4": 250, "5": 300 },
  "3": { "1": 150, "2": 150, "3": 150, "4": 150, "5": 150 },
};

// ── Geração do HTML do relatório ──────────────────────────────────────────────

function buildReportHtml(report) {
  const now = fmtDate(Date.now());
  const totalTimeMs = Object.values(report.phases).reduce((sum, ph) =>
    sum + Object.values(ph.rounds).reduce((s2, rd) => s2 + (rd.timeMs || 0), 0), 0);

  // Totaliza completados e tentados
  let totalRoundsCompleted = 0;
  let totalRoundsTried = 0;
  let totalErrors = 0;
  let totalHints = 0;

  Object.values(report.phases).forEach((ph) => {
    Object.values(ph.rounds).forEach((rd) => {
      totalRoundsTried++;
      if (rd.completed) totalRoundsCompleted++;
      totalErrors += rd.errors || 0;
      totalHints += rd.hints || 0;
    });
  });

  // ── Seção por fase ────────────────────────────────────────────────────────
  function phaseSection(phaseKey) {
    const ph = report.phases[phaseKey];
    if (!ph || Object.keys(ph.rounds).length === 0) {
      return `<div class="phase-empty">Nenhum round jogado ainda nesta fase.</div>`;
    }

    const roundRows = Object.entries(ph.rounds)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([roundKey, rd]) => {
        const roundName = ROUND_NAMES[phaseKey]?.[roundKey] || `Round ${roundKey}`;
        const maxPts = MAX_PTS[phaseKey]?.[roundKey] || "—";
        const desempenho = typeof maxPts === "number"
          ? pct(rd.scoreEarned || 0, maxPts)
          : "—";
        const tentativas = rd.attempts || 1;
        const statusBadge = rd.completed
          ? `<span class="badge badge-ok">✓ Completo</span>`
          : `<span class="badge badge-pend">Em andamento</span>`;

        return `
          <tr>
            <td>${roundKey}</td>
            <td>${roundName}</td>
            <td>${statusBadge}</td>
            <td class="pts">${rd.scoreEarned || 0} / ${maxPts}</td>
            <td class="pct">${desempenho}</td>
            <td class="stars">${stars(rd.stars)}</td>
            <td>${rd.errors || 0}</td>
            <td>${rd.hints || 0}</td>
            <td>${tentativas}</td>
            <td>${fmtMs(rd.timeMs)}</td>
            <td class="date">${fmtDate(rd.firstCompletedAt)}</td>
          </tr>`;
      }).join("");

    const phTotal = Object.values(ph.rounds).reduce((s, rd) => s + (rd.scoreEarned || 0), 0);
    const phErrors = Object.values(ph.rounds).reduce((s, rd) => s + (rd.errors || 0), 0);
    const phHints = Object.values(ph.rounds).reduce((s, rd) => s + (rd.hints || 0), 0);
    const phTime = Object.values(ph.rounds).reduce((s, rd) => s + (rd.timeMs || 0), 0);
    const phCompleted = Object.values(ph.rounds).filter(rd => rd.completed).length;
    const phTotal2 = Object.keys(ph.rounds).length;

    return `
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Round</th>
            <th>Status</th>
            <th>Pontos</th>
            <th>Aproveit.</th>
            <th>Estrelas</th>
            <th>Erros</th>
            <th>Dicas</th>
            <th>Tentativas</th>
            <th>Tempo</th>
            <th>Concluído em</th>
          </tr>
        </thead>
        <tbody>
          ${roundRows}
        </tbody>
        <tfoot>
          <tr class="total-row">
            <td colspan="3">TOTAL DA FASE — ${phCompleted}/${phTotal2} rounds concluídos</td>
            <td class="pts">${phTotal}</td>
            <td></td>
            <td></td>
            <td>${phErrors}</td>
            <td>${phHints}</td>
            <td></td>
            <td>${fmtMs(phTime)}</td>
            <td></td>
          </tr>
        </tfoot>
      </table>`;
  }

  // ── Análise qualitativa ───────────────────────────────────────────────────
  function qualAnalysis() {
    const observations = [];

    Object.entries(report.phases).forEach(([phKey, ph]) => {
      Object.entries(ph.rounds).forEach(([rdKey, rd]) => {
        const name = `${PHASE_NAMES[phKey]?.split("—")[1]?.trim() || phKey} / Round ${rdKey}`;
        if (rd.completed && rd.attempts > 2)
          observations.push(`⚠️ <b>${name}</b>: precisou de ${rd.attempts} tentativas — conteúdo pode precisar de reforço.`);
        if (rd.errors > 5)
          observations.push(`⚠️ <b>${name}</b>: ${rd.errors} erros registrados — verifique compreensão do conceito.`);
        if (rd.stars === 3 && rd.hints === 0)
          observations.push(`🌟 <b>${name}</b>: concluído com 3 estrelas sem usar dicas — excelente desempenho!`);
        if (rd.hints >= 3)
          observations.push(`💡 <b>${name}</b>: ${rd.hints} dicas usadas — aluno demonstrou boa autonomia ao buscar ajuda.`);
      });
    });

    if (observations.length === 0) return "<p>Nenhuma observação automática disponível ainda.</p>";
    return "<ul>" + observations.map(o => `<li>${o}</li>`).join("") + "</ul>";
  }

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Relatório do Professor — Fábrica de Algoritmo</title>
  <style>
    @page { size: A4; margin: 18mm 14mm; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: "Segoe UI", Arial, sans-serif;
      font-size: 11px;
      color: #1a1a1a;
      background: #fff;
    }

    /* ── Cover ── */
    .cover {
      text-align: center;
      padding: 32px 0 24px;
      border-bottom: 3px solid #f5a623;
      margin-bottom: 20px;
    }
    .cover-logo { font-size: 48px; }
    .cover-title {
      font-size: 22px;
      font-weight: 800;
      color: #1a1a1a;
      margin-top: 8px;
    }
    .cover-subtitle { font-size: 13px; color: #555; margin-top: 4px; }
    .cover-date { font-size: 10px; color: #888; margin-top: 8px; }

    /* ── Summary cards ── */
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      margin-bottom: 20px;
    }
    .card {
      border: 2px solid #f0f0f0;
      border-radius: 6px;
      padding: 10px;
      text-align: center;
      background: #fafafa;
    }
    .card-val {
      font-size: 20px;
      font-weight: 800;
      color: #f5a623;
    }
    .card-lbl { font-size: 9px; color: #666; text-transform: uppercase; margin-top: 3px; }

    /* ── Section headers ── */
    h2 {
      font-size: 13px;
      font-weight: 700;
      background: #f5a623;
      color: #fff;
      padding: 6px 10px;
      margin-top: 20px;
      margin-bottom: 8px;
      border-radius: 4px;
      page-break-after: avoid;
    }
    h3 {
      font-size: 11px;
      font-weight: 700;
      color: #333;
      margin: 14px 0 6px;
      padding-left: 8px;
      border-left: 3px solid #f5a623;
    }

    /* ── Tables ── */
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 10px;
      margin-bottom: 10px;
    }
    th {
      background: #f5a623;
      color: #fff;
      padding: 5px 6px;
      text-align: left;
      font-size: 9px;
      text-transform: uppercase;
    }
    td { padding: 5px 6px; border-bottom: 1px solid #eee; }
    tr:nth-child(even) td { background: #fafafa; }
    .total-row td {
      font-weight: 700;
      background: #fff8ee !important;
      border-top: 2px solid #f5a623;
    }
    .pts { font-weight: 700; color: #f5a623; }
    .pct { color: #333; }
    .stars { letter-spacing: 1px; color: #f5a623; }
    .date { font-size: 9px; color: #888; white-space: nowrap; }

    /* ── Badges ── */
    .badge {
      display: inline-block;
      padding: 1px 6px;
      border-radius: 3px;
      font-size: 9px;
      font-weight: 700;
    }
    .badge-ok { background: #d4edda; color: #155724; }
    .badge-pend { background: #fff3cd; color: #856404; }

    /* ── Analysis ── */
    .analysis { font-size: 10px; line-height: 1.6; }
    .analysis ul { padding-left: 16px; }
    .analysis li { margin-bottom: 6px; }

    .phase-empty { color: #888; font-style: italic; font-size: 10px; padding: 8px; }

    /* ── BNCC note ── */
    .bncc {
      margin-top: 20px;
      padding: 10px 12px;
      border: 1px solid #ddd;
      border-radius: 6px;
      background: #f9f9f9;
      font-size: 9.5px;
      color: #555;
      line-height: 1.5;
    }
    .bncc strong { color: #333; }

    /* ── Footer ── */
    .footer {
      margin-top: 24px;
      border-top: 1px solid #eee;
      padding-top: 8px;
      font-size: 9px;
      color: #aaa;
      text-align: center;
    }

    /* ── Print break helpers ── */
    .page-break { page-break-before: always; }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>

  <!-- ══ CAPA ══════════════════════════════════════════════════════════ -->
  <div class="cover">
    <div class="cover-logo">🏭</div>
    <div class="cover-title">Fábrica de Algoritmo</div>
    <div class="cover-subtitle">Relatório de Desempenho do Aluno — Para o Professor</div>
    <div class="cover-date">Gerado em: ${now} &nbsp;|&nbsp; ID de sessão: ${report.sessionId || "—"}</div>
  </div>

  <!-- ══ RESUMO GERAL ══════════════════════════════════════════════════ -->
  <h2>📊 Resumo Geral</h2>
  <div class="summary-grid">
    <div class="card">
      <div class="card-val">${report.totalScore || 0}</div>
      <div class="card-lbl">Pontos Totais</div>
    </div>
    <div class="card">
      <div class="card-val">${totalRoundsCompleted}</div>
      <div class="card-lbl">Rounds Concluídos</div>
    </div>
    <div class="card">
      <div class="card-val">${fmtMs(totalTimeMs)}</div>
      <div class="card-lbl">Tempo Total Jogado</div>
    </div>
    <div class="card">
      <div class="card-val">${fmtDate(report.startedAt)}</div>
      <div class="card-lbl">Início da Sessão</div>
    </div>
    <div class="card">
      <div class="card-val">${totalErrors}</div>
      <div class="card-lbl">Total de Erros</div>
    </div>
    <div class="card">
      <div class="card-val">${totalHints}</div>
      <div class="card-lbl">Dicas Usadas</div>
    </div>
    <div class="card">
      <div class="card-val">${fmtDate(report.lastPlayedAt)}</div>
      <div class="card-lbl">Última Atividade</div>
    </div>
    <div class="card">
      <div class="card-val">${totalErrors > 0 ? Math.round((totalErrors / Math.max(totalRoundsCompleted, 1)) * 10) / 10 : 0}</div>
      <div class="card-lbl">Erros por Round (média)</div>
    </div>
  </div>

  <!-- ══ FASE 1 ════════════════════════════════════════════════════════ -->
  <h2>⚙️ Fase 1 — Esteira de Caixas (Matrizes: Linhas e Colunas)</h2>
  <p style="font-size:9.5px;color:#555;margin-bottom:8px;">
    Habilidade BNCC: EF04MA18 — Identificar e registrar posições de objetos em uma malha quadriculada usando pares de coordenadas (linha, coluna).
  </p>
  ${phaseSection("1")}

  <!-- ══ FASE 2 ════════════════════════════════════════════════════════ -->
  <h2 class="page-break">🚛 Fase 2 — Despachante da Fábrica (Classificação e Filtros)</h2>
  <p style="font-size:9.5px;color:#555;margin-bottom:8px;">
    Habilidade BNCC: EF04MA24 — Classificar e ordenar elementos segundo critérios dados; raciocínio lógico condicional.
  </p>
  ${phaseSection("2")}

  <!-- ══ FASE 3 ════════════════════════════════════════════════════════ -->
  <h2>🤖 Fase 3 — Lavador Industrial (Algoritmos e Repetição)</h2>
  <p style="font-size:9.5px;color:#555;margin-bottom:8px;">
    Habilidade BNCC: EF04CO01 / Pensamento Computacional — Criar e depurar algoritmos sequenciais com repetição e condição.
  </p>
  ${phaseSection("3")}

  <!-- ══ ANÁLISE AUTOMÁTICA ════════════════════════════════════════════ -->
  <h2 class="page-break">🔍 Análise Automática de Desempenho</h2>
  <div class="analysis">
    ${qualAnalysis()}
  </div>

  <!-- ══ ORIENTAÇÕES BNCC ═════════════════════════════════════════════ -->
  <div class="bncc">
    <strong>Alinhamento BNCC (4º ano do Ensino Fundamental):</strong><br>
    Este jogo trabalha as seguintes habilidades da Base Nacional Comum Curricular:<br><br>
    <strong>Fase 1 — Matrizes:</strong> EF04MA18 — Localizar objetos em representações matriciais com coordenadas (linha, coluna), comparando com sistemas de localização reais (endereços, mapas).<br>
    <strong>Fase 2 — Classificação:</strong> EF04MA24 — Resolver problemas com dados e classificações; desenvolvimento do raciocínio lógico-matemático e tomada de decisão.<br>
    <strong>Fase 3 — Algoritmos:</strong> Competência 5 da BNCC — Compreensão, utilização e criação de tecnologias; pensamento computacional, sequências de instruções, estruturas de repetição e condicionais.<br><br>
    <em>Sugestão pedagógica:</em> Rounds com mais de 3 erros ou mais de 2 tentativas indicam conteúdo que merece abordagem adicional em sala, preferencialmente com materiais concretos (grade imprimível para a Fase 1, separação de objetos por categorias para a Fase 2, pseudocódigo no quadro para a Fase 3).
  </div>

  <div class="footer">
    Fábrica de Algoritmo — Jogo Educacional 4º ano EF &nbsp;|&nbsp; Relatório gerado automaticamente &nbsp;|&nbsp; ${now}
  </div>

</body>
</html>`;
}

// ── Componente React ──────────────────────────────────────────────────────────

export default function ReportDownload({ report }) {
  function handleDownload() {
    const html = buildReportHtml(report);
    const win = window.open("", "_blank");
    if (!win) {
      alert("Permita pop-ups para gerar o relatório.");
      return;
    }
    win.document.write(html);
    win.document.close();

    // Aguarda imagens/fontes (se houver) e abre o diálogo de impressão
    win.onload = () => {
      win.focus();
      setTimeout(() => win.print(), 400);
    };
  }

  return (
    <div style={{ textAlign: "center", marginTop: "8px" }}>
      <button
        onClick={handleDownload}
        style={{
          background: "#f5a623",
          color: "#1a1a1a",
          border: "3px solid #c07800",
          borderRadius: "6px",
          padding: "12px 28px",
          fontFamily: "var(--font-pixel, monospace)",
          fontSize: "clamp(10px, 1vw, 14px)",
          fontWeight: "700",
          letterSpacing: "2px",
          cursor: "pointer",
          width: "100%",
          maxWidth: "400px",
          textTransform: "uppercase",
          boxShadow: "0 4px 0 #c07800",
          transition: "transform 0.1s, box-shadow 0.1s",
        }}
        onMouseDown={(e) => {
          e.currentTarget.style.transform = "translateY(2px)";
          e.currentTarget.style.boxShadow = "0 2px 0 #c07800";
        }}
        onMouseUp={(e) => {
          e.currentTarget.style.transform = "";
          e.currentTarget.style.boxShadow = "0 4px 0 #c07800";
        }}
      >
        📄 Baixar Relatório do Professor
      </button>
      <p style={{ fontSize: "10px", color: "var(--text-dim)", marginTop: "6px" }}>
        Abre em nova aba → use Ctrl+P → Salvar como PDF
      </p>
    </div>
  );
}
