"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { createPortal } from "react-dom";
import { getAudioSettings, hydrateAudioSettings, setAudioSettings } from "../lib/sfx";
import styles from "./AudioSettingsButton.module.css";

const EVENT_OPEN_AUDIO_SETTINGS = "roboblocks:audio-settings-open";

export default function AudioSettingsButton() {
  const [open, setOpen] = useState(false);
  const [settings, setSettingsState] = useState(() => getAudioSettings());
  const pathname = usePathname();
  const inPhase = /^\/fases\/\d/.test(pathname || "");
  // Nestas telas usamos um botão próprio "Configurações" (não a engrenagem flutuante)
  const hasOwnButton = pathname === "/" || pathname === "/historia";

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
    <div className={styles.panel} role="dialog" aria-label="Controles de áudio">
      <div className={styles.header}>
        <span className={styles.title}>🔊 SOM DO JOGO</span>
        <button type="button" className={styles.closeBtn} onClick={() => setOpen(false)} aria-label="Fechar">
          ×
        </button>
      </div>

      <div className={styles.row}>
        <div className={styles.rowLabel}>
          <span>🎵 Música</span>
          <label className={styles.toggle}>
            <input
              type="checkbox"
              checked={!settings.musicMuted}
              onChange={(event) => updateSettings({ musicMuted: !event.target.checked })}
            />
            <span className={styles.toggleTrack} />
          </label>
        </div>
        <input
          className={styles.range}
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={settings.musicVolume}
          disabled={settings.musicMuted}
          onChange={(event) => updateSettings({ musicVolume: Number(event.target.value) })}
        />
      </div>

      <div className={styles.row}>
        <div className={styles.rowLabel}>
          <span>🔔 Efeitos</span>
          <label className={styles.toggle}>
            <input
              type="checkbox"
              checked={!settings.effectsMuted}
              onChange={(event) => updateSettings({ effectsMuted: !event.target.checked })}
            />
            <span className={styles.toggleTrack} />
          </label>
        </div>
        <input
          className={styles.range}
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={settings.effectsVolume}
          disabled={settings.effectsMuted}
          onChange={(event) => updateSettings({ effectsVolume: Number(event.target.value) })}
        />
      </div>

      <div className={styles.muteAllRow}>
        <span className={styles.muteAllLabel}>Som geral</span>
        <label className={styles.toggle}>
          <input
            type="checkbox"
            checked={!settings.muted}
            onChange={(event) => updateSettings({ muted: !event.target.checked })}
          />
          <span className={styles.toggleTrack} />
        </label>
      </div>
    </div>
  ) : null;

  return (
    <>
      {typeof document !== "undefined" && panel ? createPortal(panel, document.body) : null}

      {!inPhase && !hasOwnButton && (
        <button
          type="button"
          aria-label="Abrir controles de áudio"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          className={styles.fab}
        >
          ⚙️
        </button>
      )}
    </>
  );
}
