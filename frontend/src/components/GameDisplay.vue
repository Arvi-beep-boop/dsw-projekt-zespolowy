<template>
  <div class="display-wrapper">
    <div class="reels-frame">
      <div class="placeholder-grid">
        <div v-for="i in 3" :key="i" class="reel-column">
          <div v-for="j in 3" :key="j" class="symbol-slot"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.display-wrapper {
  width: 100%;
  height: 100%;
  padding: 0 0 1.5em 0  ; /* To tworzy ten "automatyczny" odstęp od krawędzi maszyny */
  display: flex;
  justify-content: center;
  align-items: center;
}

.reels-frame {
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  border: 0.25em solid var(--btn-gold-border);
  border-radius: 0.5em;
  box-shadow: inset 0 0 2em rgba(0, 0, 0, 0.9), var(--glow-frame);
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