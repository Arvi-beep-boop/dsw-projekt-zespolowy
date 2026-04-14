<script setup>
import StatDisplay from './StatDisplay.vue';
import BetSelector from './BetSelector.vue';
import SpinButton from './SpinButton.vue';
import ResetButton from './ResetButton.vue';

defineProps({
  balance: Number,
  win: Number,
  currentBet: Number,
  availableBets: Array
});

defineEmits(['update-bet', 'spin', 'reset']);
</script>

<template>
  <div class="bottom-section">
    
    <div class="panel-left">
      <StatDisplay label="BALANCE" :value="balance" unit="€" />
      <StatDisplay label="WIN" :value="win" unit="€" />
      <StatDisplay label="BET" :value="currentBet" unit="€" />
    </div>

    <div class="panel-right">
      <div class="bet-container">
        <BetSelector 
          :current-bet="currentBet" 
          :available-bets="availableBets"
          @update-bet="$emit('update-bet', $event)" 
        />
      </div>
        <ResetButton class="bet-container" @reset="$emit('reset')" />
      <SpinButton @spin="$emit('spin')" />
    </div>
    
  </div>
</template>

<style scoped>
/* --- SEKCJA UI (Pasek dolny interfejsu) --- */
.bottom-section { 
  height: 15%; 
  width: 100%;
  display: flex; 
  justify-content: space-between; 
  align-items: center;
  gap: var(--ui-gap); 
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
  gap: var(--ui-gap); 
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
  gap: var(--ui-gap); 
}

.bet-container {
  height: 33.33%; 
  aspect-ratio: 2 / 1; 
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>