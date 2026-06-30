"use client";

import { useEffect, useState, useRef } from "react";
import styles from "./FaseGame.module.css";
import PhaseActionsButton from "../components/PhaseActionsButton";
import { playRightAnswer, playWrongAnswer, startTyping, stopTyping, playGameplayMusic1, stopMusic } from "../lib/sfx";
import {
  getBaseScore,
  startRoundAttempt,
  recordRoundComplete,
} from "../lib/gameScore";

/* ── Tipos de caixa disponíveis ── */
const BOX_TYPES = [
  { icon: "📦", color: "#a0522d", border: "#8b4513" },
  { icon: "⚙️", color: "#607d8b", border: "#455a64" },
  { icon: "🔧", color: "#78909c", border: "#546e7a" },
  { icon: "💡", color: "#f9a825", border: "#f57f17" },
  { icon: "🧪", color: "#7b1fa2", border: "#4a148c" },
  { icon: "🔩", color: "#37474f", border: "#263238" },
  { icon: "🔌", color: "#00695c", border: "#004d40" },
  { icon: "🔋", color: "#558b2f", border: "#33691e" },
];

/* ── Passos do Tutorial Interativo ── */
const TUTORIAL_STEPS = [
  {
    text: "Oi! Vou te ajudar nessa primeira fase! Vamos aprender a usar a prateleira de armazenagem. 🏢",
    highlight: null,
  },
  {
    text: "Para começar, as COLUNAS ficam de pé (na vertical)! Veja a coluna 2 destacada em azul.",
    highlight: "col",
  },
  {
    text: "Para identificar a coluna, olhe o NÚMERO acima dela. O número 2 está piscando!",
    highlight: "colLabel",
  },
  {
    text: "E as LINHAS ficam deitadas (na horizontal)! Veja a linha A destacada em verde.",
    highlight: "row",
  },
  {
    text: "Para identificar a linha, olhe a LETRA à esquerda dela. A letra A está piscando!",
    highlight: "rowLabel",
  },
  {
    text: "Cruzando a linha com a coluna, temos o endereço da célula! Onde a linha A encontra a coluna 2 é a célula A,2! 📦",
    highlight: "cell",
  },
  {
    text: "As caixas vão chegar pela esteira de entrada com a etiqueta de endereço. Você deve clicar e ARRASTAR a caixa até o lugar certo na prateleira!",
    highlight: "drag",
  },
  {
    text: "Muito fácil, né? Agora você já sabe como funciona! Vamos organizar as caixas?",
    highlight: "ready",
  }
];

/* ── Configuração dos 5 Rounds ── */
const ROUNDS = [
  {
    title: "Aprendendo as Coordenadas",
    rows: ["A", "B"],
    cols: [1, 2],
    boxCount: 2,
    coordVisible: "full",
    timer: null,
    pointsCorrect: 100,
    pointsWrong: 10,
    hintCosts: [0, 0, 0],
    introText:
      "Que bom que você aceitou me ajudar! 🤖 A esteira de caixas está travada porque as coisas foram colocadas fora de ordem. Para destravar a fábrica, precisamos guardar essas primeiras caixas nos seus devidos endereços de prateleira!",
  },
  {
    title: "Mais Prateleiras",
    rows: ["A", "B", "C"],
    cols: [1, 2, 3],
    boxCount: 4,
    coordVisible: "full",
    timer: null,
    pointsCorrect: 100,
    pointsWrong: 20,
    hintCosts: [0, 0, 30],
    introText:
      "Muito bem! A fábrica cresceu! 📦 Agora temos 3 linhas e 3 colunas. Preste atenção: mais lugares possíveis significa que você precisa olhar com cuidado para a letra E o número!",
  },
  {
    title: "Prateleira sem Etiquetas",
    rows: ["A", "B", "C"],
    cols: [1, 2, 3, 4],
    boxCount: 5,
    coordVisible: "full",
    shelfLabels: "partial",
    timer: null,
    pointsCorrect: 100,
    pointsWrong: 30,
    hintCosts: [0, 20, 50],
    introText:
      "Eita! 😮 Algumas etiquetas da prateleira caíram! Onde aparecer um '?', você vai precisar CONTAR as linhas e colunas a partir das etiquetas que sobraram. A caixa mostra o endereço certinho — descubra qual lugar é esse!",
  },
  {
    title: "Endereços por Extenso",
    rows: ["A", "B", "C"],
    cols: [1, 2, 3, 4],
    boxCount: 6,
    coordVisible: "extenso",
    timer: null,
    pointsCorrect: 100,
    pointsWrong: 30,
    hintCosts: [0, 20, 50],
    introText:
      "Agora as caixas vêm com o endereço escrito por extenso! 📝 'Linha 2' quer dizer a SEGUNDA linha — conte de cima pra baixo: A é a 1ª, B é a 2ª, C é a 3ª. 'Coluna 4' é a quarta coluna. Traduza e guarde cada caixa no lugar certo!",
  },
  {
    title: "Vire o Mestre!",
    rows: ["A", "B", "C", "D"],
    cols: [1, 2, 3, 4],
    boxCount: 6,
    coordVisible: "full",
    mode: "name",
    timer: null,
    pointsCorrect: 150,
    pointsWrong: 40,
    hintCosts: [0, 0, 0],
    introText:
      "Chegou a hora de PROVAR que você é mestre! 🏆 Agora EU coloco as caixas na prateleira e VOCÊ me diz o endereço de cada uma. Olhe a linha (letra) e a coluna (número) e escolha a resposta certa!",
  },
  {
    title: "Mestre sem Etiquetas",
    rows: ["A", "B", "C", "D"],
    cols: [1, 2, 3, 4],
    boxCount: 6,
    coordVisible: "full",
    mode: "name",
    shelfLabels: "none",
    timer: null,
    pointsCorrect: 150,
    pointsWrong: 40,
    hintCosts: [0, 0, 0],
    introText:
      "Agora é o desafio dos MESTRES! 🕵️ As etiquetas da prateleira sumiram TODAS — só sobrou '?' no lugar. Eu coloco a caixa e você descobre o endereço CONTANDO a partir do canto de cima: a primeira linha é A, depois B, C, D... e a primeira coluna da esquerda é 1, 2, 3, 4. Confie no que você já aprendeu!",
  },
  {
    title: "Construa o Endereço",
    rows: ["A", "B", "C"],
    cols: [1, 2, 3],
    boxCount: 5,
    coordVisible: "full",
    mode: "produce",
    shelfLabels: "full",
    timer: null,
    pointsCorrect: 150,
    pointsWrong: 40,
    hintCosts: [0, 0, 0],
    introText:
      "Hora de CONSTRUIR o endereço com as suas próprias mãos! 🛠️ Eu coloco a caixa na prateleira e você monta a resposta: use o controle de COLUNA (que desliza pro lado) e o de LINHA (que desliza pra cima e pra baixo). Quando o endereço estiver certinho, aperte Confirmar!",
  },
  {
    title: "Mestre Supremo 5×5",
    rows: ["A", "B", "C", "D", "E"],
    cols: [1, 2, 3, 4, 5],
    boxCount: 6,
    coordVisible: "full",
    mode: "produce",
    shelfLabels: "none",
    timer: null,
    pointsCorrect: 200,
    pointsWrong: 50,
    hintCosts: [0, 0, 0],
    introText:
      "O DESAFIO FINAL chegou! 🏆 Agora a prateleira é gigante: 5 linhas e 5 colunas E as etiquetas sumiram — só tem '?'. Conte a partir do canto de cima pra descobrir cada endereço e monte a resposta com os controles. Você é o Mestre da Fábrica agora!",
  },
];

