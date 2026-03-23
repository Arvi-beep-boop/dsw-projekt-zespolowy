<script setup>
import { ref } from 'vue';
import PhaserGame from './PhaserGame.vue';

const phaserRef = ref();

// Tu trzymamy informację, który bet jest wybrany (1, 2 lub 3)
const selectedBet = ref(1);

// Funkcja zmieniająca wybrany zakład po kliknięciu
const selectBet = (amount) => {
  selectedBet.value = amount;
};
</script>

<template>
  <div class="app-wrapper">
    <div class="machine-container">
      
      <div class="game-area">
        <PhaserGame ref="phaserRef" />

        <div class="hud-credits">
          <span>Credits: 1000</span>
          <img src="/assets/coin.png" alt="coin" class="coin-icon" />
        </div>

        <button class="spin-btn">SPIN</button>

        <div class="hud-bet">
          <button 
            v-for="val in [1, 2, 3]" 
            :key="val"
            class="bet-btn"
            :class="{ active: selectedBet === val }"
            @click="selectBet(val)"
          >
            {{ val }}
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<style>
/* Reset marginesów i ciemne tło strony np. podczas ładowania*/
body {
  margin: 0;
  padding: 0;
  background-color: #1a1a1a;
  color: white;
  font-family: Arial, sans-serif;
  overflow: hidden; 
}

/* Centrowanie gry na środku ekranu */
.app-wrapper {
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center; 
  align-items: center;     
}

/* Główny kontener gry (ten wycentrowany ^^)*/
.machine-container {
  display: flex;
  flex-direction: column; /* Teraz jest w machine container jeden box game-area, 
                            więc column nie ma sensu ale może cos dodamy poniżej potem jeszcze*/
}

/* Obszar gry, narazie sam background. W przyszłości miejsce na bębny z phasera. 
W tym obszarze znajdują się również Creditsy, Spin i Bety*/
.game-area {
  width: 1024px;
  height: 768px;
  background-color: #000;
  position: relative; 
  overflow: visible; /* Pozwala przyciskowi SPIN wystawać poza dół gry */
  box-shadow: 0 0 20px rgba(0,0,0,0.5);
}

/* Napis Credits - przypięty do lewego dolnego rogu gry */
.hud-credits {
  position: absolute;
  bottom: 15px;
  left: 15px;
  display: flex;
  align-items: center; 
  gap: 8px; 
  font-size: 28px;
  font-weight: bold;
  color: #ffd700;
  white-space: nowrap;
  line-height: 1;
  z-index: 5;
  text-shadow: 2px 2px 2px rgba(0, 0, 0, 0.9);
}

/* Przyciski Bet - przypięte do prawego dolnego rogu gry */
.hud-bet {
  position: absolute;
  bottom: 15px;
  right: 15px;
  display: flex;
  gap: 10px;
  z-index: 5;
}

/* Ikonka monety - dopasowuje się do wielkości tekstu */
.coin-icon {
  width: 1em;
  height: 1em;
  display: block;
}

/* Wygląd przycisków wyboru stawki (niebieskie) */
.bet-btn {
  width: 50px;
  height: 50px;
  background-color: #0092cc;
  color: #88d3ff;
  font-size: 22px;
  font-weight: bold;
  border: 2px solid #88d3ff;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.1s, background-color 0.2s;
}

/* Wygląd wybranego przycisku stawki (aktywny na złoto) */
.bet-btn.active {
  background-color: #e9be00;
  color: white;
  border-color: #ffd700;
  box-shadow: 0 0 15px rgba(255, 215, 0, 0.6);
}

/* Przycisk SPIN - wycentrowany i wysunięty w dół poza grę */
.spin-btn {
  position: absolute;
  bottom: -50px; 
  left: 50%;
  transform: translateX(-50%); 
  width: 100px;
  height: 100px; 
  background-color: #e9be00;
  color: white;
  font-size: 24px;
  font-weight: bold;
  border: 4px solid #ffd700; 
  border-radius: 50%; 
  cursor: pointer;
  box-shadow: 0 8px #72621c; 
  transition: all 0.1s ease-in-out;
  z-index: 10;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Animacje po najechaniu i kliknięciu przycisku SPIN */
.spin-btn:hover {
  background-color: #eec615;
  border: 4px solid #ffe031; 
  transform: translateX(-50%) scale(1.10);
}

.spin-btn:active {
  box-shadow: 0 2px #72621c;
  transform: translateX(-50%) scale(1.10) translateY(6px);
}
</style>