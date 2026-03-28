<template>
  <div class="bet-wrapper">
    
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

    <button class="bet-main-btn" @click="toggleBetMenu">
      BET: {{ currentBet }}
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
  margin-bottom: 40%; 
}

.bet-dropdown {
  position: absolute;
  bottom: 105%; 
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  gap: 0.4em;
  width: 80%; 
  z-index: 10;
}

.bet-option {
  background-color: var(--bg-machine); /* Kolor z roota zamiast #333 */
  border: 0.05em solid var(--gold-main);  /* Złoty z roota */
  color: var(--text-light);
  padding: 0.5em 0;
  text-align: center;
  cursor: pointer;
  font-weight: bold;
  border-radius: 0.2em;
}

.bet-option:hover {
  background-color: var(--bg-panel);
  color: var(--gold-main);
}

.bet-main-btn {
  width: 80%;
  aspect-ratio: 2 / 1;
  cursor: pointer;
  font-size: 1.1em;
  margin-bottom: 0; 
  /* Tymczasowe kolory, dopóki nie zrobimy "złotych przycisków" z Twojego PR */
  background-color: var(--bg-panel);
  color: var(--gold-main);
  border: 0.05em solid var(--gold-main);
  border-radius: 0.2em;
}
</style>