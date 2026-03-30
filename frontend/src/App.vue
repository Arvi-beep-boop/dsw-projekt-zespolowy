<script setup>
import { ref } from 'vue';
import GameLogo from './components/GameLogo.vue';
import GameDisplay from './components/GameDisplay.vue';
import ControlPanel from './components/ControlPanel.vue';

// STAN UI: Wartości synchronizowane z interfejsem.
const balance = ref(1000);
const win = ref(0);
const currentBet = ref(1);
const availableBets = ref([1, 2, 3, 4]); 

// AKTUALIZACJA STANU: Synchronizacja wartości z ControlPanel.
const handleBetChange = (newAmount) => {
  currentBet.value = newAmount;
};

// HANDLER SPIN: Punkt startowy dla RNG i animacji bębnów.
const handleSpin = () => {
  console.log("Spinning..."); // Miejsce na logikę Phasera
};
</script>

<template>
  <div class="app-wrapper"> 
    <GameLogo />
    
    <div class="machine-container">
      
      <div class="top-section">
        <div class="game-section">
          <GameDisplay />
        </div>
      </div>
      <! Wstrzykujemy bieżące wartości ze stanu UI (const balance, win itp.) do komponentu. 
        @update-bet: Wywołuje handleBetChange, gdy gracz zmieni stawkę w menu.
        @spin: Wywołuje handleSpin, inicjując cykl losowania i komunikację z APIsss.
      >
      <ControlPanel 
        :balance="balance" 
        :win="win" 
        :current-bet="currentBet"
        :available-bets="availableBets"
        @update-bet="handleBetChange"
        @spin="handleSpin"
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
  width: 100%; 
  height: 100%;
}
</style>