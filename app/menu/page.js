"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./page.module.css";
import { playMenuMusic, stopMusic } from "../lib/sfx";
import { getRoundData, getTotalScore, getFullReport } from "../lib/gameScore";
import ReportDownload from "../components/ReportDownload";

/* ─────────────────────────────────────────────────────────────────────────────
   Dados estáticos dos rounds da Fase 1
───────────────────────────────────────────────────────────────────────────── */
const FASE1_ROUNDS = [
  { num: 1, name: "Aprendendo as Coordenadas", icon: "📦", maxPts: 200 },
  { num: 2, name: "Mais Prateleiras",           icon: "🏗️", maxPts: 400 },
  { num: 3, name: "Prateleira sem Etiquetas",   icon: "❓", maxPts: 500 },
  { num: 4, name: "Endereços por Extenso",       icon: "📝", maxPts: 600 },
  { num: 5, name: "Vire o Mestre!",              icon: "🎯", maxPts: 900 },
  { num: 6, name: "Mestre sem Etiquetas",        icon: "🕵️", maxPts: 900 },
  { num: 7, name: "Construa o Endereço",         icon: "🛠️", maxPts: 750 },
  { num: 8, name: "Mestre Supremo 5×5",          icon: "🏆", maxPts: 1200 },
];

/* ─────────────────────────────────────────────────────────────────────────────
   Sub-componentes
───────────────────────────────────────────────────────────────────────────── */

function StarRow({ count, size = "md" }) {
  return (
    <span className={`${styles.stars} ${styles[`stars_${size}`]}`}>
      {[1, 2, 3].map((i) => (
        <span key={i} className={i <= (count || 0) ? styles.starOn : styles.starOff}>★</span>
      ))}
    </span>
  );
}

function RoundCard({ roundMeta, roundData }) {
  const completed  = roundData?.completed ?? false;
  const stars      = roundData?.stars ?? 0;
  const pts        = roundData?.scoreEarned ?? 0;
  const attempts   = roundData?.attempts ?? 0;
  const isPerfect  = completed && pts >= roundMeta.maxPts;
  const notPlayed  = !completed && attempts === 0;
  const href       = `/fases/1?r=${roundMeta.num}`;

  return (
    <div className={`${styles.roundCard}
      ${completed  ? styles.roundDone    : ""}
      ${isPerfect  ? styles.roundPerfect : ""}
      ${notPlayed  ? styles.roundLocked  : ""}
    `}>
      {isPerfect && (
        <div className={styles.perfectBadge}>✨ PERFEITO!</div>
      )}
      {!completed && !notPlayed && (
        <div className={styles.inProgressBadge}>EM ANDAMENTO</div>
      )}

      <div className={styles.roundHeader}>
        <span className={styles.roundNum}>R{roundMeta.num}</span>
        <span className={styles.roundIcon}>{roundMeta.icon}</span>
      </div>

      <div className={styles.roundName}>{roundMeta.name}</div>

      <StarRow count={stars} size="lg" />

      {completed ? (
        <div className={styles.roundPts}>
          <span className={isPerfect ? styles.ptsMax : styles.ptsVal}>{pts}</span>
          <span className={styles.ptsSep}>/</span>
          <span className={styles.ptsMax2}>{roundMeta.maxPts} pts</span>
        </div>
      ) : notPlayed ? (
        <div className={styles.roundPtsEmpty}>— / {roundMeta.maxPts} pts</div>
      ) : (
        <div className={styles.roundPtsEmpty}>{pts} / {roundMeta.maxPts} pts</div>
      )}

      {notPlayed ? (
        <Link href={href} className={styles.roundBtnPlay}>▶ JOGAR</Link>
      ) : isPerfect ? (
        <Link href={href} className={styles.roundBtnReplay}>↩ Repetir</Link>
      ) : (
        <Link href={href} className={styles.roundBtnRetry}>🔄 Jogar Novamente</Link>
      )}
    </div>
  );
}

