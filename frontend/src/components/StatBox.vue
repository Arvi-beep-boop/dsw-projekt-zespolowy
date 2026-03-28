<template>
  <div class="stat-box">
    <div class="stat-label">{{ label }}</div>
    <div class="value-frame">{{ value }} {{ unit }}</div>
  </div>
</template>

<script setup>
defineProps(['label', 'value', 'unit']);
</script>

<style scoped>
.stat-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1; 
  gap: 0.4em;
}

.stat-label { 
  font-size: 0.8em; 
  color: var(--text-muted); /* <--- ZMIANA: ciągnie szary z roota */
  text-transform: uppercase; 
}

.value-frame {
  width: 90%;
  aspect-ratio: 4 / 1;
  border: 0.05em solid #444; /* Zostawiamy ciemną ramkę, żeby nie zlewało się z tłem */
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.2em;
  background-color: var(--bg-panel); /* <--- ZMIANA: ciągnie tło panelu z roota */
  color: var(--text-light);          /* <--- ZMIANA: jasny tekst z roota */
}
</style>