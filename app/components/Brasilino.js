"use client";
import { useState, useEffect } from "react";
import styles from "./Brasilino.module.css";

/**
 * Brasilino Computino — mascote do jogo
 * Props:
 *   size    — "xlarge" | "large" | "medium" | "small" | "mini"
 *   fala    — texto do balão; omitir ou string vazia para sem balão
 *   mood    — "happy" | "excited" | "sad" | "neutral"
 *   typing  — true (padrão) para animação de digitação, false para exibir tudo de uma vez
 *   speed   — ms por caractere (padrão 40)
 *   className — classe extra opcional no wrapper
 */
export default function Brasilino({
  size = "medium",
  fala = "",
  mood = "happy",
  typing = true,
  speed = 40,
  onDone = null,
  className = "",
}) {
  const [displayed, setDisplayed] = useState(typing ? "" : fala);
  const [done, setDone] = useState(!typing);

  useEffect(() => {
    if (!fala || !typing) {
      setDisplayed(fala);
      setDone(true);
      onDone?.();
      return;
    }
    setDisplayed("");
    setDone(false);
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplayed(fala.slice(0, i));
      if (i >= fala.length) {
        clearInterval(id);
        setDone(true);
        onDone?.();
      }
    }, speed);
    return () => clearInterval(id);
  }, [fala, typing, speed]);

  return (
    <div
      className={`${styles.wrapper} ${styles[size]} ${className}`}
      data-mood={mood}
    >
      <div className={styles.avatar}>
        <span className={styles.sprite} aria-label="Brasilino Computino">
          🤖
        </span>
        <span className={styles.name}>BRASILINO</span>
      </div>

      {fala && (
        <div className={styles.balloon}>
          <p className={styles.balloonText}>
            {displayed}
            {!done && <span className={styles.cursor}>▌</span>}
          </p>
        </div>
      )}
    </div>
  );
}
