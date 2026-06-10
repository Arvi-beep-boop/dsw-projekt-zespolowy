<script setup>
import { watch } from 'vue';
import { EventBus } from '../game/EventBus';
import { AUDIO_SETTINGS } from '../game/settings';

const props = defineProps({
    isSpinning: Boolean,
})
defineEmits(['spin']);
watch(() => props.isSpinning, (newValue) => {
    if (newValue === true) {
        EventBus.emit('play-audio', 'btn-press', AUDIO_SETTINGS.volumes.spinBtn, 0);
    } else {
        EventBus.emit('play-audio', 'btn-release', AUDIO_SETTINGS.volumes.spinBtn,  0);
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
    filter: grayscale(30%) brightness(0.8);
    cursor: not-allowed;
    transform: none;
}
</style>