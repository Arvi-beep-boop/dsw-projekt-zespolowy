<script setup>
import { watch } from 'vue';
import { EventBus } from '../game/EventBus';
const props = defineProps({
    isSpinning: Boolean,
})
defineEmits(['spin']);
watch(() => props.isSpinning, (newValue) => {
    if (newValue === true) {
        EventBus.emit('play-audio', 'btn-press', 1, 0);
    } else {
        EventBus.emit('play-audio', 'btn-release', 1,  0);
    }
});
</script>

<template>
  <button 
    class="btn-gold-3d spin-btn"
    :disabled="isSpinning"
    @click="$emit('spin')"
  >
    SPIN
  </button>
</template>

<style scoped>
.spin-btn {
  height: 100%; 
  aspect-ratio: 1 / 1; 
  border-radius: 50%;
  font-size: 2.5em;
  font-family: var(--font-primary);
  z-index: 100;
  flex-shrink: 0; 
}

.spin-btn:disabled {
    filter: grayscale(80%) brightness(0.7);
    cursor: not-allowed;
    transform: none;
}
</style>