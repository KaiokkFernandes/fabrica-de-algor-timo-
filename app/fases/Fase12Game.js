"use client";

import { useEffect } from "react";
import styles from "./Fase12Game.module.css";

export default function Fase12Game() {
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
        caminhoes: [{
          label: "🚛 Caminhão Frigorífico",
          aceita: ["refrigerado"],
          recusa: [],
          capacidade: 5,
          tempoLimite: null,
        }],
        caixaIds: [0, 1, 2, 3, 4],
        tutorialMsg: "🤖 Brasilino diz: Olá! Veja a ficha de cada caixa e arraste as que o caminhão aceita para os slots dele!",
      },
      {
        numero: 2,
        caminhoes: [{
          label: "🚛 Caminhão Refrigerado",
          aceita: ["refrigerado"],
          recusa: ["fragil"],
          capacidade: 5,
          tempoLimite: null,
        }],
        caixaIds: [0, 1, 2, 3, 4, 5, 6, 8, 9, 10],
      },
      {
        numero: 3,
        caminhoes: [{
          label: "🚛 Caminhão Misto",
          aceita: ["refrigerado", "congelado"],
          recusa: [],
          capacidade: 8,
          tempoLimite: null,
        }],
        // 15 caixas, 8 slots — player must choose most valuable
        caixaIds: [0, 1, 2, 3, 4, 5, 12, 13, 14, 15, 6, 7, 8, 9, 10],
      },
      {
        numero: 4,
        caminhoes: [{
          label: "🚛 Caminhão Expresso",
          aceita: ["refrigerado"],
          recusa: ["fragil", "pesado"],
          capacidade: 8,
          tempoLimite: 90,
        }],
        caixaIds: [0, 0, 0, 2, 2, 3, 3, 4, 1, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
      },
      {
        numero: 5,
        // Round 5: dois caminhões simultâneos
        caminhoes: [
          {
            label: "🚛 Caminhão Frio (sai em 30s)",
            aceita: ["refrigerado", "congelado"],
            recusa: ["fragil"],
            capacidade: 6,
            tempoLimite: 30,
          },
          {
            label: "🚚 Caminhão Seco (sai em 60s)",
            aceita: ["seco"],
            recusa: ["fragil"],
            capacidade: 6,
            tempoLimite: 60,
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
    let timerIntervals = [];
    let timesLeft = [];
    let dispatched = [];  // dispatched[t] = true se o caminhão t já foi despachado
    let roundScores = []; // pontuação de cada caminhão no round

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
      $("f12-fi").textContent = icon;
      const ft = $("f12-ft");
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
    function updateHUD() {
      const round = ROUNDS[roundIdx];
      const totalOccupied = cargo.reduce((s, slots) => s + slots.filter(Boolean).length, 0);
      const totalCap = round.caminhoes.reduce((s, t) => s + t.capacidade, 0);
      const lucroAtual = cargo.reduce((s, slots) => s + slots.filter(Boolean).reduce((a, b) => a + b.valor, 0), 0);
      $("f12-round").textContent = `ROUND ${round.numero}/5`;
      $("f12-slots").textContent = `${totalOccupied}/${totalCap}`;
      $("f12-lucro").textContent = `R$ ${lucroAtual}`;
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
          <div class="f12-truck-timer" id="f12-timer-${t}">--</div>
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
            slot.addEventListener("dragover", e => { e.preventDefault(); slot.classList.add("f12-slot-over"); });
            slot.addEventListener("dragleave", () => slot.classList.remove("f12-slot-over"));
            slot.addEventListener("drop", e => {
              e.preventDefault();
              slot.classList.remove("f12-slot-over");
              if (dragging && dragging.fromTruck === null) dropOnTruck(t, i, dragging.box);
            });
            slot.addEventListener("touchmove", e => e.preventDefault(), { passive: false });
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

      updateTimerDisplays();
    }

    function renderDepot() {
      const round = ROUNDS[roundIdx];
      const grid = $("f12-depot-grid");
      grid.innerHTML = "";

      depot.forEach(box => {
        // Check validity against any undispatched truck
        const anyValid = round.caminhoes.some((truck, t) => !dispatched[t] && isValid(box, truck));

        const el = document.createElement("div");
        el.className = "f12-box" + (anyValid ? " f12-box-valid" : "");
        el.id = "f12-box-" + box.uid;
        el.draggable = true;
        el.dataset.uid = box.uid;

        const attrs = getBoxAttrs(box);

        el.innerHTML = `
          <div class="f12-box-emoji">${box.emoji}</div>
          <div class="f12-box-name">${box.nomeProduto}</div>
          <div class="f12-box-val">R$${box.valor}</div>
        `;

        el.addEventListener("mouseenter", () => showBoxTooltip(box, el));
        el.addEventListener("mouseleave", hideBoxTooltip);

        // Desktop drag
        el.addEventListener("dragstart", () => {
          hideBoxTooltip();
          dragging = { box, fromTruck: null, fromSlot: null };
          el.classList.add("f12-dragging");
          showGhost(box);
        });
        el.addEventListener("dragend", () => {
          el.classList.remove("f12-dragging");
          hideGhost();
          dragging = null;
        });

        // Touch: show ghost on touchstart, drag on touchmove, drop on touchend
        el.addEventListener("touchstart", e => {
          hideBoxTooltip();
          dragging = { box, fromTruck: null, fromSlot: null };
          const t = e.touches[0];
          showGhost(box);
          const g = $("f12-ghost");
          g.style.left = t.clientX + "px";
          g.style.top = t.clientY + "px";
        }, { passive: true });

        el.addEventListener("touchmove", e => {
          const t = e.touches[0];
          const g = $("f12-ghost");
          g.style.left = t.clientX + "px";
          g.style.top = t.clientY + "px";
        }, { passive: false });

        el.addEventListener("touchend", e => {
          hideGhost();
          const touch = e.changedTouches[0];
          const tgt = document.elementFromPoint(touch.clientX, touch.clientY)
            ?.closest(".f12-slot:not(.f12-slot-filled)");
          if (tgt && dragging) {
            dropOnTruck(parseInt(tgt.dataset.truck), parseInt(tgt.dataset.slot), dragging.box);
          }
          dragging = null;
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
      stopTimer(truckIdx);
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

      // Save stars
      try {
        const key = `fase12_round${round.numero}_stars`;
        const prev = parseInt(localStorage.getItem(key) || "0");
        if (stars > prev) localStorage.setItem(key, String(stars));
        if (isLast && stars > 0) localStorage.setItem("fase12_completed", "1");
        // Best stars across all rounds for menu display
        const allStars = ROUNDS.map((r, i) =>
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
      $("f12-modal-msgs").innerHTML = msgs.map(m => `<div class="f12-modal-msg">${m}</div>`).join("");
      $("f12-modal-next").style.display = isLast ? "none" : "inline-block";
      $("f12-modal-finish").style.display = isLast ? "inline-block" : "none";

      modal.style.display = "flex";
    }

    function hideModal() { $("f12-modal").style.display = "none"; }

    // ── TIMER ────────────────────────────────────────────────────────────────
    function startTimer(truckIdx, seconds) {
      timesLeft[truckIdx] = seconds;
      updateTimerDisplays();
      timerIntervals[truckIdx] = setInterval(() => {
        timesLeft[truckIdx]--;
        updateTimerDisplays();
        if (timesLeft[truckIdx] <= 0) {
          stopTimer(truckIdx);
          setFeedback("⏰", "Tempo esgotado! O caminhão saiu!", "var(--red)");
          dispatchTruck(truckIdx);
        }
      }, 1000);
    }

    function stopTimer(truckIdx) {
      if (timerIntervals[truckIdx]) {
        clearInterval(timerIntervals[truckIdx]);
        timerIntervals[truckIdx] = null;
      }
    }

    function stopAllTimers() {
      timerIntervals.forEach((_, t) => stopTimer(t));
    }

    function updateTimerDisplays() {
      const round = ROUNDS[roundIdx];
      round.caminhoes.forEach((truck, t) => {
        const el = $(`f12-timer-${t}`);
        if (!el) return;
        if (timesLeft[t] == null || timesLeft[t] === undefined) {
          el.textContent = "--";
          el.className = "f12-truck-timer";
          return;
        }
        const m = Math.floor(timesLeft[t] / 60);
        const s = timesLeft[t] % 60;
        el.textContent = `⏱ ${m}:${String(s).padStart(2, "0")}`;
        el.className = "f12-truck-timer" + (timesLeft[t] <= 15 ? " f12-timer-urgent" : "");
      });
    }

    // ── INÍCIO DO ROUND ──────────────────────────────────────────────────────
    function startRound(idx) {
      roundIdx = idx;
      stopAllTimers();
      timerIntervals = [];
      timesLeft = [];
      dispatched = [];
      roundScores = [];

      const round = ROUNDS[idx];

      depot = round.caixaIds.map((pid, i) => ({
        ...PRODUTOS[pid % PRODUTOS.length],
        uid: `r${idx}-b${i}`,
      }));
      shuffle(depot);

      cargo = round.caminhoes.map(truck => new Array(truck.capacidade).fill(null));
      dispatched = round.caminhoes.map(() => false);
      timesLeft = round.caminhoes.map(t => t.tempoLimite);

      renderTruckPanels();
      renderDepot();
      updateHUD();

      round.caminhoes.forEach((truck, t) => {
        if (truck.tempoLimite) startTimer(t, truck.tempoLimite);
      });

      if (round.tutorialMsg) {
        setFeedback("🤖", round.tutorialMsg, "var(--yellow)");
      } else {
        setFeedback("🚛", "Carregue o caminhão com as caixas certas e maximize o lucro!", "");
      }
    }

    // ── EVENT LISTENERS ──────────────────────────────────────────────────────
    document.body.classList.add("game-mode");
    if (!$("f12-root")) return;

    const onDragOver = e => {
      const g = $("f12-ghost");
      g.style.left = e.clientX + "px";
      g.style.top = e.clientY + "px";
    };
    document.addEventListener("dragover", onDragOver);

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
    const finishHandler = () => { window.location.href = "/menu"; };
    finishBtn?.addEventListener("click", finishHandler);

    startRound(0);

    return () => {
      document.body.classList.remove("game-mode");
      document.removeEventListener("dragover", onDragOver);
      stopAllTimers();
      dispatchBtn?.removeEventListener("click", dispatchHandler);
      resetBtn?.removeEventListener("click", resetHandler);
      retryBtn?.removeEventListener("click", retryHandler);
      nextBtn?.removeEventListener("click", nextHandler);
      finishBtn?.removeEventListener("click", finishHandler);
    };
  }, []);

  return (
    <div id="f12-root" className={styles.root}>
      <div className={styles.gameTitle}>FABRICA DE ALGORITMOS</div>
      <div className={styles.gameSubtitle}>
        Fase 1.2 — Despachante da Fábrica
      </div>

      <div className={styles.wrap}>
        {/* HUD */}
        <div className={styles.hud}>
          <div>
            <div className={styles.hudLabel}>ROUND</div>
            <div className={styles.hudVal} id="f12-round">1/5</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div className={styles.hudLabel}>ESPAÇOS</div>
            <div className={styles.hudVal} id="f12-slots">0/5</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div className={styles.hudLabel}>LUCRO ATUAL</div>
            <div className={styles.hudVal} id="f12-lucro">R$ 0</div>
          </div>
        </div>

        {/* Main: trucks + depot */}
        <div className={styles.main}>
          <div id="f12-trucks-container" className={styles.trucksContainer}></div>

          <div className={styles.depotPanel}>
            <div className={styles.depotTitle}>
              📦 Depósito — passe o mouse sobre cada caixa para ver os detalhes
            </div>
            <div id="f12-depot-grid" className={styles.depotGrid}></div>
          </div>
        </div>

        {/* Action buttons */}
        <div className={styles.actions}>
          <button id="f12-reset" className={styles.resetBtn}>🔄 RESETAR</button>
          <button id="f12-dispatch" className={styles.dispatchBtn}>
            🚛 DESPACHAR CAMINHÃO
          </button>
        </div>

        {/* ── Brasilino: barra de feedback ── */}
        <div className={styles.feedback}>
          {/* TODO sprite */}
          <div className={styles.brasilino}>
            <div className={styles.brasilino__avatar}>🤖</div>
            <span className={styles.brasilino__name}>BRASILINO</span>
          </div>
          <div className={styles.brasilino__balloon}>
            <span id="f12-fi" className={styles.brasilino__icon}>🚛</span>&nbsp;
            <span id="f12-ft">Carregue o caminhão com as caixas certas!</span>
          </div>
        </div>
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
