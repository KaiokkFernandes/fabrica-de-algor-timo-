"use client";
import { useState, useEffect } from "react";
import styles from "./Brasilino.module.css";
import { startTyping, stopTyping } from "../lib/sfx";

const MOOD_SPRITES = {
  happy:       "feliz_normal.png",
  excited:     "feliz_gatinho.png",
  sad:         "robo_triste.png",
  neutral:     "robo_neutral.png",
  preocupado:  "robo_preocupado.png",
  brabo:       "robo_brabo.png",
  idle:        "robo_idle.png",
};

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
    startTyping();
    const id = setInterval(() => {
      i++;
      setDisplayed(fala.slice(0, i));
      if (i >= fala.length) {
        clearInterval(id);
        setDone(true);
        stopTyping();
        onDone?.();
      }
    }, speed);
    return () => {
      clearInterval(id);
      stopTyping();
    };
  }, [fala, typing, speed]);

  const exprFile = MOOD_SPRITES[mood] ?? MOOD_SPRITES.idle;

  return (
    <div
      className={`${styles.wrapper} ${styles[size]} ${className}`}
      data-mood={mood}
    >
      <div className={styles.avatarCol}>
        <div className={styles.avatar}>
          <div className={styles.face} aria-label="Brasilino Computino">
            <img src="/brasilino/robo_idle.png" className={styles.faceBase} alt="" />
            {exprFile !== "robo_idle.png" && (
              <img src={`/brasilino/${exprFile}`} className={styles.faceExpr} alt="" />
            )}
          </div>
        </div>
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
