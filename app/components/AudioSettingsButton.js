"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { createPortal } from "react-dom";
import { getAudioSettings, hydrateAudioSettings, setAudioSettings } from "../lib/sfx";

const EVENT_OPEN_AUDIO_SETTINGS = "roboblocks:audio-settings-open";

const panelStyle = {
  position: "fixed",
  right: "20px",
  bottom: "88px",
  width: "280px",
  maxHeight: "calc(100vh - 120px)",
  overflowY: "auto",
  zIndex: 50,
  borderRadius: "18px",
  border: "2px solid rgba(255,255,255,0.15)",
  background: "#7eb8f7",
  color: "#fff",
  boxShadow: "0 18px 50px rgba(0,0,0,0.35)",
  padding: "16px",
  backdropFilter: "blur(12px)",
};

const buttonStyle = {
  position: "fixed",
  right: "20px",
  bottom: "20px",
  zIndex: 51,
  width: "56px",
  height: "56px",
  borderRadius: "50%",
  border: "none",
  background: "linear-gradient(135deg, #ba9121, #275485)",
  color: "#ffffff",
  fontSize: "26px",
  fontWeight: 900,
  boxShadow: "0 16px 30px rgba(0,0,0,0.35)",
  cursor: "pointer",
};

const labelStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "12px",
  marginBottom: "12px",
  fontSize: "13px",
};

const rangeStyle = {
  width: "100%",  
};

export default function AudioSettingsButton() {
  const [open, setOpen] = useState(false);
  const [settings, setSettingsState] = useState(() => getAudioSettings());
  const pathname = usePathname();
  const inPhase = /^\/fases\/\d/.test(pathname || "");

  useEffect(() => {
    setSettingsState(hydrateAudioSettings());

    function openPanel() {
      setOpen(true);
    }

    window.addEventListener(EVENT_OPEN_AUDIO_SETTINGS, openPanel);
    return () => window.removeEventListener(EVENT_OPEN_AUDIO_SETTINGS, openPanel);
  }, []);

  useEffect(() => {
    if (inPhase) {
      setOpen(false);
    }
  }, [inPhase]);

  function updateSettings(nextPartial) {
    setSettingsState((current) => {
      const next = { ...current, ...nextPartial };
      setAudioSettings(next);
      return next;
    });
  }

  const panel = open ? (
    <div style={panelStyle} role="dialog" aria-label="Controles de áudio">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
        <strong style={{ fontSize: "14px" }}>Controles de áudio</strong>
        <button
          type="button"
          onClick={() => setOpen(false)}
          style={{
            border: "none",
            background: "transparent",
            color: "#fff",
            fontSize: "18px",
            cursor: "pointer",
          }}
        >
          ×
        </button>
      </div>

      <label style={labelStyle}>
        <span>Música</span>
        <input
          type="checkbox"
          checked={settings.musicMuted}
          onChange={(event) => updateSettings({ musicMuted: event.target.checked })}
        />
      </label>
      <input
        style={rangeStyle}
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={settings.musicVolume}
        onChange={(event) => updateSettings({ musicVolume: Number(event.target.value) })}
      />

      <div style={{ height: "12px" }} />

      <label style={labelStyle}>
        <span>Efeitos</span>
        <input
          type="checkbox"
          checked={settings.effectsMuted}
          onChange={(event) => updateSettings({ effectsMuted: event.target.checked })}
        />
      </label>
      <input
        style={rangeStyle}
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={settings.effectsVolume}
        onChange={(event) => updateSettings({ effectsVolume: Number(event.target.value) })}
      />

      <div style={{ marginTop: "14px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px", opacity: 0.8 }}>
        <span>Som geral</span>
        <input
          type="checkbox"
          checked={settings.muted}
          onChange={(event) => updateSettings({ muted: event.target.checked })}
        />
      </div>
    </div>
  ) : null;

  return (
    <>
      {typeof document !== "undefined" && panel ? createPortal(panel, document.body) : null}

      {!inPhase && (
        <button
          type="button"
          aria-label="Abrir controles de áudio"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          style={buttonStyle}
        >
          ⚙️
        </button>
      )}
    </>
  );
}
