<script setup>
import { ref } from 'vue';
import StatBox from './components/StatBox.vue';
import BetMenu from './components/BetMenu.vue';
import GameDisplay from './components/GameDisplay.vue';

// Stan globalny UI maszyny
const balance = ref(1000);
const win = ref(0);
const currentBet = ref(1);
const availableBets = [1, 2, 3, 4];
const globalPadding = 20;

// Handler: Aktualizacja stawki z BetMenu
const handleBetChange = (newAmount) => {
  currentBet.value = newAmount;
};

const audio = new Audio('/assets/audio/logoSound.mp3');
audio.volume = 0.8;

const playLogoSound = () => {
  if (!audio.paused) return; //
  audio.currentTime = 0;
  audio.play();
};
  

</script>

<template>
  <div class="app-wrapper">
    <img src="/logo.png" class="game-logo" alt="Sztosy Waifu Slots" @click="playLogoSound">
    <div class="machine-container">
      
      <div class="top-section">
        <div class="game-section">
          <GameDisplay />
        </div>
      </div>

      <div class="bottom-section">
        
        <div class="panel-left">
          <StatBox label="BALANCE" :value="balance" unit="€" />
          <StatBox label="WIN" :value="win" unit="€" />
          <StatBox label="BET" :value="currentBet" unit="€" />
        </div>

        <div class="panel-right">
          <div class="bet-container">
            <BetMenu 
              :currentBet="currentBet" 
              :availableBets="availableBets"
              @updateBet="handleBetChange" 
            />
          </div>
          <button class="btn-gold-3d spin-btn">SPIN</button>
        </div>
        
      </div>

    </div>
  </div>
</template>

<style scoped>
/* --- KONTENER GŁÓWNY (Tło i centrowanie) --- */
.app-wrapper {
  position: relative;
  width: 100vw;
  height: 100vh;
  padding: var(--app-padding);
  background-image: url('background.jpg'); 
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  background-color: var(--bg-app);
  display: flex;
  justify-content: center;
  align-items: center;
}

/* --- SZKIELET MASZYNY (Wymuszony rzut 4:3) --- */
.machine-container {
  aspect-ratio: 4 / 3;
  width: var(--available-width);
  max-height: var(--available-height);
  max-width: calc(var(--available-height) * (4 / 3));
  display: flex;
  flex-direction: column;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  font-size: min(1.1vw, 1.8vh);
  position: relative;
}

/* --- SEKCJA GRY (Obszar pod płótno Phasera) --- */
.top-section { 
  height: 85%; 
  width: 100%;
  display: flex; 
}

.game-section { 
  width: 100%; 
  height: 100%;
}

/* --- SEKCJA UI (Pasek dolny interfejsu) --- */
.bottom-section { 
  height: 15%; 
  width: 100%;
  display: flex; 
  justify-content: space-between; 
  align-items: center;
  gap: 20px; 
  padding: 0; 
  background-color: var(--bg-panel); 
  position: relative;
  z-index: 10;
}

/* --- LEWY PANEL (Statystyki Gracza) --- */
.panel-left {
  flex: 1; 
  display: flex;
  justify-content: space-between; 
  align-items: stretch; 
  height: 100%;
  gap: 20px; 
}

.panel-left > * {
  flex: 1; 
  margin: 0 !important; 
}

/* --- PRAWY PANEL (Akcje i Stawki) --- */
.panel-right {
  display: flex;
  justify-content: space-between; 
  align-items: center;
  height: 100%;
  gap: 20px; 
}

.bet-container {
  height: 33.33%; 
  aspect-ratio: 2 / 1; 
  display: flex;
  justify-content: center;
  align-items: center;
}

.spin-btn {
  height: 100%; 
  aspect-ratio: 1 / 1; 
  border-radius: 50%;
  font-size: 2.5em;
  font-family: var(--font-primary);
  z-index: 100;
  flex-shrink: 0; 
}

/* --- LOGO GRY (Pływające nad layoutem) --- */
.game-logo {
  position: absolute;
  top: var(--app-padding);
  left: var(--app-padding);
  width: 22.5vh; 
  max-width: var(--logo-max-width); 
  z-index: 100;
  pointer-events: none; 
  opacity: 0.9; 
  /* Złożony filtr: tło + podwójne złote podświetlenie */
  filter: drop-shadow(0 0 20px rgba(0, 0, 0, 0.8)) drop-shadow(0 0 1.5em var(--btn-gold-glow)) drop-shadow(0 0 1.5em var(--btn-gold-glow));
  pointer-events: auto;
  cursor: pointer;
  transition: all 0.1s ease-in-out;
}

.game-logo:hover {
  transform: scale(1.09);
}
.game-logo:active {
  transition: all 0.05s ease-out;
  transform: scale(1.03); /* Przesunięcie o wysokość cienia */
}

/* Ukrycie loga przed kolizją z lewą krawędzią gry */
@media (max-aspect-ratio: 18/10) {
  .game-logo {
    display: none;
  }
}
</style>