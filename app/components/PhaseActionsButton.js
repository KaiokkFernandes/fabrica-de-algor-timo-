"use client";

import { useEffect, useRef, useState } from "react";

const EVENT_OPEN_AUDIO_SETTINGS = "roboblocks:audio-settings-open";

const rootStyle = {
  position: "relative", /* Para que o menu dropdown se posicione corretamente */
  zIndex: 20, /* Garante que o menu aberto fique sobre outros elementos */
  display: "flex",
  flexDirection: "column",
  alignItems: "stretch",
  gap: "8px",
};

const baseButtonStyle = {
  fontFamily: "var(--font-pixel)",
  fontSize: "clamp(11px, 1.1vw, 15px)",
  background: "var(--yellow)",
  color: "#fff",
  border: "3px solid #8c2d05",
  boxShadow: "0 3px 0 #8c2d05",
  cursor: "pointer",
  textDecoration: "none",
  whiteSpace: "nowrap",
};

const mainButtonStyle = {
  ...baseButtonStyle,
  padding: "8px 14px",
  minWidth: "132px",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "10px",
  transition: "transform 0.1s, background 0.15s",
};

const itemButtonStyle = {
  ...baseButtonStyle,
  padding: "8px 12px",
  minWidth: "132px",
  textAlign: "center",
  transition: "transform 0.1s, background 0.15s",
};

const menuItemStyle = {
  position: "absolute",
  right: 0,
  bottom: "calc(100% + 8px)",
  display: "flex",
  flexDirection: "column",
  gap: "8px",
};

export default function PhaseActionsButton({ menuHref = "/" }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    function onOutsideClick(event) {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("click", onOutsideClick);
    return () => {
      document.removeEventListener("click", onOutsideClick);
    };
  }, []);

  function goHome() {
    window.location.href = menuHref;
  }

  function openAudioSettings(event) {
    event.preventDefault();
    event.stopPropagation();
    window.dispatchEvent(new Event(EVENT_OPEN_AUDIO_SETTINGS));
    setOpen(false);
  }

  return (
    <div ref={rootRef} style={rootStyle} onClick={(event) => event.stopPropagation()}>
      {open && (
        <div style={menuItemStyle} aria-label="Ações da fase">
          <button type="button" onClick={goHome} style={itemButtonStyle}>
            🏠 MENU
          </button>
          <button type="button" onClick={openAudioSettings} style={itemButtonStyle}>
            ⚙️ CONFIGURAÇÕES
          </button>
        </div>
      )}

      <button
        type="button"
        aria-label="Abrir ações da fase"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        style={mainButtonStyle}
      >
        ☰ AÇÕES
        <span style={{ fontSize: "0.9em" }}>{open ? "▴" : "▾"}</span>
      </button>
    </div>
  );
}