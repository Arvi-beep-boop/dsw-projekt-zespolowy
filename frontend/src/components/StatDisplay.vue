<template>
  <div class="stat-box">
    <div class="stat-row">
      <div class="stat-label">{{ label }}</div>
    </div>
    
    <div class="stat-row">
      <div class="value-frame">{{ value }} {{ unit }}</div>
    </div>
    
    <div class="stat-row"></div>
  </div>
</template>

<script setup>
// Odbiór danych do wyświetlenia w panelu UI
defineProps(['label', 'value', 'unit']);
</script>

<style scoped>
/* --- KONTENER GŁÓWNY --- */
.stat-box {
  display: flex;
  flex-direction: column;
  flex: 1; 
  height: 100%; /* Wymusza wypełnienie całej wysokości z App.vue */
  min-height: 0;
  
}

/* --- WIERSZE W KONTENERZE --- */
/* Dzieli komponent na 3 równe piętra (każde zajmuje 1/3 wysokości) */
.stat-row {
  flex: 1;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 0;
}

/* --- TEKST (LABEL) --- */
.stat-label { 
  font-family: var(--font-primary);
  font-size: 2.5em; 
  color: var(--text-muted);

  text-transform: uppercase; 
  font-weight: bold;
  letter-spacing: 0.05em;
  margin-bottom: 0.7em;

  -webkit-text-stroke: 2px var(--text-outline);
  
  
}

/* --- RAMKA Z WARTOŚCIĄ --- */
.value-frame {
  width: 100%;
  height: 100%; /* Wypełnia całą dostępną 1/3 wysokości (równo z przyciskiem BET) */
  box-sizing: border-box; /* Zapobiega rozpychaniu wymiarów przez grubość ramki (border) */
  
  display: flex;
  justify-content: center;
  align-items: center;
  
  font-size: 1.8em;
  font-weight: bold;
  background-color: var(--bg-valueFrame); 
  border: 0.15em solid var(--btn-gold-border); 
  border-radius: 0.8em; 
  color: var(--text-light); 
  
  
  box-shadow: 
    inset 0 0 0.8em rgba(0, 0, 0, 0.158), 
    0 0.3em 0.5em rgba(255, 255, 255, 0.459);
  text-shadow: var(--glow-text);
  
}
</style>