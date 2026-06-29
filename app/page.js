'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import styles from "./page.module.css";
import Brasilino from "./components/Brasilino";
import AnimacaoRoboblocks from "./components/animacao-roboblocks";

export default function HomePage() {
  const [introActive, setIntroActive] = useState(true);
  const [savedGame, setSavedGame] = useState(null);

  useEffect(() => {
    // A animação roda por 2.8 segundos como intro antes da transição
    const timer = setTimeout(() => {
      setIntroActive(false);
    }, 2800);

    // Recuperar fase e round salvos na cache
    try {
      const phase = localStorage.getItem("current_phase");
      const round = localStorage.getItem("current_round");
      if (phase && round) {
        setSavedGame({ phase, round, url: `/fases/${phase}` });
      }
    } catch (e) {
      // localStorage pode estar desativado
    }

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`${styles.screen} ${introActive ? styles.introMode : styles.normalMode}`}>
      {/* ── Hero central ── */}
      <div className={styles.hero}>
        <div className={styles.animationContainer}>
          <AnimacaoRoboblocks showControls={false} autoPlay={true} />
        </div>

        <div className={styles.contentBody}>
          <p className={styles.gameSub}>
            Resolva desafios, descubra algoritmos e vire mestre dos robôs!
          </p>

          <Brasilino
            size="large"
            mood="excited"
            fala="Oi! Eu sou o Brasilino! Vamos consertar a fábrica juntos? 🔧"
          />

          <Link href="/historia" className={styles.playBtn}>
            ▶ JOGAR
          </Link>
        </div>
      </div>

      {/* ── Links secundários — canto inferior direito ── */}
      <div className={styles.sideLinks}>
        <Link href="/introducao" className={styles.sideLink}>
          📋 Introdução
        </Link>
        <Link href="/menu" className={styles.sideLink}>
          🗺️ Mapa de fases
        </Link>
        <Link href="/manual" className={styles.sideLink}>
          📖 Ajuda
        </Link>
      </div>

      {/* ── Botão de continuar jogo — canto inferior esquerdo ── */}
      {!introActive && savedGame && (
        <div className={styles.resumeContainer}>
          <Link href={savedGame.url} className={styles.resumeBtn}>
            🔄 Voltar para Fase {savedGame.phase} Round {savedGame.round}
          </Link>
        </div>
      )}
    </div>
  );
}