function PhaseSummaryCard({ num, icon, name, desc, href, color, roundCount, data }) {
  const completed = data ? Object.values(data.rounds || {}).filter(r => r.completed).length : 0;
  const totalPts  = data ? Object.values(data.rounds || {}).reduce((s, r) => s + (r.scoreEarned || 0), 0) : 0;
  const bestStars = data ? Math.max(0, ...Object.values(data.rounds || {}).map(r => r.stars || 0)) : 0;

  return (
    <Link href={href} className={styles.phaseCard} style={{ "--accent": color }}>
      <div className={styles.phaseCardLeft}>
        <span className={styles.phaseIcon}>{icon}</span>
        <div>
          <span className={styles.phaseNum}>{num}</span>
          <h2 className={styles.phaseName}>{name}</h2>
          <p className={styles.phaseDesc}>{desc}</p>
        </div>
      </div>
      <div className={styles.phaseCardRight}>
        <div className={styles.phaseStats}>
          <div className={styles.phaseStat}>
            <span className={styles.phaseStatVal}>{completed}/{roundCount}</span>
            <span className={styles.phaseStatLbl}>rounds</span>
          </div>
          <div className={styles.phaseStat}>
            <span className={styles.phaseStatVal}>{totalPts}</span>
            <span className={styles.phaseStatLbl}>pts</span>
          </div>
          <div className={styles.phaseStat}>
            <StarRow count={bestStars} size="sm" />
            <span className={styles.phaseStatLbl}>melhor</span>
          </div>
        </div>
        <span className={styles.phasePlay}>▶ JOGAR</span>
      </div>
    </Link>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Página principal — /menu
───────────────────────────────────────────────────────────────────────────── */
export default function MenuPage() {
  const [roundsData, setRoundsData]   = useState({});
  const [phase2Data, setPhase2Data]   = useState(null);
  const [phase3Data, setPhase3Data]   = useState(null);
  const [totalScore, setTotalScore]   = useState(0);
  const [report,     setReport]       = useState(null);

  useEffect(() => {
    playMenuMusic();
    return () => stopMusic();
  }, []);

  useEffect(() => {
    const rd = {};
    FASE1_ROUNDS.forEach(({ num }) => { rd[num] = getRoundData(1, num); });
    setRoundsData(rd);

    const rep = getFullReport();
    setPhase2Data(rep?.phases?.["2"] || null);
    setPhase3Data(rep?.phases?.["3"] || null);
    setTotalScore(getTotalScore());
    setReport(rep);
  }, []);

  const f1Completed = FASE1_ROUNDS.filter(r => roundsData[r.num]?.completed).length;
  const f1TotalPts  = FASE1_ROUNDS.reduce((s, r) => s + (roundsData[r.num]?.scoreEarned || 0), 0);
  const f1MaxPts    = FASE1_ROUNDS.reduce((s, r) => s + r.maxPts, 0);
  const f1Pct       = Math.round((f1TotalPts / f1MaxPts) * 100);

  return (
    <div className={styles.screen}>
      <Link href="/" className={styles.backBtn}>← Voltar</Link>

      <div className={styles.header}>
        <h1 className={styles.title}>🗺️ Mapa de Fases</h1>
        <div className={styles.totalScore}>
          🏆 <strong>{totalScore}</strong> pts acumulados
        </div>
      </div>

      {/* ══ FASE 1 — detalhe completo ══════════════════════════════════════ */}
      <section className={styles.phase1Section}>
        <div className={styles.phase1Header}>
          <div className={styles.phase1TitleRow}>
            <span className={styles.phase1Icon}>⚙️</span>
            <div>
              <div className={styles.phase1Tag}>FASE 1</div>
              <h2 className={styles.phase1Name}>Esteira de Caixas</h2>
            </div>
          </div>
          <div className={styles.phase1Progress}>
            <div className={styles.progressInfo}>
              <span>{f1Completed}/{FASE1_ROUNDS.length} rounds</span>
              <span>{f1TotalPts} / {f1MaxPts} pts</span>
              <span>{f1Pct}%</span>
            </div>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${Math.min(f1Pct, 100)}%` }}
              />
            </div>
          </div>
        </div>

        <div className={styles.roundsGrid}>
          {FASE1_ROUNDS.map((r) => (
            <RoundCard key={r.num} roundMeta={r} roundData={roundsData[r.num]} />
          ))}
        </div>
      </section>

      {/* ══ FASES 2 e 3 — cards de resumo ═════════════════════════════════ */}
      <div className={styles.phaseSummaryRow}>
        <PhaseSummaryCard
          num="FASE 2" icon="🚛"
          name="Despachante da Fábrica"
          desc="Escolha as caixas certas e maximize o lucro!"
          href="/fases/2" color="#5a9e30" roundCount={5} data={phase2Data}
        />
        <PhaseSummaryCard
          num="FASE 3" icon="🤖"
          name="Lavador Industrial"
          desc="Programe o Robozinho para lavar todas as janelas!"
          href="/fases/3" color="#7eb8f7" roundCount={5} data={phase3Data}
        />
      </div>

      {/* ══ Relatório ══════════════════════════════════════════════════════ */}
      {report && <ReportDownload report={report} />}
    </div>
  );
}
