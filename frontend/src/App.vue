<script setup>
import { onMounted, ref } from 'vue';
import GameLogo from './components/GameLogo.vue';
import GameDisplay from './components/GameDisplay.vue';
import ControlPanel from './components/ControlPanel.vue';
import CoinFountain from './components/CoinFountain.vue';
import LebronEgg from './components/LebronEgg.vue';
import WinIndicator from './components/WinIndicator.vue';
import { useSlotMachine } from './composables/useSlotMachine';
import SettingsPanel from './components/SettingsPanel.vue';

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

const isSettingsPanelOpen = ref(false);

const toggleSettingsPanel = () => {
    isSettingsPanelOpen.value = !isSettingsPanelOpen.value;
    console.log("Panel ustawień:", isSettingsPanelOpen.value);
};

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
    <div class="right-panel-controls">
        <button @click="toggleMusic" class="panel-btn">
            <img v-if="isMusicMuted" src="/assets/icons/musicOff.png" class="panel-icon is-muted" />
            <img v-else src="/assets/icons/musicOn.png" class="panel-icon" />
        </button>
        <button @click="toggleSfx" class="panel-btn">
            <img v-if="isSfxMuted" src="/assets/icons/soundOff.png" class="panel-icon is-muted" />
            <img v-else src="/assets/icons/soundOn.png" class="panel-icon" />
        </button>
        <button @click="toggleSettingsPanel" class="panel-btn">
            <img src="/assets/icons/settings.png" class="panel-icon" />
        </button>
    </div>

    <SettingsPanel 
        :is-open="isSettingsPanelOpen" 
        :is-spinning="isSpinning"
        @force-spin="handleSpin" 
    />

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
    <img src="/assets/icons/musicOff.png" style="display: none;" />
    <img src="/assets/icons/soundOff.png" style="display: none;" />
    <img src="/assets/sztosy.png" style="display: none;" />
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

.right-panel-controls {
  position: absolute;
  top: var(--app-padding);
  right: var(--app-padding);
  display: flex;
  flex-direction: row;
  gap: 15px;
  z-index: 100;
}

.panel-btn {
  margin: 0;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  outline: none;
}

.panel-icon {
  width: 45px;
  height: 45px;
  object-fit: contain;
  opacity: 0.3; 
  filter: brightness(0) invert(0);
  transition: all 0.3s ease;
  transform: scale(1);
}

.panel-btn:active .panel-icon,
.panel-icon.is-muted {
  opacity: 0.2; 
  filter: brightness(0) invert(0); 
  transform: scale(1);
}

.panel-btn:last-child {
  margin-left: -10px;
}
</style>