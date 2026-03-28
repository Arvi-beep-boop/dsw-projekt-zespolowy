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
          <button class="spin-btn">SPIN</button>
        </div>
      </div>

    </div>
  </div>
</template>

<style>
:root {
  /* --- TŁA --- */
  --bg-app: #111111;
  --bg-machine: #222222;
  --bg-panel: #1a1a1a;

  /* --- ZŁOTO (Główny Bohater) --- */
  --gold-light: #ffdf00; 
  --gold-main: #edb406; 
  --gold-dark: #b8860b; 
  --gold-border: #ffd700; 

  /* --- TEKST --- */
  --text-dark: #1a1a1a; 
  --text-light: #ffffff;
  --text-muted: #aaaaaa;

  /* --- EFEKTY --- */
  --shadow-gold-btn: 0 0.4em 0 var(--gold-dark); /* Zamienione na em */
  --border-gold-heavy: 0.2em solid var(--gold-border); /* Zamienione na em */
}

/* --- RESETY I UKŁAD --- */
* {
  box-sizing: border-box; /* Ważne, żeby ramki nie psuły szerokości! */
}

body {
  margin: 0;
  padding: 0;
}

.app-wrapper {
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--bg-app);
  color: var(--text-light);
  font-family: sans-serif;
}

/* Główny kontener - 0px, pełna elastyczność */
.machine-container {
  width: 80vw;
  max-width: 60em;
  aspect-ratio: 4 / 3;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-machine);
  font-size: 1em; 
  border: 1px solid #555; /* Ramka zewnętrzna 1px */
}

/* --- SEKCJE GŁÓWNE --- */
.top-section { height: 85%; display: flex; }
.bottom-section { height: 15%; display: flex; }

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
}

/* 3. LEWY DÓŁ */
.bottom-left {
  width: 85%;
  background-color: var(--bg-panel);
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  border-right: 1px solid #555; 
}

/* 4. PRAWY DÓŁ */
.bottom-right {
  width: 15%;
  background-color: var(--bg-machine);
  display: flex;
  justify-content: center;
  align-items: center;
}

/* --- PRZYCISK SPIN (Tymczasowy styl) --- */
.spin-btn {
  width: 70%;
  aspect-ratio: 1 / 1;
  font-size: 1.1em;
  font-weight: bold;
  cursor: pointer;
  border-radius: 50%;
  background-color: var(--bg-panel);
  color: var(--gold-main);
  border: 1px solid var(--gold-main);
}
</style>