import Link from "next/link";
import styles from "./page.module.css";
import Brasilino from "./components/Brasilino";

export default function HomePage() {
  return (
    <div className={styles.screen}>
      {/* ── Hero central ── */}
      <div className={styles.hero}>
        <h1 className={styles.gameTitle}>RoboBlocks</h1>
        <p className={styles.gameSub}>
          Resolva desafios, descubra algoritmos e vire mestre dos robôs!
        </p>

        <div className={styles.spinner}>
          <div className={styles.sq1} />
          <div className={styles.sq2} />
          <div className={styles.sq3} />
          <div className={styles.sq4} />
          <div className={styles.sq5} />
        </div>

        <Brasilino
          size="xlarge"
          mood="excited"
          fala="Oi! Eu sou o Brasilino! Vamos consertar a fábrica juntos? 🔧"
        />

        <Link href="/historia" className={styles.playBtn}>
          ▶ JOGAR
        </Link>
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
    </div>
  );
}
