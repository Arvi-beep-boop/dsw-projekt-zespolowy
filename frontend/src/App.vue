<script setup>
import { ref } from 'vue';
import StatBox from './components/StatBox.vue';
import BetMenu from './components/BetMenu.vue';

// Stan gry
const balance = ref(1000);
const win = ref(0);
const currentBet = ref(1);
const availableBets = [1, 2, 3];

// Obsługa zmiany zakładu z komponentu BetMenu
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
        
        <div class="spin-section">
          <BetMenu 
            :currentBet="currentBet" 
            :availableBets="availableBets"
            @updateBet="handleBetChange" 
          />
        </div>
      </div>

      <div class="bottom-section">
        <div class="bottom-left">
          <StatBox label="BALANCE" :value="balance" unit="€" />
          <StatBox label="WIN" :value="win" unit="€" />
          <StatBox label="BET" :value="currentBet" unit="€" />
        </div>

        <div class="bottom-right">
          <button class="btn-gold-3d spin-btn">SPIN</button>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
/* --- TYLKO UKŁAD I WYMIARY --- */

.app-wrapper {
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;

  background-image: url('background.jpg'); 
  background-size: cover;
  background-repeat: repeat; /* Powieli się, jeśli monitor jest za duży */
  background-position: center;
  background-color: #111; /* Kolor pod spodem na wszelki wypadek */

  display: flex;
  justify-content: center;
  align-items: center;
}

/* Główny kontener - 0px, pełna elastyczność */
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
  font-size: 1em; 
  border: 1px solid #555; /* Ramka zewnętrzna 1px */
}

/* --- SEKCJE GŁÓWNE --- */
.top-section { 
  height: 85%; 
  display: flex; 
}

.bottom-section { 
  height: 15%; 
  display: flex; 
  background-color: transparent; 
  position: relative;
}

/* 1. LEWA GÓRA */
.game-section { 
  width: 85%; 
  border-right: 1px solid #555; 
  border-bottom: 1px solid #555; 
}

/* 2. PRAWA GÓRA */
.spin-section {
  width: 15%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  border-bottom: 1px solid #555; 
  position: relative;
}

/* 3. LEWY DÓŁ */
.bottom-left {
  width: 85%;
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  border-right: 1px solid #555; 
}

/* 4. PRAWY DÓŁ */
.bottom-right {
  width: 15%;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* --- SPECYFICZNE WYMIARY SPIN --- */
.spin-btn {
  position: relative;
  width: 75%;
  aspect-ratio: 1 / 1;
  border-radius: 50%; 
  font-size: 1.6em; 
  z-index: 100;
}
</style>