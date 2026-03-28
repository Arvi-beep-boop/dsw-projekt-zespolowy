<template>
  <div class="app-wrapper">
    <div class="machine-container">
      
      <div class="top-section">
        <div class="game-section"></div>
        <div class="spin-section">
          <button class="bet-main-btn">BET</button>
        </div>
      </div>

      <div class="bottom-section">
        <div class="bottom-left">
          
          <div class="stat-box">
            <div class="stat-label">BALANCE</div>
            <div class="value-frame">1000.00 €</div>
          </div>

          <div class="stat-box">
            <div class="stat-label">WIN</div>
            <div class="value-frame">0.00 €</div>
          </div>

          <div class="stat-box">
            <div class="stat-label">BET</div>
            <div class="value-frame">10.00</div>
          </div>

        </div>

        <div class="bottom-right">
          <button class="spin-btn">SPIN</button>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.app-wrapper {
  background-color: #111;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-family: sans-serif;
}

.machine-container {
  width: 1024px;
  height: 768px;
  display: flex;
  flex-direction: column;
  background-color: #222;
  font-size: 16px; 
  border: 0.15em solid #555;
}

.top-section { height: 85%; display: flex; }
.bottom-section { height: 15%; display: flex; }

.game-section { width: 85%; border: 0.06em solid #444; }

.spin-section {
  width: 15%;
  border: 0.06em solid #444;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  padding-bottom: 2%;
}

.bottom-left {
  width: 85%;
  border: 0.06em solid #444;
  display: flex;
  justify-content: space-evenly;
  align-items: center;
}

.bottom-right {
  width: 15%;
  border: 0.06em solid #444;
  display: flex;
  justify-content: center;
  align-items: center;
}

.stat-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 28%;
  gap: 0.4em;
}

.stat-label { font-size: 0.8em; color: #aaa; }

.value-frame {
  width: 100%;
  aspect-ratio: 4 / 1;
  border: 0.06em solid #444;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.2em;
}

.bet-main-btn {
  width: 60%;
  aspect-ratio: 2 / 1;
  font-size: 1em;
  cursor: pointer;
  margin-bottom: 15%;
}

.spin-btn {
  width: 70%;
  aspect-ratio: 1 / 1;
  font-size: 1.1em;
  font-weight: bold;
  cursor: pointer;
}
</style>