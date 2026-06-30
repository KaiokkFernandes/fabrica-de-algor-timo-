"use client";
import { useEffect } from "react";
import { playClick } from "../lib/sfx";

/**
 * Toca o som de clique em qualquer botão/link da interface.
 * Exclui as telas de jogo (/fases/<número>) para não soar nos
 * controles do próprio jogo (que têm seus próprios sons).
 */
export default function ClickSound() {
  useEffect(() => {
    function onClick(e) {
      // Dentro do jogo (/fases/1, /fases/2, ...) não toca
      if (/^\/fases\/\d/.test(window.location.pathname)) return;
      const el = e.target.closest?.("button, a, [role='button']");
      if (!el) return;
      if (el.disabled) return;
      playClick();
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
