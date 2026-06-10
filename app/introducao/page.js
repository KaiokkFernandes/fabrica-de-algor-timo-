import Link from "next/link";
import styles from "./page.module.css";
import Brasilino from "../components/Brasilino";

const objectives = [
  "Descobrir como coordenadas funcionam — linha e coluna",
  "Usar cartas de dica com sabedoria para ganhar mais pontos",
  "Pensar antes de agir para não cometer erros",
  "Completar todas as aventuras e colecionar estrelas!",
];

export default function IntroducaoPage() {
  return (
    <div className={styles.screen}>
      <div className={styles.header}>
        <h1 className={styles.title}>Bem-vindo à Fábrica!</h1>
      </div>

      <div className={styles.dialogBox}>
        <div className={styles.dialogHead}>
          <Brasilino size="medium" mood="excited" />
          <span className={styles.speakerName}>Brasilino Computino</span>
        </div>
        <p className={styles.dialogText}>
          "Oi! Eu sou o Brasilino Computino, seu guia aqui na Fábrica de
          Algoritmos! Aqui você vai aprender a organizar caixas, despachar
          caminhões e resolver desafios usando lógica — tudo de um jeito
          divertido. Cada fase tem um mistério diferente pra você resolver.
          Topa o desafio?"
        </p>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>Sobre o jogo</div>
        <p className={styles.sectionText}>
          Na Fábrica de Algoritmos, cada fase é um desafio novo. Você vai
          usar lógica e raciocínio para resolver problemas reais — do tipo
          que os computadores resolvem todo dia. Quanto mais você pratica,
          mais fácil fica!
        </p>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>O que você vai aprender</div>
        <ul className={styles.objectives}>
          {objectives.map((obj, i) => (
            <li key={i} className={styles.objItem}>
              <span className={styles.objCheck}>✓</span>
              <span>{obj}</span>
            </li>
          ))}
        </ul>
      </div>

      <Link href="/menu" className={styles.startBtn}>
        Vamos lá! 🚀
      </Link>
    </div>
  );
}
