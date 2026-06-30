"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import { playMenuMusic, startTyping, stopTyping, stopMusic } from "../lib/sfx";
const SPEED = 38;

const slides = [
  {
    imagem: "/historia/chegando_aeroporto.webp",
    imagemLabel: "BRASILINO CHEGANDO DAS FÉRIAS COM MALA E CHAPÉU DE PRAIA",
    fala: "UFA! Que férias incríveis! Finalmente de volta pra fábrica! 🏖️",
    mood: "excited",
  },
  {
    imagem: "/historia/bagunca.webp",
    imagemLabel: "FÁBRICA EM BAGUNÇA TOTAL — CAIXAS ESPALHADAS, SUJEIRA",
    fala: "As caixas estão tudo fora do lugar... os caminhões parados sem saber o que carregar... e nem me fala das janelas do prédio!",
    mood: "sad",
  },
  {
    imagem: "/historia/chegando_viagem.webp",
    imagemLabel: "CAIXAS FORA DO LUGAR, CAMINHÕES PARADOS, JANELAS SUJAS",
    fala: "Espera... o que aconteceu aqui?! A fábrica tá uma BAGUNÇA TOTAL! 😱",
    mood: "preocupado",
  },
  {
    imagem: "/historia/esperancoso.webp",
    imagemLabel: "BRASILINO COM EXPRESSÃO ESPERANÇOSA OLHANDO PARA O JOGADOR",
    fala: "Eu preciso da sua ajuda! Você consegue me ajudar a organizar tudo de volta?",
    mood: "happy",
  },
];

const MOOD_SPRITES = {
  excited:    "feliz_gatinho.png",
  sad:        "robo_triste.png",
  happy:      "feliz_normal.png",
  neutral:    "robo_neutral.png",
  preocupado: "robo_preocupado.png",
  brabo:      "robo_brabo.png",
};

export default function HistoriaPage() {
  const router = useRouter();
  const [slideIdx, setSlideIdx] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  const slide = slides[slideIdx];
  const isLast = slideIdx === slides.length - 1;

  useEffect(() => {
    playMenuMusic();
    return () => stopMusic();
  }, []);

  useEffect(() => {
    setDisplayed("");
    setDone(false);
    let i = 0;
    startTyping();
    const id = setInterval(() => {
      i++;
      setDisplayed(slide.fala.slice(0, i));
      if (i >= slide.fala.length) {
        clearInterval(id);
        setDone(true);
        stopTyping();
      }
    }, SPEED);
    return () => {
      clearInterval(id);
      stopTyping();
    };
  }, [slideIdx]);

  function skipOrNext() {
    if (!done) {
      setDisplayed(slide.fala);
      setDone(true);
      stopTyping();
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
        {slide.imagem ? (
          <img
            key={slide.imagem}
            src={slide.imagem}
            alt={slide.imagemLabel}
            className={styles.image}
          />
        ) : (
          <div className={styles.imagePlaceholder}>
            <span className={styles.imageLabel}>[ADICIONAR IMAGEM DE {slide.imagemLabel}]</span>
          </div>
        )}
      </div>

      {/* ── Barra de diálogo ── */}
      <div className={styles.dialogBar} onClick={(e) => e.stopPropagation()}>
        <div className={styles.dialogSprite}>
          <div className={styles.face}>
            <img src="/brasilino/robo_idle.png" className={styles.faceBase} alt="" />
            <img src={`/brasilino/${MOOD_SPRITES[slide.mood] ?? "robo_idle.png"}`} className={styles.faceExpr} alt="" />
          </div>
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
