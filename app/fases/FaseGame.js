"use client";

import { useEffect } from "react";
import styles from "./FaseGame.module.css";

export default function FaseGame() {
  useEffect(() => {
    const ROWS = ["A", "B", "C"],
      COLS = [1, 2, 3, 4];
    const BOX_TYPES = [
      { icon: "📦", color: "#a0522d", border: "#8b4513" },
      { icon: "⚙️", color: "#607d8b", border: "#455a64" },
      { icon: "🔧", color: "#78909c", border: "#546e7a" },
      { icon: "💡", color: "#f9a825", border: "#f57f17" },
      { icon: "🧪", color: "#7b1fa2", border: "#4a148c" },
      { icon: "🔩", color: "#37474f", border: "#263238" }
    ];
    const HINT_CARDS = [
      { cost: 0, used: false },
      { cost: 0, used: false },
      { cost: 50, used: false }
    ];

    let score = 0,
      hits = 0,
      total = 6,
      batch = [],
      dragging = null,
      cardsLeft = 3;

    document.body.classList.add("game-mode");

    const ghost = document.getElementById("ghost");
    if (!ghost) return;

    function shuffle(a) {
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    }

    function buildShelf() {
      document.getElementById("row-lbls").innerHTML = "";
      document.getElementById("col-lbls").innerHTML = "";
      document.getElementById("sgrid").innerHTML = "";
      COLS.forEach((c) => {
        const d = document.createElement("div");
        d.className = "clbl";
        d.textContent = c;
        document.getElementById("col-lbls").appendChild(d);
      });
      ROWS.forEach((r) => {
        const rl = document.createElement("div");
        rl.className = "rlbl";
        rl.textContent = r;
        document.getElementById("row-lbls").appendChild(rl);
        COLS.forEach((c) => {
          const cell = document.createElement("div");
          cell.className = "scell";
          cell.dataset.coord = r + c;
          cell.dataset.row = r;
          cell.dataset.col = c;
          cell.addEventListener("dragover", (e) => {
            e.preventDefault();
            cell.classList.add("over");
          });
          cell.addEventListener("dragleave", () => cell.classList.remove("over"));
          cell.addEventListener("drop", (e) => {
            e.preventDefault();
            cell.classList.remove("over");
            if (dragging) drop(cell, dragging);
          });
          cell.addEventListener("touchmove", (e) => e.preventDefault(), {
            passive: false
          });
          document.getElementById("sgrid").appendChild(cell);
        });
      });
    }

    function genBatch() {
      const all = [];
      ROWS.forEach((r) => COLS.forEach((c) => all.push(r + c)));
      shuffle(all);
      const chosen = all.slice(0, total);
      const types = shuffle([...BOX_TYPES]);
      return chosen.map((coord, i) => ({
        coord,
        row: coord[0],
        col: parseInt(coord[1]),
        type: types[i % types.length],
        id: "b" + i,
        placed: false
      }));
    }

    function renderBelt() {
      const q = document.getElementById("belt-q");
      q.innerHTML = "";
      batch
        .filter((b) => !b.placed)
        .forEach((box) => {
          const el = document.createElement("div");
          el.className = "bbox";
          el.id = box.id;
          el.draggable = true;
          el.style.background = box.type.color;
          el.style.borderColor = box.type.border;
          el.innerHTML = `<div class="bicon">${box.type.icon}</div><div class="bcoord">${box.row},${box.col}</div>`;
          el.addEventListener("dragstart", () => {
            dragging = box;
            el.classList.add("dragging");
            showGhost(box);
          });
          el.addEventListener("dragend", () => {
            el.classList.remove("dragging");
            ghost.style.display = "none";
            dragging = null;
          });
          el.addEventListener(
            "touchstart",
            (e) => {
              dragging = box;
              const t = e.touches[0];
              showGhost(box);
              ghost.style.left = t.clientX + "px";
              ghost.style.top = t.clientY + "px";
            },
            { passive: true }
          );
          el.addEventListener(
            "touchmove",
            (e) => {
              const t = e.touches[0];
              ghost.style.left = t.clientX + "px";
              ghost.style.top = t.clientY + "px";
            },
            { passive: false }
          );
          el.addEventListener("touchend", (e) => {
            ghost.style.display = "none";
            const t = e.changedTouches[0];
            const tgt = document.elementFromPoint(t.clientX, t.clientY)?.closest(".scell");
            if (tgt && dragging) drop(tgt, dragging);
            dragging = null;
          });
          q.appendChild(el);
        });
    }

    function showGhost(box) {
      ghost.style.background = box.type.color;
      ghost.style.borderColor = box.type.border;
      document.getElementById("gi").textContent = box.type.icon;
      document.getElementById("gc").textContent = box.row + "," + box.col;
      ghost.style.display = "flex";
    }

    function drop(cell, box) {
      if (box.placed) return;
      clearHintGlows();
      if (cell.dataset.row === box.row && parseInt(cell.dataset.col) === box.col) {
        box.placed = true;
        cell.innerHTML = "";
        const p = document.createElement("div");
        p.className = "placed";
        p.style.background = box.type.color;
        p.style.borderColor = box.type.border;
        p.innerHTML = `<div class="bicon">${box.type.icon}</div><div class="bcoord" style="color:rgba(255,255,255,.9)">${box.row},${box.col}</div>`;
        cell.appendChild(p);
        cell.classList.add("cflash");
        setTimeout(() => cell.classList.remove("cflash"), 500);
        hits++;
        score += 100;
        document.getElementById("score").textContent = String(score).padStart(3, "0");
        document.getElementById("hits").textContent = hits + "/" + total;
        setFeedback("✅", `Certo! ${box.type.icon} em (${box.row},${box.col}) — +100 pts`, "#4caf50");
        const el = document.getElementById(box.id);
        if (el) el.remove();
        if (batch.filter((b) => !b.placed).length === 0) win();
      } else {
        cell.classList.add("wflash");
        setTimeout(() => cell.classList.remove("wflash"), 450);
        score = Math.max(0, score - 30);
        document.getElementById("score").textContent = String(score).padStart(3, "0");
        setFeedback("❌", `Errado! Destino correto: (${box.row},${box.col}) — -30 pts`, "#f44336");
      }
    }

    function setFeedback(icon, text, color) {
      document.getElementById("fi").textContent = icon;
      const ft = document.getElementById("ft");
      ft.textContent = text;
      ft.style.color = color || "var(--text)";
    }

    function clearHintGlows() {
      document.querySelectorAll(".scell").forEach((c) =>
        c.classList.remove("hint-glow", "hint-glow-box")
      );
    }

    function useCard(idx) {
      if (HINT_CARDS[idx].used) return;
      const unplaced = batch.filter((b) => !b.placed);
      if (unplaced.length === 0) return;
      HINT_CARDS[idx].used = true;
      cardsLeft--;
      document.getElementById("card-" + idx).classList.add("used");
      document.getElementById("cards-left").textContent =
        cardsLeft + " carta" + (cardsLeft !== 1 ? "s" : "") + " restante" + (cardsLeft !== 1 ? "s" : "");
      if (HINT_CARDS[idx].cost > 0) {
        score = Math.max(0, score - HINT_CARDS[idx].cost);
        document.getElementById("score").textContent = String(score).padStart(3, "0");
      }
      clearHintGlows();
      const hint = document.getElementById("hint-result");
      hint.classList.add("active");

      if (idx === 0) {
        const box = unplaced[0];
        const target = document.querySelector(`.scell[data-coord="${box.coord}"]`);
        if (target) {
          target.classList.add("hint-glow");
          setTimeout(() => target.classList.remove("hint-glow"), 3000);
        }
        hint.innerHTML = `<div><span style="color:var(--card-gold)">ILUMINAR CÉLULA</span><br><br>A célula <span style="color:var(--yellow)">(${box.row},${box.col})</span> foi destacada em dourado por 3s!</div>`;
        setFeedback("🔦", `Dica: célula (${box.row},${box.col}) iluminada!`, "#f0c040");
      } else if (idx === 1) {
        const box = unplaced[Math.floor(Math.random() * unplaced.length)];
        const el = document.getElementById(box.id);
        if (el) {
          el.style.outline = "3px solid #ff9800";
          el.style.outlineOffset = "3px";
          setTimeout(() => {
            el.style.outline = "";
            el.style.outlineOffset = "";
          }, 3000);
        }
        const target = document.querySelector(`.scell[data-coord="${box.coord}"]`);
        if (target) {
          target.classList.add("hint-glow-box");
          setTimeout(() => target.classList.remove("hint-glow-box"), 3000);
        }
        hint.innerHTML = `<div><span style="color:var(--card-gold)">MARCAR CAIXA</span><br><br>A caixa <span style="color:var(--yellow)">${box.type.icon}</span> e seu destino estão marcados em laranja por 3s!</div>`;
        setFeedback("📍", `Dica: caixa ${box.type.icon} e destino marcados!`, "#ff9800");
      } else {
        unplaced.forEach((box) => {
          const target = document.querySelector(`.scell[data-coord="${box.coord}"]`);
          if (target) {
            target.classList.add("hint-glow");
            setTimeout(() => target.classList.remove("hint-glow"), 4000);
          }
        });
        const lines = unplaced.map((b) => `${b.type.icon} → (${b.row},${b.col})`).join("&nbsp;&nbsp;&nbsp;");
        hint.innerHTML = `<div><span style="color:var(--card-gold)">MAPA COMPLETO</span><br><br>${lines}<br><br><span style="color:#f44336">-50 pts usados</span></div>`;
        setFeedback("🗺️", "Mapa completo revelado! Todas as células iluminadas.", "#f0c040");
      }
    }

    function win() {
      const stars = score >= 550 ? "★★★" : score >= 350 ? "★★☆" : "★☆☆";
      setFeedback("🏆", `Rodada concluída! ${stars}  Pontos: ${score}`, "#ffeb3b");
      document.getElementById("next-btn").style.display = "block";
    }

    function startRound() {
      hits = 0;
      cardsLeft = 3;
      HINT_CARDS.forEach((c, i) => {
        c.used = false;
        document.getElementById("card-" + i).classList.remove("used");
      });
      document.getElementById("hint-result").classList.remove("active");
      document.getElementById("hint-result").innerHTML = "Clique em uma carta para receber uma dica!";
      document.getElementById("next-btn").style.display = "none";
      clearHintGlows();
      buildShelf();
      batch = genBatch();
      renderBelt();
      document.getElementById("hits").textContent = "0/" + total;
      document.getElementById("cards-left").textContent = "3 cartas restantes";
      setFeedback("🏭", "Arraste cada caixa para o lugar certo na prateleira!", "");
    }

    const onDragOver = (e) => {
      ghost.style.left = e.clientX + "px";
      ghost.style.top = e.clientY + "px";
    };

    const cardHandlers = [0, 1, 2].map((idx) => {
      const el = document.getElementById("card-" + idx);
      if (!el) return null;
      const handler = () => useCard(idx);
      el.addEventListener("click", handler);
      return { el, handler };
    });

    const nextBtn = document.getElementById("next-btn");
    const nextHandler = () => startRound();
    nextBtn?.addEventListener("click", nextHandler);

    document.addEventListener("dragover", onDragOver);
    startRound();

    return () => {
      document.body.classList.remove("game-mode");
      document.removeEventListener("dragover", onDragOver);
      cardHandlers.forEach((entry) => {
        if (!entry) return;
        entry.el.removeEventListener("click", entry.handler);
      });
      nextBtn?.removeEventListener("click", nextHandler);
    };
  }, []);

  return (
    <div id="fases-root" className={styles.root}>
      <div id="game-title" className={styles.gameTitle}>
        FABRICA DE ALGORITMOS
      </div>
      <div id="game-subtitle" className={styles.gameSubtitle}>
        Fase 1.1 — Esteira de Caixas
      </div>

      <div id="wrap" className={styles.wrap}>
        <div id="hud" className={styles.hud}>
          <div>
            <div style={{ fontSize: "clamp(11px,0.75vw,13px)" }}>Pontos</div>
            <div className={styles.hv} id="score">
              000
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "clamp(11px,0.75vw,13px)" }}>Fase</div>
            <div className={styles.hv}>1.1</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "clamp(11px,0.75vw,13px)" }}>Acertos</div>
            <div className={styles.hv} id="hits">
              0/6
            </div>
          </div>
        </div>

        <div id="mission" className={styles.mission}>
          Cada caixa tem um lugar certo na prateleira. <span>Você consegue descobrir?</span>
          <br />
          Cuidado pra não errar! Use as <span>cartas de dica 💡</span> se precisar de ajuda.
        </div>

        <div id="coord-hint" className={styles.coordHint}>
          Linhas: A · B · C &nbsp;|&nbsp; Colunas: 1 · 2 · 3 · 4
        </div>

        <div id="main" className={styles.main}>
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

        <div id="cards-section" className={styles.cardsSection}>
          <div id="cards-header" className={styles.cardsHeader}>
            CARTAS DE DICA &nbsp;—&nbsp; <span id="cards-left">3 cartas restantes</span>
          </div>
          <div id="cards-row" className={styles.cardsRow}>
            <div className="hint-card" id="card-0">
              <div className="card-top">🔦</div>
              <div className="card-name">ILUMINAR CÉLULA</div>
              <div className="card-cost">-0 pts</div>
            </div>
            <div className="hint-card" id="card-1">
              <div className="card-top">📍</div>
              <div className="card-name">MARCAR CAIXA</div>
              <div className="card-cost">-0 pts</div>
            </div>
            <div className="hint-card" id="card-2">
              <div className="card-top">🗺️</div>
              <div className="card-name">MAPA COMPLETO</div>
              <div className="card-cost">-50 pts</div>
            </div>
            <div id="hint-result" className={styles.hintResult}>
              Clique em uma carta para receber uma dica!
            </div>
          </div>
        </div>

        {/* ── Brasilino: barra de feedback ── */}
        <div id="feedback" className={styles.feedback}>
          {/* TODO sprite: substituir por <img src="/brasilino-happy.png"> */}
          <div className={styles.brasilino}>
            <div className={styles.brasilino__avatar}>🤖</div>
            <span className={styles.brasilino__name}>BRASILINO</span>
          </div>
          <div className={styles.brasilino__balloon}>
            <span id="fi" className={styles.brasilino__icon}>🏭</span>&nbsp;
            <span id="ft">Arraste cada caixa para o lugar certo na prateleira!</span>
          </div>
        </div>
        <button id="next-btn" className={styles.nextButton}>
          ▶ PRÓXIMA RODADA
        </button>
      </div>

      <div id="ghost" className={styles.ghost}>
        <div id="gi" className="bicon"></div>
        <div id="gc" className="bcoord"></div>
      </div>
    </div>
  );
}
