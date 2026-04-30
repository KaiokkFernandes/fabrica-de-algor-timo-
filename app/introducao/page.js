import Link from "next/link";
import styles from "./page.module.css";

const objectives = [
  "Entender coordenadas em grade — linha e coluna",
  "Usar cartas de dica com estrategia para maximizar pontos",
  "Evitar erros: cada erro custa -30 pontos",
  "Completar todas as missoes com pontuacao maxima",
];

export default function IntroducaoPage() {
  return (
    <div className={styles.screen}>
      <div className={styles.header}>
        <p className={styles.eyebrow}>MODULO 00</p>
        <h1 className={styles.title}>BRIEFING DA MISSAO</h1>
      </div>

      <div className={styles.dialogBox}>
        <div className={styles.dialogHead}>
          <div className={styles.speakerAvatar}>🤖</div>
          <span className={styles.speakerName}>SISTEMA &gt; OPERADOR_01</span>
        </div>
        <p className={styles.dialogText}>
          "Recruta, bem-vindo a Fabrica de Algoritmos. Aqui voce vai aprender
          a base de qualquer sistema de busca e organizacao de dados:
          coordenadas. Cada caixa na esteira tem um destino exato na
          prateleira. Sua missao e encontrar esse destino usando logica,
          nao forca bruta. Bom treinamento."
        </p>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>◄ SOBRE O PROJETO ►</div>
        <p className={styles.sectionText}>
          A proposta e transformar ideias em algoritmos com clareza e
          estrutura. Cada fase e uma etapa do treinamento, com desafios
          crescentes e progresso visivel. Voce evolui resolvendo
          problemas reais de organizacao e logica.
        </p>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>◄ OBJETIVOS DA FASE 1 ►</div>
        <ul className={styles.objectives}>
          {objectives.map((obj, i) => (
            <li key={i} className={styles.objItem}>
              <span className={styles.objCheck}>✓</span>
              <span>{obj}</span>
            </li>
          ))}
        </ul>
      </div>

      <Link href="/fases" className={styles.startBtn}>
        ► INICIAR TREINAMENTO
      </Link>
    </div>
  );
}
