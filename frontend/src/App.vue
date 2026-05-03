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
    let musicWasFaded = false;
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
                await new Promise(resolve => setTimeout(resolve, 400));
                win.value = result.cumulativeWinMoney / SCALAR;
                
                const hasWin = result.winLineWinData && result.winLineWinData.length > 0;
                const isLast = i === response.gameResult.length - 1;
                // Odblokowujemy przycisk "Spin" zaraz po zatrzymaniu bębnów (1100ms).
                // Dzięki temu gracz może pominąć animację wygranej, jeśli chce grać szybciej.
                const cooldownTime = (hasWin && !isLast) ? 3400 : 1200;
                
                if (result.numFreeSpinsAwarded > 0) {
                    if (!musicWasFaded) {
                        EventBus.emit('bg-music-fade-out', 1000);
                        musicWasFaded = true; 
                    }
                    EventBus.emit('play-audio', 'win-scatter', 0.5, 1400);
                }

                if (hasWin) {
                    const soundToPlay = getWinSoundKey(result);
                    
                    let myVol = 0.9;
                    let myDelay = 1400;

                    // --- 1. LOGIKA MUZYKI TŁA (SCATTER) ---
                    if (result.numFreeSpinsAwarded > 0) {
                        if (!musicWasFaded) {
                            EventBus.emit('bg-music-fade-out', 1000);
                            musicWasFaded = true; 
                        }
                        // Głośność scattera obniżona, by linie mogły się przebić przez tło
                        EventBus.emit('play-audio', 'win-scatter', 0.5, myDelay);
                    }

                    // --- 2. LOGIKA EFEKTÓW LINII WYGRYWAJĄCYCH ---
                    if (soundToPlay) {
                        if (soundToPlay === 'win-high') {
                            EventBus.emit('play-audio', 'win-high', myVol, myDelay);
                        } 
                        else if (soundToPlay === 'win-medium') {
                            EventBus.emit('play-audio', 'win-medium', myVol, myDelay);
                        } 
                        else if (soundToPlay === 'win-low') {
                            EventBus.emit('play-audio', 'win-low', myVol, myDelay);
                        }
                    }

                    setTimeout(() => {
                        if (!isSpinning.value || !isLast) {
                            EventBus.emit('trigger-fountain');
                        }
                    }, 1300);
                }
                
                await new Promise(resolve => setTimeout(resolve, cooldownTime));
            }
        }
        
        if (musicWasFaded) {
            // Wycisz muzyke scattera, wartość fade-out = 750ms
            EventBus.emit('stop-audio', 'win-scatter', 750);
            // Włącz background music, wartość fade-in = 750ms, docelowa głośność na powrót 0.7 max głośności
            EventBus.emit('bg-music-fade-in', 750, 0.7);
        }

        isSpinning.value = false;
        
    } catch (error) {
        console.error(error.message);
        alert("Spin odrzucony: Sprawdź saldo lub stawkę.");
        isSpinning.value = false;
    }
};

const getWinSoundKey = (result) => {
    if (!result.winLineWinData || result.winLineWinData.length === 0) {
        return null;
    }

    let hasHigh = false;
    let hasMedium = false;
    let hasLow = false;

    for (const line of result.winLineWinData) {
        const symbolId = line.symbol; 
        
        if (symbolId === 1 || symbolId === 2 || symbolId === 9) {
            hasHigh = true;
        } 
        else if (symbolId === 3 || symbolId === 4) {
            hasMedium = true;
        }
        else if (symbolId === 5 || symbolId === 6 || symbolId === 7) {
            hasLow = true;
        }
    }

    if (hasHigh) return 'win-high';
    if (hasMedium) return 'win-medium';
    if (hasLow) return 'win-low';
    
    return null;
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