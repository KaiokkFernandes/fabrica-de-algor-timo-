"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./PhaseActionsButton.module.css";

const EVENT_OPEN_AUDIO_SETTINGS = "roboblocks:audio-settings-open";

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
    <div ref={rootRef} className={styles.root} onClick={(event) => event.stopPropagation()}>
      {open && (
        <div className={styles.menu} aria-label="Configurações da fase">
          <button type="button" onClick={goHome} className={styles.menuItem}>
            🏠 MENU
          </button>
          <button type="button" onClick={openAudioSettings} className={styles.menuItem}>
            🔊 SOM
          </button>
        </div>
      )}

      <button
        type="button"
        aria-label="Abrir configurações da fase"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className={styles.gearBtn}
      >
        ⚙️
      </button>
    </div>
  );
}
