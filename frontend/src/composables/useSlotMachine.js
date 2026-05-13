import { ref } from 'vue';
import { fetchInitialState, spinReelsAPI, reloadBalance, SYMBOL_MAP } from '../api/gameApi';
import { EventBus } from '../game/EventBus';
import { getWinSoundKey } from '../utils/audioHelpers';
import { AUDIO_SETTINGS, GAME_SETTINGS } from '../game/settings';
import { mockScatterResponse } from '../api/mockScatter';

export function useSlotMachine() {
    const SCALAR = 100;
    const balance = ref(0);
    const win = ref(0);
    const currentBet = ref(1);
    const availableBets = ref([1, 2, 5, 10, 20, 50, 100, 500, 1000]);
    const isSpinning = ref(false);
    
    let activeSpinId = 0;
    
    // --- MASZYNA STANÓW ---
    let payoutPhase = 'IDLE'; 
    let payoutTimer = null;
    let transferAnimFrameId = null;
    let currentWinAmount = 0;
    let currentWinSound = null;
    let musicWasFaded = false;
    let isFirstSpinDev = GAME_SETTINGS.dev?.mockScatterFirstSpin || false;

    const startTransferAnim = (customDuration = null) => {
        payoutPhase = 'TRANSFERRING';
        const startWin = win.value;
        let currentWin = startWin;
        
        const duration = customDuration !== null ? customDuration : Math.min(1500, 250 + (startWin * 1.05));
        const startTime = performance.now();

        const step = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            let newWin = Math.round(startWin * (1 - progress));
            if (progress === 1) newWin = 0; 

            const delta = currentWin - newWin; 
            win.value = newWin;
            balance.value = Math.round(balance.value + delta);
            currentWin = newWin;

            if (progress < 1) {
                transferAnimFrameId = requestAnimationFrame(step);
            } else {
                transferAnimFrameId = null;
                payoutPhase = 'IDLE';
            }
        };
        transferAnimFrameId = requestAnimationFrame(step);
    };

    const handleBetChange = (newAmount) => { currentBet.value = newAmount; };

    const loadInitialState = async () => {
        const initState = await fetchInitialState();
        if (initState) balance.value = initState.newBalance / SCALAR;
    };

    const handleSpin = async () => {
        if (isSpinning.value) return;

        // Start spina - zdejmujemy stare animacje wygranych
        EventBus.emit('clear-win-animations');
        EventBus.emit('fs-counter-destroy'); 

        let clearWinText = true;

        const totalSpinTime = GAME_SETTINGS.timings.spinDurationBeforeStop + GAME_SETTINGS.timings.reelsStopDuration; 
        const dynamicHoldTime = Math.round(totalSpinTime * 0.5); 
        const dynamicAnimTime = totalSpinTime - dynamicHoldTime - 50; 

        // --- OBSŁUGA PRZYSPIESZANIA ---
        if (payoutPhase === 'WAITING_150' || payoutPhase === 'WAITING_1000') {
            clearTimeout(payoutTimer);
            EventBus.emit('clear-win-animations'); // Sprzątamy animacje jeśli gracz przyspiesza wypłatę

            if (musicWasFaded) {
                EventBus.emit('crossfade-to-bg'); // Czysty powrót do tła
                musicWasFaded = false;
            }

            if (payoutPhase === 'WAITING_150') {
                win.value = currentWinAmount; 
                if (currentWinSound) {
                    EventBus.emit('play-audio', currentWinSound, AUDIO_SETTINGS.volumes.win, 0);
                }
            }
            
            payoutPhase = 'WAITING_QUICK_SPIN'; 
            clearWinText = false; 
            
            payoutTimer = setTimeout(() => {
                if (payoutPhase !== 'WAITING_QUICK_SPIN') return;
                EventBus.emit('trigger-fountain', currentWinAmount);
                startTransferAnim(dynamicAnimTime); 
            }, dynamicHoldTime); 
        } 
        else if (payoutPhase === 'TRANSFERRING') {
            cancelAnimationFrame(transferAnimFrameId);
            transferAnimFrameId = null;
            if (win.value > 0) balance.value = Math.round(balance.value + win.value);
            payoutPhase = 'IDLE';
            EventBus.emit('clear-win-animations');
        } 

        if (clearWinText) win.value = 0;

        isSpinning.value = true;
        balance.value = Number((balance.value - currentBet.value).toFixed(2));

        activeSpinId++;
        const mySpinId = activeSpinId;
        
        let freeSpinsPopupShown = false; 
        const backendBet = currentBet.value * SCALAR;

        try {
            // --- DEV MODE WSTRZYKIWANIE ---
            let response;
            if (isFirstSpinDev) {
                console.log("🛠️ DEV MODE: Wstrzykuję sztywny JSON (Scatter) na pierwszy spin!");
                response = mockScatterResponse;
                isFirstSpinDev = false; 
                await new Promise(r => setTimeout(r, 200)); 
            } else {
                response = await spinReelsAPI(backendBet);
            }
            // ------------------------------

            const finalBalance = response.newBalance / SCALAR;
            if (response && response.gameResult && response.gameResult.length > 0) {
                for (let i = 0; i < response.gameResult.length; i++) {
                    const result = response.gameResult[i];
                    const isLast = i === response.gameResult.length - 1;
                    
                    if (mySpinId !== activeSpinId) return;
                    
                    if (response.gameResult.length > 1 && i > 0) {
                        const remaining = response.gameResult.length - i; 
                        EventBus.emit('fs-counter-update', remaining); 
                    }

                    EventBus.emit('spin-start');

                    // --- WCZESNE WYCISZANIE TŁA (PRE-FADE) ---
                    if (result.numFreeSpinsAwarded > 0 && !freeSpinsPopupShown && !musicWasFaded) {
                        const totalSpinTime = GAME_SETTINGS.timings.spinDurationBeforeStop + GAME_SETTINGS.timings.reelsStopDuration;
                        const preFadeTime = AUDIO_SETTINGS.fades?.preFadeTime || 200;
                        const earlyFadeDelay = Math.max(0, totalSpinTime - preFadeTime);

                        setTimeout(() => {
                            if (mySpinId === activeSpinId && !musicWasFaded) {
                                EventBus.emit('pre-fade-bg');
                                musicWasFaded = true;
                            }
                        }, earlyFadeDelay);
                    }
                    await new Promise(resolve => setTimeout(resolve, GAME_SETTINGS.timings.spinDurationBeforeStop));
                    
                    EventBus.emit('spin-stop', result);
                    
                    await new Promise(resolve => {
                        const onReelsStopped = () => {
                            EventBus.off('all-reels-stopped', onReelsStopped);
                            resolve();
                        };
                        EventBus.on('all-reels-stopped', onReelsStopped);
                    });
                    
                    if (!isLast) {
                        // --- SPINY WEWNĄTRZ SCATTERA ---
                        await new Promise(resolve => setTimeout(resolve, GAME_SETTINGS.timings.showWinsDelay));
                        if (mySpinId !== activeSpinId) return; 

                        win.value = result.cumulativeWinMoney / SCALAR;
                        let timeSpentOnPopup = 0;

                        if (result.numFreeSpinsAwarded > 0 && !freeSpinsPopupShown) {
                            freeSpinsPopupShown = true; 
                            
                            if (!musicWasFaded) {
                                EventBus.emit('pre-fade-bg');
                                musicWasFaded = true; 
                            }
                            
                            EventBus.emit('play-scatter-sound');
                            
                            EventBus.emit('show-free-spins-announcement', result.numFreeSpinsAwarded);

                            await new Promise(resolve => {
                                const onFinished = () => {
                                    EventBus.off('free-spins-popup-finished', onFinished);
                                    resolve();
                                };
                                EventBus.on('free-spins-popup-finished', onFinished);
                            });
                            
                            EventBus.emit('fs-counter-create', result.numFreeSpinsAwarded); 
                            timeSpentOnPopup = GAME_SETTINGS.timings.freeSpinsPopupTime;
                        }

                        const hasWin = result.winLineWinData && result.winLineWinData.length > 0;
                        let isLongAnimation = false;

                        if (hasWin) {
                            result.winLineWinData.forEach(winData => {
                                const symbolKey = SYMBOL_MAP[winData.symbol]?.toUpperCase();
                                if (symbolKey === 'H1' || symbolKey === 'COIN' || symbolKey === 'LEBRON') {
                                    isLongAnimation = true;
                                }
                            });

                            const soundToPlay = getWinSoundKey(result);
                            if (soundToPlay) {
                                EventBus.emit('play-audio', soundToPlay, AUDIO_SETTINGS.volumes.win, 0);
                            }
                            
                            const baseCooldown = isLongAnimation ? GAME_SETTINGS.timings.cooldownWin : 1280;
                            const waitTime = baseCooldown - timeSpentOnPopup;
                            await new Promise(resolve => setTimeout(resolve, Math.max(0, waitTime)));
                        }
                        
                        // Zabezpieczenie przed przejściem do następnego spina z wiszącymi animacjami
                        EventBus.emit('clear-win-animations');

                    } else {
                        // --- OSTATNI SPIN ---
                        if (response.gameResult.length > 1) {
                            EventBus.emit('fs-counter-destroy');
                        }

                        if (payoutPhase === 'TRANSFERRING') {
                            cancelAnimationFrame(transferAnimFrameId);
                            transferAnimFrameId = null;
                            if (win.value > 0) balance.value = Math.round(balance.value + win.value);
                            win.value = 0; 
                            payoutPhase = 'IDLE';
                        }
                        if (payoutTimer) {
                            clearTimeout(payoutTimer);
                            payoutTimer = null;
                            if (win.value > 0) {
                                balance.value = Math.round(balance.value + win.value);
                                win.value = 0; 
                            }
                            payoutPhase = 'IDLE';
                        }

                        currentWinAmount = result.cumulativeWinMoney / SCALAR;
                        currentWinSound = getWinSoundKey(result);
                        
                        // ODBLOKOWANIE SPINA dokładnie wtedy, gdy bębny stoją (nieważne czy jest wypłata, czy nie)
                        isSpinning.value = false;

                        if (musicWasFaded) {
                            EventBus.emit('crossfade-to-bg'); // Czysty powrót do tła na koniec
                            musicWasFaded = false;
                        }

                        if (currentWinAmount > 0) {
                            payoutPhase = 'WAITING_150';
                            
                            payoutTimer = setTimeout(() => {
                                if (payoutPhase !== 'WAITING_150') return; 
                                
                                payoutPhase = 'WAITING_1000';
                                win.value = currentWinAmount;
                                if (currentWinSound) {
                                    EventBus.emit('play-audio', currentWinSound, AUDIO_SETTINGS.volumes.win, 0);
                                }

                                payoutTimer = setTimeout(() => {
                                    if (payoutPhase !== 'WAITING_1000') return;
                                    EventBus.emit('trigger-fountain', currentWinAmount);
                                    startTransferAnim(); 
                                }, 1000);

                            }, GAME_SETTINGS.timings.showWinsDelay); 

                        } else {
                            balance.value = finalBalance;
                            payoutPhase = 'IDLE';
                        }
                        return; 
                    }
                }
            }
            
        } catch (error) {
            console.error("Błąd podczas spina:", error);
            if (mySpinId === activeSpinId) isSpinning.value = false;
        }
    };

    const handleReload = async () => {
        try {
            if (payoutPhase === 'TRANSFERRING') cancelAnimationFrame(transferAnimFrameId);
            clearTimeout(payoutTimer);
            payoutPhase = 'IDLE';
            EventBus.emit('fs-counter-destroy');
            
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