export default function FaseGame() {
  /* ── Estados React ── */
  const [currentRound, setCurrentRound] = useState(0);
  const [showIntro, setShowIntro] = useState(true);
  const [introText, setIntroText] = useState("");
  const [introDone, setIntroDone] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [resultData, setResultData] = useState(null);

  /* ── Estados do Tutorial ── */
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [tutorialBoxPlaced, setTutorialBoxPlaced] = useState(false);
  const [tutorialSelected, setTutorialSelected] = useState(false);
  const [tutorialDragging, setTutorialDragging] = useState(false);

  useEffect(() => {
      playGameplayMusic1();
      return () => stopMusic();
    }, []);

  const handleRoundEndRef = useRef(null);
  const roundConfig = ROUNDS[currentRound];

  /* ── Salvar progresso na cache (localStorage) ── */
  useEffect(() => {
    try {
      localStorage.setItem("current_phase", "1");
      localStorage.setItem("current_round", String(currentRound + 1));
    } catch (e) {
      // localStorage pode estar desativado
    }
  }, [currentRound]);

  /* ── Efeito de digitação da intro ── */
  useEffect(() => {
    if (!showIntro) return;
    setIntroText("");
    setIntroDone(false);
    const text = ROUNDS[currentRound].introText;
    let i = 0;
    startTyping();
    const id = setInterval(() => {
      i++;
      setIntroText(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(id);
        setIntroDone(true);
        stopTyping();
      }
    }, 25);
    return () => {
      clearInterval(id);
      stopTyping();
    };
  }, [showIntro, currentRound]);

  /* ── Controle da intro ── */
  const handleIntroNext = () => {
    if (!introDone) {
      setIntroText(ROUNDS[currentRound].introText);
      setIntroDone(true);
      stopTyping();
    } else {
      setShowIntro(false);
      try {
        // Se for o primeiro round e o tutorial ainda não tiver sido visto, mostra o tutorial
        if (currentRound === 0 && !localStorage.getItem("fase1_tutorial_seen")) {
          setShowTutorial(true);
        }
      } catch (e) {}
    }
  };

  /* ── Callback para fim de round (via ref para acessar dentro do useEffect) ── */
  handleRoundEndRef.current = (data) => {
    // Legado: salvar estrelas individualmente
    const key = `fase1_round${currentRound + 1}_stars`;
    try {
      const prev = parseInt(localStorage.getItem(key) || "0");
      if (data.stars > prev) localStorage.setItem(key, String(data.stars));
    } catch (e) {
      /* localStorage indisponível */
    }

    // Sistema global de pontuação
    const result = recordRoundComplete(1, currentRound + 1, {
      score: data.score,
      errors: data.errors || 0,
      hints: data.hints || 0,
      stars: data.stars,
      timeMs: data.timeMs || 0,
    });

    setResultData({ ...data, isFirst: result.isFirst, totalScore: result.totalScore });
    setShowResult(true);
  };

  /* ── Avançar para o próximo round ── */
  const handleNextRound = () => {
    if (currentRound < ROUNDS.length - 1) {
      setShowResult(false);
      setCurrentRound((prev) => prev + 1);
      setShowIntro(true);
    }
  };

  /* ── Repetir o round atual (0 estrelas) ── */
  const handleRetryRound = () => {
    setShowResult(false);
    setShowIntro(true); // Re-exibe o diálogo e reinicia o round
  };

  /* ══════════════════════════════════════════════════════════════════
     LÓGICA PRINCIPAL DO JOGO (vanilla DOM dentro de useEffect)
     ══════════════════════════════════════════════════════════════════ */
  useEffect(() => {
    if (showIntro || showResult) return;

    const config = ROUNDS[currentRound];
    const ROWS = config.rows;
    const COLS = config.cols;
    const total = config.boxCount;
    const coordVisible = config.coordVisible;
    const pointsCorrect = config.pointsCorrect;
    const pointsWrong = config.pointsWrong;

    const HINT_CARDS = [
      { cost: config.hintCosts[0], used: false },
      { cost: config.hintCosts[1], used: false },
      { cost: config.hintCosts[2], used: false },
    ];

    // ── Pontuação global ──────────────────────────────────────────────
    // baseScore = total acumulado SEM este round (para o HUD)
    const baseScore = getBaseScore(1, currentRound + 1);
    const roundStartTime = Date.now();
    let errors = 0; // contador de erros desta tentativa

    // Registra início da tentativa
    startRoundAttempt(1, currentRound + 1);

    // Auxiliar para atualizar o display do score com o total acumulado
    function updateScoreDisplay(roundScore) {
      const el = document.getElementById("score");
      if (el) el.textContent = String(baseScore + Math.max(0, roundScore)).padStart(5, "0");
    }

    let score = 0,
      hits = 0,
      batch = [],
      dragging = null,
      cardsLeft = 3,
      beltInsertIdx = -1,
      beltBuilt = false;
    let timerInterval = null;
    let timeRemaining = config.timer;

    /* ── Constantes da esteira ── */
    const SLOT_BASE = 20;   // right do slot 0 (mais à direita)
    const SLOT_STEP = 150;  // espaçamento entre slots
    const ENTRANCE_OFFSET = 450; // distância de entrada (todos partem daqui à esquerda)
    const slotRight = (i) => SLOT_BASE + i * SLOT_STEP;

    document.body.classList.add("game-mode");
    const ghost = document.getElementById("ghost");
    if (!ghost) return;

    /* ── Utilitário: shuffle ── */
    function shuffle(a) {
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    }

    /* ── Construir a prateleira com tamanho dinâmico ── */
    function buildShelf() {
      const rowLbls = document.getElementById("row-lbls");
      const colLbls = document.getElementById("col-lbls");
      const sgrid = document.getElementById("sgrid");
      if (!rowLbls || !colLbls || !sgrid) return;

      rowLbls.innerHTML = "";
      colLbls.innerHTML = "";
      sgrid.innerHTML = "";

      // Grade dinâmica baseada no round
      sgrid.style.gridTemplateColumns = `repeat(${COLS.length}, clamp(85px, 11vh, 130px))`;
      sgrid.style.gridTemplateRows = `repeat(${ROWS.length}, clamp(85px, 11vh, 130px))`;

      // Rótulos parciais (Round 3): esconde os do meio, mantém o primeiro e o último
      const partial = config.shelfLabels === "partial";
      // Rótulos ocultos (Round 6): esconde TODOS — o jogador conta a partir do canto
      const noneLbl = config.shelfLabels === "none";

      COLS.forEach((c, ci) => {
        const d = document.createElement("div");
        d.className = "clbl";
        const hidden = noneLbl || (partial && ci !== 0 && ci !== COLS.length - 1);
        d.textContent = hidden ? "?" : c;
        if (hidden) d.classList.add("lbl-hidden");
        colLbls.appendChild(d);
      });

      ROWS.forEach((r, ri) => {
        const rl = document.createElement("div");
        rl.className = "rlbl";
        const hidden = noneLbl || (partial && ri !== 0 && ri !== ROWS.length - 1);
        rl.textContent = hidden ? "?" : r;
        if (hidden) rl.classList.add("lbl-hidden");
        rowLbls.appendChild(rl);

        COLS.forEach((c) => {
          const cell = document.createElement("div");
          cell.className = "scell";
          // some a coordenada fantasma de fundo (rounds parciais/ocultos e de produção)
          if (partial || noneLbl || config.mode === "produce") cell.classList.add("no-hint");
          cell.dataset.coord = r + "" + c;
          cell.dataset.row = r;
          cell.dataset.col = c;
          sgrid.appendChild(cell);
        });
      });
    }

    /* ── Gerar lote de caixas ── */
    function genBatch() {
      const all = [];
      ROWS.forEach((r) => COLS.forEach((c) => all.push(r + "" + c)));
      shuffle(all);
      const chosen = all.slice(0, total);
      const types = shuffle([...BOX_TYPES]);
      return chosen.map((coord, i) => ({
        coord,
        row: coord[0],
        col: parseInt(coord.slice(1)),
        type: types[i % types.length],
        id: "b" + i,
        placed: false,
      }));
    }

    /* ── Label de coordenada conforme a representação do round ── */
    function getCoordLabel(box) {
      if (coordVisible === "extenso")
        return `Linha ${ROWS.indexOf(box.row) + 1}, Coluna ${box.col}`;
      if (coordVisible === "partial") return `${box.row},?`;
      if (coordVisible === "hidden") return "???";
      return `${box.row},${box.col}`;
    }

    /* ── Renderizar esteira — build inicial + animação de entrada ── */
    function renderBelt() {
      const q = document.getElementById("belt-q");
      if (!q) return;

      if (!beltBuilt) {
        q.innerHTML = "";
        // Recria o slot de inserção como nó vanilla (fora do controle do React,
        // evitando conflito de removeChild ao trocar de round)
        const slot = document.createElement("div");
        slot.id = "belt-insert-slot";
        slot.className = styles.beltInsertSlot;
        slot.style.display = "none";
        q.appendChild(slot);
        batch.forEach((box) => {
          const el = document.createElement("div");
          el.className = "bbox";
          el.id = box.id;
          el.style.background = box.type.color;
          el.style.borderColor = box.type.border;
          el.style.touchAction = "none";
          el.innerHTML = `<div class="bicon">${box.type.icon}</div><div class="bcoord">${getCoordLabel(box)}</div>`;

          el.addEventListener("pointerdown", (e) => {
            e.preventDefault();
            el.setPointerCapture(e.pointerId);
            dragging = box;
            el.style.opacity = "0";
            showGhostEl(box);
            ghost.style.left = e.clientX + "px";
            ghost.style.top = e.clientY + "px";
            ghost.style.display = "flex";
          });

          box.el = el;
          q.appendChild(el);

          // Todas partem da mesma posição inicial (off-screen esquerda, sem transição)
          el.style.transition = "none";
          el.style.right = "650px";
          el.style.opacity = "0";
          el.style.pointerEvents = "none";
        });

        // Flush para garantir que o browser registre a posição inicial
        q.offsetHeight;

        // Anima o lote inteiro entrando junto da esquerda para a direita
        requestAnimationFrame(() => {
          const unplaced = batch.filter((b) => !b.placed);
          unplaced.forEach((box, i) => {
            if (!box.el) return;
            box.el.style.transition = ""; // restaura CSS transitions
            if (i < 3) {
              box.el.style.right = slotRight(i) + "px";
              box.el.style.opacity = "1";
              box.el.style.pointerEvents = "auto";
            } else {
              // Boxes além do slot 2 ficam fora da tela, prontas para entrar
              box.el.style.right = slotRight(3) + "px";
            }
          });
        });

        beltBuilt = true;
        return;
      }

      updateBeltPositions(-1);
    }

    /* ── Atualizar posições da esteira (com ou sem gap de inserção) ── */
    function updateBeltPositions(gapIdx) {
      const others = batch.filter((b) => !b.placed && b !== dragging);

      // Slot de inserção visual
      const insertSlot = document.getElementById("belt-insert-slot");
      if (insertSlot) {
        if (gapIdx >= 0) {
          insertSlot.style.right = slotRight(gapIdx) + "px";
          insertSlot.style.display = "flex";
        } else {
          insertSlot.style.display = "none";
        }
      }

      batch.forEach((box) => {
        const el = box.el;
        if (!el) return;

        if (box.placed) {
          el.style.right = "-150px";
          el.style.opacity = "0";
          el.style.pointerEvents = "none";
          return;
        }

        if (box === dragging) return;

        const baseSlot = others.indexOf(box);
        if (baseSlot < 0) return;

        // Se há um gap antes ou neste slot, empurra a caixa um slot para a esquerda
        const visualSlot = gapIdx >= 0 && baseSlot >= gapIdx ? baseSlot + 1 : baseSlot;

        if (visualSlot < 3) {
          el.style.right = slotRight(visualSlot) + "px";
          el.style.opacity = "1";
          el.style.pointerEvents = "auto";
        } else {
          el.style.right = slotRight(3) + "px"; // fora da tela à esquerda
          el.style.opacity = "0";
          el.style.pointerEvents = "none";
        }
      });
    }

    /* ── Caixas que já pontuaram (evita pontuação dupla ao recolocar) ── */
    const scoredBoxIds = new Set();

    /* ── Ghost de arrasto ── */
    function showGhostEl(box) {
      ghost.style.background = box.type.color;
      ghost.style.borderColor = box.type.border;
      document.getElementById("gi").textContent = box.type.icon;
      document.getElementById("gc").textContent = getCoordLabel(box);
      ghost.style.display = "flex";
    }

    /* ── Soltar caixa na célula ── */
    function drop(cell, box, cursorX, cursorY) {
      if (box.placed) return;
      clearHintGlows();

      if (
        cell.dataset.row === box.row &&
        parseInt(cell.dataset.col) === box.col
      ) {
        // ACERTO
        box.placed = true;
        cell.innerHTML = "";
        const p = document.createElement("div");
        p.className = "placed";
        p.style.background = box.type.color;
        p.style.borderColor = box.type.border;
        p.style.cursor = "grab";
        p.innerHTML = `<div class="picon">${box.type.icon}</div><div class="pcoord" style="color:rgba(255,255,255,.9)">${box.row},${box.col}</div>`;
        cell.appendChild(p);
        cell.classList.add("cflash");
        setTimeout(() => cell.classList.remove("cflash"), 500);

        // Pontuação só na primeira vez que a caixa é colocada corretamente
        if (!scoredBoxIds.has(box.id)) {
          scoredBoxIds.add(box.id);
          score += pointsCorrect;
          updateScoreDisplay(score);
          bumpHud("score", "positive");
          showFloatPoints(cursorX, cursorY, `+${pointsCorrect}`, "#69f0ae");
          setFeedback("✅", `Certo! ${box.type.icon} em (${box.row},${box.col}) — +${pointsCorrect} pts`, "#4caf50");
        } else {
          setFeedback("✅", `Certo! ${box.type.icon} reposicionado em (${box.row},${box.col})`, "#4caf50");
        }
        hits++;
        document.getElementById("hits").textContent = hits + "/" + total;
        bumpHud("hits", "positive");

        // Permite arrastar a caixa de volta da prateleira
        p.addEventListener("pointerdown", (e) => {
          e.preventDefault();

          // Desfaz o placement
          box.placed = false;
          hits = Math.max(0, hits - 1);
          document.getElementById("hits").textContent = hits + "/" + total;
          bumpHud("hits", "negative");
          cell.innerHTML = "";

          // Reanexa o elemento da caixa na esteira
          const q = document.getElementById("belt-q");
          if (q && box.el) {
            box.el.style.transition = "";
            box.el.style.opacity = "0";
            box.el.style.pointerEvents = "none";
            box.el.style.right = slotRight(3) + "px";
            q.appendChild(box.el);
          }

          // Inicia o drag
          dragging = box;
          showGhostEl(box);
          ghost.style.left = e.clientX + "px";
          ghost.style.top = e.clientY + "px";
          ghost.style.display = "flex";
        });

        const el = document.getElementById(box.id);
        if (el) el.remove();
        if (batch.filter((b) => !b.placed).length === 0) win();
      } else {
        // ERRO

        // 1. Célula errada: 2 flashes vermelhos via keyframe
        cell.classList.remove("wflash");
        void cell.offsetWidth; // força reflow para reiniciar animação
        cell.classList.add("wflash");
        setTimeout(() => cell.classList.remove("wflash"), 650);

        // 2. Célula correta brilha em verde para guiar o aluno
        const correctCell = document.querySelector(`.scell[data-coord="${box.coord}"]`);
        if (correctCell) {
          correctCell.classList.add("hint-correct");
          setTimeout(() => correctCell.classList.remove("hint-correct"), 2000);
        }

        // 3. Penalidade de pontos + erro
        errors++;
        score = Math.max(0, score - pointsWrong);
        updateScoreDisplay(score);
        bumpHud("score", "negative");
        showFloatPoints(cursorX, cursorY, `-${pointsWrong}`, "#ff5252");

        // 4. Toast "Tente Novamente!"
        const toast = document.getElementById("wrong-toast");
        const toastPenalty = document.getElementById("wrong-toast-penalty");
        if (toast) {
          if (toastPenalty) toastPenalty.textContent = `-${pointsWrong} Pontos`;
          toast.style.display = "block";
          toast.style.animation = "none";
          void toast.offsetWidth; // reflow para reiniciar animação
          toast.style.animation = "";
          setTimeout(() => { toast.style.display = "none"; }, 2950);
        }

        setFeedback("❌", `Errado! A célula certa é (${box.row},${box.col}) — ela está brilhando! 🟢`, "#f44336");
      }
    }

    /* ── Bump animado no HUD (score ou hits) ── */
    function bumpHud(id, type) {
      const el = document.getElementById(id);
      if (!el) return;
      el.classList.remove("hud-bump-positive", "hud-bump-negative");
      void el.offsetWidth;
      el.classList.add(type === "negative" ? "hud-bump-negative" : "hud-bump-positive");
      setTimeout(() => el.classList.remove("hud-bump-positive", "hud-bump-negative"), 480);
    }

    /* ── Pontuação flutuante ao lado do cursor ── */
    function showFloatPoints(x, y, text, color) {
      // Som: "+" = acerto, "-" = erro (cobre todos os modos de round)
      if (typeof text === "string" && text[0] === "+") playRightAnswer();
      else if (typeof text === "string" && text[0] === "-") playWrongAnswer();
      const el = document.getElementById("float-points");
      if (!el) return;
      el.textContent = text;
      el.style.color = color;
      el.style.left = (x + 16) + "px";
      el.style.top  = (y - 20) + "px";
      el.style.display = "block";
      el.style.animation = "none";
      void el.offsetWidth;
      el.style.animation = "";
      setTimeout(() => { el.style.display = "none"; }, 1150);
    }

    /* ── Feedback textual (safe — elementos podem não existir) ── */
    function setFeedback(icon, text, color) {
      const fi = document.getElementById("fi");
      const ft = document.getElementById("ft");
      if (fi) fi.textContent = icon;
      if (ft) {
        ft.textContent = text;
        ft.style.color = color || "var(--text)";
      }
    }

    /* ── Limpar glows de dicas ── */
    function clearHintGlows() {
      document
        .querySelectorAll(".scell")
        .forEach((c) => c.classList.remove("hint-glow", "hint-glow-box"));
    }

    /* ── Usar carta de dica ── */
    function useCard(idx) {
      if (HINT_CARDS[idx].used) return;
      const unplaced = batch.filter((b) => !b.placed);
      if (unplaced.length === 0) return;

      HINT_CARDS[idx].used = true;
      cardsLeft--;
      document.getElementById("card-" + idx).classList.add("used");
      document.getElementById("cards-left").textContent =
        cardsLeft +
        " carta" +
        (cardsLeft !== 1 ? "s" : "") +
        " restante" +
        (cardsLeft !== 1 ? "s" : "");

      if (HINT_CARDS[idx].cost > 0) {
        score = Math.max(0, score - HINT_CARDS[idx].cost);
        updateScoreDisplay(score);
      }

      clearHintGlows();
      const hint = document.getElementById("hint-result");
      if (!hint) return;
      hint.classList.add("active");

      if (idx === 0) {
        // ILUMINAR CÉLULA
        const box = unplaced[0];
        const target = document.querySelector(
          `.scell[data-coord="${box.coord}"]`
        );
        if (target) {
          target.classList.add("hint-glow");
          setTimeout(() => target.classList.remove("hint-glow"), 3000);
        }
        hint.innerHTML = `<div><span style="color:var(--card-gold)">ILUMINAR CÉLULA</span><br><br>A célula <span style="color:var(--yellow)">(${box.row},${box.col})</span> foi destacada por 3s!</div>`;
        setFeedback(
          "🔦",
          `Dica: célula (${box.row},${box.col}) iluminada!`,
          "#c2410c"
        );
      } else if (idx === 1) {
        // MARCAR CAIXA
        const box = unplaced[Math.floor(Math.random() * unplaced.length)];
        const el = document.getElementById(box.id);
        if (el) {
          el.style.outline = "3px solid #c2410c";
          el.style.outlineOffset = "3px";
          setTimeout(() => {
            el.style.outline = "";
            el.style.outlineOffset = "";
          }, 3000);
        }
        const target = document.querySelector(
          `.scell[data-coord="${box.coord}"]`
        );
        if (target) {
          target.classList.add("hint-glow-box");
          setTimeout(() => target.classList.remove("hint-glow-box"), 3000);
        }
        hint.innerHTML = `<div><span style="color:var(--card-gold)">MARCAR CAIXA</span><br><br>A caixa <span style="color:var(--yellow)">${box.type.icon}</span> e seu destino estão marcados por 3s!</div>`;
        setFeedback(
          "📍",
          `Dica: caixa ${box.type.icon} e destino marcados!`,
          "#c2410c"
        );
      } else {
        // MAPA COMPLETO
        unplaced.forEach((box) => {
          const target = document.querySelector(
            `.scell[data-coord="${box.coord}"]`
          );
          if (target) {
            target.classList.add("hint-glow");
            setTimeout(() => target.classList.remove("hint-glow"), 4000);
          }
        });
        const lines = unplaced
          .map((b) => `${b.type.icon} → (${b.row},${b.col})`)
          .join("&nbsp;&nbsp;&nbsp;");
        hint.innerHTML = `<div><span style="color:var(--card-gold)">MAPA COMPLETO</span><br><br>${lines}<br><br><span style="color:#f44336">-${HINT_CARDS[idx].cost} pts usados</span></div>`;
        setFeedback("🗺️", "Mapa completo revelado!", "#c2410c");
      }
    }

    /* ── Vitória do round ── */
    function win() {
      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
      }
      const timeBonus =
        config.timer && timeRemaining > 0 ? timeRemaining * 2 : 0;
      const finalScore = score + timeBonus;
      const maxScore = total * pointsCorrect;
      const pct = finalScore / maxScore;
      const stars = pct >= 0.9 ? 3 : pct >= 0.7 ? 2 : pct >= 0.5 ? 1 : 0;
      handleRoundEndRef.current?.({
        score: finalScore,
        stars,
        completed: true,
        timeBonus,
        errors,
        hints: 3 - cardsLeft,
        timeMs: Date.now() - roundStartTime,
      });
    }

    /* ── Tempo esgotado — auto-colocar caixas restantes com animação ── */
    function timeUp() {
      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
      }

      const unplaced = batch.filter((b) => !b.placed);
      if (unplaced.length === 0) {
        // Todas já foram colocadas, tratar como vitória
        win();
        return;
      }

      // Auto-colocar cada caixa restante sequencialmente (300ms entre cada)
      setFeedback(
        "⏰",
        "Tempo esgotado! Olhe onde cada caixa deveria ir...",
        "#c2410c"
      );

      unplaced.forEach((box, i) => {
        setTimeout(() => {
          const cell = document.querySelector(
            `.scell[data-coord="${box.coord}"]`
          );
          if (cell) {
            box.placed = true;
            cell.innerHTML = "";
            const p = document.createElement("div");
            p.className = "placed";
            p.style.background = box.type.color;
            p.style.borderColor = box.type.border;
            p.style.opacity = "0.6"; // Semi-transparente para indicar que foi automático
            p.innerHTML = `<div class="picon">${box.type.icon}</div><div class="pcoord" style="color:rgba(255,255,255,.9)">${box.row},${box.col}</div>`;
            cell.appendChild(p);
            cell.classList.add("hint-correct");
            setTimeout(() => cell.classList.remove("hint-correct"), 1500);

            // Remover da esteira
            const el = document.getElementById(box.id);
            if (el) el.remove();
          }

          // Após a última caixa, mostrar resultado
          if (i === unplaced.length - 1) {
            setTimeout(() => {
              const maxScore = total * pointsCorrect;
              const pct = score / maxScore;
              const stars =
                pct >= 0.9 ? 3 : pct >= 0.7 ? 2 : pct >= 0.5 ? 1 : 0;
              handleRoundEndRef.current?.({
                score,
                stars,
                completed: false,
                timeBonus: 0,
                errors,
                hints: 3 - cardsLeft,
                timeMs: Date.now() - roundStartTime,
              });
            }, 800);
          }
        }, i * 400); // 400ms de intervalo entre cada auto-colocação
      });
    }

    /* ══════════════════════════════════════════════════════════════════
       MODO "NOMEAR" (Round 5) — o jogo coloca a caixa, o aluno diz o endereço
       ══════════════════════════════════════════════════════════════════ */
    function setupNameRound() {
      const allCoords = [];
      ROWS.forEach((r) => COLS.forEach((c) => allCoords.push({ row: r, col: c, coord: r + "" + c })));
      shuffle(allCoords);
      const questions = allCoords.slice(0, total);
      let qIndex = 0, nameScore = 0, nameHits = 0;
      const timeouts = [];

      const qEl = document.getElementById("quiz-question");
      const optsEl = document.getElementById("quiz-options");
      const progEl = document.getElementById("quiz-progress");

      const fmt = (coord) => coord[0] + "," + coord.slice(1);

      function buildOptions(correct) {
        const opts = new Set([correct.coord]);
        const otherCols = COLS.filter((c) => c !== correct.col);
        const otherRows = ROWS.filter((r) => r !== correct.row);
        // Distrator 1: mesma linha, coluna trocada (erra a coluna)
        if (otherCols.length) opts.add(correct.row + "" + otherCols[Math.floor(Math.random() * otherCols.length)]);
        // Distrator 2: mesma coluna, linha trocada (erra a linha)
        if (otherRows.length) opts.add(otherRows[Math.floor(Math.random() * otherRows.length)] + "" + correct.col);
        // Completa até 4 opções
        while (opts.size < 4) {
          const r = ROWS[Math.floor(Math.random() * ROWS.length)];
          const c = COLS[Math.floor(Math.random() * COLS.length)];
          opts.add(r + "" + c);
        }
        return shuffle([...opts]);
      }

      function onAnswer(opt, q, btn, e) {
        if (opt === q.coord) {
          nameScore += pointsCorrect;
          nameHits++;
          updateScoreDisplay(nameScore);
          document.getElementById("hits").textContent = nameHits + "/" + total;
          bumpHud("score", "positive");
          bumpHud("hits", "positive");
          showFloatPoints(e.clientX, e.clientY, `+${pointsCorrect}`, "#69f0ae");
          btn.classList.add("correct");
          const cell = document.querySelector(`.scell[data-coord="${q.coord}"]`);
          if (cell) {
            cell.classList.remove("cflash"); void cell.offsetWidth; cell.classList.add("cflash");
          }
          setFeedback("✅", `Isso! A caixa está em (${q.row},${q.col}). 🌟`, "#4caf50");
          document.querySelectorAll(".quiz-opt").forEach((b) => (b.disabled = true));
          timeouts.push(setTimeout(() => { qIndex++; showQuestion(); }, 1050));
        } else {
          errors++;
          nameScore = Math.max(0, nameScore - pointsWrong);
          updateScoreDisplay(nameScore);
          bumpHud("score", "negative");
          showFloatPoints(e.clientX, e.clientY, `-${pointsWrong}`, "#ff5252");
          btn.classList.add("wrong");
          btn.disabled = true;
          const cell = document.querySelector(`.scell[data-coord="${q.coord}"]`);
          if (cell) {
            cell.classList.remove("wflash"); void cell.offsetWidth; cell.classList.add("wflash");
            timeouts.push(setTimeout(() => cell.classList.remove("wflash"), 650));
          }
          const toast = document.getElementById("wrong-toast");
          const toastPenalty = document.getElementById("wrong-toast-penalty");
          if (toast) {
            if (toastPenalty) toastPenalty.textContent = `-${pointsWrong} Pontos`;
            toast.style.display = "block"; toast.style.animation = "none";
            void toast.offsetWidth; toast.style.animation = "";
            timeouts.push(setTimeout(() => { toast.style.display = "none"; }, 2950));
          }
          setFeedback("❌", "Quase! Olhe de novo: a LINHA é a letra, a COLUNA é o número.", "#f44336");
        }
      }

      function showQuestion() {
        if (qIndex >= questions.length) {
          const maxScore = total * pointsCorrect;
          const pct = nameScore / maxScore;
          const stars = pct >= 0.9 ? 3 : pct >= 0.7 ? 2 : pct >= 0.5 ? 1 : 0;
          handleRoundEndRef.current?.({ score: nameScore, stars, completed: true, timeBonus: 0, errors, hints: 0, timeMs: Date.now() - roundStartTime });
          return;
        }
        const q = questions[qIndex];
        if (progEl) progEl.textContent = `Pergunta ${qIndex + 1} de ${questions.length}`;

        // Limpa a prateleira e coloca a caixa-mistério na célula da pergunta
        document.querySelectorAll(".scell").forEach((c) => {
          c.innerHTML = "";
          c.classList.remove("name-target");
        });
        const boxType = BOX_TYPES[Math.floor(Math.random() * BOX_TYPES.length)];
        const cell = document.querySelector(`.scell[data-coord="${q.coord}"]`);
        if (cell) {
          const p = document.createElement("div");
          p.className = "placed name-box";
          p.style.background = boxType.color;
          p.style.borderColor = boxType.border;
          p.innerHTML = `<div class="picon">${boxType.icon}</div>`;
          cell.appendChild(p);
          cell.classList.add("name-target");
        }
        if (qEl) qEl.innerHTML = `Qual é o endereço da caixa <span style="font-size:1.4em">${boxType.icon}</span>?`;

        if (optsEl) {
          optsEl.innerHTML = "";
          buildOptions(q).forEach((opt) => {
            const btn = document.createElement("button");
            btn.className = "quiz-opt";
            btn.textContent = fmt(opt);
            btn.addEventListener("click", (e) => onAnswer(opt, q, btn, e));
            optsEl.appendChild(btn);
          });
        }
      }

      showQuestion();
      return () => timeouts.forEach((t) => clearTimeout(t));
    }

    /* ── Round de PRODUÇÃO: spinners (▲▼) de linha + coluna ── */
    function setupProduceRound() {
      const allCoords = [];
      ROWS.forEach((r) => COLS.forEach((c) => allCoords.push({ row: r, col: c, coord: r + "" + c })));
      shuffle(allCoords);
      const questions = allCoords.slice(0, total);
      let qIndex = 0, prodScore = 0, prodHits = 0;
      let rowIdx = 0, colIdx = 0;
      const timeouts = [];
      const listeners = [];

      const qEl = document.getElementById("produce-question");
      const progEl = document.getElementById("produce-progress");
      const rowValEl = document.getElementById("produce-row-val");
      const colValEl = document.getElementById("produce-col-val");
      const confirmBtn = document.getElementById("produce-confirm");

      const els = {
        row: {
          prev: document.getElementById("row-prev"), cur: document.getElementById("row-cur"),
          next: document.getElementById("row-next"), up: document.getElementById("row-up"),
          down: document.getElementById("row-down"),
        },
        col: {
          prev: document.getElementById("col-prev"), cur: document.getElementById("col-cur"),
          next: document.getElementById("col-next"), up: document.getElementById("col-up"),
          down: document.getElementById("col-down"),
        },
      };

      function renderReel() {
        // Linha
        if (els.row.cur) els.row.cur.textContent = ROWS[rowIdx];
        if (els.row.prev) els.row.prev.textContent = rowIdx > 0 ? ROWS[rowIdx - 1] : "";
        if (els.row.next) els.row.next.textContent = rowIdx < ROWS.length - 1 ? ROWS[rowIdx + 1] : "";
        if (els.row.up) els.row.up.disabled = rowIdx === 0;
        if (els.row.down) els.row.down.disabled = rowIdx === ROWS.length - 1;
        // Coluna
        if (els.col.cur) els.col.cur.textContent = COLS[colIdx];
        if (els.col.prev) els.col.prev.textContent = colIdx > 0 ? COLS[colIdx - 1] : "";
        if (els.col.next) els.col.next.textContent = colIdx < COLS.length - 1 ? COLS[colIdx + 1] : "";
        if (els.col.up) els.col.up.disabled = colIdx === 0;
        if (els.col.down) els.col.down.disabled = colIdx === COLS.length - 1;
        // Leitura do par (linha, coluna)
        if (rowValEl) rowValEl.textContent = ROWS[rowIdx];
        if (colValEl) colValEl.textContent = COLS[colIdx];
      }

      function bump(el) {
        if (!el) return;
        el.classList.remove("spin-bump"); void el.offsetWidth; el.classList.add("spin-bump");
      }

      function step(axis, dir) {
        if (axis === "row") {
          const n = Math.min(ROWS.length - 1, Math.max(0, rowIdx + dir));
          if (n === rowIdx) return;
          rowIdx = n; renderReel(); bump(els.row.cur);
        } else {
          const n = Math.min(COLS.length - 1, Math.max(0, colIdx + dir));
          if (n === colIdx) return;
          colIdx = n; renderReel(); bump(els.col.cur);
        }
      }

      function bind(el, ev, fn) {
        if (!el) return;
        el.addEventListener(ev, fn);
        listeners.push([el, ev, fn]);
      }
      // ▲ = valor anterior (sobe pra A/1) · ▼ = próximo
      bind(els.row.up, "click", () => step("row", -1));
      bind(els.row.down, "click", () => step("row", +1));
      bind(els.col.up, "click", () => step("col", -1));
      bind(els.col.down, "click", () => step("col", +1));
      // Clicar no valor esmaecido (vizinho) também rola até ele
      bind(els.row.prev, "click", () => step("row", -1));
      bind(els.row.next, "click", () => step("row", +1));
      bind(els.col.prev, "click", () => step("col", -1));
      bind(els.col.next, "click", () => step("col", +1));

      function onConfirm(e) {
        if (qIndex >= questions.length) return;
        const q = questions[qIndex];
        const chosenRow = ROWS[rowIdx];
        const chosenCol = COLS[colIdx];
        const x = e.clientX || window.innerWidth / 2;
        const y = e.clientY || window.innerHeight / 2;
        if (chosenRow === q.row && chosenCol === q.col) {
          prodScore += pointsCorrect; prodHits++;
          updateScoreDisplay(prodScore);
          document.getElementById("hits").textContent = prodHits + "/" + total;
          bumpHud("score", "positive"); bumpHud("hits", "positive");
          showFloatPoints(x, y, `+${pointsCorrect}`, "#69f0ae");
          const cell = document.querySelector(`.scell[data-coord="${q.coord}"]`);
          if (cell) { cell.classList.remove("cflash"); void cell.offsetWidth; cell.classList.add("cflash"); }
          setFeedback("✅", `Isso! O endereço é (${q.row},${q.col}). 🌟`, "#4caf50");
          if (confirmBtn) confirmBtn.disabled = true;
          timeouts.push(setTimeout(() => { qIndex++; showQuestion(); }, 1050));
        } else {
          errors++;
          prodScore = Math.max(0, prodScore - pointsWrong);
          updateScoreDisplay(prodScore);
          bumpHud("score", "negative");
          showFloatPoints(x, y, `-${pointsWrong}`, "#ff5252");
          const cell = document.querySelector(`.scell[data-coord="${q.coord}"]`);
          if (cell) {
            cell.classList.remove("wflash"); void cell.offsetWidth; cell.classList.add("wflash");
            timeouts.push(setTimeout(() => cell.classList.remove("wflash"), 650));
          }
          const toast = document.getElementById("wrong-toast");
          const toastPenalty = document.getElementById("wrong-toast-penalty");
          if (toast) {
            if (toastPenalty) toastPenalty.textContent = `-${pointsWrong} Pontos`;
            toast.style.display = "block"; toast.style.animation = "none";
            void toast.offsetWidth; toast.style.animation = "";
            timeouts.push(setTimeout(() => { toast.style.display = "none"; }, 2950));
          }
          setFeedback("❌", "Ainda não! Confira: a LINHA é a letra, a COLUNA é o número.", "#f44336");
        }
      }
      bind(confirmBtn, "click", onConfirm);

      function showQuestion() {
        if (qIndex >= questions.length) {
          const maxScore = total * pointsCorrect;
          const pct = prodScore / maxScore;
          const stars = pct >= 0.9 ? 3 : pct >= 0.7 ? 2 : pct >= 0.5 ? 1 : 0;
          handleRoundEndRef.current?.({ score: prodScore, stars, completed: true, timeBonus: 0, errors, hints: 0, timeMs: Date.now() - roundStartTime });
          return;
        }
        const q = questions[qIndex];
        if (progEl) progEl.textContent = `Pergunta ${qIndex + 1} de ${questions.length}`;
        if (confirmBtn) confirmBtn.disabled = false;

        // Reseta os spinners para o começo (A, 1)
        rowIdx = 0; colIdx = 0;
        renderReel();

        // Coloca a caixa-mistério na célula
        document.querySelectorAll(".scell").forEach((c) => { c.innerHTML = ""; c.classList.remove("name-target"); });
        const boxType = BOX_TYPES[Math.floor(Math.random() * BOX_TYPES.length)];
        const cell = document.querySelector(`.scell[data-coord="${q.coord}"]`);
        if (cell) {
          const p = document.createElement("div");
          p.className = "placed name-box";
          p.style.background = boxType.color;
          p.style.borderColor = boxType.border;
          p.innerHTML = `<div class="picon">${boxType.icon}</div>`;
          cell.appendChild(p);
          cell.classList.add("name-target");
        }
        if (qEl) qEl.innerHTML = `Monte o endereço da caixa <span style="font-size:1.4em">${boxType.icon}</span> com os controles!`;
      }

      showQuestion();
      return () => {
        timeouts.forEach((t) => clearTimeout(t));
        listeners.forEach(([el, ev, fn]) => el.removeEventListener(ev, fn));
      };
    }

    if (config.mode === "name") {
      buildShelf();
      document.getElementById("hits").textContent = "0/" + total;
      updateScoreDisplay(0);
      const timerEl = document.getElementById("timer-display");
      if (timerEl) timerEl.style.display = "none";
      const cleanupName = setupNameRound();
      return () => {
        document.body.classList.remove("game-mode");
        cleanupName && cleanupName();
      };
    }

    if (config.mode === "produce") {
      buildShelf();
      document.getElementById("hits").textContent = "0/" + total;
      updateScoreDisplay(0);
      const timerEl = document.getElementById("timer-display");
      if (timerEl) timerEl.style.display = "none";
      const cleanupProduce = setupProduceRound();
      return () => {
        document.body.classList.remove("game-mode");
        cleanupProduce && cleanupProduce();
      };
    }

    /* ── Inicializar o round ── */
    buildShelf();
    batch = genBatch();
    renderBelt();

    // HUD
    document.getElementById("hits").textContent = "0/" + total;
    updateScoreDisplay(0); // começa do acumulado (baseScore + 0)
    document.getElementById("cards-left").textContent = "3 cartas restantes";

    // Reset hint cards
    HINT_CARDS.forEach((c, i) => {
      c.used = false;
      const cardEl = document.getElementById("card-" + i);
      if (cardEl) cardEl.classList.remove("used");
    });
    const hintResult = document.getElementById("hint-result");
    if (hintResult) {
      hintResult.classList.remove("active");
      hintResult.innerHTML = "Clique em uma carta para receber uma dica!";
    }

    // Timer (se o round tiver)
    const timerEl = document.getElementById("timer-display");
    if (config.timer) {
      if (timerEl) {
        timerEl.textContent = `⏱️ ${timeRemaining}s`;
        timerEl.style.display = "block";
        timerEl.classList.remove("urgent");
      }
      timerInterval = setInterval(() => {
        timeRemaining--;
        if (timerEl) timerEl.textContent = `⏱️ ${timeRemaining}s`;
        if (timeRemaining <= 10 && timerEl) timerEl.classList.add("urgent");
        if (timeRemaining <= 0) timeUp();
      }, 1000);
    } else {
      if (timerEl) timerEl.style.display = "none";
    }

    /* ── Posiciona uma caixa no slot correto sem animar o right (evita slide vindo de fora) ── */
    function snapBoxToBelt(box) {
      const el = box.el;
      if (!el) return;
      // Suspende a transição de right para que o box apareça direto no slot
      el.style.transition = "opacity 0.3s ease";
      beltInsertIdx = -1;
      updateBeltPositions(-1);
      // Restaura as transições completas no próximo frame
      requestAnimationFrame(() => {
        if (el) el.style.transition = "";
      });
    }

    /* ── Event listeners globais de Pointer Drag-and-Drop ── */
    const onPointerMove = (e) => {
      if (!dragging) return;
      ghost.style.left = e.clientX + "px";
      ghost.style.top = e.clientY + "px";

      // Detecta se está sobre a área da esteira
      const beltBoxEl = document.getElementById("belt-box");
      const beltRect = beltBoxEl?.getBoundingClientRect();
      const overBelt = beltRect &&
        e.clientX >= beltRect.left && e.clientX <= beltRect.right &&
        e.clientY >= beltRect.top  && e.clientY <= beltRect.bottom;

      if (overBelt) {
        // Limpa highlights da prateleira
        document.querySelectorAll(".scell").forEach((c) => c.classList.remove("over"));

        // Calcula o índice de inserção pelo offset X dentro da esteira
        const others = batch.filter((b) => !b.placed && b !== dragging);
        const rightOffset = beltRect.right - e.clientX;
        const rawIdx = Math.round((rightOffset - SLOT_BASE) / SLOT_STEP);
        const newInsertIdx = Math.max(0, Math.min(rawIdx, others.length));

        if (newInsertIdx !== beltInsertIdx) {
          beltInsertIdx = newInsertIdx;
          updateBeltPositions(beltInsertIdx);
        }
      } else {
        // Fora da esteira — limpa o gap se havia um
        if (beltInsertIdx >= 0) {
          beltInsertIdx = -1;
          updateBeltPositions(-1);
        }

        // Highlight da célula da prateleira
        document.querySelectorAll(".scell").forEach((c) => c.classList.remove("over"));
        const hoverTarget = document.elementFromPoint(e.clientX, e.clientY)?.closest(".scell");
        if (hoverTarget) hoverTarget.classList.add("over");
      }
    };

    const onPointerUp = (e) => {
      if (!dragging) return;
      const draggedBox = dragging;
      dragging = null;
      ghost.style.display = "none";

      document.querySelectorAll(".scell").forEach((c) => c.classList.remove("over"));

      const dropTarget = document.elementFromPoint(e.clientX, e.clientY)?.closest(".scell");

      if (dropTarget) {
        // Drop na prateleira — tenta colocar a caixa
        const el = document.getElementById(draggedBox.id);
        if (el) el.style.opacity = "1"; // restaura antes (drop falho mantém na esteira)
        drop(dropTarget, draggedBox, e.clientX, e.clientY);
        beltInsertIdx = -1;
        updateBeltPositions(-1);
      } else if (beltInsertIdx >= 0) {
        // Drop na esteira — reordena
        const fromIdx = batch.indexOf(draggedBox);
        batch.splice(fromIdx, 1);

        const notDragging = batch.filter((b) => !b.placed);
        if (beltInsertIdx < notDragging.length) {
          const targetBatchIdx = batch.indexOf(notDragging[beltInsertIdx]);
          batch.splice(targetBatchIdx, 0, draggedBox);
        } else {
          const last = notDragging[notDragging.length - 1];
          const afterIdx = last ? batch.indexOf(last) + 1 : batch.length;
          batch.splice(afterIdx, 0, draggedBox);
        }

        snapBoxToBelt(draggedBox);
      } else {
        // Drop em área neutra — devolve caixa à esteira sem animação de slide
        snapBoxToBelt(draggedBox);
      }
    };

    document.addEventListener("pointermove", onPointerMove);
    document.addEventListener("pointerup", onPointerUp);

    const cardHandlers = [0, 1, 2].map((i) => {
      const el = document.getElementById("card-" + i);
      if (!el) return null;
      const handler = () => useCard(i);
      el.addEventListener("click", handler);
      return { el, handler };
    });

    /* ── Cleanup ── */
    return () => {
      if (timerInterval) clearInterval(timerInterval);
      document.body.classList.remove("game-mode");
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerup", onPointerUp);
      cardHandlers.forEach((entry) => {
        if (!entry) return;
        entry.el.removeEventListener("click", entry.handler);
      });
    };
  }, [currentRound, showIntro, showResult]);

  /* ══════════════════════════════════════════════════════════════════
     JSX
     ══════════════════════════════════════════════════════════════════ */
  return (
    <div id="fases-root" className={styles.root}>
      {/* ── Overlay: Tutorial Interativo da Prateleira ── */}
      {showTutorial && tutorialStep < TUTORIAL_STEPS.length && (
        <div className={styles.tutorialOverlay}>
          <div className={styles.tutorialBox}>
            <div className={styles.tutorialTitle}>Como usar a Prateleira 🏢</div>
            
            {/* Elementos visuais do tutorial agrupados */}
            <div className={styles.tutorialVisuals}>
              {/* Prateleira de exemplo 3x3 */}
              <div className={styles.exampleShelfWrap}>
                {/* Rótulos das linhas (A, B, C) */}
                <div className={styles.exampleRowLabels}>
                  {["A", "B", "C"].map((r) => (
                    <div
                      key={r}
                      className={`${styles.exampleRowLabel} ${
                        r === "A" && TUTORIAL_STEPS[tutorialStep].highlight === "rowLabel"
                          ? styles.glowLabel
                          : ""
                      }`}
                    >
                      {r}
                    </div>
                  ))}
                </div>

                <div className={styles.exampleGridWrap}>
                  {/* Rótulos das colunas (1, 2, 3) */}
                  <div className={styles.exampleColLabels}>
                    {[1, 2, 3].map((c) => (
                      <div
                        key={c}
                        className={`${styles.exampleColLabel} ${
                          c === 2 && TUTORIAL_STEPS[tutorialStep].highlight === "colLabel"
                            ? styles.glowLabel
                            : ""
                        }`}
                      >
                        {c}
                      </div>
                    ))}
                  </div>

                  {/* Grade 3x3 */}
                  <div className={styles.exampleGrid}>
                    {["A", "B", "C"].map((r) =>
                      [1, 2, 3].map((c) => {
                        const coord = r + c;
                        let highlightClass = "";
                        const hl = TUTORIAL_STEPS[tutorialStep].highlight;
                        if (c === 2 && (hl === "col" || hl === "colLabel")) {
                          highlightClass = styles.highlightCol;
                        } else if (r === "A" && (hl === "row" || hl === "rowLabel")) {
                          highlightClass = styles.highlightRow;
                        } else if (coord === "A2" && (hl === "cell" || hl === "drag")) {
                          highlightClass = styles.highlightCell;
                        }

                        return (
                          <div
                            key={coord}
                            data-coord={coord}
                            className={`${styles.exampleCell} ${highlightClass}`}
                            onDragOver={(e) => {
                              if (hl === "drag" && coord === "A2" && !tutorialBoxPlaced) {
                                e.preventDefault();
                              }
                            }}
                            onDrop={(e) => {
                              if (hl === "drag" && coord === "A2") {
                                setTutorialBoxPlaced(true);
                                setTutorialSelected(false);
                                setTimeout(() => {
                                  setTutorialStep((prev) => prev + 1);
                                }, 1200);
                              }
                            }}
                            onClick={() => {
                              if (hl === "drag" && coord === "A2" && tutorialSelected) {
                                setTutorialBoxPlaced(true);
                                setTutorialSelected(false);
                                setTimeout(() => {
                                  setTutorialStep((prev) => prev + 1);
                                }, 1200);
                              }
                            }}
                            style={{
                              cursor: hl === "drag" && coord === "A2" && !tutorialBoxPlaced ? "pointer" : "default"
                            }}
                          >
                            {((coord === "A2" && hl === "cell") || (coord === "A2" && hl === "drag" && tutorialBoxPlaced)) ? "📦" : ""}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>

              {/* Se for o passo de arrastar, mostra a esteira e a animação de arrasto */}
              {TUTORIAL_STEPS[tutorialStep].highlight === "drag" && (
                <>
                  {/* Mini esteira */}
                  <div className={styles.exampleBelt}>
                    {!tutorialBoxPlaced && (
                      <div
                        className={`${styles.exampleBox} bbox`}
                        style={{
                          background: "#a0522d",
                          borderColor: "#8b4513",
                          cursor: "grab",
                          outline: tutorialSelected ? "3px solid var(--yellow)" : "none",
                          outlineOffset: "2px",
                          touchAction: "none"
                        }}
                        onPointerDown={(e) => {
                          e.preventDefault();
                          e.currentTarget.setPointerCapture(e.pointerId);
                          setTutorialDragging(true);
                          setTutorialSelected(true);
                          e.currentTarget.style.opacity = "0"; // Slot fica vazio

                          const ghostEl = document.getElementById("ghost");
                          if (ghostEl) {
                            ghostEl.style.background = "#a0522d";
                            ghostEl.style.borderColor = "#8b4513";
                            const gi = document.getElementById("gi");
                            const gc = document.getElementById("gc");
                            if (gi) gi.textContent = "📦";
                            if (gc) gc.textContent = "A,2";
                            ghostEl.style.left = e.clientX + "px";
                            ghostEl.style.top = e.clientY + "px";
                            ghostEl.style.display = "flex";
                          }
                        }}
                        onPointerMove={(e) => {
                          if (!tutorialDragging) return;
                          const ghostEl = document.getElementById("ghost");
                          if (ghostEl) {
                            ghostEl.style.left = e.clientX + "px";
                            ghostEl.style.top = e.clientY + "px";
                          }

                          // Highlight cell A2 if hovered
                          document.querySelectorAll(`.${styles.exampleCell}`).forEach(c => c.classList.remove(styles.highlightCell));
                          const hoverTarget = document.elementFromPoint(e.clientX, e.clientY)?.closest(`.${styles.exampleCell}`);
                          if (hoverTarget && hoverTarget.dataset.coord === "A2") {
                            hoverTarget.classList.add(styles.highlightCell);
                          }
                        }}
                        onPointerUp={(e) => {
                          if (!tutorialDragging) return;
                          setTutorialDragging(false);
                          const ghostEl = document.getElementById("ghost");
                          if (ghostEl) {
                            ghostEl.style.display = "none";
                          }

                          // Clean highlights
                          document.querySelectorAll(`.${styles.exampleCell}`).forEach(c => c.classList.remove(styles.highlightCell));

                          const dropTarget = document.elementFromPoint(e.clientX, e.clientY)?.closest(`.${styles.exampleCell}`);
                          if (dropTarget && dropTarget.dataset.coord === "A2") {
                            setTutorialBoxPlaced(true);
                            setTutorialSelected(false);
                            setTimeout(() => {
                              setTutorialStep((prev) => Math.min(prev + 1, TUTORIAL_STEPS.length - 1));
                            }, 1200);
                          } else {
                            // Drop falhou — volta a caixa para o slot
                            e.currentTarget.style.opacity = "1";
                          }
                        }}
                        onClick={() => setTutorialSelected(true)}
                      >
                        <div className="bicon">📦</div>
                        <div className="bcoord">B,2</div>
                      </div>
                    )}
                  </div>
                  {/* Seta/Mãozinha de arrasto */}
                  {!tutorialBoxPlaced && (
                    <div className={styles.dragIndicator}>
                      <span className={styles.dragHand}>👆</span>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Balão do Brasilino */}
            <div className={styles.feedback} style={{ width: "100%", minHeight: "80px", margin: 0 }}>
              <div className={styles.brasilino} style={{ padding: "6px 10px" }}>
                <div className={styles.brasilino__avatar} style={{ fontSize: "28px" }}>🤖</div>
                <span className={styles.brasilino__name}>BRASILINO</span>
              </div>
              <div className={styles.brasilino__balloon} style={{ fontSize: "16px", padding: "10px 16px", color: "var(--text)" }}>
                <span>{TUTORIAL_STEPS[tutorialStep].text}</span>
              </div>
            </div>

            {/* Ações */}
            <div style={{ display: "flex", gap: "12px", marginTop: "4px" }}>
              {tutorialStep > 0 && (
                <button
                  className={styles.introBtn}
                  style={{ background: "#78909c", borderColor: "#546e7a", boxShadow: "0 4px 0 #546e7a" }}
                  onClick={() => {
                    if (tutorialStep === 6) {
                      setTutorialBoxPlaced(false);
                      setTutorialSelected(false);
                    }
                    setTutorialStep((prev) => prev - 1);
                  }}
                >
                  ◀ VOLTAR
                </button>
              )}
              <button
                className={styles.introBtn}
                disabled={TUTORIAL_STEPS[tutorialStep].highlight === "drag" && !tutorialBoxPlaced}
                style={{
                  opacity: (TUTORIAL_STEPS[tutorialStep].highlight === "drag" && !tutorialBoxPlaced) ? 0.5 : 1,
                  cursor: (TUTORIAL_STEPS[tutorialStep].highlight === "drag" && !tutorialBoxPlaced) ? "not-allowed" : "pointer"
                }}
                onClick={() => {
                  if (tutorialStep < TUTORIAL_STEPS.length - 1) {
                    setTutorialStep((prev) => prev + 1);
                  } else {
                    try {
                      localStorage.setItem("fase1_tutorial_seen", "true");
                    } catch (e) {}
                    setShowTutorial(false);
                  }
                }}
              >
                {tutorialStep < TUTORIAL_STEPS.length - 1 ? "AVANÇAR ▶" : "COMEÇAR ROUND 1! 🚀"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Overlay: Intro do Round ── */}
      {showIntro && (
        <div className={styles.overlay} onClick={handleIntroNext}>
          <div
            className={styles.introDialog}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.introAvatar}>
              <span className={styles.avatarEmoji}>🤖</span>
              <span className={styles.avatarName}>BRASILINO</span>
            </div>
            <div className={styles.introContent}>
              <p className={styles.introText}>
                {introText}
                {!introDone && <span className={styles.cursor}>▌</span>}
              </p>
              <div className={styles.introActions}>
                {introDone && (
                  <button className={styles.introBtn} onClick={handleIntroNext}>
                    COMEÇAR ROUND {currentRound + 1}! 🚀
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Overlay: Resultado do Round ── */}
      {showResult && resultData && (
        <div className={styles.overlay}>
          <div
            className={styles.introDialog}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.introAvatar}>
              <span className={styles.avatarEmoji}>
                {resultData.stars >= 3
                  ? "🏆"
                  : resultData.stars >= 2
                  ? "⭐"
                  : "🤖"}
              </span>
              <span className={styles.avatarName}>BRASILINO</span>
            </div>
            <div className={styles.introContent}>
              <div className={styles.introText}>
                <div>
                  <div className={styles.resultStars}>
                    {"★".repeat(resultData.stars)}
                    {"☆".repeat(3 - resultData.stars)}
                  </div>
                  <div style={{ marginTop: "8px" }}>
                    {resultData.stars === 0
                      ? "Vamos tentar de novo? Você está quase lá! 💪"
                      : resultData.completed
                      ? resultData.stars >= 3
                        ? `Perfeito! Round ${currentRound + 1} completo! 🌟`
                        : `Round ${currentRound + 1} completo!`
                      : "⏰ Tempo esgotado! Veja onde cada caixa deveria ir."}
                  </div>
                  <div style={{ marginTop: "4px", fontSize: "0.8em" }}>
                    {resultData.isFirst
                      ? `+${resultData.score} pts neste round`
                      : `${resultData.score} pts (round já concluído — pontos não adicionados)`}
                    {resultData.timeBonus > 0 &&
                      ` (inclui bônus de ${resultData.timeBonus} pts pelo tempo!)`}
                  </div>
                  <div style={{ marginTop: "4px", fontSize: "0.85em", color: "#ffd700", fontWeight: "bold" }}>
                    🏆 Total acumulado: {resultData.totalScore} pts
                  </div>
                </div>
              </div>
              <div className={styles.introActions}>
                {resultData.stars === 0 ? (
                  /* 0 estrelas = obrigatório repetir o round */
                  <button
                    className={styles.introBtn}
                    onClick={handleRetryRound}
                  >
                    TENTAR DE NOVO 🔄
                  </button>
                ) : currentRound < ROUNDS.length - 1 ? (
                  <button
                    className={styles.introBtn}
                    onClick={handleNextRound}
                  >
                    PRÓXIMO ROUND →
                  </button>
                ) : (
                  <button
                    className={styles.introBtn}
                    onClick={() => {
                      try {
                        localStorage.removeItem("current_phase");
                        localStorage.removeItem("current_round");
                      } catch (e) {}
                      window.location.href = "/fases";
                    }}
                  >
                    FASE COMPLETA! 🎉
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Pontuação flutuante ── */}
      <div id="float-points" className={styles.floatPoints}></div>

      {/* ── Toast de erro ── */}
      <div id="wrong-toast" className={styles.wrongToast} style={{ display: "none" }}>
        <span className={styles.toastTitle}>Tente Novamente!</span>
        <span className={styles.toastPenalty} id="wrong-toast-penalty">-10 Pontos</span>
      </div>

      {/* ── Conteúdo do jogo ── */}
      <div id="wrap" className={styles.wrap}>
        {/* ── [SOMENTE TESTES — REMOVER ANTES DO LANÇAMENTO] ── */}
        <div className={styles.devNav}>
          <span className={styles.devNavLabel}>🧪 DEV</span>
          {ROUNDS.map((r, i) => (
            <button
              key={i}
              className={`${styles.devNavBtn} ${currentRound === i ? styles.devNavBtnActive : ""}`}
              onClick={() => { setCurrentRound(i); setShowIntro(true); setIntroDone(false); }}
            >
              R{i + 1}
            </button>
          ))}
        </div>

        {/* HUD colado no topo */}
        <div id="hud" className={styles.hud}>
          <div>
            <div style={{ fontSize: "clamp(11px,0.75vw,13px)" }}>Pontos</div>
            <div className={styles.hv} id="score">
              000
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div className={styles.hudPhase}>
              Round {currentRound + 1}/{ROUNDS.length} — {roundConfig.title}
            </div>
          </div>
          <div
            id="timer-display"
            className={styles.timer}
            style={{ display: "none" }}
          ></div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "clamp(11px,0.75vw,13px)" }}>Acertos</div>
            <div className={styles.hv} id="hits">
              0/{roundConfig.boxCount}
            </div>
          </div>
        </div>

        {/* Área principal do jogo */}
        <div id="main" className={styles.main}>
          {/* Coluna esquerda: esteira + cartas OU painel de quiz (Round 5) */}
          <div className={styles.leftColumn}>
            {roundConfig.mode === "name" ? (
              <div id="quiz-panel" className={styles.quizPanel}>
                <div className={styles.quizHeader}>🎯 NOMEIE O ENDEREÇO</div>
                <div id="quiz-progress" className={styles.quizProgress}>
                  Pergunta 1 de {roundConfig.boxCount}
                </div>
                <div id="quiz-question" className={styles.quizQuestion}>
                  Olhe a prateleira →
                </div>
                <div id="quiz-options" className={styles.quizOptions}></div>
                <div className={styles.quizHelp}>
                  Dica: a <strong>linha</strong> é a letra e a <strong>coluna</strong> é o número.
                </div>
              </div>
            ) : roundConfig.mode === "produce" ? (
              <div id="produce-panel" className={styles.producePanel}>
                <div className={styles.quizHeader}>🛠️ CONSTRUA O ENDEREÇO</div>
                <div id="produce-progress" className={styles.quizProgress}>
                  Pergunta 1 de {roundConfig.boxCount}
                </div>
                <div id="produce-question" className={styles.quizQuestion}>
                  Olhe a prateleira →
                </div>

                <div className={styles.produceSpinners}>
                  <div className={styles.spinnerBox}>
                    <span className={styles.produceAxisLabel}>LINHA</span>
                    <button id="row-up" type="button" className={styles.spinBtn} aria-label="Linha acima">▲</button>
                    <div className={styles.spinReel}>
                      <span id="row-prev" className={styles.spinPrev}></span>
                      <span id="row-cur" className={styles.spinCur}>A</span>
                      <span id="row-next" className={styles.spinNext}></span>
                    </div>
                    <button id="row-down" type="button" className={styles.spinBtn} aria-label="Linha abaixo">▼</button>
                  </div>

                  <div className={styles.spinnerBox}>
                    <span className={styles.produceAxisLabel}>COLUNA</span>
                    <button id="col-up" type="button" className={styles.spinBtn} aria-label="Coluna acima">▲</button>
                    <div className={styles.spinReel}>
                      <span id="col-prev" className={styles.spinPrev}></span>
                      <span id="col-cur" className={styles.spinCur}>1</span>
                      <span id="col-next" className={styles.spinNext}></span>
                    </div>
                    <button id="col-down" type="button" className={styles.spinBtn} aria-label="Coluna abaixo">▼</button>
                  </div>
                </div>

                <div className={styles.produceReadout}>
                  <span id="produce-row-val">A</span>
                  <span className={styles.readoutComma}>,</span>
                  <span id="produce-col-val">1</span>
                </div>

                <button id="produce-confirm" type="button" className={styles.produceConfirm}>
                  CONFIRMAR ✓
                </button>
                <div className={styles.quizHelp}>
                  Use as setas <strong>▲▼</strong> pra rolar até a linha e a coluna certas e aperte <strong>Confirmar</strong>.
                </div>
              </div>
            ) : (
              <>
                <div id="belt-col" className={styles.beltCol}>
                  <div id="belt-lbl" className={styles.beltLabel}>
                    ◄ ESTEIRA DE ENTRADA ►
                  </div>
                  <div id="belt-box" className={styles.beltBox}>
                    <div className="belt-lines"></div>
                    <div className="roller l"></div>
                    <div className="roller r"></div>
                    {/* belt-q é preenchido pelo DOM vanilla (incl. o insert-slot) */}
                    <div id="belt-q" className={styles.beltQueue}></div>
                  </div>
                </div>

                <div id="cards-section" className={styles.cardsSection}>
                  <div id="cards-header" className={styles.cardsHeader}>
                    CARTAS DE DICA &nbsp;—&nbsp;{" "}
                    <span id="cards-left">3 cartas restantes</span>
                  </div>
                  <div id="cards-row" className={styles.cardsRow}>
                    <div className="hint-card" id="card-0">
                      <div className="card-top">🔦</div>
                      <div className="card-name">ILUMINAR CÉLULA</div>
                      <div className="card-cost">
                        -{roundConfig.hintCosts[0]} pts
                      </div>
                    </div>
                    <div className="hint-card" id="card-1">
                      <div className="card-top">📍</div>
                      <div className="card-name">MARCAR CAIXA</div>
                      <div className="card-cost">
                        -{roundConfig.hintCosts[1]} pts
                      </div>
                    </div>
                    <div className="hint-card" id="card-2">
                      <div className="card-top">🗺️</div>
                      <div className="card-name">MAPA COMPLETO</div>
                      <div className="card-cost">
                        -{roundConfig.hintCosts[2]} pts
                      </div>
                    </div>
                    <div id="hint-result" className={styles.hintResult}>
                      Clique em uma carta para receber uma dica!
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Coluna direita: prateleira */}
          <div id="shelf-col" className={styles.shelfCol}>
            <div id="shelf-lbl" className={styles.shelfLabel}>
              PRATELEIRA DE ARMAZENAGEM
            </div>
            <div id="shelf-wrap" className={styles.shelfWrap}>
              <div id="row-lbls" className={styles.rowLabels}></div>
              <div id="sgwrap" className={styles.shelfGridWrap}>
                <div id="col-lbls" className={styles.colLabels}></div>
                <div id="sgrid" className={styles.sgrid}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Banner de instruções colado no rodapé */}
        <div id="mission" className={styles.mission}>
          {roundConfig.mode === "name" ? (
            <>
              Eu coloco a caixa, você diz o endereço! Olhe a <span>linha (letra)</span> e a{" "}
              <span>coluna (número)</span> e escolha a resposta certa.
            </>
          ) : roundConfig.mode === "produce" ? (
            <>
              Eu coloco a caixa, você MONTA o endereço! Use o controle de{" "}
              <span>coluna</span> e o de <span>linha</span> e aperte Confirmar.
            </>
          ) : (
            <>
              Cada caixa tem um lugar certo na prateleira. Você consegue descobrir?
              <br />
              Cuidado pra não errar! Use as{" "}
              <span>cartas de dica 💡</span> se precisar de ajuda.
            </>
          )}
          <PhaseActionsButton />
        </div>
      </div>

      {/* Ghost de arrasto */}
      <div id="ghost" className={styles.ghost}>
        <div id="gi" className="bicon"></div>
        <div id="gc" className="bcoord"></div>
      </div>
    </div>
  );
}
