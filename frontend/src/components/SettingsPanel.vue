<script setup>
defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
  isSpinning: {
    type: Boolean,
    required: true
  }
});

const emit = defineEmits(['force-spin']);

const forceMap = {
  'H1': 1, 'H2': 2, 'M1': 3, 'M2': 4,
  'L1': 5, 'L2': 6, 'L3': 7, 'FREE_SPINS': 8
};

const forceResult = (type) => {
  const id = forceMap[type];
  if (id) {
    emit('force-spin', id);
  }
};
</script>

<template>
  <div v-if="isOpen" class="settings-panel">
    
    <h2 class="god-mode-title">GOD<span class="mobile-break"> </span>MODE</h2>
    
    <div class="buttons-container">
      <div class="btn-row">
        <button @click="forceResult('H1')" class="force-btn small-btn" :disabled="isSpinning">H1</button>
        <button @click="forceResult('H2')" class="force-btn small-btn" :disabled="isSpinning">H2</button>
      </div>
      <div class="btn-row">
        <button @click="forceResult('M1')" class="force-btn small-btn" :disabled="isSpinning">M1</button>
        <button @click="forceResult('M2')" class="force-btn small-btn" :disabled="isSpinning">M2</button>
      </div>
      <div class="btn-row">
        <button @click="forceResult('L1')" class="force-btn small-btn" :disabled="isSpinning">L1</button>
        <button @click="forceResult('L2')" class="force-btn small-btn" :disabled="isSpinning">L2</button>
        <button @click="forceResult('L3')" class="force-btn small-btn" :disabled="isSpinning">L3</button>
      </div>
      <div class="btn-row">
        <button @click="forceResult('FREE_SPINS')" class="force-btn wide-btn" :disabled="isSpinning">Free Spins</button>
      </div>
    </div>
    <img :src="'/assets/sztosy.png'" class="bottom-img" />
  </div>
</template>

<style scoped>
.settings-panel {
  position: absolute;
  top: calc(var(--app-padding) + 55px);
  right: var(--app-padding);
  width: 335px;
  height: 480px;
  background-color: rgba(131, 131, 131, 0.329);
  backdrop-filter: blur(8px);
  z-index: 9999;
  padding: 20px;
  display: flex;
  flex-direction: column;
  transform: translateX(5px);
}


.buttons-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-top: auto; 
  margin-top: 0%; 
}

.btn-row {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.force-btn {
  background-color: #63636377;
  color: white;
  border: 1px solid rgba(224, 224, 224, 0.7);
  border-radius: 4px;
  cursor: pointer;
  font-family: sans-serif;
  font-size: 16px;
  font-weight: bold;
  transition: all 0.1s ease;
}

.force-btn:active:not(:disabled) {
  transform: scale(0.9);
}

.force-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  border-color: rgba(255, 255, 255, 0.3);
}

.small-btn {
  width: 60px;
  aspect-ratio: 2 / 1;
}

.wide-btn {
  padding: 10px 20px;
  width: auto;
}

.bottom-img {
  width: calc(100% + 40px);
  margin-left: -20px;
  margin-bottom: -20px;
  margin-top: auto;
  object-fit: cover;
  padding-top: 10px;
}

.god-mode-title {
  color: white;
  text-align: center;
  margin: 0 0 20px 0;
  font-family: 'Arial Black', sans-serif;
  font-size: 28px; /* Rozmiar tekstu */
  font-weight: 900;
  letter-spacing: 4px;
  text-transform: uppercase;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.8), 0 0 20px rgba(0, 195, 255, 0.6); 
  z-index: 2;
}

.force-btn:hover:not(:disabled) {
  background-color: var(--btn-gold-hover);
  border-color: var(--btn-gold-border-hover);
  box-shadow: var(--glow-frame);
  color: var(--btn-gold-text-glow);
  text-shadow: var(--glow-text);
}

.mobile-break {
  display: inline;
}

@media (max-width: 1850px) {
  .settings-panel {
    width: max-content;
    height: auto;
    padding: 10px;
    transform: translateX(0);
  }

  .bottom-img {
    display: none;
  }

  .mobile-break {
    display: block;
  }

  .god-mode-title {
    font-size: 20px;
    line-height: 1.2;
  }

  .buttons-container {
    flex-direction: column-reverse;
    gap: 10px;
  }

  .btn-row {
    flex-direction: column-reverse;
    gap: 10px;
  }

  .force-btn, .small-btn, .wide-btn {
    width: 100px;
    aspect-ratio: auto;
    padding: 10px;
  }
}
</style>