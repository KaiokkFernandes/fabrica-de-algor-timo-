/* ──────────────────────────────────────────────────────────────
   Áudio compartilhado da experiência
   - efeitos podem sobrepor uns aos outros e a trilha
   - música fica em um canal ativo por vez
   - tudo falha em silêncio quando o navegador bloqueia áudio
   ────────────────────────────────────────────────────────────── */

const DEFAULT_SETTINGS = {
  muted: false,
  musicMuted: false,
  effectsMuted: false,
  effectsVolume: 0.5,
  musicVolume: 0.1, // ~30% do volume padrão original (era 0.35)
};

const AUDIO_SETTINGS_STORAGE_KEY = "roboblocks-audio-settings";

let typingAudio = null;
let activeMusicAudio = null;
const activeEffectAudios = new Set();
let activeEffectCount = 0;
let resumeMusicAfterEffects = false;
let audioSettings = { ...DEFAULT_SETTINGS };
let musicFadeInterval = null;

function isClientSide() {
  return typeof window !== "undefined";
}

function readPersistedAudioSettings() {
  if (!isClientSide()) return null;
  try {
    const raw = window.localStorage.getItem(AUDIO_SETTINGS_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch (e) {
    return null;
  }
}

function persistAudioSettings(settings) {
  if (!isClientSide()) return;
  try {
    window.localStorage.setItem(AUDIO_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {}
}

export function hydrateAudioSettings() {
  const stored = readPersistedAudioSettings();
  if (!stored) return getAudioSettings();
  audioSettings = {
    ...DEFAULT_SETTINGS,
    ...stored,
  };
  return getAudioSettings();
}

function createAudio(src, { loop = false, volume = 1 } = {}) {
  const audio = new Audio(src);
  audio.loop = loop;
  audio.volume = volume;
  return audio;
}

function applyAudioSettings(audio, kind = "effects") {
  if (!audio) return;
  audio.muted = audioSettings.muted || (kind === "music" ? audioSettings.musicMuted : audioSettings.effectsMuted);
  const volume = kind === "music" ? audioSettings.musicVolume : audioSettings.effectsVolume;
  audio.volume = volume;
}

function pauseMusicForEffects() {
  if (!activeMusicAudio || activeMusicAudio.paused) return;
  if (audioSettings.muted) return;
  try {
    activeMusicAudio.pause();
    resumeMusicAfterEffects = true;
  } catch (e) {
    resumeMusicAfterEffects = false;
  }
}

function maybeResumeMusicAfterEffects() {
  if (!resumeMusicAfterEffects || activeEffectCount > 0 || !activeMusicAudio) return;
  resumeMusicAfterEffects = false;
  try {
    activeMusicAudio.play().catch(() => {});
  } catch (e) {}
}

export function setAudioSettings(nextSettings = {}) {
  audioSettings = {
    ...audioSettings,
    ...nextSettings,
  };
  persistAudioSettings(audioSettings);

  if (typingAudio) {
    applyAudioSettings(typingAudio, "effects");
  }
  if (activeMusicAudio) {
    applyAudioSettings(activeMusicAudio, "music");
  }
  activeEffectAudios.forEach((audio) => applyAudioSettings(audio, "effects"));
}

export function getAudioSettings() {
  const stored = readPersistedAudioSettings();
  if (stored) {
    audioSettings = {
      ...DEFAULT_SETTINGS,
      ...stored,
    };
  }
  return { ...audioSettings };
}

export function playEffect(src, { loop = false, reset = true, volume } = {}) {
  if (!isClientSide()) return null;
  try {
    activeEffectCount += 1;
    pauseMusicForEffects();
    const audio = createAudio(src, { loop, volume: volume ?? audioSettings.effectsVolume });
    applyAudioSettings(audio, "effects");
    activeEffectAudios.add(audio);
    let cleaned = false;
    const cleanup = () => {
      if (cleaned) return;
      cleaned = true;
      activeEffectAudios.delete(audio);
      activeEffectCount = Math.max(0, activeEffectCount - 1);
      maybeResumeMusicAfterEffects();
    };
    audio.addEventListener("ended", cleanup, { once: true });
    audio.addEventListener("error", cleanup, { once: true });
    if (reset) audio.currentTime = 0;
    audio.play().catch(() => {
      cleanup();
    });
    return audio;
  } catch (e) {
    activeEffectCount = Math.max(0, activeEffectCount - 1);
    maybeResumeMusicAfterEffects();
    return null;
  }
}

/* Navegadores bloqueiam audio.play() sem interação prévia do usuário.
   Se a chamada falhar por isso, tenta de novo assim que o usuário
   clicar/tocar/apertar qualquer tecla na página pela primeira vez.
   onStart roda só quando a reprodução realmente começa (para o fade
   não "andar" enquanto o áudio ainda está bloqueado, pausado). */
function playWithUnlockFallback(audio, onStart) {
  const attempt = () => {
    const result = audio.play();
    if (result && typeof result.then === "function") {
      result.then(() => onStart && onStart()).catch(() => {
        const retry = () => {
          // Só retoma se esta ainda for a música ativa (usuário pode ter
          // trocado de página, chamado stopMusic(), antes do 1º clique)
          if (audio !== activeMusicAudio) return;
          audio.play().then(() => onStart && onStart()).catch(() => {});
        };
        ["pointerdown", "keydown", "touchstart"].forEach((evt) =>
          document.addEventListener(evt, retry, { once: true, passive: true })
        );
      });
    } else {
      onStart && onStart();
    }
  };
  attempt();
}

function clearMusicFade() {
  if (musicFadeInterval) {
    clearInterval(musicFadeInterval);
    musicFadeInterval = null;
  }
}

/* Sobe o volume de 0 até o volume-alvo (já respeitando o slider do usuário)
   ao longo de fadeMs, em vez de começar tocando no volume cheio. */
function fadeMusicIn(audio, targetVolume, fadeMs) {
  clearMusicFade();
  if (fadeMs <= 0 || targetVolume <= 0) return;
  const steps = 30;
  const stepMs = fadeMs / steps;
  let i = 0;
  audio.volume = 0;
  musicFadeInterval = setInterval(() => {
    i++;
    audio.volume = Math.min(targetVolume, (targetVolume * i) / steps);
    if (i >= steps) clearMusicFade();
  }, stepMs);
}

export function playMusic(src, { loop = true, reset = true, volume, fadeMs = 0 } = {}) {
  if (!isClientSide()) return null;
  try {
    if (activeMusicAudio && activeMusicAudio.src.endsWith(src)) {
      applyAudioSettings(activeMusicAudio, "music");
      if (reset) activeMusicAudio.currentTime = 0;
      if (activeEffectCount > 0) {
        resumeMusicAfterEffects = true;
        activeMusicAudio.pause();
      } else {
        const targetVolume = activeMusicAudio.volume;
        playWithUnlockFallback(activeMusicAudio, () => {
          if (fadeMs > 0) fadeMusicIn(activeMusicAudio, targetVolume, fadeMs);
        });
      }
      return activeMusicAudio;
    }

    stopMusic();
    activeMusicAudio = createAudio(src, { loop, volume: volume ?? audioSettings.musicVolume });
    applyAudioSettings(activeMusicAudio, "music");
    if (reset) activeMusicAudio.currentTime = 0;
    if (activeEffectCount > 0) {
      resumeMusicAfterEffects = true;
      activeMusicAudio.pause();
    } else {
      const targetVolume = activeMusicAudio.volume;
      playWithUnlockFallback(activeMusicAudio, () => {
        if (fadeMs > 0) fadeMusicIn(activeMusicAudio, targetVolume, fadeMs);
      });
    }
    return activeMusicAudio;
  } catch (e) {
    return null;
  }
}

export function stopMusic() {
  if (!isClientSide()) return;
  try {
    clearMusicFade();
    if (activeMusicAudio) {
      activeMusicAudio.pause();
      activeMusicAudio.currentTime = 0;
      activeMusicAudio = null;
    }
    resumeMusicAfterEffects = false;
  } catch (e) {
    activeMusicAudio = null;
    resumeMusicAfterEffects = false;
  }
}

export function stopAllEffects() {
  if (!isClientSide()) return;
  activeEffectAudios.forEach((audio) => {
    try {
      audio.pause();
      audio.currentTime = 0;
    } catch (e) {}
  });
  activeEffectAudios.clear();
}

export function startTyping() {
  if (!isClientSide()) return;
  try {
    if (!typingAudio) {
      typingAudio = createAudio("/sounds/typing.mp3", { loop: true, volume: 0.35 });
    }
    applyAudioSettings(typingAudio, "effects");
    typingAudio.currentTime = 0;
    typingAudio.play().catch(() => {});
  } catch (e) { /* áudio indisponível */ }
}

export function stopTyping() {
  if (!isClientSide()) return;
  try {
    if (typingAudio) {
      typingAudio.pause();
      typingAudio.currentTime = 0;
    }
  } catch (e) { /* áudio indisponível */ }
}

export function playClick() {
  return playEffect("/sounds/button_click.mp3", { volume: 0.5 });
}

export function playMenuMusic({ fadeMs = 0 } = {}) {
  return playMusic("/sounds/menu_song.mp3", { loop: true, volume: 0.32, fadeMs });
}

export function playGameplayMusic1() {
  return playMusic("/sounds/gameplay_song_1.mp3", { loop: true, volume: 0.3 });
}

export function playGameplayMusic2() {
  return playMusic("/sounds/gameplay_song_2.mp3", { loop: true, volume: 0.3 });
}

export function playGameplayMusic3() {
  return playMusic("/sounds/gameplay_song_final.mp3", { loop: true, volume: 0.3 });
}

export function playRightAnswer() {
  return playEffect("/sounds/right_answer.mp3", { volume: 0.6 });
}

export function playWrongAnswer() {
  return playEffect("/sounds/wrong_answer.mp3", { volume: 0.6 });
}
