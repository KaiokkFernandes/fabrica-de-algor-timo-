/* ──────────────────────────────────────────────────────────────
   Sons da interface (fora do jogo)
   - typing: toca em loop enquanto o Brasilino "digita" a fala
   - click:  toca ao clicar em botões/links de tela (não do jogo)
   ────────────────────────────────────────────────────────────── */

let typingAudio = null;
let clickAudio = null;

export function startTyping() {
  if (typeof window === "undefined") return;
  try {
    if (!typingAudio) {
      typingAudio = new Audio("/sounds/typing.mp3");
      typingAudio.loop = true; // recomeça sozinho se acabar antes da digitação terminar
      typingAudio.volume = 0.35;
    }
    typingAudio.currentTime = 0;
    typingAudio.play().catch(() => {});
  } catch (e) { /* áudio indisponível */ }
}

export function stopTyping() {
  if (typeof window === "undefined") return;
  try {
    if (typingAudio) {
      typingAudio.pause();
      typingAudio.currentTime = 0;
    }
  } catch (e) { /* áudio indisponível */ }
}

export function playClick() {
  if (typeof window === "undefined") return;
  try {
    if (!clickAudio) {
      clickAudio = new Audio("/sounds/button_click.mp3");
      clickAudio.volume = 0.5;
    }
    clickAudio.currentTime = 0;
    clickAudio.play().catch(() => {});
  } catch (e) { /* áudio indisponível */ }
}
