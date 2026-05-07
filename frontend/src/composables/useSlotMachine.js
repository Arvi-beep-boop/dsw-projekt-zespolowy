import { ref } from 'vue';
import { fetchInitialState, spinReelsAPI, reloadBalance } from '../api/gameApi';
import { EventBus } from '../game/EventBus';
import { getWinSoundKey } from '../utils/audioHelpers';
import { AUDIO_SETTINGS, GAME_SETTINGS } from '../game/settings';

export function useSlotMachine() {
    const SCALAR = 100;
    const balance = ref(0);
    const win = ref(0);
    const currentBet = ref(1);
    const availableBets = ref([1, 2, 3, 4]);
    const isSpinning = ref(false);
    
    let activeSpinId = 0;

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
        isSpinning.value = false; 
        isSpinning.value = true;
        
        activeSpinId++;
        const mySpinId = activeSpinId;
        
        let musicWasFaded = false;
        let freeSpinsPopupShown = false; // Nasza blokada wielokrotnego popupu
        const backendBet = currentBet.value * SCALAR;

        try {
            const response = await spinReelsAPI(backendBet);
            console.log("🔍 DANE Z BACKENDU:", response?.gameResult);

            if (response && response.gameResult && response.gameResult.length > 0) {
                balance.value = response.newBalance / SCALAR;
                win.value = 0;
                
                for (let i = 0; i < response.gameResult.length; i++) {
                    const result = response.gameResult[i];
                    const isLast = i === response.gameResult.length - 1;
                    
                    if (mySpinId !== activeSpinId) return;

                    // Przerwa przed kolejnym spinem w darmowych/auto
                    if (i > 0) {
                        await new Promise(resolve => setTimeout(resolve, GAME_SETTINGS.timings.autoSpinInterval));
                    }
                    
                    if (mySpinId !== activeSpinId) return;
                    
                    EventBus.emit('spin-start');
                    
                    // Czas kręcenia bębnów
                    await new Promise(resolve => setTimeout(resolve, GAME_SETTINGS.timings.spinDurationBeforeStop));
                    
                    EventBus.emit('spin-stop', result);
                    
                    // Czekamy na sygnał, aż bębny fizycznie się zatrzymają
                    await new Promise(resolve => {
                        const onReelsStopped = () => {
                            EventBus.off('all-reels-stopped', onReelsStopped);
                            resolve();
                        };
                        EventBus.on('all-reels-stopped', onReelsStopped);
                    });
                    
                    // Odczekujemy dynamiczny czas z ustawień (pokazanie co wypadło)
                    await new Promise(resolve => setTimeout(resolve, GAME_SETTINGS.timings.showWinsDelay));
                    
                    // Odblokowujemy przycisk po tym czasie,
                    // no chyba że lecą free spiny - wtedy odblokuje się dopiero przy ostatnim w pętli
                    if (isLast && mySpinId === activeSpinId) {
                        isSpinning.value = false;
                    }
                    
                    const hasWin = result.winLineWinData && result.winLineWinData.length > 0;
                    const cooldownTime = (hasWin && !isLast) ? GAME_SETTINGS.timings.cooldownWin : GAME_SETTINGS.timings.cooldownNormal;
                    
                    win.value = result.cumulativeWinMoney / SCALAR;
                    
                    // --- LOGIKA DARMOWYCH SPINÓW ---
                    if (result.numFreeSpinsAwarded > 0 && !freeSpinsPopupShown) {
                        freeSpinsPopupShown = true; // Zabezpieczenie przed kolejnymi iteracjami

                        if (!musicWasFaded) {
                            EventBus.emit('bg-music-fade-out', 1000);
                            musicWasFaded = true; 
                        }
                        EventBus.emit('play-audio', 'win-scatter', 0.5, 0);
                        
                        EventBus.emit('show-free-spins-announcement', result.numFreeSpinsAwarded);

                        // Vue czeka, aż animacja napisu w Phaserze się zakończy
                        await new Promise(resolve => {
                            const onFinished = () => {
                                EventBus.off('free-spins-popup-finished', onFinished);
                                resolve();
                            };
                            EventBus.on('free-spins-popup-finished', onFinished);
                        });
                    }

                    // --- LOGIKA NORMALNEJ WYGRANEJ ---
                    if (hasWin) {
                        const soundToPlay = getWinSoundKey(result);
                        const winVol = AUDIO_SETTINGS.volumes.win; 

                        if (soundToPlay) {
                            if (soundToPlay === 'win-high') {
                                EventBus.emit('play-audio', 'win-high', winVol, 0);
                            } 
                            else if (soundToPlay === 'win-medium') {
                                EventBus.emit('play-audio', 'win-medium', winVol, 0);
                            } 
                            else if (soundToPlay === 'win-low') {
                                EventBus.emit('play-audio', 'win-low', winVol, 0);
                            }
                        }

                        if (mySpinId === activeSpinId) {
                            EventBus.emit('trigger-fountain');
                        }
                    }
                    
                    await new Promise(resolve => setTimeout(resolve, cooldownTime));
                }
            }
            
            // Koniec pętli - przywracamy muzykę
            if (mySpinId === activeSpinId) {
                if (musicWasFaded) {
                    EventBus.emit('stop-audio', 'win-scatter', 750);
                    EventBus.emit('bg-music-fade-in', 750, 0.7);
                }
                isSpinning.value = false;
            }
            
        } catch (error) {
            console.error("Wystąpił błąd podczas spina:", error);
            alert("Spin odrzucony: Sprawdź saldo lub stawkę.");
            if (mySpinId === activeSpinId) {
                isSpinning.value = false;
            }
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