import Link from "next/link";
import styles from "./page.module.css";

const fases = [
  {
    num: "FASE 1",
    icon: "⚙️",
    name: "Esteira de Caixas",
    desc: "Arraste as caixas para as coordenadas corretas na prateleira.",
    href: "/fases/1",
    color: "#f0c040",
  },
  {
    num: "FASE 2",
    icon: "🚛",
    name: "Despachante da Fábrica",
    desc: "Escolha as caixas certas para cada caminhão e maximize o lucro!",
    href: "/fases/2",
    color: "#5a9e30",
  },
  {
    num: "FASE 3",
    icon: "🤖",
    name: "Lavador Industrial",
    desc: "Programe o Robozinho para lavar todas as janelas do prédio!",
    href: "/fases/3",
    color: "#7eb8f7",
  },
];

export default function FaseSelectorPage() {
  return (
    <div className={styles.screen}>
      <Link href="/" className={styles.backBtn}>← Voltar</Link>

      <div className={styles.header}>
        <h1 className={styles.title}>Selecione a Fase</h1>
        <p className={styles.sub}>Escolha por onde quer começar!</p>
      </div>

      <div className={styles.grid}>
        {fases.map((f, i) => (
          <Link key={f.num} href={f.href} className={styles.card} style={{ "--accent": f.color, "--i": i }}>
            <span className={styles.cardIcon}>{f.icon}</span>
            <span className={styles.cardNum}>{f.num}</span>
            <h2 className={styles.cardName}>{f.name}</h2>
            <p className={styles.cardDesc}>{f.desc}</p>
            <span className={styles.cardPlay}>▶ JOGAR</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
