"use client";

import { useEffect } from "react";
import styles from "./Fase12Game.module.css";
import PhaseActionsButton from "../components/PhaseActionsButton";
import { playRightAnswer, playWrongAnswer, startTyping, stopTyping, playGameplayMusic2, stopMusic } from "../lib/sfx";
import {
  getBaseScore,
  startRoundAttempt,
  recordRoundComplete,
} from "../lib/gameScore";

export default function Fase12Game() {
  useEffect(() => {
    playGameplayMusic2();
    return () => stopMusic();
  }, []);

  useEffect(() => {
    // ── CATÁLOGO DE PRODUTOS ─────────────────────────────────────────────────
    const PRODUTOS = [
      { nomeProduto: "Leite",     emoji: "🥛", categoria: "refrigerado", fragil: false, peso: 1.0, valor: 15 },
      { nomeProduto: "Queijo",    emoji: "🧀", categoria: "refrigerado", fragil: true,  peso: 0.5, valor: 30 },
      { nomeProduto: "Iogurte",   emoji: "🫙", categoria: "refrigerado", fragil: false, peso: 0.8, valor: 20 },
      { nomeProduto: "Manteiga",  emoji: "🧈", categoria: "refrigerado", fragil: false, peso: 0.3, valor: 25 },
      { nomeProduto: "Presunto",  emoji: "🥓", categoria: "refrigerado", fragil: false, peso: 1.5, valor: 40 },
      { nomeProduto: "Ovo",       emoji: "🥚", categoria: "refrigerado", fragil: true,  peso: 0.6, valor: 10 },
      { nomeProduto: "Arroz",     emoji: "🌾", categoria: "seco",        fragil: false, peso: 5.0, valor: 20 },
      { nomeProduto: "Farinha",   emoji: "🌫️", categoria: "seco",        fragil: false, peso: 2.0, valor: 12 },
      { nomeProduto: "Macarrão",  emoji: "🍝", categoria: "seco",        fragil: false, peso: 1.0, valor: 10 },
      { nomeProduto: "Biscoito",  emoji: "🍪", categoria: "seco",        fragil: true,  peso: 0.4, valor: 8  },
      { nomeProduto: "Feijão",    emoji: "🫘", categoria: "seco",        fragil: false, peso: 1.0, valor: 18 },
      { nomeProduto: "Açúcar",    emoji: "🍬", categoria: "seco",        fragil: false, peso: 1.0, valor: 10 },
      { nomeProduto: "Sorvete",   emoji: "🍦", categoria: "congelado",   fragil: false, peso: 0.5, valor: 35 },
      { nomeProduto: "Pizza",     emoji: "🍕", categoria: "congelado",   fragil: false, peso: 0.8, valor: 28 },
      { nomeProduto: "Carne",     emoji: "🥩", categoria: "congelado",   fragil: false, peso: 2.5, valor: 50 },
      { nomeProduto: "Frango",    emoji: "🍗", categoria: "congelado",   fragil: false, peso: 1.8, valor: 45 },
    ];

    // ── CONFIGURAÇÃO DOS ROUNDS ──────────────────────────────────────────────
    // caixaIds: índices em PRODUTOS; repetidos = mesmo produto, uid diferente
    const ROUNDS = [
      {
        numero: 1,
        pontosMaximos: 150,
        caminhoes: [{
          label: "🚛 Caminhão Frigorífico",
          aceita: ["refrigerado"],
          recusa: [],
          capacidade: 5,
        }],
        caixaIds: [0, 1, 2, 3, 4],
        tutorialMsg: "🤖 Brasilino diz: Olá! Veja a ficha de cada caixa e arraste as que o caminhão aceita para os slots dele!",
      },
      {
        numero: 2,
        pontosMaximos: 200,
        caminhoes: [{
          label: "🚛 Caminhão Refrigerado",
          aceita: ["refrigerado"],
          recusa: ["fragil"],
          capacidade: 5,
        }],
        caixaIds: [0, 1, 2, 3, 4, 5, 6, 8, 9, 10],
      },
      {
        numero: 3,
        pontosMaximos: 200,
        caminhoes: [{
          label: "🚛 Caminhão Misto",
          aceita: ["refrigerado", "congelado"],
          recusa: [],
          capacidade: 8,
        }],
        // 15 caixas, 8 slots — player must choose most valuable
        caixaIds: [0, 1, 2, 3, 4, 5, 12, 13, 14, 15, 6, 7, 8, 9, 10],
      },
      {
        numero: 4,
        pontosMaximos: 250,
        caminhoes: [{
          label: "🚛 Caminhão Expresso",
          aceita: ["refrigerado"],
          recusa: ["fragil", "pesado"],
          capacidade: 8,
        }],
        caixaIds: [0, 0, 0, 2, 2, 3, 3, 4, 1, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
      },
      {
        numero: 5,
        pontosMaximos: 300,
        // Round 5: dois caminhões simultâneos
        caminhoes: [
          {
            label: "🚛 Caminhão Frio",
            aceita: ["refrigerado", "congelado"],
            recusa: ["fragil"],
            capacidade: 6,
          },
          {
            label: "🚚 Caminhão Seco",
            aceita: ["seco"],
            recusa: ["fragil"],
            capacidade: 6,
          },
        ],
        caixaIds: [0, 2, 3, 4, 6, 7, 8, 10, 11, 12, 13, 14, 15, 1, 5, 9],
      },
    ];

    // ── ESTADO DO JOGO ───────────────────────────────────────────────────────
    let roundIdx = 0;
    let depot = [];
    // cargo[t] = array de tamanho capacidade, cada slot é null ou box
    let cargo = [[]];
    let dragging = null;  // { box, fromTruck: null|number, fromSlot: null|number }
    let dispatched = [];  // dispatched[t] = true se o caminhão t já foi despachado
    let roundScores = []; // pontuação de cada caminhão no round

    // ── Pontuação global ──────────────────────────────────────────────────────
    let baseScore = 0;       // total acumulado sem este round (carregado ao iniciar round)
    let roundStartTime = 0;  // timestamp de início do round atual

    // ── UTILITÁRIOS ──────────────────────────────────────────────────────────
    function shuffle(a) {
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    }

    function $(id) { return document.getElementById(id); }

    function getBoxAttrs(box) {
      const attrs = [box.categoria];
      if (box.fragil) attrs.push("fragil");
      attrs.push(box.peso < 2 ? "leve" : "pesado");
      return attrs;
    }

    function isValid(box, truck) {
      const attrs = getBoxAttrs(box);
      return truck.aceita.some(a => attrs.includes(a))
        && !truck.recusa.some(r => attrs.includes(r));
    }

    function maxLucroTruck(allBoxes, truck) {
      const valid = allBoxes.filter(b => isValid(b, truck));
      valid.sort((a, b) => b.valor - a.valor);
      return valid.slice(0, truck.capacidade).reduce((s, b) => s + b.valor, 0);
    }

    function attrLabel(attr) {
      return {
        refrigerado: "❄️ Refrigerado",
        seco: "📦 Seco",
        congelado: "🧊 Congelado",
        fragil: "⚠️ Frágil",
        pesado: "🏋️ Pesado (≥2kg)",
        leve: "🪶 Leve (<2kg)",
      }[attr] || attr;
    }

    function showBoxTooltip(box, el) {
      const tt = $("f12-tt");
      if (!tt) return;
      tt.innerHTML = `
        <div class="f12-tt-title">${box.emoji} ${box.nomeProduto}</div>
        <div>Categoria: <b>${box.categoria}</b></div>
        <div>Frágil: <b>${box.fragil ? "Sim ⚠️" : "Não"}</b></div>
        <div>Peso: <b>${box.peso}kg</b></div>
        <div>Valor: <b>R$${box.valor}</b></div>
      `;
      tt.style.display = "block";
      const rect  = el.getBoundingClientRect();
      const ttW   = tt.offsetWidth;
      let left = rect.left + rect.width / 2 - ttW / 2;
      left = Math.max(8, Math.min(window.innerWidth - ttW - 8, left));
      tt.style.left = left + "px";
      tt.style.top  = (rect.bottom + 8) + "px";
    }

    function hideBoxTooltip() {
      const tt = $("f12-tt");
      if (tt) tt.style.display = "none";
    }

    function setFeedback(icon, text, color) {
      const fi = $("f12-fi");
      if (fi) fi.textContent = icon;
      const ft = $("f12-ft");
      if (!ft) return;
      ft.textContent = text;
      ft.style.color = color || "var(--text)";
    }

    function showGhost(box) {
      const g = $("f12-ghost");
      g.style.display = "flex";
      $("f12-ghost-emoji").textContent = box.emoji;
      $("f12-ghost-name").textContent = box.nomeProduto;
    }

    function hideGhost() { $("f12-ghost").style.display = "none"; }

    // ── RENDERIZAÇÃO ─────────────────────────────────────────────────────────
    function updateScoreHUD(roundPts) {
      const el = $("f12-score");
      if (el) el.textContent = String(baseScore + Math.max(0, roundPts)).padStart(5, "0");
    }

    function updateHUD() {
      const round = ROUNDS[roundIdx];
      const lucroAtual = cargo.reduce((s, slots) => s + slots.filter(Boolean).reduce((a, b) => a + b.valor, 0), 0);
      $("f12-round").textContent = `ROUND ${round.numero}/5`;
      $("f12-lucro").textContent = `R$ ${lucroAtual}`;
      // O score HUD é atualizado no showModal() ao final do round
      updateScoreHUD(0);
    }

    function renderTruckPanels() {
      const round = ROUNDS[roundIdx];
      const container = $("f12-trucks-container");
      container.innerHTML = "";

      round.caminhoes.forEach((truck, t) => {
        const panel = document.createElement("div");
        panel.className = "f12-truck-panel" + (dispatched[t] ? " f12-truck-dispatched" : "");
        panel.id = `f12-truck-panel-${t}`;

        // Header
        const header = document.createElement("div");
        header.className = "f12-truck-header";
        header.innerHTML = `
          <div class="f12-truck-label">${truck.label}</div>
        `;
        panel.appendChild(header);

        // Criteria
        const criteria = document.createElement("div");
        criteria.className = "f12-criteria";
        criteria.innerHTML = `
          <div class="f12-criteria-row">
            <span class="f12-criteria-lbl">✅ ACEITA:</span>
            <div class="f12-tags-wrap">
              ${truck.aceita.map(a => `<span class="f12-tag f12-tag-ok">${attrLabel(a)}</span>`).join("")}
            </div>
          </div>
          ${truck.recusa.length ? `
          <div class="f12-criteria-row">
            <span class="f12-criteria-lbl">❌ RECUSA:</span>
            <div class="f12-tags-wrap">
              ${truck.recusa.map(r => `<span class="f12-tag f12-tag-no">${attrLabel(r)}</span>`).join("")}
            </div>
          </div>` : ""}
        `;
        panel.appendChild(criteria);

        // Slots
        const slotsLabel = document.createElement("div");
        slotsLabel.className = "f12-slots-label";
        const occupied = cargo[t].filter(Boolean).length;
        slotsLabel.textContent = `CARGA: ${occupied}/${truck.capacidade}`;
        panel.appendChild(slotsLabel);

        const slotsEl = document.createElement("div");
        slotsEl.className = "f12-truck-slots";
        slotsEl.id = `f12-slots-${t}`;

        for (let i = 0; i < truck.capacidade; i++) {
          const slot = document.createElement("div");
          const box = cargo[t][i];
          slot.className = "f12-slot" + (box ? " f12-slot-filled" : "");
          slot.dataset.truck = t;
          slot.dataset.slot = i;

          if (box) {
            const validCls = isValid(box, truck) ? "" : " f12-slot-invalid";
            slot.className += validCls;
            slot.innerHTML = `<div class="f12-slot-emoji">${box.emoji}</div><div class="f12-slot-val">R$${box.valor}</div>`;
            slot.title = `${box.nomeProduto} — clique para devolver ao depósito`;
            if (!dispatched[t]) {
              slot.addEventListener("click", () => returnToDepot(t, i));
            }
          } else if (!dispatched[t]) {
            slot.innerHTML = `<div class="f12-slot-empty">vago</div>`;
          }
          slotsEl.appendChild(slot);
        }
        panel.appendChild(slotsEl);

        // Dispatch button per truck (only for round 5 dual trucks)
        if (round.caminhoes.length > 1 && !dispatched[t]) {
          const btn = document.createElement("button");
          btn.className = "f12-dispatch-small";
          btn.textContent = "DESPACHAR ESTE";
          btn.addEventListener("click", () => dispatchTruck(t));
          panel.appendChild(btn);
        }

        container.appendChild(panel);
      });
    }

    function renderDepot() {
      const grid = $("f12-depot-grid");
      grid.innerHTML = "";

      depot.forEach(box => {
        const el = document.createElement("div");
        el.className = "f12-box";
        el.id = "f12-box-" + box.uid;
        el.dataset.uid = box.uid;
        el.style.touchAction = "none";

        el.innerHTML = `
          <div class="f12-box-emoji">${box.emoji}</div>
          <div class="f12-box-name">${box.nomeProduto}</div>
          <div class="f12-box-val">R$${box.valor}</div>
        `;

        el.addEventListener("mouseenter", () => showBoxTooltip(box, el));
        el.addEventListener("mouseleave", hideBoxTooltip);

        // Arrasto unificado (mouse/touch/caneta) via Pointer Events — evita o
        // ghost feio do drag-and-drop nativo do navegador (mesmo padrão da Fase 1)
        el.addEventListener("pointerdown", (e) => {
          e.preventDefault();
          el.setPointerCapture(e.pointerId);
          hideBoxTooltip();
          dragging = { box, fromTruck: null, fromSlot: null };
          el.classList.add("f12-dragging");
          showGhost(box);
          const g = $("f12-ghost");
          g.style.left = e.clientX + "px";
          g.style.top = e.clientY + "px";
        });

        grid.appendChild(el);
      });
    }

    // ── AÇÕES ────────────────────────────────────────────────────────────────
    function dropOnTruck(truckIdx, slotIdx, box) {
      const round = ROUNDS[roundIdx];
      const truck = round.caminhoes[truckIdx];
      if (cargo[truckIdx][slotIdx]) return;
      if (dispatched[truckIdx]) return;

      const di = depot.findIndex(b => b.uid === box.uid);
      if (di === -1) return;
      depot.splice(di, 1);
      cargo[truckIdx][slotIdx] = box;

      if (!isValid(box, truck)) {
        setFeedback("⚠️", `${box.emoji} ${box.nomeProduto} não pertence a este caminhão!`, "var(--red)");
      } else {
        setFeedback("✅", `${box.emoji} ${box.nomeProduto} carregado! +R$${box.valor}`, "var(--green)");
      }

      updateHUD();
      renderTruckPanels();
      renderDepot();
    }

    function returnToDepot(truckIdx, slotIdx) {
      const box = cargo[truckIdx][slotIdx];
      if (!box) return;
      cargo[truckIdx][slotIdx] = null;
      depot.push(box);
      setFeedback("↩️", `${box.emoji} ${box.nomeProduto} devolvido ao depósito.`, "var(--text)");
      updateHUD();
      renderTruckPanels();
      renderDepot();
    }

    function resetAllCargo() {
      cargo.forEach((slots, t) => {
        slots.forEach((box, i) => {
          if (box && !dispatched[t]) { depot.push(box); cargo[t][i] = null; }
        });
      });
      setFeedback("🔄", "Caixas devolvidas ao depósito.", "var(--text)");
      updateHUD();
      renderTruckPanels();
      renderDepot();
    }

    function dispatchTruck(truckIdx) {
      const round = ROUNDS[roundIdx];
      const truck = round.caminhoes[truckIdx];
      dispatched[truckIdx] = true;

      const cargoBoxes = cargo[truckIdx].filter(Boolean);
      const lucroObtido = cargoBoxes.reduce((s, b) => s + b.valor, 0);
      const allBoxes = [...depot, ...cargoBoxes];
      const lucroMax = maxLucroTruck(allBoxes, truck);
      roundScores[truckIdx] = { lucroObtido, lucroMax, invalidCount: cargoBoxes.filter(b => !isValid(b, truck)).length };

      // If all trucks dispatched (or only one truck), show modal
      const allDone = round.caminhoes.every((_, t) => dispatched[t]);
      if (allDone) {
        showModal();
      } else {
        setFeedback("🚛", `Caminhão ${truckIdx + 1} despachado! Agora carregue o próximo.`, "var(--yellow)");
        renderTruckPanels();
        renderDepot();
      }
    }

    function dispatchAll() {
      const round = ROUNDS[roundIdx];
      round.caminhoes.forEach((_, t) => {
        if (!dispatched[t]) dispatchTruck(t);
      });
    }

    function showModal() {
      const round = ROUNDS[roundIdx];
      const modal = $("f12-modal");

      const totalLucro = roundScores.reduce((s, r) => s + (r ? r.lucroObtido : 0), 0);
      const totalMax = roundScores.reduce((s, r) => s + (r ? r.lucroMax : 0), 0);
      const totalInvalid = roundScores.reduce((s, r) => s + (r ? r.invalidCount : 0), 0);
      const totalEmpty = round.caminhoes.reduce((s, truck, t) => {
        const filledSlots = (cargo[t] || []).filter(Boolean).length;
        return s + (truck.capacidade - filledSlots);
      }, 0);

      const pct = totalMax > 0 ? totalLucro / totalMax : 0;
      const stars = pct >= 0.9 ? 3 : pct >= 0.7 ? 2 : pct >= 0.5 ? 1 : 0;
      const isLast = roundIdx === ROUNDS.length - 1;

      // ── Pontos padronizados ──────────────────────────────────────────────────
      const pontosGanhos = Math.round(pct * (round.pontosMaximos || 200));
      const gsResult = recordRoundComplete(2, roundIdx + 1, {
        score: pontosGanhos,
        errors: totalInvalid,
        hints: 0,
        stars,
        timeMs: Date.now() - roundStartTime,
      });
      // Atualiza HUD com pontuação final do round
      updateScoreHUD(pontosGanhos);

      // Save stars (legado)
      try {
        const key = `fase12_round${round.numero}_stars`;
        const prev = parseInt(localStorage.getItem(key) || "0");
        if (stars > prev) localStorage.setItem(key, String(stars));
        if (isLast && stars > 0) localStorage.setItem("fase12_completed", "1");
        const allStars = ROUNDS.map((r) =>
          parseInt(localStorage.getItem(`fase12_round${r.numero}_stars`) || "0")
        );
        localStorage.setItem("fase12_best_stars", String(Math.min(...allStars)));
      } catch (_) {}

      const msgs = [];
      if (totalInvalid > 0) msgs.push(`⚠️ ${totalInvalid} caixa(s) inválida(s) foram embarcadas!`);
      if (totalEmpty > 0) msgs.push(`📦 ${totalEmpty} espaço(s) vazio(s). Podia ter ganho mais!`);
      if (stars === 3) msgs.push("🤖 Brasilino diz: Perfeito! Você é um despachante nota 10!");
      else if (stars === 2) msgs.push("🤖 Brasilino diz: Bom trabalho! Pode melhorar ainda mais!");
      else if (stars === 1) msgs.push("🤖 Brasilino diz: Deu pra passar... Tenta de novo pra melhorar!");
      else msgs.push("🤖 Brasilino diz: Eita! Vamos tentar de novo com calma?");

      const starsStr = "★".repeat(stars) + "☆".repeat(3 - stars);
      $("f12-modal-stars").textContent = starsStr;
      $("f12-modal-stars").className = `f12-modal-stars f12-stars-${stars}`;
      $("f12-modal-lucro").textContent = `R$ ${totalLucro} / R$ ${totalMax}`;
      $("f12-modal-pct").textContent = `${Math.round(pct * 100)}% do lucro máximo`;
      $("f12-modal-pts").textContent = gsResult.isFirst
        ? `+${pontosGanhos} pts 🎉 | 🏆 Total: ${gsResult.totalScore} pts`
        : `${pontosGanhos} pts (round já concluído — pontos não adicionados) | 🏆 Total: ${gsResult.totalScore} pts`;
      $("f12-modal-msgs").innerHTML = msgs.map(m => `<div class="f12-modal-msg">${m}</div>`).join("");
      $("f12-modal-next").style.display = isLast ? "none" : "inline-block";
      $("f12-modal-finish").style.display = isLast ? "inline-block" : "none";

      modal.style.display = "flex";
    }

    function hideModal() { $("f12-modal").style.display = "none"; }

    // ── [SOMENTE TESTES — REMOVER ANTES DO LANÇAMENTO] ── navegação livre de round
    function renderDevNav() {
      const nav = $("f12-dev-nav");
      if (!nav) return;
      nav.innerHTML = "";

      const label = document.createElement("span");
      label.className = "f12-dev-nav-label";
      label.textContent = "🧪 DEV";
      nav.appendChild(label);

      ROUNDS.forEach((r, i) => {
        const btn = document.createElement("button");
        btn.className = "f12-dev-nav-btn" + (roundIdx === i ? " f12-dev-nav-btn-active" : "");
        btn.textContent = `R${i + 1}`;
        btn.addEventListener("click", () => startRound(i));
        nav.appendChild(btn);
      });
    }

    // ── INÍCIO DO ROUND ──────────────────────────────────────────────────────
    function startRound(idx) {
      roundIdx = idx;
      renderDevNav();
      try {
        localStorage.setItem("current_phase", "2");
        localStorage.setItem("current_round", String(idx + 1));
      } catch (e) {}
      dispatched = [];
      roundScores = [];

      // Pontuação global
      baseScore = getBaseScore(2, idx + 1);
      roundStartTime = Date.now();
      startRoundAttempt(2, idx + 1);
      updateScoreHUD(0);

      const round = ROUNDS[idx];

      depot = round.caixaIds.map((pid, i) => ({
        ...PRODUTOS[pid % PRODUTOS.length],
        uid: `r${idx}-b${i}`,
      }));
      shuffle(depot);

      cargo = round.caminhoes.map(truck => new Array(truck.capacidade).fill(null));
      dispatched = round.caminhoes.map(() => false);

      renderTruckPanels();
      renderDepot();
      updateHUD();

      if (round.tutorialMsg) {
        setFeedback("🤖", round.tutorialMsg, "var(--yellow)");
      } else {
        setFeedback("🚛", "Carregue o caminhão com as caixas certas e maximize o lucro!", "");
      }
    }

    // ── EVENT LISTENERS ──────────────────────────────────────────────────────
    document.body.classList.add("game-mode");
    if (!$("f12-root")) return;

    const onPointerMove = e => {
      if (!dragging) return;
      const g = $("f12-ghost");
      g.style.left = e.clientX + "px";
      g.style.top = e.clientY + "px";

      document.querySelectorAll(".f12-slot-over").forEach(s => s.classList.remove("f12-slot-over"));
      const hoverSlot = document.elementFromPoint(e.clientX, e.clientY)?.closest(".f12-slot:not(.f12-slot-filled)");
      if (hoverSlot) hoverSlot.classList.add("f12-slot-over");
    };

    const onPointerUp = e => {
      if (!dragging) return;
      const draggedBox = dragging;
      dragging = null;
      hideGhost();
      document.querySelectorAll(".f12-slot-over").forEach(s => s.classList.remove("f12-slot-over"));

      const el = $("f12-box-" + draggedBox.box.uid);
      if (el) el.classList.remove("f12-dragging"); // restaura antes (drop falho mantém a caixa no depósito)

      const dropTarget = document.elementFromPoint(e.clientX, e.clientY)?.closest(".f12-slot:not(.f12-slot-filled)");
      if (dropTarget) {
        dropOnTruck(parseInt(dropTarget.dataset.truck), parseInt(dropTarget.dataset.slot), draggedBox.box);
      }
    };

    document.addEventListener("pointermove", onPointerMove);
    document.addEventListener("pointerup", onPointerUp);

    const dispatchBtn = $("f12-dispatch");
    const dispatchHandler = () => dispatchAll();
    dispatchBtn?.addEventListener("click", dispatchHandler);

    const resetBtn = $("f12-reset");
    const resetHandler = () => resetAllCargo();
    resetBtn?.addEventListener("click", resetHandler);

    const retryBtn = $("f12-modal-retry");
    const retryHandler = () => { hideModal(); startRound(roundIdx); };
    retryBtn?.addEventListener("click", retryHandler);

    const nextBtn = $("f12-modal-next");
    const nextHandler = () => { hideModal(); startRound(roundIdx + 1); };
    nextBtn?.addEventListener("click", nextHandler);

    const finishBtn = $("f12-modal-finish");
    const finishHandler = () => {
      try {
        localStorage.removeItem("current_phase");
        localStorage.removeItem("current_round");
      } catch (e) {}
      window.location.href = "/menu";
    };
    finishBtn?.addEventListener("click", finishHandler);

    startRound(0);

    return () => {
      document.body.classList.remove("game-mode");
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerup", onPointerUp);
      dispatchBtn?.removeEventListener("click", dispatchHandler);
      resetBtn?.removeEventListener("click", resetHandler);
      retryBtn?.removeEventListener("click", retryHandler);
      nextBtn?.removeEventListener("click", nextHandler);
      finishBtn?.removeEventListener("click", finishHandler);
    };
  }, []);
  
  return (
    <div id="f12-root" className={styles.root}>
      <div className={styles.wrap}>
        {/* ── [SOMENTE TESTES — REMOVER ANTES DO LANÇAMENTO] ── */}
        <div id="f12-dev-nav" className={styles.devNav}></div>

        {/* HUD */}
        <div className={styles.hud}>
          <div>
            <div className={styles.hudLabel}>ROUND</div>
            <div className={styles.hudVal} id="f12-round">1/5</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div className={styles.hudLabel}>PONTOS</div>
            <div className={styles.hudVal} id="f12-score">00000</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div className={styles.hudLabel}>LUCRO ATUAL</div>
            <div className={styles.hudVal} id="f12-lucro">R$ 0</div>
          </div>
        </div>

        {/* Main: depot + trucks */}
        <div className={styles.main}>
          <div className={styles.depotPanel}>
            <div className={styles.depotTitle}>
              📦 Depósito — passe o mouse sobre cada caixa para ver os detalhes
            </div>
            <div id="f12-depot-grid" className={styles.depotGrid}></div>
          </div>

          <div id="f12-trucks-container" className={styles.trucksContainer}></div>
        </div>

        {/* Action buttons */}
        <div className={styles.actions}>
          <button id="f12-reset" className={styles.resetBtn}>🔄 RESETAR</button>
          <button id="f12-dispatch" className={styles.dispatchBtn}>
            🚛 DESPACHAR CAMINHÃO
          </button>
        </div>

        <PhaseActionsButton />
      </div>

      {/* End-round modal */}
      <div id="f12-modal" className={styles.modal}>
        <div className={styles.modalBox}>
          {/* Brasilino no modal — mood trocado via JS em showModal() */}
          <div className={styles.brasilino} id="f12-modal-brasilino">
            <div className={styles.brasilino__avatar}>🤖</div>
            <span className={styles.brasilino__name}>BRASILINO</span>
          </div>
          <div className={styles.modalTitle}>🚛 CAMINHÃO DESPACHADO!</div>
          <div id="f12-modal-stars" className="f12-modal-stars">★★★</div>
          <div id="f12-modal-lucro" className={styles.modalLucro}></div>
          <div id="f12-modal-pct" className={styles.modalPct}></div>
          <div id="f12-modal-pts" style={{ fontSize: "0.85em", color: "#ffd700", fontWeight: "bold", margin: "4px 0" }}></div>
          <div id="f12-modal-msgs" className={styles.modalMsgs}></div>
          <div className={styles.modalBtns}>
            <button id="f12-modal-retry" className={styles.retryBtn}>↩ TENTAR DE NOVO</button>
            <button id="f12-modal-next" className={styles.advanceBtn}>► PRÓXIMO ROUND</button>
            <button id="f12-modal-finish" className={styles.advanceBtn}>🏁 VOLTAR AO MAPA</button>
          </div>
        </div>
      </div>

      {/* Tooltip fixo — posicionado via JS com getBoundingClientRect */}
      <div id="f12-tt" className={styles.fixedTooltip}></div>

      {/* Drag ghost */}
      <div id="f12-ghost" className={styles.ghost}>
        <div id="f12-ghost-emoji" className={styles.ghostEmoji}></div>
        <div id="f12-ghost-name" className={styles.ghostName}></div>
      </div>
    </div>
  );
}
