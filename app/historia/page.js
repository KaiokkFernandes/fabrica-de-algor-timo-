"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import { playMenuMusic, startTyping, stopTyping, stopMusic } from "../lib/sfx";
import {
  getPlayerName,
  setPlayerName as saveName,
} from "../lib/gameScore";
import AnimacaoRoboblocks from "../components/animacao-roboblocks";

const SPEED = 38;
const NAME_QUESTION = "Olá! Antes de começar, como posso te chamar?";

function getSlides(nome) {
  return [
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
      fala: `Eu preciso da sua ajuda, ${nome}! Você consegue me ajudar a organizar tudo de volta?`,
      mood: "happy",
    },
  ];
}

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

  const [mounted, setMounted] = useState(false);

  // Step de nome
  const [nameStep, setNameStep] = useState(false);
  const [nameDisplayed, setNameDisplayed] = useState("");
  const [nameDone, setNameDone] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [playerName, setPlayerName] = useState("");

  // Slides
  const [slideIdx, setSlideIdx] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  // Inicialização: verifica nome salvo e inicia música
  useEffect(() => {
    playMenuMusic();
    const saved = getPlayerName();
    if (saved) {
      setPlayerName(saved);
      setNameStep(false);
    } else {
      setNameStep(true);
    }
    setMounted(true);
    return () => stopMusic();
  }, []);

  // Efeito de digitação da pergunta de nome
  useEffect(() => {
    if (!nameStep) return;
    setNameDisplayed("");
    setNameDone(false);
    let i = 0;
    startTyping();
    const id = setInterval(() => {
      i++;
      setNameDisplayed(NAME_QUESTION.slice(0, i));
      if (i >= NAME_QUESTION.length) {
        clearInterval(id);
        setNameDone(true);
        stopTyping();
      }
    }, SPEED);
    return () => {
      clearInterval(id);
      stopTyping();
    };
  }, [nameStep]);

  const slides = getSlides(playerName || "você");
  const slide = slides[slideIdx];
  const isLast = slideIdx === slides.length - 1;

  // Efeito de digitação dos slides
  useEffect(() => {
    if (nameStep || !mounted) return;
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
  }, [slideIdx, nameStep, mounted]);

  function handleNameSubmit() {
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    saveName(trimmed);
    setPlayerName(trimmed);
    setNameStep(false);
  }

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

  if (!mounted) return null;

  return (
    <div className={styles.screen} onClick={nameStep ? undefined : skipOrNext}>
      {/* ── Área da imagem ── */}
      <div className={styles.imageArea} style={nameStep ? { background: "var(--bg)" } : undefined}>
        {nameStep ? (
          <div className={styles.welcomeContent}>
            <AnimacaoRoboblocks showControls={false} autoPlay={true} />
          </div>
        ) : (
          <>
            <button
              type="button"
              className={styles.settingsBtn}
              onClick={(e) => {
                e.stopPropagation();
                window.dispatchEvent(new Event("roboblocks:audio-settings-open"));
              }}
            >
              ⚙️ Configurações
            </button>
            <div className={styles.dots}>
              {slides.map((_, i) => (
                <span
                  key={i}
                  className={`${styles.dot} ${i === slideIdx ? styles.dotActive : ""}`}
                />
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
                <span className={styles.imageLabel}>
                  [ADICIONAR IMAGEM DE {slide.imagemLabel}]
                </span>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Barra de diálogo ── */}
      <div className={styles.dialogBar} onClick={(e) => e.stopPropagation()}>
        <div className={styles.dialogSprite}>
          <div className={styles.face}>
            <img src="/brasilino/robo_idle.png" className={styles.faceBase} alt="" />
            <img
              src={`/brasilino/${nameStep ? "feliz_normal.png" : (MOOD_SPRITES[slide.mood] ?? "robo_idle.png")}`}
              className={styles.faceExpr}
              alt=""
            />
          </div>
          <span className={styles.spriteName}>BRASILINO</span>
        </div>

        <div className={styles.dialogContent}>
          {nameStep ? (
            <>
              <p className={styles.dialogText}>
                {nameDisplayed}
                {!nameDone && <span className={styles.cursor}>▌</span>}
              </p>
              {nameDone && (
                <div className={styles.nameForm}>
                  <input
                    className={styles.nameInput}
                    type="text"
                    placeholder="Digite seu nome..."
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && nameInput.trim()) handleNameSubmit();
                    }}
                    autoFocus
                    maxLength={20}
                  />
                  <button
                    className={styles.playBtn}
                    onClick={handleNameSubmit}
                    disabled={!nameInput.trim()}
                  >
                    VAMOS LÁ! →
                  </button>
                </div>
              )}
            </>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}
