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
  transform: translateY(-0.8em);
}

.stat-label { 
  font-size: 1.5em; 
  /* Ciągnie szary z roota w main.css */
  color: var(--text-muted); 
  text-transform: uppercase; 
  font-weight: bold;
  letter-spacing: 0.05em;
  
}

.value-frame {
  width: 90%;
  
  /* --- ZMIANA WYSOKOŚCI --- */
  /* Zmienione z 4/1. Jeśli chcesz jeszcze niższe, wpisz np. 6/1 */
  aspect-ratio: 5.5 / 1; 
  
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.8em;
  font-weight: bold;
  
  background-color: rgba(15, 15, 15, 0.85); 
  
  /* --- ZMIANA GRUBOŚCI RAMKI --- */
  /* Pogrubione z 0.15em na 0.25em */
  border: 0.15em solid var(--btn-gold-border); 
  
  border-radius: 0.8em; 
  color: var(--text-light); 
  
  box-shadow: 
    inset 0 0 0.8em rgba(0, 0, 0, 0.9), 
    0 0.3em 0.5em rgba(0, 0, 0, 0.4);
  text-shadow: 0 0 0.5em var(--btn-gold-text-glow); /* Tworzy poświatę wokół liter */
}
</style>