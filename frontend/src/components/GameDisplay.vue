<script setup>
import PhaserGame from '../PhaserGame.vue';
</script>

<template>
  <div class="display-wrapper">
    <div class="reels-frame">
      <PhaserGame />
    </div>
  </div>
</template>

<style scoped>
.display-wrapper {
  width: 100%;
  height: 100%;
  padding: 0 0 1.5em 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.reels-frame {
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0);
  border: 0.25em solid var(--btn-gold-border);
  border-radius: 0.5em;
  box-shadow:var(--glow-frame);
  position: relative;
  overflow: hidden;
}

.placeholder-grid {
  display: flex;
  width: 100%;
  height: 100%;
}

.reel-column {
  flex: 1;
  border-right: 0.1em solid rgba(197, 176, 129, 0.2);
  display: flex;
  flex-direction: column;
}

.reel-column:last-child {
  border-right: none;
}

.symbol-slot {
  flex: 1;
  border-bottom: 0.1em solid rgba(197, 176, 129, 0.1);
}
</style>