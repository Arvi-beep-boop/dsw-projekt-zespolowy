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
        isSpinning.value = true;
        
        activeSpinId++;
        const mySpinId = activeSpinId;
        
        let musicWasFaded = false;
        let freeSpinsPopupShown = false; 
        const backendBet = currentBet.value * SCALAR;

        try {
            const response = await spinReelsAPI(backendBet);

            if (response && response.gameResult && response.gameResult.length > 0) {
                balance.value = response.newBalance / SCALAR;
                win.value = 0;
                
                for (let i = 0; i < response.gameResult.length; i++) {
                    const result = response.gameResult[i];
                    const isLast = i === response.gameResult.length - 1;
                    
                    if (mySpinId !== activeSpinId) return;

                    // 1. autoSpinInterval - Odstęp przed startem w trybie auto/free
                    if (i > 0) {
                        await new Promise(resolve => setTimeout(resolve, GAME_SETTINGS.timings.autoSpinInterval));
                    }
                    
                    if (mySpinId !== activeSpinId) return;
                    
                    // 2. spinDurationBeforeStop - Start i kręcenie
                    EventBus.emit('spin-start');
                    await new Promise(resolve => setTimeout(resolve, GAME_SETTINGS.timings.spinDurationBeforeStop));
                    
                    // 3. reelsStopDuration - Hamowanie
                    EventBus.emit('spin-stop', result);
                    
                    await new Promise(resolve => {
                        const onReelsStopped = () => {
                            EventBus.off('all-reels-stopped', onReelsStopped);
                            resolve();
                        };
                        EventBus.on('all-reels-stopped', onReelsStopped);
                    });
                    
                    // 4. showWinsDelay - Krótki "oddech" na zobaczenie siatki
                    await new Promise(resolve => setTimeout(resolve, GAME_SETTINGS.timings.showWinsDelay));
                    
                    // QUICK SPIN: Odblokowujemy przycisk dla gracza już teraz.
                    // Nawet jeśli zaraz zaczną się animacje wygranej, gracz może kliknąć "Spin" ponownie.
                    if (isLast) {
                        isSpinning.value = false;
                    }

                    win.value = result.cumulativeWinMoney / SCALAR;
                    
                    // --- LOGIKA DARMOWYCH SPINÓW ---
                    if (result.numFreeSpinsAwarded > 0 && !freeSpinsPopupShown) {
                        freeSpinsPopupShown = true; 
                        if (!musicWasFaded) {
                            EventBus.emit('bg-music-fade-out', 1000);
                            musicWasFaded = true; 
                        }
                        EventBus.emit('play-audio', 'win-scatter', 0.5, 0);
                        EventBus.emit('show-free-spins-announcement', result.numFreeSpinsAwarded);
                        await new Promise(resolve => {
                            const onFinished = () => {
                                EventBus.off('free-spins-popup-finished', onFinished);
                                resolve();
                            };
                            EventBus.on('free-spins-popup-finished', onFinished);
                        });
                    }

                    // --- LOGIKA NORMALNEJ WYGRANEJ ---
                    const hasWin = result.winLineWinData && result.winLineWinData.length > 0;
                    if (hasWin) {
                        const soundToPlay = getWinSoundKey(result);
                        if (soundToPlay) {
                            EventBus.emit('play-audio', soundToPlay, AUDIO_SETTINGS.volumes.win, 0);
                        }
                        if (mySpinId === activeSpinId) {
                            EventBus.emit('trigger-fountain');
                        }
                    }
                    
                    // --- SYNCHRONIZACJA DLA DARMOWYCH SPINÓW ---
                    if (!isLast) {
                        // Jeśli to darmowe spiny, MUSIMY poczekać na koniec animacji, 
                        // inaczej gra przeleci przez wszystkie spiny w 2 sekundy.
                        if (hasWin) {
                            const waitTime = GAME_SETTINGS.timings.cooldownWin - GAME_SETTINGS.timings.autoSpinInterval;
                            await new Promise(resolve => setTimeout(resolve, Math.max(0, waitTime)));
                        }
                    }
                    // W przypadku zwykłego spina (isLast), pętla się kończy i przycisk jest już aktywny.
                }
            }
            
            if (mySpinId === activeSpinId) {
                if (musicWasFaded) {
                    EventBus.emit('stop-audio', 'win-scatter', 750);
                    EventBus.emit('bg-music-fade-in', 750, 0.7);
                }
                isSpinning.value = false;
            }
            
        } catch (error) {
            console.error("Błąd podczas spina:", error);
            if (mySpinId === activeSpinId) isSpinning.value = false;
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
            console.error("Błąd reloadu:", error);
        }
    };

    return {
        balance, win, currentBet, availableBets, isSpinning,
        handleBetChange, handleSpin, handleReload, loadInitialState
    };
}