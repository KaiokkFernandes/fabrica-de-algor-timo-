# 🏭 Fábrica de Algoritmos

Jogo educacional 2D com estética pixel art / 16-bit construído com **Next.js 14**. O objetivo é ensinar lógica e algoritmos por meio de desafios práticos ambientados em uma fábrica — onde o jogador organiza caixas na esteira usando coordenadas, cartas de dica e estratégia de pontuação.

---

## Rotas

| Rota | Tela | Descrição |
|------|------|-----------|
| `/` | Tela Título | Apresentação do jogo com acesso aos módulos |
| `/introducao` | Briefing de Missão | Contexto, objetivos e tutorial inicial |
| `/menu` | Seleção de Fase | Mapa com todas as fases e status de progresso |
| `/fases` | Gameplay | Fase 1.1 — Esteira de Caixas (jogo completo) |

---

## Gameplay — Fase 1.1: Esteira de Caixas

O jogador recebe caixas numa esteira. Cada caixa exibe uma **coordenada (linha, coluna)** que indica sua posição correta na prateleira. A missão é arrastar cada caixa para a célula certa antes que a esteira avance.

**Mecânicas:**
- Acerto: `+100 pts`
- Erro: `-30 pts`
- 3 **Cartas de Dica** por rodada:
  - 🔦 **Iluminar Célula** — destaca a célula alvo por 3 s (grátis)
  - 📍 **Marcar Caixa** — destaca uma caixa e seu destino por 3 s (grátis)
  - 🗺️ **Mapa Completo** — revela todos os destinos (`-50 pts`)
- Avaliação por estrelas: `★★★` ≥ 550 pts · `★★☆` ≥ 350 pts · `★☆☆` abaixo

Suporte a **drag-and-drop** no desktop e **touch** no mobile.

---

## Stack

- **Next.js 14** — App Router
- **React 18** — `useEffect` para toda a lógica de jogo (sem biblioteca de estado)
- **CSS Modules** — estilos escopados por componente
- **Press Start 2P** (Google Fonts) — fonte pixel art usada em todo o projeto

---

## Estrutura

```
app/
├── layout.js               # Shell global (header HUD, footer, fonte)
├── globals.css             # Paleta de cores, scanlines, variáveis CSS
├── page.js                 # Tela título (/)
├── page.module.css
├── components/
│   ├── Nav.js              # Navegação pixel game
│   └── Nav.module.css
├── introducao/
│   ├── page.js             # Briefing RPG (/introducao)
│   └── page.module.css
├── menu/
│   ├── page.js             # Seleção de fase (/menu)
│   └── page.module.css
└── fases/
    ├── page.js             # Entrada da rota (/fases)
    ├── FaseGame.js         # Componente principal do jogo
    └── FaseGame.module.css
```

---

## Paleta de Cores

| Variável | Valor | Uso |
|----------|-------|-----|
| `--bg` | `#1a1a2e` | Fundo principal |
| `--panel` | `#16213e` | Painéis e cards |
| `--text` | `#e8d5a3` | Texto principal |
| `--yellow` | `#ffeb3b` | Destaques e títulos |
| `--green` | `#4caf50` | Acertos e botões de ação |
| `--red` | `#f44336` | Erros e penalidades |
| `--gold` | `#f0c040` | Cartas de dica |
| `--border` | `#4a4a6a` | Bordas dos painéis |

---

## Rodando localmente

```bash
npm install
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

```bash
npm run build   # build de produção
npm run start   # servidor de produção
npm run lint    # ESLint
```

---

## Próximas fases (roadmap)

- [ ] Fase 1.2 — novo mecânico em desenvolvimento
- [ ] Fase 2.0 — desafio avançado de ordenação
- [ ] Sistema de save de pontuação por fase
- [ ] Tela de Game Over com replay

---

> Construindo ideias, uma fase por vez.
