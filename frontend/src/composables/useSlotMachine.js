import { ref } from 'vue';
import { fetchInitialState, spinReelsAPI, reloadBalance } from '../api/gameApi';
import { EventBus } from '../game/EventBus';
import { getWinSoundKey } from '../utils/audioHelpers';

export function useSlotMachine() {
    const SCALAR = 100;
    const balance = ref(0);
    const win = ref(0);
    const currentBet = ref(1);
    const availableBets = ref([1, 2, 3, 4]);
    const isSpinning = ref(false);

    const handleBetChange = (newAmount) => {
        currentBet.value = newAmount;
    };

    const loadInitialState = async () => {
        const initState = await fetchInitialState();
        if (initState) {
            balance.value = initState.newBalance / SCALAR;
        }
    };

    const handleSpin = async () => {
        if (isSpinning.value) return;
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

                        if (result.numFreeSpinsAwarded > 0) {
                            if (!musicWasFaded) {
                                EventBus.emit('bg-music-fade-out', 300);
                                musicWasFaded = true; 
                            }
                            EventBus.emit('play-audio', 'win-scatter', 0.5, 0);
                        }

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
                EventBus.emit('stop-audio', 'win-scatter', 750);
                EventBus.emit('bg-music-fade-in', 750, 0.7);
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
    };

    return {
        balance,
        win,
        currentBet,
        availableBets,
        isSpinning,
        handleBetChange,
        handleSpin,
        handleReload,
        loadInitialState
    };
}