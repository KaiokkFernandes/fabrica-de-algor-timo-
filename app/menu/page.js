"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./page.module.css";
import Brasilino from "../components/Brasilino";
import { getTotalScore, getFullReport } from "../lib/gameScore";
import ReportDownload from "../components/ReportDownload";

const stages = [
  {
    code: "MODULO 00",
    name: "INTRODUCAO",
    desc: "Contexto e objetivos do treinamento.",
    href: "/introducao",
    locked: false,
    icon: "📋",
  },
  {
    code: "FASE 1",
    name: "ESTEIRA DE CAIXAS",
    desc: "Arraste caixas para as coordenadas corretas.",
    href: "/fases/1",
    locked: false,
    icon: "⚙️",
  },
  {
    code: "FASE 2",
    name: "DESPACHANTE DA FABRICA",
    desc: "Arraste as caixas certas para o caminhao e maximize o lucro!",
    href: "/fases/2",
    locked: false,
    icon: "🚛",
  },
  {
    code: "FASE 3",
    name: "LAVADOR INDUSTRIAL",
    desc: "Programe o Robozinho pra lavar todas as janelas do predio!",
    href: "/fases/3",
    locked: false,
    icon: "🤖",
  },
  {
    code: "FASE 2.0",
    name: "EM BREVE",
    desc: "Novos desafios se aproximam.",
    href: "#",
    locked: true,
    icon: "🔒",
  },
];

export default function MenuPage() {
  const [totalScore, setTotalScore] = useState(0);
  const [report, setReport] = useState(null);

  useEffect(() => {
    setTotalScore(getTotalScore());
    setReport(getFullReport());
  }, []);

  return (
    <div className={styles.screen}>
      <div className={styles.header}>
        <h1 className={styles.title}>Escolha sua aventura!</h1>
        <Brasilino
          size="small"
          mood="happy"
          fala="Qual aventura você escolhe hoje? Eu te ajudo! 😄"
        />
      </div>

      {/* Placar global */}
      <div className={styles.scoreBar}>
        <span className={styles.scoreLabel}>🏆 PONTUAÇÃO TOTAL</span>
        <span className={styles.scoreValue}>{totalScore} pts</span>
      </div>

      <div className={styles.list}>
        {stages.map((s) => (
          <Link
            key={s.code}
            href={s.href}
            className={`${styles.stage} ${s.locked ? styles.locked : ""}`}
          >
            <span className={styles.arrow}>{s.locked ? "🔒" : "►"}</span>
            <div className={styles.info}>
              <span className={styles.code}>{s.code}</span>
              <span className={styles.name}>{s.name}</span>
              <span className={styles.desc}>{s.desc}</span>
            </div>
            <span className={styles.stageIcon}>{s.icon}</span>
          </Link>
        ))}
      </div>

      <div className={styles.hint}>
        Complete as fases para ganhar <span>⭐⭐⭐</span> e desbloquear novas aventuras!
      </div>

      {/* Botão de relatório */}
      {report && <ReportDownload report={report} />}
    </div>
  );
}
