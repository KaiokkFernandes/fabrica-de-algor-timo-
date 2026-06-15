"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

const SPEED = 38;

const slides = [
  {
    imagemLabel: "BRASILINO CHEGANDO DAS FÉRIAS COM MALA E CHAPÉU DE PRAIA",
    fala: "UFA! Que férias incríveis! Finalmente de volta pra fábrica! 🏖️",
    mood: "excited",
  },
  {
    imagemLabel: "FÁBRICA EM BAGUNÇA TOTAL — CAIXAS ESPALHADAS, SUJEIRA",
    fala: "Espera... o que aconteceu aqui?! A fábrica tá uma BAGUNÇA TOTAL! 😱",
    mood: "sad",
  },
  {
    imagemLabel: "CAIXAS FORA DO LUGAR, CAMINHÕES PARADOS, JANELAS SUJAS",
    fala: "As caixas estão tudo fora do lugar... os caminhões parados sem saber o que carregar... e nem me fala das janelas do prédio!",
    mood: "sad",
  },
  {
    imagemLabel: "BRASILINO COM EXPRESSÃO ESPERANÇOSA OLHANDO PARA O JOGADOR",
    fala: "Eu preciso da sua ajuda! Você consegue me ajudar a organizar tudo de volta?",
    mood: "happy",
  },
];

const MOODS = {
  excited: "😄",
  sad: "😰",
  happy: "🤖",
};

export default function HistoriaPage() {
  const router = useRouter();
  const [slideIdx, setSlideIdx] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  const slide = slides[slideIdx];
  const isLast = slideIdx === slides.length - 1;

  useEffect(() => {
    setDisplayed("");
    setDone(false);
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplayed(slide.fala.slice(0, i));
      if (i >= slide.fala.length) {
        clearInterval(id);
        setDone(true);
      }
    }, SPEED);
    return () => clearInterval(id);
  }, [slideIdx]);

  function skipOrNext() {
    if (!done) {
      setDisplayed(slide.fala);
      setDone(true);
      return;
    }
    if (isLast) {
      router.push("/fases");
    } else {
      setSlideIdx((i) => i + 1);
    }
  }

  return (
    <div className={styles.screen} onClick={skipOrNext}>
      {/* ── Área da imagem ── */}
      <div className={styles.imageArea}>
        <div className={styles.dots}>
          {slides.map((_, i) => (
            <span key={i} className={`${styles.dot} ${i === slideIdx ? styles.dotActive : ""}`} />
          ))}
        </div>
        <div className={styles.imagePlaceholder}>
          <span className={styles.imageLabel}>[ADICIONAR IMAGEM DE {slide.imagemLabel}]</span>
        </div>
      </div>

      {/* ── Barra de diálogo ── */}
      <div className={styles.dialogBar} onClick={(e) => e.stopPropagation()}>
        <div className={styles.dialogSprite}>
          <span className={styles.spriteEmoji}>{MOODS[slide.mood]}</span>
          <span className={styles.spriteName}>BRASILINO</span>
        </div>

        <div className={styles.dialogContent}>
          <p className={styles.dialogText}>
            {displayed}
            {!done && <span className={styles.cursor}>▌</span>}
          </p>

          <div className={styles.actions}>
            {!done && (
              <button className={styles.skipBtn} onClick={skipOrNext}>
                clique para avançar ▸▸
              </button>
            )}
            {done && !isLast && (
              <button className={styles.nextBtn} onClick={skipOrNext}>
                Próximo →
              </button>
            )}
            {done && isLast && (
              <>
                <button className={styles.playBtn} onClick={() => router.push("/fases")}>
                  ✅ CLARO, VAMOS LÁ!
                </button>
                <button className={styles.backBtn} onClick={() => router.push("/")}>
                  Voltar ao início
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
