<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

defineProps({
  currentBet: Number,
  availableBets: Array
});

const emit = defineEmits(['update-bet']);

const isBetMenuOpen = ref(false);
const betWrapper = ref(null);

const toggleBetMenu = () => {
  isBetMenuOpen.value = !isBetMenuOpen.value;
};

const selectBet = (amount) => {
  emit('update-bet', amount);
  isBetMenuOpen.value = false;
};

// Zapobiega zamknięciu menu przy szybkim zjechaniu kursorem w stronę przycisku SPIN
const handleMouseLeave = (event) => {
  if (event.relatedTarget && event.relatedTarget.closest('.spin-btn')) {
    return;
  }
  isBetMenuOpen.value = false;
};

// Globalne nasłuchiwanie: zamyka menu kliknięciem w dowolne inne miejsce na ekranie
const handleGlobalClick = (event) => {
  if (isBetMenuOpen.value) {
    if (!event.target.closest('.bet-option') && !event.target.closest('.bet-main-btn')) {
      isBetMenuOpen.value = false;
    }
  }
};

onMounted(() => { window.addEventListener('click', handleGlobalClick); });
onUnmounted(() => { window.removeEventListener('click', handleGlobalClick); });
</script>

<template>
  <div 
    ref="betWrapper" 
    :class="['bet-wrapper', { 'is-open': isBetMenuOpen }]" 
    @mouseleave="handleMouseLeave"
  >
    <div v-if="isBetMenuOpen" class="bet-dropdown">
      <div 
        v-for="bet in availableBets" :key="bet" 
        class="bet-option" @click="selectBet(bet)"
      >
        {{ bet }}
      </div>
    </div>

    <button 
      :class="['btn-gold-3d', 'bet-main-btn', { 'is-open': isBetMenuOpen }]" 
      @click.stop="toggleBetMenu"
    >
      BET
    </button>
  </div>
</template>

<style scoped>
/* --- KONTENER GŁÓWNY --- */
.bet-wrapper {
  position: relative; 
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center; /* Wypełnia szerokość narzuconą przez App.vue */
  z-index: 50;
}

/* --- LISTA ZAKŁADÓW --- */
.bet-dropdown {
  position: absolute;
  bottom: 110%; 
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column-reverse;
  gap: 0.4em;
  width: 200%; 
  z-index: 10;
  align-items: center;
}

.bet-option {
  width: 50%;
  aspect-ratio: 2 / 1;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--btn-gold-bg); 
  color: white;
  border: 0.15em solid var(--btn-gold-border);
  font-family: var(--font-primary);
  font-size: 1.4em;
  font-weight: bold;
  border-radius: 0.4em;
  cursor: pointer;
  transition: all 0.2s ease;
  
}

.bet-option:hover {
  background-color: var(--btn-gold-hover);
  border-color: var(--btn-gold-border-hover);
  transform: scale(1.15);
  box-shadow: 0 0.15em 0 var(--btn-gold-shadow), var(--glow-frame);
  text-shadow: var(--glow-text);
}

/* --- GŁÓWNY PRZYCISK BET --- */
.bet-main-btn {
  width: 100%;
  height: 100%;
  border-radius: 0.4em;
  font-family: var(--font-primary);
  font-size: 1.4em;
  margin: 0;
  padding: 0;
  
}

/* Zachowanie przycisku (zablokowane skalowanie na hover) */
.bet-main-btn:hover {
  transform: none; 
}

.bet-main-btn:active {
  transform: translateY(0.15em); 
}

.bet-main-btn.is-open {
  transform: translateY(0.15em); 
  box-shadow: none;
  border-color: var(--btn-gold-border);
  color: var(--btn-gold-text);
  text-shadow: none;
  cursor: default;
}

.bet-main-btn.is-open:hover {
  background-color: var(--btn-gold-bg);
  box-shadow: none;
  text-shadow: none;
  border-color: var(--btn-gold-border);
  transform: translateY(0.15em);
}

/* --- ROZSZERZONY HITBOX (UX) --- 
   Niewidoczna warstwa zapobiegająca przypadkowemu zamknięciu menu
   przy gwałtownych ruchach myszką (np. zsuwając z opcji na główny widok Phasera) */
.bet-wrapper::before {
  content: '';
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 26em; 
  height: 26em;
  z-index: -1; 
  display: none;
  pointer-events: all; 
  /* Pole ucieczki do wyswietlenia
  background-color: rgba(255, 0, 0, 0.4);
  */
}

.bet-wrapper.is-open::before {
  display: block;
}
</style>