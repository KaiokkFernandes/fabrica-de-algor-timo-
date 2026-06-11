"use client";
import { useEffect } from "react";
import styles from "./Fase13Game.module.css";

export default function Fase13Game() {
  useEffect(() => {

    // ── ROUNDS ───────────────────────────────────────────────────────────────
    const ROUNDS = [
      {
        numero: 1,
        predio: { andares: 1, janelasPorAndar: 3, janelasJaLimpas: [] },
        blocosDisponiveis: ["f13_lavar_janela", "f13_proxima_janela"],
        blocosMinimos: 5,
        tempoLimite: null,
        tutorialMsg:
          "Encaixa os blocos pra ensinar o Robozinho a lavar as 3 janelas!",
      },
      {
        numero: 2,
        predio: { andares: 1, janelasPorAndar: 5, janelasJaLimpas: [] },
        blocosDisponiveis: [
          "f13_lavar_janela",
          "f13_proxima_janela",
          "f13_repetir",
        ],
        blocosMinimos: 3,
        tempoLimite: null,
        tutorialMsg:
          "Muitas janelas! Use o bloco Repetir pra não precisar repetir os blocos.",
      },
      {
        numero: 3,
        predio: { andares: 3, janelasPorAndar: 3, janelasJaLimpas: [] },
        blocosDisponiveis: [
          "f13_lavar_janela",
          "f13_proxima_janela",
          "f13_repetir",
          "f13_subir_andar",
          "f13_mudar_direcao",
        ],
        blocosMinimos: 6,
        tempoLimite: null,
        tutorialMsg:
          "3 andares! Use Mudar direção após cada andar — o Robozinho vai em zigue-zague!",
      },
      {
        numero: 4,
        predio: {
          andares: 3,
          janelasPorAndar: 4,
          janelasJaLimpas: [[0, 1], [1, 2], [2, 0]],
        },
        blocosDisponiveis: [
          "f13_lavar_janela",
          "f13_proxima_janela",
          "f13_repetir",
          "f13_subir_andar",
          "f13_voltar_inicio",
          "f13_se_suja",
        ],
        blocosMinimos: 8,
        tempoLimite: null,
        tutorialMsg:
          "Algumas janelas já estão limpas! Use Se janela está suja antes de lavar.",
      },
      {
        numero: 5,
        predio: { andares: 4, janelasPorAndar: 5, janelasJaLimpas: [] },
        blocosDisponiveis: [
          "f13_lavar_janela",
          "f13_proxima_janela",
          "f13_repetir",
          "f13_subir_andar",
          "f13_voltar_inicio",
          "f13_se_suja",
        ],
        blocosMinimos: 6,
        tempoLimite: 90,
        tutorialMsg:
          "Desafio final! 90s pra montar o programa. Use o mínimo de blocos possível!",
      },
    ];

    // ── ESTADO ───────────────────────────────────────────────────────────────
    let roundIdx = 0;
    let workspace = null;
    let roboAndar = 0;
    let roboJanela = 0;
    let direcao = "direita"; // "direita" | "esquerda"
    let janelasEstado = []; // [andar][janela] => true = limpa
    let running = false;
    let execId = 0;          // incrementado a cada execução; tick() abortará se mudar
    let timerInterval = null;
    let tempoRestante = null;
    let hintCount = 0;
    let cleanupDone = false;

    function $(id) { return document.getElementById(id); }

    // ── BLOCOS CUSTOMIZADOS ──────────────────────────────────────────────────
    function registerBlocks(Blockly, gen) {
      function def(type, label, colour, tooltip) {
        if (Blockly.Blocks[type]) return;
        Blockly.Blocks[type] = {
          init() {
            this.appendDummyInput().appendField(label);
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(colour);
            this.setTooltip(tooltip || "");
          },
        };
      }

      def("f13_lavar_janela",   "🧹 Lavar janela",          120, "Lava a janela onde o Robozinho está");
      def("f13_proxima_janela", "➡️ Próxima janela",         120, "Move o Robozinho na direção atual");
      def("f13_subir_andar",    "⬆️ Subir andar",            120, "Move o Robozinho para o andar de cima");
      def("f13_voltar_inicio",  "↩️ Voltar ao início",       120, "Volta o Robozinho para a 1ª janela do andar");
      def("f13_mudar_direcao",  "↔️ Mudar direção",          65,  "Inverte a direção do Robozinho (direita ↔ esquerda)");

      // Condicional: Se janela está suja
      if (!Blockly.Blocks["f13_se_suja"]) {
        Blockly.Blocks["f13_se_suja"] = {
          init() {
            this.appendStatementInput("DO").appendField("🪟 Se janela está suja:");
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(210);
            this.setTooltip("Executa os blocos dentro só se a janela estiver suja");
          },
        };
      }

      // Bloco Repetir — dropdown clicável, sem digitação
      if (!Blockly.Blocks["f13_repetir"]) {
        const opcoes = Array.from({ length: 10 }, (_, i) => [String(i + 1), String(i + 1)])
          .concat([["15", "15"], ["20", "20"], ["25", "25"], ["30", "30"], ["50", "50"]]);
        Blockly.Blocks["f13_repetir"] = {
          init() {
            this.appendDummyInput()
              .appendField("🔁 Repetir")
              .appendField(new Blockly.FieldDropdown(opcoes), "TIMES")
              .appendField("vezes:");
            this.appendStatementInput("DO");
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(120);
            this.setTooltip("Repete os blocos dentro N vezes — clique no número para escolher");
          },
        };
      }

      // ── GERADORES DE CÓDIGO ──────────────────────────────────────────────
      gen.forBlock["f13_lavar_janela"]   = () => "lavarJanela();\n";
      gen.forBlock["f13_proxima_janela"] = () => "proximaJanela();\n";
      gen.forBlock["f13_subir_andar"]    = () => "subirAndar();\n";
      gen.forBlock["f13_voltar_inicio"]  = () => "voltarInicio();\n";
      gen.forBlock["f13_mudar_direcao"]  = () => "mudarDirecao();\n";

      gen.forBlock["f13_se_suja"] = (block, g) => {
        const body = g.statementToCode(block, "DO");
        return `if (janelaEstaSuja()) {\n${body}}\n`;
      };

      gen.forBlock["f13_repetir"] = (block, g) => {
        // Variável única por bloco para suportar loops aninhados sem colisão
        const v     = "__r" + block.id.replace(/[^a-zA-Z0-9]/g, "");
        const times = block.getFieldValue("TIMES") || "3";
        const body  = g.statementToCode(block, "DO");
        return `for (var ${v} = 0; ${v} < ${times}; ${v}++) {\n${body}}\n`;
      };
    }

    // ── TOOLBOX ──────────────────────────────────────────────────────────────
    function buildToolbox(blocos) {
      const acaoTypes = [
        "f13_lavar_janela",
        "f13_proxima_janela",
        "f13_subir_andar",
        "f13_voltar_inicio",
        "f13_mudar_direcao",
      ];
      const acoes = acaoTypes
        .filter((b) => blocos.includes(b))
        .map((b) => ({ kind: "block", type: b }));

      const items = [];

      // Ações — sempre visíveis, sem clique
      if (acoes.length) {
        items.push({ kind: "label", text: "⚙️  AÇÕES", "web-class": "f13-tb-label" });
        acoes.forEach((b) => items.push(b));
      }
      if (blocos.includes("f13_repetir")) {
        items.push({ kind: "sep", "gap": "14" });
        items.push({ kind: "label", text: "🔁  LOOPS", "web-class": "f13-tb-label" });
        items.push({ kind: "block", type: "f13_repetir" });
      }
      if (blocos.includes("f13_se_suja")) {
        items.push({ kind: "sep", "gap": "14" });
        items.push({ kind: "label", text: "❓  CONDIÇÃO", "web-class": "f13-tb-label" });
        items.push({ kind: "block", type: "f13_se_suja" });
      }

      // flyoutToolbox = blocos sempre visíveis, sem precisar clicar em categorias
      return { kind: "flyoutToolbox", contents: items };
    }

    // ── PRÉDIO ───────────────────────────────────────────────────────────────
    function buildPredio() {
      const round = ROUNDS[roundIdx];
      const { andares, janelasPorAndar, janelasJaLimpas } = round.predio;

      // Estado inicial
      janelasEstado = Array.from({ length: andares }, () =>
        Array(janelasPorAndar).fill(false)
      );
      (janelasJaLimpas || []).forEach(([a, j]) => {
        janelasEstado[a][j] = true;
      });

      // Grade visual — renderiza de cima pra baixo (andar mais alto = topo)
      const grid = $("f13-predio-grid");
      grid.innerHTML = "";
      grid.style.gridTemplateColumns = `repeat(${janelasPorAndar}, 1fr)`;

      for (let a = andares - 1; a >= 0; a--) {
        for (let j = 0; j < janelasPorAndar; j++) {
          const cell = document.createElement("div");
          cell.className =
            "f13-janela" + (janelasEstado[a][j] ? " f13-janela-limpa" : "");
          cell.dataset.andar  = a;
          cell.dataset.janela = j;
          cell.innerHTML      = janelasEstado[a][j] ? "✨" : "🪟";
          grid.appendChild(cell);
        }
      }

      // Robô começa no andar 0, janela 0, indo para a direita
      roboAndar  = 0;
      roboJanela = 0;
      direcao    = "direita";
      const roboEl = $("f13-robo");
      if (roboEl) { roboEl.style.transition = "none"; roboEl.style.transform = "scaleX(1)"; }
      updateRoboPos(false);
      updateHUD();
    }

    function getCell(andar, janela) {
      return document.querySelector(
        `[data-andar="${andar}"][data-janela="${janela}"]`
      );
    }

    function updateRoboPos(animate) {
      const robo  = $("f13-robo");
      const cell  = getCell(roboAndar, roboJanela);
      const outer = $("f13-predio-outer");
      if (!robo || !cell || !outer) return;

      const cRect = cell.getBoundingClientRect();
      const oRect = outer.getBoundingClientRect();

      // Robô ocupa só a metade inferior da célula → janela visível em cima
      const halfH = cRect.height * 0.52;
      robo.style.transition = animate
        ? "left 0.38s ease, top 0.38s ease"
        : "none";
      robo.style.left   = cRect.left - oRect.left + "px";
      robo.style.top    = cRect.bottom - oRect.top - halfH + "px";
      robo.style.width  = cRect.width + "px";
      robo.style.height = halfH + "px";
    }

    function updateHUD() {
      const round = ROUNDS[roundIdx];
      const total  = round.predio.andares * round.predio.janelasPorAndar;
      const limpas = janelasEstado.flat().filter(Boolean).length;
      $("f13-round").textContent   = `ROUND ${round.numero}/5`;
      $("f13-janelas").textContent = `${limpas}/${total}`;
    }

    function setFeedback(icon, text, color) {
      $("f13-fi").textContent  = icon;
      const ft = $("f13-ft");
      ft.textContent  = text;
      ft.style.color  = color || "var(--text)";
    }

    function hideRound1Hint() {
      const h = $("f13-hint-r1");
      if (h) h.style.display = "none";
    }

    function showRound1Hint() {
      const h = $("f13-hint-r1");
      if (!h || roundIdx !== 0) return;
      h.style.display = "none";

      // Aguarda Blockly renderizar o flyout para calcular posição real
      setTimeout(() => {
        if (roundIdx !== 0 || !workspace) return;
        try {
          const flyout   = workspace.getFlyout?.() ?? workspace.getFlyout?.(true);
          const flyoutWs = flyout?.getWorkspace?.();
          const blocks   = flyoutWs?.getAllBlocks?.(false) ?? [];
          if (blocks.length > 0) {
            const svgRoot  = blocks[0].getSvgRoot?.();
            const svgRect  = svgRoot?.getBoundingClientRect?.();
            const wrapRect = $("f13-blockly-div")?.getBoundingClientRect?.();
            if (svgRect && wrapRect && svgRect.width > 0) {
              h.style.left = Math.round(svgRect.right - wrapRect.left + 14) + "px";
              h.style.top  = Math.round(svgRect.top   - wrapRect.top  + svgRect.height / 2 - 14) + "px";
              h.style.display = "flex";
              return;
            }
          }
        } catch (_) {}
        // Fallback caso a API do flyout não esteja disponível
        h.style.left    = "175px";
        h.style.top     = "65px";
        h.style.display = "flex";
      }, 650);
    }

    // ── ANIMAÇÕES ────────────────────────────────────────────────────────────
    const delay = (ms) => new Promise((res) => setTimeout(res, ms));

    function animLavar() {
      const robo = $("f13-robo");
      if (robo) robo.textContent = "🫧";
      return delay(500).then(() => {
        janelasEstado[roboAndar][roboJanela] = true;
        const cell = getCell(roboAndar, roboJanela);
        if (cell) {
          cell.className = "f13-janela f13-janela-limpa";
          cell.innerHTML = "✨";
          cell.classList.add("f13-janela-flash");
          setTimeout(() => cell.classList.remove("f13-janela-flash"), 700);
        }
        if (robo) robo.textContent = "🤖";
        updateHUD();
        return delay(600);
      });
    }

    function animProxima() {
      const round = ROUNDS[roundIdx];
      if (direcao === "direita") {
        if (roboJanela >= round.predio.janelasPorAndar - 1) return delay(0); // no-op na borda
        roboJanela++;
      } else {
        if (roboJanela <= 0) return delay(0); // no-op na borda
        roboJanela--;
      }
      updateRoboPos(true);
      return delay(420);
    }

    function animMudarDirecao() {
      direcao = direcao === "direita" ? "esquerda" : "direita";
      const robo = $("f13-robo");
      if (robo) {
        robo.style.transition = "transform 0.25s ease";
        robo.style.transform  = direcao === "esquerda" ? "scaleX(-1)" : "scaleX(1)";
      }
      return delay(300);
    }

    function animSubir() {
      const round = ROUNDS[roundIdx];
      if (roboAndar >= round.predio.andares - 1) return delay(0); // no-op no topo
      roboAndar++;
      updateRoboPos(true);
      return delay(420);
    }

    function animVoltarInicio() {
      roboJanela = 0;
      updateRoboPos(true);
      return delay(360);
    }

    function janelaEstaSuja() {
      return !janelasEstado[roboAndar][roboJanela];
    }

    // ── EXECUÇÃO ─────────────────────────────────────────────────────────────
    function executeProgram(gen, Interpreter) {
      if (running) return;

      let code;
      try {
        code = gen.workspaceToCode(workspace);
      } catch (e) {
        setFeedback("❌", "Erro ao ler o programa: " + e.message, "var(--red)");
        return;
      }
      if (!code.trim()) {
        setFeedback("❓", "Adiciona blocos antes de executar!", "var(--yellow)");
        return;
      }

      running = true;
      const myExecId = ++execId;
      $("f13-run-btn").disabled   = true;
      $("f13-reset-btn").disabled = true;
      setFeedback("▶️", "Executando o programa...", "var(--yellow)");

      let steps = 0;
      let interp;

      try {
        interp = new Interpreter(code, (interp, globalObject) => {
          const wrap = (fn) =>
            interp.createAsyncFunction((cb) =>
              fn()
                .then(cb)
                .catch((e) => stopWithError(e.message))
            );

          interp.setProperty(globalObject, "lavarJanela",   wrap(animLavar));
          interp.setProperty(globalObject, "proximaJanela", wrap(animProxima));
          interp.setProperty(globalObject, "subirAndar",    wrap(animSubir));
          interp.setProperty(globalObject, "voltarInicio",  wrap(animVoltarInicio));
          interp.setProperty(globalObject, "mudarDirecao",  wrap(animMudarDirecao));
          interp.setProperty(
            globalObject,
            "janelaEstaSuja",
            interp.createNativeFunction(() =>
              interp.nativeToPseudo(janelaEstaSuja())
            )
          );
        });
      } catch (e) {
        stopWithError("Erro no programa: " + e.message);
        return;
      }

      const tick = () => {
        if (myExecId !== execId) return; // round mudou, descarta execução antiga
        if (++steps > 50000) {
          stopWithError("Loop infinito detectado! Verifique os números do Repetir.");
          return;
        }
        try {
          if (interp.step()) setTimeout(tick, 0);
          else onProgramEnd();
        } catch (e) {
          stopWithError(e.message);
        }
      };
      tick();
    }

    function stopWithError(msg) {
      running = false;
      if ($("f13-run-btn"))   $("f13-run-btn").disabled   = false;
      if ($("f13-reset-btn")) $("f13-reset-btn").disabled = false;
      const robo = $("f13-robo");
      if (robo) {
        robo.textContent = "😵";
        setTimeout(() => { if (robo) robo.textContent = "🤖"; }, 1200);
      }
      setFeedback("❌", "🤖 Brasilino diz: " + msg, "var(--red)");
    }

    function onProgramEnd() {
      running = false;
      if ($("f13-run-btn"))   $("f13-run-btn").disabled   = false;
      if ($("f13-reset-btn")) $("f13-reset-btn").disabled = false;

      const round  = ROUNDS[roundIdx];
      const total  = round.predio.andares * round.predio.janelasPorAndar;
      const limpas = janelasEstado.flat().filter(Boolean).length;

      if (limpas < total) {
        setFeedback(
          "🤔",
          `Quase! O Robozinho lavou ${limpas} de ${total} janelas. O que está faltando?`,
          "var(--yellow)"
        );
        return;
      }

      setFeedback("✅", "Todas as janelas limpas! 🎉", "var(--green)");

      const blocosUsados = workspace ? workspace.getAllBlocks(false).length : 99;
      const isOptimo     = blocosUsados <= round.blocosMinimos + 1;
      const stars        = isOptimo && hintCount === 0 ? 3 : hintCount <= 1 ? 2 : 1;

      try {
        const key  = `fase13_round${round.numero}_stars`;
        const prev = parseInt(localStorage.getItem(key) || "0");
        if (stars > prev) localStorage.setItem(key, String(stars));
        if (roundIdx === ROUNDS.length - 1 && stars > 0)
          localStorage.setItem("fase13_completed", "1");
      } catch (_) {}

      showModal(stars, blocosUsados, round.blocosMinimos);
    }

    // ── MODAL ────────────────────────────────────────────────────────────────
    function showModal(stars, blocosUsados, blocosMin) {
      const isLast = roundIdx === ROUNDS.length - 1;
      $("f13-modal-stars").textContent = "★".repeat(stars) + "☆".repeat(3 - stars);
      $("f13-modal-stars").className   = `f13-modal-stars f13-stars-${stars}`;

      const msgs = [];
      if (stars === 3) msgs.push("🤖 Brasilino diz: Programa perfeito! Você é um programador nato!");
      else if (stars === 2) msgs.push("🤖 Brasilino diz: Muito bem! Tente usar menos blocos na próxima.");
      else msgs.push("🤖 Brasilino diz: Funcionou! Tente o bloco Repetir para usar menos blocos.");
      if (blocosUsados > blocosMin + 1)
        msgs.push(`💡 Você usou ${blocosUsados} blocos. O mínimo possível é ${blocosMin}.`);

      $("f13-modal-msgs").innerHTML = msgs
        .map((m) => `<div class="f13-modal-msg">${m}</div>`)
        .join("");
      $("f13-modal-next").style.display   = isLast ? "none"         : "inline-block";
      $("f13-modal-finish").style.display = isLast ? "inline-block" : "none";
      $("f13-modal").style.display        = "flex";
    }

    // ── TIMER ────────────────────────────────────────────────────────────────
    function startTimer(seconds) {
      tempoRestante = seconds;
      renderTimer();
      timerInterval = setInterval(() => {
        tempoRestante--;
        renderTimer();
        if (tempoRestante <= 0) {
          clearInterval(timerInterval);
          timerInterval = null;
          if (!running)
            setFeedback("⏰", "Tempo esgotado! Clique Executar para tentar.", "var(--red)");
        }
      }, 1000);
    }

    function stopTimer() {
      if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
    }

    function renderTimer() {
      const el = $("f13-timer");
      if (!el) return;
      if (tempoRestante == null) { el.textContent = "--"; el.className = styles.hudVal; return; }
      const m = Math.floor(tempoRestante / 60);
      const s = tempoRestante % 60;
      el.textContent = `⏱ ${m}:${String(s).padStart(2, "0")}`;
      el.className   = styles.hudVal + (tempoRestante <= 15 ? " f13-timer-urgent" : "");
    }

    // ── INÍCIO DO ROUND ──────────────────────────────────────────────────────
    function startRound(idx, gen) {
      execId++;           // invalida qualquer tick() de execução anterior
      roundIdx  = idx;
      hintCount = 0;
      running   = false;
      stopTimer();
      $("f13-modal").style.display = "none";

      buildPredio();

      if (workspace) {
        try { workspace.updateToolbox(buildToolbox(ROUNDS[idx].blocosDisponiveis)); } catch (_) {}
        workspace.clear();
      }

      const round = ROUNDS[idx];
      if (round.tempoLimite) startTimer(round.tempoLimite);
      else { tempoRestante = null; renderTimer(); }

      if ($("f13-run-btn"))   $("f13-run-btn").disabled   = false;
      if ($("f13-reset-btn")) $("f13-reset-btn").disabled = false;

      setFeedback("🤖", round.tutorialMsg || "Monte o programa e clique Executar!", "var(--yellow)");

      if (idx === 0) showRound1Hint(); else hideRound1Hint();
    }

    // ── CARREGAR BLOCKLY + JS-INTERPRETER ───────────────────────────────────
    document.body.classList.add("game-mode");
    if (!$("f13-root")) return;

    Promise.all([
      import("blockly"),
      import("blockly/javascript"),
      import("blockly/msg/pt-br").catch(() => null),
    ]).then(([BlyMod, jsGenMod, ptBrMod]) => {
      if (cleanupDone) return;

      const Blockly = BlyMod.default ?? BlyMod;
      const { javascriptGenerator: gen } = jsGenMod;

      // Traduz menus de contexto e tooltips do Blockly para pt-BR
      if (ptBrMod) {
        try { Blockly.setLocale(ptBrMod.default ?? ptBrMod); } catch (_) {}
      }

      registerBlocks(Blockly, gen);

      // Tema escuro compatível com a interface do jogo
      let theme;
      try {
        theme = Blockly.Theme.defineTheme("f13_dark", {
          base: Blockly.Themes.Classic,
          componentStyles: {
            workspaceBackgroundColour: "#1a1a2e",
            toolboxBackgroundColour:   "#16213e",
            toolboxForegroundColour:   "#e8d5a3",
            flyoutBackgroundColour:    "#0d0d1a",
            flyoutForegroundColour:    "#e8d5a3",
            flyoutOpacity:             0.97,
            scrollbarColour:           "#4a4a6a",
            scrollbarOpacity:          0.5,
          },
        });
      } catch (_) {
        theme = undefined;
      }

      const blocklyDiv = $("f13-blockly-div");
      if (!blocklyDiv) return;

      workspace = Blockly.inject(blocklyDiv, {
        toolbox:    buildToolbox(ROUNDS[0].blocosDisponiveis),
        trashcan:   true,
        scrollbars: false,
        move:       { scrollbars: false, drag: false, wheel: false },
        zoom:       { controls: false, wheel: false, startScale: 1.3, maxScale: 1.3, minScale: 1.3 },
        ...(theme ? { theme } : {}),
      });

      // Esconde dica do round 1 quando o user arrastar qualquer bloco
      workspace.addChangeListener(() => {
        if (roundIdx === 0 && workspace.getAllBlocks(false).length > 0) {
          hideRound1Hint();
        }
      });

      import("js-interpreter").then((InterpMod) => {
        if (cleanupDone) return;
        const Interpreter = InterpMod.default ?? InterpMod;

        startRound(0, gen);

        // ── HANDLERS ──────────────────────────────────────────────────────
        const runBtn    = $("f13-run-btn");
        const resetBtn  = $("f13-reset-btn");
        const hintBtn   = $("f13-hint-btn");
        const retryBtn  = $("f13-modal-retry");
        const nextBtn   = $("f13-modal-next");
        const finishBtn = $("f13-modal-finish");

        const onRun = () => executeProgram(gen, Interpreter);
        const onReset = () => {
          if (running) return;
          buildPredio();
          setFeedback("🔄", "Robozinho voltou ao início!", "var(--text)");
        };
        const onHint = () => {
          hintCount++;
          const round = ROUNDS[roundIdx];
          const tips = [
            `💡 Dica 1: O prédio tem ${round.predio.andares} andar(es) e ${round.predio.janelasPorAndar} janela(s) por andar.`,
            `💡 Dica 2: Você precisa Lavar e depois ir à Próxima janela para cada janela do andar.`,
            `💡 Dica 3: Use o bloco Repetir com o número certo pra não repetir os mesmos blocos.`,
          ];
          setFeedback("💡", tips[Math.min(hintCount - 1, tips.length - 1)], "var(--yellow)");
        };
        const onRetry  = () => {
          $("f13-modal").style.display = "none";
          buildPredio();
          workspace?.clear();
          if (roundIdx === 0) showRound1Hint();
        };
        const onNext   = () => startRound(roundIdx + 1, gen);
        const onFinish = () => { window.location.href = "/menu"; };

        runBtn?.addEventListener("click",    onRun);
        resetBtn?.addEventListener("click",  onReset);
        hintBtn?.addEventListener("click",   onHint);
        retryBtn?.addEventListener("click",  onRetry);
        nextBtn?.addEventListener("click",   onNext);
        finishBtn?.addEventListener("click", onFinish);

        window.__f13_cleanup = () => {
          runBtn?.removeEventListener("click",    onRun);
          resetBtn?.removeEventListener("click",  onReset);
          hintBtn?.removeEventListener("click",   onHint);
          retryBtn?.removeEventListener("click",  onRetry);
          nextBtn?.removeEventListener("click",   onNext);
          finishBtn?.removeEventListener("click", onFinish);
        };
      }).catch((e) => {
        setFeedback("❌", "Erro ao carregar o motor de execução: " + e.message, "var(--red)");
      });
    }).catch((e) => {
      setFeedback("❌", "Erro ao carregar Blockly: " + e.message, "var(--red)");
    });

    return () => {
      cleanupDone = true;
      document.body.classList.remove("game-mode");
      stopTimer();
      if (window.__f13_cleanup) { window.__f13_cleanup(); delete window.__f13_cleanup; }
      if (workspace) { try { workspace.dispose(); } catch (_) {} workspace = null; }
    };
  }, []);

  // ── JSX SHELL ─────────────────────────────────────────────────────────────
  return (
    <div id="f13-root" className={styles.root}>
      <div className={styles.gameTitle}>FABRICA DE ALGORITMOS</div>
      <div className={styles.gameSubtitle}>
        FASE 1.3 — LAVADOR INDUSTRIAL &nbsp;|&nbsp; EF04CO03
      </div>

      <div className={styles.wrap}>
        {/* HUD */}
        <div className={styles.hud}>
          <div>
            <div className={styles.hudLabel}>ROUND</div>
            <div className={styles.hudVal} id="f13-round">1/5</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div className={styles.hudLabel}>JANELAS LIMPAS</div>
            <div className={styles.hudVal} id="f13-janelas">0/3</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div className={styles.hudLabel}>TEMPO</div>
            <div className={styles.hudVal} id="f13-timer">--</div>
          </div>
        </div>

        {/* Área principal */}
        <div className={styles.main}>
          {/* ESQUERDA: workspace Blockly */}
          <div className={styles.blocklyPanel}>
            <div className={styles.panelLabel}>📦 SEU PROGRAMA</div>
            <div className={styles.blocklyPosWrap}>
              <div id="f13-blockly-div" className={styles.blocklyDiv} />
              {/* Dica flutuante do Round 1 — some quando o usuário arrastar um bloco */}
              <div id="f13-hint-r1" className={styles.dragHint} style={{ display: "none" }}>
                ← Arraste!
              </div>
            </div>
          </div>

          {/* DIREITA: prédio + feedback */}
          <div className={styles.rightPanel}>
            <div className={styles.predioWrap}>
              <div className={styles.panelLabel}>🏢 PRÉDIO</div>
              <div id="f13-predio-outer" className={styles.predioOuter}>
                <div id="f13-predio-grid" className={styles.predioGrid} />
                <div id="f13-robo" className={styles.robo}>🤖</div>
              </div>
            </div>

            <div className={styles.feedback}>
              <span id="f13-fi">🤖</span>&nbsp;
              <span id="f13-ft">Carregando Blockly...</span>
            </div>
          </div>
        </div>

        {/* Botões de ação */}
        <div className={styles.actions}>
          <button id="f13-hint-btn"  className={styles.hintBtn}>💡 DICA</button>
          <button id="f13-reset-btn" className={styles.resetBtn}>🔄 RESETAR</button>
          <button id="f13-run-btn"   className={styles.runBtn}>▶ EXECUTAR</button>
        </div>
      </div>

      {/* Modal fim de round */}
      <div id="f13-modal" className={styles.modal}>
        <div className={styles.modalBox}>
          <div className={styles.modalTitle}>✅ JANELAS LIMPAS!</div>
          <div id="f13-modal-stars" className="f13-modal-stars">★★★</div>
          <div id="f13-modal-msgs"  className={styles.modalMsgs}></div>
          <div className={styles.modalBtns}>
            <button id="f13-modal-retry"  className={styles.retryBtn}>↩ TENTAR DE NOVO</button>
            <button id="f13-modal-next"   className={styles.advanceBtn}>► PRÓXIMO ROUND</button>
            <button id="f13-modal-finish" className={styles.advanceBtn}>🏁 VOLTAR AO MAPA</button>
          </div>
        </div>
      </div>
    </div>
  );
}
