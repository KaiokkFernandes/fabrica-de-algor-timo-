"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./page.module.css";

const FASES = [
  {
    id: "1.1",
    nome: "ESTEIRA DE CAIXAS",
    dificuldade: "INICIANTE",
    dificuldadeNum: 1,
    estrelas: "★☆☆",
    icone: "📦",
    conceitos: ["Coordenadas", "Matrizes"],
    desc: "Cada caixa que chega na esteira tem um endereço na prateleira. Você precisa encontrar esse endereço usando as coordenadas (linha e coluna) e arrastar a caixa para o lugar certo!",
    objetivo: "Colocar todas as 6 caixas nos lugares certos sem errar muito.",
    dicas: [
      "Leia a coordenada da caixa ANTES de arrastar",
      "A letra indica a linha (A, B ou C)",
      "O número indica a coluna (1, 2, 3 ou 4)",
      "Use as cartas de dica quando ficar com dúvida",
      "Cada erro tira 30 pontos — pense antes de agir!",
    ],
    href: "/fases",
  },
  {
    id: "1.2",
    nome: "Despachante da Fábrica",
    dificuldade: "INTERMEDIÁRIO",
    dificuldadeNum: 2,
    estrelas: "★★☆",
    icone: "🚛",
    conceitos: ["Atributos", "Filtros", "Registros"],
    desc: "Chegaram 20 caixas no depósito e um caminhão esperando ser carregado! Cada caminhão aceita só certos tipos de produto. Você precisa ler a ficha de cada caixa e escolher as certas pra maximizar o lucro.",
    objetivo: "Carregar o caminhão com as caixas certas e ganhar o máximo de dinheiro possível.",
    dicas: [
      "Leia os critérios do caminhão antes de começar",
      "Passe o mouse sobre as caixas para ver a ficha completa",
      "Caixas com borda verde são as que o caminhão aceita",
      "Se colocar caixa errada, clique nela no caminhão pra devolver",
      "Nos rounds avançados, escolha as caixas mais valiosas!",
    ],
    href: "/fases/1.2",
    bloqueada: false,
  },
  {
    id: "2.1",
    nome: "EM BREVE",
    dificuldade: "AVANCADO",
    dificuldadeNum: 3,
    estrelas: "★★★",
    icone: "🔒",
    conceitos: ["Algoritmos", "Lógica", "Matrizes"],
    desc: "Uma nova fase está chegando! Continue treinando para desbloquear.",
    objetivo: "",
    dicas: [],
    bloqueada: true,
  },
];

const CONCEITOS = [
  {
    nome: "Coordenadas",
    icone: "📍",
    fases: ["1.1"],
    desc: "Coordenadas são como um endereço dentro de uma grade (tabela). Usamos uma LETRA para a linha e um NÚMERO para a coluna. Assim, cada célula tem um endereço único — igual a um mapa!",
    exemplo: {
      titulo: "EXEMPLO PRÁTICO",
      texto:
        'Na fase 1.1, a prateleira tem linhas A, B e C, e colunas 1, 2, 3 e 4. Se uma caixa tem coordenada "B3", ela fica na linha B, coluna 3.',
    },
  },
  {
    nome: "Matrizes",
    icone: "🗂️",
    fases: ["1.1", "1.2"],
    desc: "Uma matriz é uma tabela organizada em linhas e colunas. Cada posição dentro dela tem um endereço chamado coordenada. Os computadores usam matrizes para guardar e organizar informações — como uma planilha gigante!",
    exemplo: {
      titulo: "EXEMPLO PRÁTICO",
      texto:
        "A prateleira da fábrica é uma matriz 3×4: 3 linhas (A, B, C) e 4 colunas (1, 2, 3, 4), com 12 posições no total.",
    },
  },
  {
    nome: "Algoritmo",
    icone: "⚙️",
    fases: ["1.1", "1.2", "2.1"],
    desc: "Um algoritmo é uma lista de passos em ordem para resolver um problema. Assim como uma receita de bolo — você segue os passos um por um até chegar no resultado. Todo programa de computador usa algoritmos!",
    exemplo: {
      titulo: "EXEMPLO PRÁTICO",
      texto:
        "Para colocar uma caixa no lugar certo: 1) Leia a coordenada. 2) Ache a linha. 3) Ache a coluna. 4) Arraste a caixa. Esses 4 passos formam um algoritmo!",
    },
  },
  {
    nome: "Lógica",
    icone: "🧠",
    fases: ["1.1", "1.2", "2.1"],
    desc: "Lógica é a capacidade de pensar de forma ordenada e tomar decisões corretas com base nas informações que você tem. É a habilidade mais importante de quem programa!",
    exemplo: {
      titulo: "EXEMPLO PRÁTICO",
      texto:
        'Se uma caixa tem coordenada "A1" e você sabe que a linha A é a primeira e a coluna 1 é a mais à esquerda, então logicamente a caixa vai para o canto superior esquerdo!',
    },
  },
];

