<script setup>
const audio = new Audio('/assets/audio/logoSound.mp3');
audio.volume = 0.8;

const playLogoSound = () => {
  if (!audio.paused) return;
  audio.currentTime = 0;
  audio.play();
};
</script>

<template>
  <img src="/logo.png" class="game-logo" alt="Sztosy Waifu Slots" @click="playLogoSound">
</template>

<style scoped>
.game-logo {
  position: absolute;
  top: var(--app-padding);
  left: var(--app-padding);
  width: 22.5vh; 
  max-width: var(--logo-max-width); 
  z-index: 100;
  opacity: 0.9; 
  filter: drop-shadow(0 0 20px rgba(0, 0, 0, 0.8)) drop-shadow(0 0 1.5em var(--btn-gold-glow)) drop-shadow(0 0 1.5em var(--btn-gold-glow));
  pointer-events: auto;
  cursor: pointer;
  transition: all 0.1s ease-in-out;
}

.game-logo:hover {
  transform: scale(1.09);
}
.game-logo:active {
  transition: all 0.05s ease-out;
  transform: scale(1.03); 
}

@media (max-aspect-ratio: 18/10) {
  .game-logo {
    display: none;
  }
}
</style>