<script setup>
defineProps({
  response: Object,
  request: Object
});
</script>

<template>
  <div class="debug-panel">
    <div class="debug-section response-block">
      <div class="label">GRID:</div>
      <div class="grid-row" v-for="(row, i) in response?.grid" :key="i">
        [ <span class="val">{{ row[0] }}</span>, <span class="val">{{ row[1] }}</span>, <span class="val">{{ row[2] }}</span> ]
      </div>
    </div>
    
    <div class="debug-section inline">
      <span class="label">WIN:</span> <span class="val">{{ response?.win }}</span>
    </div>

    <div class="debug-section">
      <div class="label">WIN_LINES:</div>
      <div v-for="(line, index) in response?.winLineData" :key="index" class="win-line-item">
        <div>SYMBOL: <span class="val">{{ line.symbol }}</span></div>
        <div>LENGTH: <span class="val">{{ line.length }}</span></div>
        <div>ID: <span class="val">{{ line.winLineId }}</span></div>
        <div>CASH: <span class="val">{{ line.win }}</span></div>
      </div>
    </div>

    <div class="debug-section request-block" v-if="request">
      <br>
      <div class="label">SPIN REQUEST:</div>
      <div>bet: <span class="val">{{ request.bet }}</span></div>
    </div>
    
  </div>
</template>

<style scoped>
.debug-panel {
  color: white;
  font-family: monospace;
  font-size: 14px;
  margin-left: 40px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.label { font-weight: bold; }
.inline .label { margin-right: 10px; }
.val { color: #ffd700; }
.grid-row { margin-left: 10px; letter-spacing: 2px; }
.win-line-item { 
  margin-left: 10px; 
  padding-left: 10px; 
  border-left: 1px solid #333;
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 5px;
}
</style>