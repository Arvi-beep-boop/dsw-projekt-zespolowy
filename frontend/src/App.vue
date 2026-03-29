<script setup>
import { ref } from 'vue';
import StatBox from './components/StatBox.vue';
import BetMenu from './components/BetMenu.vue';

// Globalny stan maszyny
const balance = ref(1000);
const win = ref(0);
const currentBet = ref(1);
const availableBets = [1, 2, 3];

// Aktualizacja stawki z komponentu BetMenu
const handleBetChange = (newAmount) => {
  currentBet.value = newAmount;
};
</script>

<template>
  <div class="app-wrapper">
    <div class="machine-container">
      
      <div class="top-section">
        <div class="game-section">
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
/* --- GŁÓWNY KONTENER APLIKACJI --- */
.app-wrapper {
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
  background-image: url('background.jpg'); 
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  background-color: #111;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Wymiary proporcjonalne automatu (4:3) */
.machine-container {
  aspect-ratio: 4 / 3;
  width: 98vw;
  max-width: calc(98vh * (4 / 3));
  max-height: 98vh;
  display: flex;
  flex-direction: column;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  font-size: min(1.1vw, 1.8vh);  
}

/* --- SEKCJA GRY (Phaser) --- */
.top-section { 
  height: 85%; 
  width: 100%;
  display: flex; 
}

.game-section { 
  width: 100%; 
  height: 100%;
}

/* --- SEKCJA INTERFEJSU (UI) --- */
.bottom-section { 
  height: 15%; 
  width: 100%;
  display: flex; 
  justify-content: space-between; 
  align-items: center;
  gap: 20px; 
  padding: 0; 
  background-color: transparent; 
  position: relative;
  z-index: 10;
}

/* --- LEWY PANEL (Statystyki) --- */
.panel-left {
  flex: 1; /* Automatyczne wypełnienie dostępnej przestrzeni */
  display: flex;
  justify-content: space-between; 
  align-items: stretch; /* StatBoxy zajmują 100% wysokości panelu */
  height: 100%;
  gap: 20px; 
}

.panel-left > * {
  flex: 1; 
  margin: 0 !important; 
}

/* --- PRAWY PANEL (Akcje) --- */
.panel-right {
  display: flex;
  justify-content: space-between; 
  align-items: center;
  height: 100%;
  gap: 20px; 
}

/* Kontener dla przycisku stawki (proporcja 2:1, 1/3 wysokości) */
.bet-container {
  height: 33.33%; 
  aspect-ratio: 2 / 1; 
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Główny przycisk obrotu (proporcja 1:1, pełna wysokość) */
.spin-btn {
  height: 100%; 
  aspect-ratio: 1 / 1; 
  border-radius: 50%;
  font-size: 1.6em;
  z-index: 100;
  flex-shrink: 0; 
}
</style>