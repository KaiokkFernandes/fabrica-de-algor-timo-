"use client";
import Link from "next/link";
import Brasilino from "../components/Brasilino";

const MOODS = [
  { mood: "idle",       label: "idle (base)",    fala: "..." },
  { mood: "neutral",    label: "neutral",         fala: "Ok." },
  { mood: "happy",      label: "happy (feliz_normal)", fala: "Que bom! 😊" },
  { mood: "excited",    label: "excited (feliz_gatinho)", fala: "UFA! Que férias incríveis! 🏖️" },
  { mood: "sad",        label: "sad (robo_triste)",  fala: "Que tristeza..." },
  { mood: "preocupado", label: "preocupado",      fala: "Hm... não sei não..." },
  { mood: "brabo",      label: "brabo",           fala: "Isso não tá certo!" },
];

const SIZES = ["mini", "small", "medium", "large", "xlarge"];

export default function BrasilinoTest() {
  return (
    <div style={{ background: "#0d1f0a", minHeight: "100vh", padding: "40px", fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 40 }}>
        <Link href="/" style={{ color: "#aaa", textDecoration: "none", fontSize: 14 }}>← Voltar</Link>
        <h1 style={{ color: "#f0c040", margin: 0, fontSize: 22, fontWeight: 700 }}>Brasilino — Preview de rostos</h1>
      </div>

      {/* Grid de expressões em tamanho medium */}
      <section style={{ marginBottom: 60 }}>
        <h2 style={{ color: "#7eb8f7", fontSize: 14, letterSpacing: 2, marginBottom: 20 }}>EXPRESSÕES (medium)</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 32, alignItems: "flex-start" }}>
          {MOODS.map(({ mood, label, fala }) => (
            <div key={mood} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
              <Brasilino size="medium" mood={mood} fala={fala} typing={false} />
              <span style={{ color: "#aaa", fontSize: 11, fontFamily: "monospace" }}>{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Tamanhos para mood "excited" */}
      <section style={{ marginBottom: 60 }}>
        <h2 style={{ color: "#7eb8f7", fontSize: 14, letterSpacing: 2, marginBottom: 20 }}>TAMANHOS (excited)</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 32, alignItems: "flex-end" }}>
          {SIZES.map((size) => (
            <div key={size} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
              <Brasilino size={size} mood="excited" fala={size !== "mini" ? "Oi!" : ""} typing={false} />
              <span style={{ color: "#aaa", fontSize: 11, fontFamily: "monospace" }}>{size}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Sprites diretas — sem balão */}
      <section>
        <h2 style={{ color: "#7eb8f7", fontSize: 14, letterSpacing: 2, marginBottom: 20 }}>SPRITES PURAS (sem balão, large)</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 32, alignItems: "flex-start" }}>
          {MOODS.map(({ mood, label }) => (
            <div key={mood} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
              <Brasilino size="large" mood={mood} fala="" typing={false} />
              <span style={{ color: "#aaa", fontSize: 11, fontFamily: "monospace" }}>{label}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