const COMO_JOGAR = [
  {
    passo: "01",
    icone: "👀",
    titulo: "LEIA A COORDENADA",
    texto: "Cada caixa na esteira tem uma coordenada: uma letra (linha) e um número (coluna). Leia ela primeiro!",
  },
  {
    passo: "02",
    icone: "🗺️",
    titulo: "ENCONTRE O LUGAR",
    texto: "Na prateleira, procure a linha com aquela letra e a coluna com aquele número. O cruzamento é o destino!",
  },
  {
    passo: "03",
    icone: "🖱️",
    titulo: "ARRASTE A CAIXA",
    texto: "Arraste (ou toque no celular) a caixa da esteira até a célula certa na prateleira.",
  },
  {
    passo: "04",
    icone: "🃏",
    titulo: "USE AS CARTAS",
    texto: "Se ficar em dúvida, use as cartas de dica! Você tem 3 por rodada. A carta de Mapa Completo custa -50 pts.",
  },
  {
    passo: "05",
    icone: "🏆",
    titulo: "GANHE ESTRELAS",
    texto: "Termine a rodada com 550+ pts para 3 estrelas, 350+ para 2 estrelas. Erros custam -30 pts cada.",
  },
];

export default function ManualPage() {
  const [aba, setAba] = useState("fases");
  const [faseSelecionada, setFaseSelecionada] = useState(null);
  const [conceitoSelecionado, setConceitoSelecionado] = useState(null);

  return (
    <div className={styles.screen}>
      <div className={styles.header}>
        <h1 className={styles.title}>Ajuda e Dicas</h1>
        <p className={styles.subtitle}>
          Tudo que você precisa saber pra arrebentar na fábrica! 💪
        </p>
      </div>

      <div className={styles.tabBar}>
        <button
          className={`${styles.tab} ${aba === "fases" ? styles.tabActive : ""}`}
          onClick={() => { setAba("fases"); setFaseSelecionada(null); }}
        >
          🗺️ FASES
        </button>
        <button
          className={`${styles.tab} ${aba === "conceitos" ? styles.tabActive : ""}`}
          onClick={() => { setAba("conceitos"); setConceitoSelecionado(null); }}
        >
          📚 CONCEITOS
        </button>
        <button
          className={`${styles.tab} ${aba === "como" ? styles.tabActive : ""}`}
          onClick={() => setAba("como")}
        >
          ❓ COMO JOGAR
        </button>
        <button className={`${styles.tab} ${styles.tabLocked}`} disabled>
          🏅 CONQUISTAS
          <span className={styles.lockBadge}>EM BREVE</span>
        </button>
      </div>

      {aba === "fases" && (
        <div className={styles.content}>
          {!faseSelecionada ? (
            <>
              <p className={styles.contentDesc}>
                Clique em uma fase para ver os detalhes, os conceitos e as dicas!
              </p>
              <div className={styles.faseList}>
                {FASES.map((fase) => (
                  <button
                    key={fase.id}
                    className={`${styles.faseCard} ${fase.bloqueada ? styles.faseBloqueada : ""}`}
                    onClick={() => !fase.bloqueada && setFaseSelecionada(fase)}
                    disabled={fase.bloqueada}
                  >
                    <span className={styles.faseIcone}>{fase.icone}</span>
                    <div className={styles.faseInfo}>
                      <div className={styles.faseId}>FASE {fase.id}</div>
                      <div className={styles.faseNome}>{fase.nome}</div>
                      <div className={styles.faseMeta}>
                        <span className={styles.faseEstrelas}>{fase.estrelas}</span>
                        <span className={`${styles.faseDificuldade} ${styles["dif" + fase.dificuldadeNum]}`}>
                          {fase.dificuldade}
                        </span>
                      </div>
                    </div>
                    {!fase.bloqueada && <span className={styles.faseArrow}>►</span>}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className={styles.faseDetail}>
              <button className={styles.backBtn} onClick={() => setFaseSelecionada(null)}>
                ◄ VOLTAR
              </button>

              <div className={styles.detailHeader}>
                <span className={styles.detailIcone}>{faseSelecionada.icone}</span>
                <div>
                  <div className={styles.detailId}>FASE {faseSelecionada.id}</div>
                  <div className={styles.detailNome}>{faseSelecionada.nome}</div>
                  <div className={styles.faseMeta}>
                    <span className={styles.faseEstrelas}>{faseSelecionada.estrelas}</span>
                    <span className={`${styles.faseDificuldade} ${styles["dif" + faseSelecionada.dificuldadeNum]}`}>
                      {faseSelecionada.dificuldade}
                    </span>
                  </div>
                </div>
              </div>

              <div className={styles.detailSection}>
                <div className={styles.sectionLabel}>► O QUE É?</div>
                <p className={styles.detailText}>{faseSelecionada.desc}</p>
              </div>

              {faseSelecionada.objetivo && (
                <div className={styles.detailSection}>
                  <div className={styles.sectionLabel}>► OBJETIVO</div>
                  <p className={styles.detailText}>{faseSelecionada.objetivo}</p>
                </div>
              )}

              {faseSelecionada.conceitos.length > 0 && (
                <div className={styles.detailSection}>
                  <div className={styles.sectionLabel}>► CONCEITOS DESTA FASE</div>
                  <div className={styles.tagList}>
                    {faseSelecionada.conceitos.map((c) => (
                      <span key={c} className={styles.tag}>{c}</span>
                    ))}
                  </div>
                </div>
              )}

              {faseSelecionada.dicas.length > 0 && (
                <div className={styles.detailSection}>
                  <div className={styles.sectionLabel}>► DICAS DO ENGENHEIRO</div>
                  <ul className={styles.dicaList}>
                    {faseSelecionada.dicas.map((d, i) => (
                      <li key={i} className={styles.dicaItem}>
                        <span className={styles.dicaBullet}>✓</span>
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <Link href={faseSelecionada.href} className={styles.playBtn}>
                ► JOGAR FASE {faseSelecionada.id}
              </Link>
            </div>
          )}
        </div>
      )}

      {aba === "conceitos" && (
        <div className={styles.content}>
          {!conceitoSelecionado ? (
            <>
              <p className={styles.contentDesc}>
                Clique em um conceito para entender como ele funciona e em quais fases aparece!
              </p>
              <div className={styles.conceitoList}>
                {CONCEITOS.map((c) => (
                  <button
                    key={c.nome}
                    className={styles.conceitoCard}
                    onClick={() => setConceitoSelecionado(c)}
                  >
                    <span className={styles.conceitoIcone}>{c.icone}</span>
                    <div className={styles.conceitoInfo}>
                      <div className={styles.conceitoNome}>{c.nome}</div>
                      <div className={styles.conceitoFases}>
                        {c.fases.map((f) => (
                          <span key={f} className={styles.faseTag}>Fase {f}</span>
                        ))}
                      </div>
                    </div>
                    <span className={styles.faseArrow}>►</span>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className={styles.faseDetail}>
              <button className={styles.backBtn} onClick={() => setConceitoSelecionado(null)}>
                ◄ VOLTAR
              </button>

              <div className={styles.detailHeader}>
                <span className={styles.detailIcone}>{conceitoSelecionado.icone}</span>
                <div>
                  <div className={styles.detailNome}>{conceitoSelecionado.nome}</div>
                  <div className={styles.conceitoFases} style={{ marginTop: 6 }}>
                    {conceitoSelecionado.fases.map((f) => (
                      <span key={f} className={styles.faseTag}>Fase {f}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className={styles.detailSection}>
                <div className={styles.sectionLabel}>► O QUE É?</div>
                <p className={styles.detailText}>{conceitoSelecionado.desc}</p>
              </div>

              <div className={styles.exampleBox}>
                <div className={styles.exampleTitle}>{conceitoSelecionado.exemplo.titulo}</div>
                <p className={styles.exampleText}>{conceitoSelecionado.exemplo.texto}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {aba === "como" && (
        <div className={styles.content}>
          <p className={styles.contentDesc}>
            Siga esses passos e voce vai arrasar na fabrica!
          </p>
          <div className={styles.passoList}>
            {COMO_JOGAR.map((p) => (
              <div key={p.passo} className={styles.passoCard}>
                <div className={styles.passoNum}>{p.passo}</div>
                <span className={styles.passoIcone}>{p.icone}</span>
                <div className={styles.passoInfo}>
                  <div className={styles.passoTitulo}>{p.titulo}</div>
                  <p className={styles.passoTexto}>{p.texto}</p>
                </div>
              </div>
            ))}
          </div>
          <Link href="/fases" className={styles.playBtn}>
            ► JOGAR AGORA
          </Link>
        </div>
      )}
    </div>
  );
}
