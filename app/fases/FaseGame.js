"use client";

import { useEffect, useState, useRef } from "react";
import styles from "./FaseGame.module.css";

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
    title: "Caixas Misteriosas",
    rows: ["A", "B", "C"],
    cols: [1, 2, 3, 4],
    boxCount: 5,
    coordVisible: "partial",
    timer: null,
    pointsCorrect: 100,
    pointsWrong: 30,
    hintCosts: [0, 20, 50],
    introText:
      "Alerta! 🚨 Algumas caixas perderam parte do endereço! Agora você só consegue ver a linha da caixa, mas não a coluna. Use as dicas com sabedoria para descobrir onde cada uma vai!",
  },
  {
    title: "Entrega Expressa",
    rows: ["A", "B", "C"],
    cols: [1, 2, 3, 4],
    boxCount: 6,
    coordVisible: "full",
    timer: 120,
    pointsCorrect: 100,
    pointsWrong: 30,
    hintCosts: [0, 20, 50],
    introText:
      "URGÊNCIA na fábrica! ⏰ O caminhão de entregas chega em 2 minutos! Organize todas as 6 caixas antes do tempo acabar. Mas calma: é melhor acertar devagar do que errar rápido!",
  },
  {
    title: "O Grande Desafio",
    rows: ["A", "B", "C", "D"],
    cols: [1, 2, 3, 4],
    boxCount: 8,
    coordVisible: "hidden",
    timer: 90,
    pointsCorrect: 150,
    pointsWrong: 40,
    hintCosts: [0, 30, 50],
    introText:
      "Este é o grande desafio! 🏆 A prateleira cresceu para 4 linhas × 4 colunas e as caixas perderam TODOS os endereços! Use suas dicas com estratégia. Se conseguir, você será o Mestre das Coordenadas!",
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
    const id = setInterval(() => {
      i++;
      setIntroText(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(id);
        setIntroDone(true);
      }
    }, 25);
    return () => clearInterval(id);
  }, [showIntro, currentRound]);

  /* ── Controle da intro ── */
  const handleIntroNext = () => {
    if (!introDone) {
      setIntroText(ROUNDS[currentRound].introText);
      setIntroDone(true);
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
    const key = `fase1_round${currentRound + 1}_stars`;
    try {
      const prev = parseInt(localStorage.getItem(key) || "0");
      if (data.stars > prev) localStorage.setItem(key, String(data.stars));
    } catch (e) {
      /* localStorage indisponível */
    }
    setResultData(data);
    setShowResult(true);
  };

  /* ── Avançar para o próximo round ── */
  const handleNextRound = () => {
    if (currentRound < 4) {
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

    let score = 0,
      hits = 0,
      batch = [],
      dragging = null,
      cardsLeft = 3;
    let timerInterval = null;
    let timeRemaining = config.timer;

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

      COLS.forEach((c) => {
        const d = document.createElement("div");
        d.className = "clbl";
        d.textContent = c;
        colLbls.appendChild(d);
      });

      ROWS.forEach((r) => {
        const rl = document.createElement("div");
        rl.className = "rlbl";
        rl.textContent = r;
        rowLbls.appendChild(rl);

        COLS.forEach((c) => {
          const cell = document.createElement("div");
          cell.className = "scell";
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

    /* ── Label de coordenada conforme visibilidade do round ── */
    function getCoordLabel(box) {
      if (coordVisible === "full") return `${box.row},${box.col}`;
      if (coordVisible === "partial") return `${box.row},?`;
      return "???";
    }

    /* ── Renderizar esteira com caixas arrastáveis ── */
    function renderBelt() {
      const q = document.getElementById("belt-q");
      if (!q) return;

      // Se a quantidade de caixas na DOM não bate ou não temos as referências, inicializa
      if (q.children.length !== batch.length || !batch[0]?.el) {
        q.innerHTML = "";
        batch.forEach((box) => {
          const el = document.createElement("div");
          el.className = "bbox";
          el.id = box.id;
          el.style.background = box.type.color;
          el.style.borderColor = box.type.border;
          el.style.touchAction = "none";
          // Inicializa escondida fora da tela à esquerda
          el.style.right = "550px";
          el.style.opacity = "0";
          el.innerHTML = `<div class="bicon">${box.type.icon}</div><div class="bcoord">${getCoordLabel(box)}</div>`;

          el.addEventListener("pointerdown", (e) => {
            e.preventDefault();
            el.setPointerCapture(e.pointerId);
            dragging = box;
            el.style.opacity = "0.4"; // Feedback visual
            showGhostEl(box);
            ghost.style.left = e.clientX + "px";
            ghost.style.top = e.clientY + "px";
            ghost.style.display = "flex";
          });

          box.el = el;
          q.appendChild(el);
        });
        // Forçar reflow para que o navegador registre a posição inicial (550px) antes de aplicar as posições finais
        q.offsetHeight;
      }

      // Atualiza a posição (right) e visibilidade de cada caixa
      const unplaced = batch.filter((b) => !b.placed);
      
      batch.forEach((box) => {
        const el = box.el;
        if (!el) return;

        if (box.placed) {
          // Desliza para fora da tela à direita e some
          el.style.right = "-150px";
          el.style.opacity = "0";
          el.style.pointerEvents = "none";
        } else {
          const unplacedIndex = unplaced.indexOf(box);
          if (unplacedIndex >= 0 && unplacedIndex < 3) {
            // Desliza para o seu espaço visível (acumulado na direita)
            // Slot 0: 20px, Slot 1: 170px, Slot 2: 320px
            el.style.right = `${20 + unplacedIndex * 150}px`;
            el.style.opacity = "1";
            el.style.pointerEvents = "auto";
          } else {
            // Aguarda fora da tela à esquerda
            el.style.right = "550px";
            el.style.opacity = "0";
            el.style.pointerEvents = "none";
          }
        }
      });
    }

    /* ── Ghost de arrasto ── */
    function showGhostEl(box) {
      ghost.style.background = box.type.color;
      ghost.style.borderColor = box.type.border;
      document.getElementById("gi").textContent = box.type.icon;
      document.getElementById("gc").textContent = getCoordLabel(box);
      ghost.style.display = "flex";
    }

    /* ── Soltar caixa na célula ── */
    function drop(cell, box) {
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
        p.innerHTML = `<div class="picon">${box.type.icon}</div><div class="pcoord" style="color:rgba(255,255,255,.9)">${box.row},${box.col}</div>`;
        cell.appendChild(p);
        cell.classList.add("cflash");
        setTimeout(() => cell.classList.remove("cflash"), 500);

        hits++;
        score += pointsCorrect;
        document.getElementById("score").textContent = String(score).padStart(
          3,
          "0"
        );
        document.getElementById("hits").textContent = hits + "/" + total;
        setFeedback(
          "✅",
          `Certo! ${box.type.icon} em (${box.row},${box.col}) — +${pointsCorrect} pts`,
          "#4caf50"
        );

        const el = document.getElementById(box.id);
        if (el) el.remove();
        if (batch.filter((b) => !b.placed).length === 0) win();
      } else {
        // ERRO — Feedback corretivo (Opção C)
        // 1. Célula errada pisca em vermelho
        cell.classList.add("wflash");
        setTimeout(() => cell.classList.remove("wflash"), 500);

        // 2. Célula CERTA brilha em verde por 2s para mostrar o destino correto
        const correctCell = document.querySelector(
          `.scell[data-coord="${box.coord}"]`
        );
        if (correctCell) {
          correctCell.classList.add("hint-correct");
          setTimeout(() => correctCell.classList.remove("hint-correct"), 2000);
        }

        // 3. Penalidade leve de pontos
        score = Math.max(0, score - pointsWrong);
        document.getElementById("score").textContent = String(score).padStart(
          3,
          "0"
        );

        // 4. Feedback educativo — mostra onde deveria ter ido
        setFeedback(
          "❌",
          `Errado! Olhe: a célula certa é (${box.row},${box.col}) — ela está brilhando! 🟢`,
          "#f44336"
        );
        // A caixa permanece na esteira para o aluno tentar novamente
      }
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
        document.getElementById("score").textContent = String(score).padStart(
          3,
          "0"
        );
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
              });
            }, 800);
          }
        }, i * 400); // 400ms de intervalo entre cada auto-colocação
      });
    }

    /* ── Inicializar o round ── */
    buildShelf();
    batch = genBatch();
    renderBelt();

    // HUD
    document.getElementById("hits").textContent = "0/" + total;
    document.getElementById("score").textContent = "000";
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

    /* ── Event listeners globais de Pointer Drag-and-Drop ── */
    const onPointerMove = (e) => {
      if (!dragging) return;
      ghost.style.left = e.clientX + "px";
      ghost.style.top = e.clientY + "px";

      // Remove a classe 'over' de todas as células
      document.querySelectorAll(".scell").forEach((c) => c.classList.remove("over"));

      // Identifica a célula sob o ponteiro
      const hoverTarget = document.elementFromPoint(e.clientX, e.clientY)?.closest(".scell");
      if (hoverTarget) {
        hoverTarget.classList.add("over");
      }
    };

    const onPointerUp = (e) => {
      if (!dragging) return;
      const draggedBox = dragging;
      dragging = null;
      ghost.style.display = "none";

      // Restaura a opacidade do elemento original
      const el = document.getElementById(draggedBox.id);
      if (el) el.style.opacity = "1";

      // Remove a classe 'over'
      document.querySelectorAll(".scell").forEach((c) => c.classList.remove("over"));

      // Identifica e processa o drop
      const dropTarget = document.elementFromPoint(e.clientX, e.clientY)?.closest(".scell");
      if (dropTarget) {
        drop(dropTarget, draggedBox);
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
      {showTutorial && (
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
                              setTutorialStep((prev) => prev + 1);
                            }, 1200);
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
                    Pontuação: {resultData.score} pts
                    {resultData.timeBonus > 0 &&
                      ` (inclui bônus de ${resultData.timeBonus} pts pelo tempo!)`}
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
                ) : currentRound < 4 ? (
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

      {/* ── Conteúdo do jogo ── */}
      <div id="wrap" className={styles.wrap}>
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
              Round {currentRound + 1}/5 — {roundConfig.title}
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
          {/* Coluna esquerda: esteira + cartas de dica */}
          <div className={styles.leftColumn}>
            <div id="belt-col" className={styles.beltCol}>
              <div id="belt-lbl" className={styles.beltLabel}>
                ◄ ESTEIRA DE ENTRADA ►
              </div>
              <div id="belt-box" className={styles.beltBox}>
                <div className="belt-lines"></div>
                <div className="roller l"></div>
                <div className="roller r"></div>
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
          Cada caixa tem um lugar certo na prateleira. Você consegue descobrir?
          <br />
          Cuidado pra não errar! Use as{" "}
          <span>cartas de dica 💡</span> se precisar de ajuda.
          <button
            className={styles.footerMenuBtn}
            onClick={() => (window.location.href = "/")}
          >
            🏠 MENU
          </button>
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
