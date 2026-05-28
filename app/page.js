import Link from "next/link";
import styles from "./page.module.css";

const modules = [
  {
    num: "MODULO 00",
    icon: "📋",
    title: "INTRODUCAO",
    desc: "Contexto, objetivos e como tudo se conecta. Comece aqui.",
    action: "► LER BRIEFING",
    href: "/introducao",
  },
  {
    num: "MODULO 01",
    icon: "🗺️",
    title: "MAPA DO JOGO",
    desc: "Navegue pelas missoes e acompanhe seu progresso.",
    action: "► VER MAPA",
    href: "/menu",
  },
  {
    num: "MODULO 02",
    icon: "⚙️",
    title: "FASES",
    desc: "Etapas em sequencia com desafios crescentes.",
    action: "► JOGAR AGORA",
    href: "/fases",
  },
  {
    num: "MODULO 03",
    icon: "📖",
    title: "MANUAL DO ENGENHEIRO",
    desc: "Consulte fases, conceitos e aprenda como jogar.",
    action: "► ABRIR MANUAL",
    href: "/manual",
  },
];

export default function HomePage() {
  return (
    <div className={styles.screen}>
      <div className={styles.titleBox}>
        <span className={styles.badge}>SISTEMA DE TREINAMENTO V1.0</span>
        <h1 className={styles.gameTitle}>
          FABRICA<br />DE<br />ALGORITMOS
        </h1>
        <p className={styles.gameSub}>
          APRENDA ALGORITMOS RESOLVENDO DESAFIOS REAIS NA FABRICA.
          <br />
          COORDENADAS • LOGICA • ESTRATEGIA
        </p>
        <p className={styles.pressStart}>▼ SELECIONE UMA OPCAO ▼</p>
      </div>

      <div className={styles.grid}>
        {modules.map((m) => (
          <Link key={m.num} href={m.href} className={styles.card}>
            <div className={styles.cardTop}>
              <span className={styles.cardIcon}>{m.icon}</span>
              <span className={styles.cardNum}>{m.num}</span>
            </div>
            <div className={styles.cardTitle}>{m.title}</div>
            <p className={styles.cardDesc}>{m.desc}</p>
            <span className={styles.cardAction}>{m.action}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
