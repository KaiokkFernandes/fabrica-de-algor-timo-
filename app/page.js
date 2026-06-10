import Link from "next/link";
import styles from "./page.module.css";

const modules = [
  {
    num: "",
    icon: "📋",
    title: "INTRODUÇÃO",
    desc: "Descubra o que você vai aprender na fábrica!",
    action: "Quero conhecer →",
    href: "/introducao",
  },
  {
    num: "",
    icon: "🗺️",
    title: "MAPA DE FASES",
    desc: "Escolha uma aventura e jogue!",
    action: "Escolher fase →",
    href: "/menu",
  },
  {
    num: "",
    icon: "⚙️",
    title: "JOGAR",
    desc: "Vai direto para o jogo!",
    action: "Jogar agora →",
    href: "/fases",
  },
  {
    num: "",
    icon: "📖",
    title: "AJUDA",
    desc: "Precisa de ajuda? É aqui!",
    action: "Ver dicas →",
    href: "/manual",
  },
];

export default function HomePage() {
  return (
    <div className={styles.screen}>
      <div className={styles.titleBox}>
        <h1 className={styles.gameTitle}>
          FÁBRICA<br />DE<br />ALGORITMOS
        </h1>
        <p className={styles.gameSub}>
          Resolva desafios, descubra algoritmos e vire mestre da fábrica!
        </p>
        <p className={styles.pressStart}>▼ O QUE VAMOS FAZER? ▼</p>
      </div>

      <div className={styles.grid}>
        {modules.map((m) => (
          <Link key={m.title} href={m.href} className={styles.card}>
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
