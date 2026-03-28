<template>
  <div :class="['bet-wrapper', { 'is-open': isBetMenuOpen }]" @mouseleave="isBetMenuOpen = false">
    
    <div v-if="isBetMenuOpen" class="bet-dropdown">
      <div 
        v-for="bet in availableBets" 
        :key="bet" 
        class="bet-option"
        @click="selectBet(bet)"
      >
        {{ bet }}
      </div>
    </div>

    <button 
        :class="['btn-gold-3d', 'bet-main-btn', { 'is-open': isBetMenuOpen }]" 
        @click="toggleBetMenu"
    >
        BET
    </button>

  </div>
</template>

<script setup>
import { ref } from 'vue';

// Odbieramy dane z App.vue (dostępne zakłady i aktualny wybór)
const props = defineProps(['currentBet', 'availableBets']);

// Definiujemy zdarzenie, którym "krzykniemy" do App.vue, że zakład się zmienił
const emit = defineEmits(['updateBet']);

// Stan otwarcia menu zostaje tutaj, bo App.vue nie musi o tym wiedzieć
const isBetMenuOpen = ref(false);

const toggleBetMenu = () => {
  isBetMenuOpen.value = !isBetMenuOpen.value;
};

const selectBet = (amount) => {
  emit('updateBet', amount); // Wysyłamy nowy zakład do App.vue
  isBetMenuOpen.value = false; // Zamykamy menu
};
</script>

<style scoped>
/* Przeniesione style z App.vue z dodanymi zmiennymi z roota */
.bet-wrapper {
  position: relative; 
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 5%; 
  /* SERWIS - Wyświetla pole hitboxa od przycisku bet
  background-color: rgba(255, 0, 0, 0.1) !important; 
  */
  z-index: 50;
}

.bet-dropdown {
  position: absolute;
  bottom: 120%; 
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column-reverse;
  gap: 0.4em;
  width: 100%; 
  z-index: 10;
  align-items: center;
  /* SERWIS - Wyświetla pole hitboxa od wyświetlanej listy bet
  outline: 2px solid blue !important;
  */
}

.bet-option {
  width: 25%;
  aspect-ratio: 1 / 1;
  display: flex;
  justify-content: center;
  align-items: center;
  
  /* Teraz też są złote od startu! */
  background-color: var(--btn-gold-bg); 
  color: white;
  border: 0.15em solid var(--btn-gold-border);
  font-size: 1.2em;
  font-weight: bold;
  border-radius: 0.4em;
  cursor: pointer;
  transition: all 0.2s ease;
}

.bet-option:hover {
  background-color: var(--btn-gold-hover);
  border-color: var(--btn-gold-border-hover);
  box-shadow: 0 0 1.2em var(--btn-gold-glow); /* To jest to złote świecenie! */
  transform: scale(1.15); /* Niech lekko wyskoczy do przodu */
}

/* GŁÓWNY PRZYCISK BET */
.bet-main-btn {
  width: 50%;
  aspect-ratio: 2 / 1;
  border-radius: 0.4em;
  font-size: 1em;
  /* Wygląd, kolory, ramki, cienie i animacje lecą z .btn-gold-3d w main.css */
}

/* --- NADPISYWANIE GLOBALA DLA EFEKTU "SZTYWNEGO" KLIKNIĘCIA --- */

.bet-main-btn:hover {
  /* Blokujemy powiększanie (scale) z main.css */
  transform: none; 
}

.bet-main-btn:active {
  /* Tylko ruch w dół (translateY) - zasłania cień bez kurczenia się */
  transform: translateY(0.15em); 
}

.bet-main-btn.is-open {
  /* Przycisk zostaje na dole i "pożera" cień */
  transform: translateY(0.15em); 
  box-shadow: none;
  
  /* Resetujemy kolory do bazowych (wyłączamy świecenie) */
  border-color: var(--btn-gold-border);
  color: var(--btn-gold-text);
  text-shadow: none;
  cursor: default;
}

/* Blokujemy jakiekolwiek zmiany na hoverze, gdy menu jest otwarte */
.bet-main-btn.is-open:hover {
  background-color: var(--btn-gold-bg); /* Nie rozjaśnia się */
  box-shadow: none;                    /* Nie dostaje glow wokół przycisku */
  text-shadow: none;                   /* Nie dostaje glow na tekście */
  border-color: var(--btn-gold-border);
  transform: translateY(0.15em);       /* Zostaje w tej samej dolnej pozycji */
}

.bet-wrapper::before {
  content: '';
  position: absolute;
  
  /* Centrowanie względem przycisku BET */
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);

  /* Rozmiar kwadratu - zwiększony do 24em, żeby wystawał nad listę */
  width: 24em; 
  height: 24em;

  /* WAŻNE: Musi być "niewidoczny", ale łapać myszkę */
  z-index: -1; 
  display: none;
  pointer-events: all; 

  /* SERWIS - Wyświetla pole hitboxa dla myszki kiedy opuszczasz kliknięty bet
  background: rgba(0, 255, 0, 0.1); 
  border: 2px dashed rgba(0, 255, 0, 0.5);
  */
}

.bet-wrapper.is-open::before {
  display: block; /* <--- POJAWIA SIĘ I ŁAPIE MYSZKĘ */
}
</style>