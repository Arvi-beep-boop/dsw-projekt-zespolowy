<script setup>
import { onMounted, ref } from 'vue';
import GameLogo from './components/GameLogo.vue';
import GameDisplay from './components/GameDisplay.vue';
import ControlPanel from './components/ControlPanel.vue';
import CoinFountain from './components/CoinFountain.vue';
import LebronEgg from './components/LebronEgg.vue';
import WinIndicator from './components/WinIndicator.vue';
import { useSlotMachine } from './composables/useSlotMachine';

import { AUDIO_SETTINGS } from './game/settings.js';
import { EventBus } from './game/EventBus.js';



const { 
    balance, 
    win, 
    currentBet, 
    availableBets, 
    isSpinning, 
    handleBetChange, 
    handleSpin, 
    handleReload,
    loadInitialState 
} = useSlotMachine();

const originalMusicVols = {
    bgMusic: AUDIO_SETTINGS.volumes.bgMusic,
    scatterPopup: AUDIO_SETTINGS.volumes.scatterPopup
};

const originalSfxVols = {
    reelsSpin: AUDIO_SETTINGS.volumes.reelsSpin,
    reelsStop: AUDIO_SETTINGS.volumes.reelsStop,
    win: AUDIO_SETTINGS.volumes.win,
    coinFountain: AUDIO_SETTINGS.volumes.coinFountain,
    spinBtn: AUDIO_SETTINGS.volumes.spinBtn
};

const isMusicMuted = ref(false);
const isSfxMuted = ref(false);

const toggleMusic = () => {
    isMusicMuted.value = !isMusicMuted.value;
    AUDIO_SETTINGS.volumes.bgMusic = isMusicMuted.value ? 0 : originalMusicVols.bgMusic;
    AUDIO_SETTINGS.volumes.scatterPopup = isMusicMuted.value ? 0 : originalMusicVols.scatterPopup;
    EventBus.emit('update-music-volume', isMusicMuted.value);
};

const toggleSfx = () => {
    isSfxMuted.value = !isSfxMuted.value;
    for (const key in originalSfxVols) {
        AUDIO_SETTINGS.volumes[key] = isSfxMuted.value ? 0 : originalSfxVols[key];
    }
    EventBus.emit('update-sfx-volume', isSfxMuted.value);
};

onMounted(() => {
    loadInitialState();
});
</script>

<template>
  <div class="app-wrapper"> 
    <div class="audio-controls">
        <button @click="toggleMusic" class="audio-btn">
            <img v-if="isMusicMuted" src="/assets/icons/musicOff.png" class="audio-icon is-muted" />
            <img v-else src="/assets/icons/musicOn.png" class="audio-icon" />
        </button>
        <button @click="toggleSfx" class="audio-btn">
            <img v-if="isSfxMuted" src="/assets/icons/soundOff.png" class="audio-icon is-muted" />
            <img v-else src="/assets/icons/soundOn.png" class="audio-icon" />
        </button>
    </div>

    <CoinFountain />
    <LebronEgg />
    <GameLogo />
    
    <div class="machine-container">
      
      <div class="top-section">
        <div class="game-section">
          <GameDisplay />
          <WinIndicator />
        </div>
      </div>
      <!--Wstrzykujemy bieżące wartości ze stanu UI (const balance, win itp.) do komponentu. 
        @update-bet: Wywołuje handleBetChange, gdy gracz zmieni stawkę w menu.
        @spin: Wywołuje handleSpin, inicjując cykl losowania i komunikację z API. -->
      <ControlPanel 
        :balance="balance" 
        :win="win" 
        :current-bet="currentBet"
        :available-bets="availableBets"
        :is-spinning="isSpinning"
        @update-bet="handleBetChange"
        @spin="handleSpin"
        @reset="handleReload"
      />

    </div>
  </div>
</template>

<style scoped>
/* --- KONTENER GŁÓWNY (Tło i centrowanie) --- */
.app-wrapper {
  position: relative;
  /* vw/vh (Viewport Units): Gwarantują zajęcie 100% okna przeglądarki niezależnie od rozmiaru rodzica (body). 
  1vw i 1vh to dokładnie 1% szerokości okna przeglądarki.*/
  width: 100vw;
  height: 100vh;
  /* --app-padding Pobranie stałej z :root (main.css). Zapobiega stykaniu się maszyny z krawędzią okna i umożliwia globalną zmianę marginesów w jednym pliku. */
  padding: var(--app-padding);
  background-image: url('background.jpg'); 
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  /* Domyślne tło gdyby nie załadowało jpg */
  background-color: var(--bg-app);
  display: flex;
  justify-content: center;
  align-items: center;
}

/* --- SZKIELET MASZYNY (Wymuszony rzut 4:3) --- */
.machine-container {
  /* Wymuszenie stałych proporcji automatu (4:3) niezależnie od rozdzielczości.
  Wykorzystanie dynamicznych zmiennych do zachowania sztywnego rzutu ekranu; 
  max-width uzależnia szerokość od bieżącej wysokości, 
  blokując deformację proporcji na monitorach panoramicznych.*/
  aspect-ratio: 4 / 3;
  width: var(--available-width);
  max-height: var(--available-height);
  max-width: calc(var(--available-height) * (4 / 3));
  display: flex;
  flex-direction: column;
  gap: 0; 
  /* Funkcja min() wybiera mniejszą wartość z dwóch jednostek viewportu, 
  dzięki czemu interfejs i teksty skalują się proporcjonalnie 
  do krótszej krawędzi ekranu, nie wychodząc poza ramy maszyny. */
  font-size: min(1.1vw, 1.8vh);
  position: relative;
}

/* --- SEKCJA GRY (Obszar pod Phasera) --- */
.top-section { 
  flex: 1; 
  width: 100%;
  display: flex; 
}

.game-section { 
  position: relative;
  width: 100%; 
  height: 100%;
}

.audio-controls {
  position: absolute;
  top: var(--app-padding);
  right: var(--app-padding);
  display: flex;
  gap: 10px;
  z-index: 100;
}

.audio-btn {
  margin: 0 10px;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  outline: none;
}

.audio-icon {
  width: 55px;
  height: 55px;
  object-fit: contain;
  opacity: 0.3; 
  filter: brightness(0) invert(0);
  transition: all 0.3s ease;
  transform: scale(1);
}

.audio-btn:active .audio-icon,
.audio-icon.is-muted {
  opacity: 0.2; 
  filter: brightness(0) invert(0); 
  transform: scale(1);
}

</style>