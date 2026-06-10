import styles from "./Brasilino.module.css";

/**
 * Brasilino Computino — mascote do jogo
 *
 * TODO (asset): substituir o emoji 🤖 pelo sprite PNG/SVG final.
 *      Spec do personagem: robô com monitor CRT na cabeça,
 *      macacão verde-amarelo, estilo pixel art Stardew Valley.
 *      Arquivo esperado: /public/brasilino-[happy|excited|sad].png
 *
 * Props:
 *   size    — "large" | "medium" | "small" | "mini"
 *   fala    — texto do balão; omitir ou string vazia para sem balão
 *   mood    — "happy" | "excited" | "sad" | "neutral"
 *   className — classe extra opcional no wrapper
 */
export default function Brasilino({
  size = "medium",
  fala = "",
  mood = "happy",
  className = "",
}) {
  return (
    <div
      className={`${styles.wrapper} ${styles[size]} ${className}`}
      data-mood={mood}
    >
      {/* ── avatar ────────────────────────────────────────────── */}
      <div className={styles.avatar}>
        {/* TODO: <img src={`/brasilino-${mood}.png`} alt="Brasilino" /> */}
        <span className={styles.sprite} aria-label="Brasilino Computino">
          🤖
        </span>
        <span className={styles.name}>BRASILINO</span>
      </div>

      {/* ── balão de fala ─────────────────────────────────────── */}
      {fala && (
        <div className={styles.balloon}>
          <p className={styles.balloonText}>{fala}</p>
        </div>
      )}
    </div>
  );
}
