<script setup>
import { ref, onMounted } from 'vue';
import GameLogo from './components/GameLogo.vue';
import GameDisplay from './components/GameDisplay.vue';
import ControlPanel from './components/ControlPanel.vue';
import CoinFountain from './components/CoinFountain.vue';
import LebronEgg from './components/LebronEgg.vue';
import WinIndicator from './components/WinIndicator.vue';
import { fetchInitialState, spinReelsAPI, reloadBalance } from './api/gameApi';
import { EventBus } from './game/EventBus';

const SCALAR = 100;
const balance = ref(0);
const win = ref(0);
const currentBet = ref(1);
const availableBets = ref([1, 2, 3, 4])
const isSpinning = ref(false);

const handleBetChange = (newAmount) => {
    currentBet.value = newAmount;
};

onMounted(async () => {
    const initState = await fetchInitialState();
    if (initState) {
        balance.value = initState.newBalance / SCALAR;
    }
});

const handleSpin = async () => {
    if (isSpinning.value) return
    isSpinning.value = true;
    const backendBet = currentBet.value * SCALAR;

    try {
        const response = await spinReelsAPI(backendBet);

        if (response && response.gameResult && response.gameResult.length > 0) {
            balance.value = response.newBalance / SCALAR;
            win.value = 0;
            
            for (let i = 0; i < response.gameResult.length; i++) {
                const result = response.gameResult[i];
                
                if (i > 0) {
                    await new Promise(resolve => setTimeout(resolve, 600));
                }
                
                EventBus.emit('spin-start');
                await new Promise(resolve => setTimeout(resolve, 600));
                
                EventBus.emit('spin-stop', result);
                await new Promise(resolve => setTimeout(resolve, 800));
                win.value = result.cumulativeWinMoney / SCALAR;
                
                const hasWin = result.winLineWinData && result.winLineWinData.length > 0;
                const isLast = i === response.gameResult.length - 1;
                // Odblokowujemy przycisk "Spin" zaraz po zatrzymaniu bębnów (1100ms).
                // Dzięki temu gracz może pominąć animację wygranej, jeśli chce grać szybciej.
                const cooldownTime = (hasWin && !isLast) ? 3400 : 1100;
                
                if (hasWin) {
                    setTimeout(() => {
                        // Odpal fontannę tylko jeśli gracz nie kliknął już kolejnego spina
                        if (!isSpinning.value || !isLast) {
                            EventBus.emit('trigger-fountain');
                        }
                    }, 1300);
                }
                
                await new Promise(resolve => setTimeout(resolve, cooldownTime));
            }
        }
        
        isSpinning.value = false;
        
    } catch (error) {
        console.error(error.message);
        alert("Spin odrzucony: Sprawdź saldo lub stawkę.");
        isSpinning.value = false;
    }
};

const handleReload = async () => {
    try {
        await reloadBalance();
        const freshState = await fetchInitialState();
        
        if (freshState && freshState.newBalance !== undefined) {
            balance.value = freshState.newBalance / SCALAR;
            win.value = 0;
        }
    } catch (error) {
        console.error("Wystąpił błąd:", error);
    }
}  
</script>

<template>
  <div class="app-wrapper"> 
    <CoinFountain />
    <LebronEgg />
    <GameLogo />
    
    <div class="machine-container">
      
      <div class="top-section">
        <div class="game-section">
          <GameDisplay />
          <WinIndicator />
        </div>
      </div>
      <!--Wstrzykujemy bieżące wartości ze stanu UI (const balance, win itp.) do komponentu. 
        @update-bet: Wywołuje handleBetChange, gdy gracz zmieni stawkę w menu.
        @spin: Wywołuje handleSpin, inicjując cykl losowania i komunikację z API. -->
      <ControlPanel 
        :balance="balance" 
        :win="win" 
        :current-bet="currentBet"
        :available-bets="availableBets"
        :is-spinning="isSpinning"
        @update-bet="handleBetChange"
        @spin="handleSpin"
        @reset="handleReload"
      />

    </div>
  </div>
</template>

<style scoped>
/* --- KONTENER GŁÓWNY (Tło i centrowanie) --- */
.app-wrapper {
  position: relative;
  /* vw/vh (Viewport Units): Gwarantują zajęcie 100% okna przeglądarki niezależnie od rozmiaru rodzica (body). 
  1vw i 1vh to dokładnie 1% szerokości okna przeglądarki.*/
  width: 100vw;
  height: 100vh;
  /* --app-padding Pobranie stałej z :root (main.css). Zapobiega stykaniu się maszyny z krawędzią okna i umożliwia globalną zmianę marginesów w jednym pliku. */
  padding: var(--app-padding);
  background-image: url('background.jpg'); 
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  /* Domyślne tło gdyby nie załadowało jpg */
  background-color: var(--bg-app);
  display: flex;
  justify-content: center;
  align-items: center;
}

/* --- SZKIELET MASZYNY (Wymuszony rzut 4:3) --- */
.machine-container {
  /* Wymuszenie stałych proporcji automatu (4:3) niezależnie od rozdzielczości.
  Wykorzystanie dynamicznych zmiennych do zachowania sztywnego rzutu ekranu; 
  max-width uzależnia szerokość od bieżącej wysokości, 
  blokując deformację proporcji na monitorach panoramicznych.*/
  aspect-ratio: 4 / 3;
  width: var(--available-width);
  max-height: var(--available-height);
  max-width: calc(var(--available-height) * (4 / 3));
  display: flex;
  flex-direction: column;
  gap: 0; 
  /* Funkcja min() wybiera mniejszą wartość z dwóch jednostek viewportu, 
  dzięki czemu interfejs i teksty skalują się proporcjonalnie 
  do krótszej krawędzi ekranu, nie wychodząc poza ramy maszyny. */
  font-size: min(1.1vw, 1.8vh);
  position: relative;
}

/* --- SEKCJA GRY (Obszar pod Phasera) --- */
.top-section { 
  flex: 1; 
  width: 100%;
  display: flex; 
}

.game-section { 
  position: relative;
  width: 100%; 
  height: 100%;
}
</style>