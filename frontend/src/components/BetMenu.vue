<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const props = defineProps(['currentBet', 'availableBets']);
const emit = defineEmits(['updateBet']);

const isBetMenuOpen = ref(false);
const betWrapper = ref(null);

const toggleBetMenu = () => {
  isBetMenuOpen.value = !isBetMenuOpen.value;
};

const selectBet = (amount) => {
  emit('updateBet', amount);
  isBetMenuOpen.value = false;
};

// NOWA FUNKCJA - Ignoruje ucieczkę na SPIN, ale zamyka na wszystko inne
const handleMouseLeave = (event) => {
  if (event.relatedTarget && event.relatedTarget.closest('.spin-btn')) {
    return; // Zostawiamy menu otwarte
  }
  isBetMenuOpen.value = false;
};

// Zamykanie kliknięciem (np. jak klikniesz w SPIN)
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
/* PRZYWRÓCONE TWOJE ORYGINALNE STYLE */
.bet-wrapper {
  position: relative; 
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 5%; 
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
}

.bet-option {
  width: 25%;
  aspect-ratio: 1 / 1;
  display: flex;
  justify-content: center;
  align-items: center;
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
  box-shadow: 0 0 1.2em var(--btn-gold-glow);
  transform: scale(1.15);
}

.bet-main-btn {
  width: 40%;
  aspect-ratio: 2 / 1;
  border-radius: 0.4em;
  font-size: 1em;
}

/* BLOKADA POWIĘKSZANIA (ZGODNIE Z TWOIM ŻYCZENIEM) */
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

/* TWOJA RAMKA HITBOX */
.bet-wrapper::before {
  content: '';
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 24em; 
  height: 24em;
  z-index: -1; 
  display: none;
  pointer-events: all; 
  /* Debug: background: rgba(0, 255, 0, 0.1); */
}

.bet-wrapper.is-open::before {
  display: block;
}
</style>