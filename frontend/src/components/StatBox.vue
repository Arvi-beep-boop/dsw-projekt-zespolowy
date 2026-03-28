<template>
  <div class="stat-box">
    <div class="stat-label">{{ label }}</div>
    <div class="value-frame">{{ value }} {{ unit }}</div>
  </div>
</template>

<script setup>
/* Komentarz: Odbieramy propsy, żeby wyświetlić odpowiednie statystyki */
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
  /* Ciągnie szary z roota w main.css */
  color: var(--text-muted); 
  text-transform: uppercase; 
  font-weight: bold;
  letter-spacing: 0.05em;
}

.value-frame {
  width: 90%;
  aspect-ratio: 4 / 1;
  /* Zostawiamy ciemną ramkę 1px, żeby pasowała do matrycy 1024x768 */
  border: 1px solid #444; 
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.2em;
  font-weight: bold;
  /* Ciągnie tło panelu i kolor tekstu z roota */
  background-color: var(--bg-panel); 
  color: var(--text-light);          
  border-radius: 0.2em; /* Lekkie zaokrąglenie, żeby pasowało do przycisku BET */
}
</style>