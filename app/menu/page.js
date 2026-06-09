import Link from "next/link";
import styles from "./page.module.css";

const stages = [
  {
    code: "MODULO 00",
    name: "INTRODUCAO",
    desc: "Contexto e objetivos do treinamento.",
    href: "/introducao",
    stars: 3,
    locked: false,
    icon: "📋",
  },
  {
    code: "FASE 1.1",
    name: "ESTEIRA DE CAIXAS",
    desc: "Arraste caixas para as coordenadas corretas.",
    href: "/fases",
    stars: 0,
    locked: false,
    icon: "⚙️",
  },
  {
    code: "FASE 1.2",
    name: "DESPACHANTE DA FABRICA",
    desc: "Arraste as caixas certas para o caminhao e maximize o lucro!",
    href: "/fases/1.2",
    stars: 0,
    locked: false,
    icon: "🚛",
  },
  {
    code: "FASE 2.0",
    name: "EM BREVE",
    desc: "Novos desafios se aproximam.",
    href: "#",
    stars: 0,
    locked: true,
    icon: "🔒",
  },
];

function Stars({ count }) {
  return (
    <span className={styles.stars}>
      {[1, 2, 3].map((i) => (
        <span key={i} style={{ color: i <= count ? "#ffeb3b" : "#4a4a6a" }}>
          ★
        </span>
      ))}
    </span>
  );
}

export default function MenuPage() {
  return (
    <div className={styles.screen}>
      <div className={styles.header}>
        <p className={styles.eyebrow}>MAPA DO JOGO</p>
        <h1 className={styles.title}>SELECIONE A MISSAO</h1>
      </div>

      <div className={styles.list}>
        {stages.map((s) => (
          <Link
            key={s.code}
            href={s.href}
            className={`${styles.stage} ${s.locked ? styles.locked : ""}`}
          >
            <span className={styles.arrow}>{s.locked ? "🔒" : "►"}</span>
            <div className={styles.info}>
              <span className={styles.code}>{s.code}</span>
              <span className={styles.name}>{s.name}</span>
              <span className={styles.desc}>{s.desc}</span>
            </div>
            <Stars count={s.stars} />
          </Link>
        ))}
      </div>

      <div className={styles.hint}>
        COMPLETE AS FASES PARA GANHAR <span>★★★</span> E DESBLOQUEAR NOVOS NIVEIS
      </div>
    </div>
  );
}
