import { ref } from 'vue';
import { fetchInitialState, spinReelsAPI, reloadBalance, SYMBOL_MAP } from '../api/gameApi';
import { EventBus } from '../game/EventBus';
import { getWinSoundKey } from '../utils/audioHelpers';
import { AUDIO_SETTINGS, GAME_SETTINGS } from '../game/settings';

export function useSlotMachine() {
    const SCALAR = 100;
    const balance = ref(0);
    const win = ref(0);
    const currentBet = ref(1);
    const availableBets = ref([1, 2, 5, 10, 20, 50, 100, 500, 1000]); // Twoja nowa lista stawek
    const isSpinning = ref(false);
    
    let activeSpinId = 0;

    // --- ZMIENNE DO KONTROLI ANIMACJI I POCZEKALNI (RACE CONDITION FIX) ---
    let transferTimeoutId = null;
    let transferAnimFrameId = null;
    let quickSpinShowTimeoutId = null; 
    let pendingWinAmount = 0;          
    let pendingTargetBalance = null;   
    let pendingWinSound = null;
    let winShownTime = 0; // Dodane: mierzy czas, od kiedy kwota jest na ekranie

    // --- BŁYSKAWICZNE PRZERZUCENIE (SKIP) JEŚLI GRACZ KLIKNĄŁ SPIN ---
    const forceCompleteTransfer = () => {
        if (quickSpinShowTimeoutId) {
            // Ignorujemy podwójne kliknięcie – kwota musi odwisieć swoje 1000ms
            return;
        }

        if (transferTimeoutId) {
            // Gracz przerwał normalne czekanie (np. podczas krótkiej animacji)
            clearTimeout(transferTimeoutId);
            transferTimeoutId = null;

            // Obliczamy, ile z obiecanych 1000ms już minęło
            const elapsed = performance.now() - winShownTime;
            const remaining = Math.max(0, 1000 - elapsed);

            if (remaining > 50) {
                // Czekamy brakującą resztę czasu, żeby zachować równe 1000ms ekspozycji
                quickSpinShowTimeoutId = setTimeout(() => {
                    quickSpinShowTimeoutId = null;
                    if (!transferAnimFrameId && win.value > 0) {
                        animateTransfer();
                    }
                }, remaining);
            } else {
                animateTransfer();
            }
        } else if (pendingWinAmount > 0 && !transferAnimFrameId) {
            // Gracz kliknął w ułamku sekundy PO zatrzymaniu bębnów (w trakcie showWinsDelay)
            win.value = pendingWinAmount; 
            winShownTime = performance.now(); // Zapisujemy czas pojawienia się
            
            // --- ODPALAMY FONTANNĘ I DŹWIĘK PRZY SZYBKIM KLIKNIĘCIU ---
            EventBus.emit('trigger-fountain');
            if (pendingWinSound) {
                EventBus.emit('play-audio', pendingWinSound, AUDIO_SETTINGS.volumes.win, 0);
            }
            
            quickSpinShowTimeoutId = setTimeout(() => {
                quickSpinShowTimeoutId = null;
                if (!transferAnimFrameId && win.value > 0) {
                    animateTransfer(); 
                }
            }, 1000);
        } else if (pendingTargetBalance !== null && !transferAnimFrameId) {
            // Szybki skip przegranego spina
            balance.value = pendingTargetBalance;
            pendingTargetBalance = null;
            pendingWinAmount = 0;
            pendingWinSound = null;
        }
    };

    // --- FUNKCJA ANIMUJĄCA PRZELEWANIE PIENIĘDZY ---
    const animateTransfer = () => {
        const startWin = win.value;
        let currentWin = startWin;

        pendingWinAmount = 0;
        pendingTargetBalance = null;
        pendingWinSound = null;

        // DYNAMO-TEMPO: 
        // Zaczynamy od 150ms (podstawa dla małych kwot) 
        // i dodajemy ok. 1.05ms na każdy 1 punkt wygranej.
        const duration = Math.min(1500, 250 + (startWin * 1.05));

        const startTime = performance.now();

        const step = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Win schodzi jako pełna liczba (bez setnych)
            let newWin = Math.round(startWin * (1 - progress));
            if (progress === 1) newWin = 0; 

            const delta = currentWin - newWin; 
            
            win.value = newWin;
            // Balance rośnie o to, co ubyło z Win (zaokrąglone do liczb całkowitych)
            balance.value = Math.round(balance.value + delta);
            currentWin = newWin;

            if (progress < 1) {
                transferAnimFrameId = requestAnimationFrame(step);
            } else {
                transferAnimFrameId = null;
            }
        };
        transferAnimFrameId = requestAnimationFrame(step);
    };

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
        
        // Jeśli gracz kliknie przed końcem animacji poprzedniej wygranej - wymuś przelew
        forceCompleteTransfer();
        
        isSpinning.value = true;
        
        // Pobranie zakładu z balansu
        balance.value = Number((balance.value - currentBet.value).toFixed(2));

        activeSpinId++;
        const mySpinId = activeSpinId;
        
        let musicWasFaded = false;
        let freeSpinsPopupShown = false; 
        const backendBet = currentBet.value * SCALAR;

        try {
            const response = await spinReelsAPI(backendBet);
            const finalBalance = response.newBalance / SCALAR;

            if (response && response.gameResult && response.gameResult.length > 0) {
                // Dodane zabezpieczenie przed zerowaniem przy szybkim backendzie
                if (!transferAnimFrameId && !quickSpinShowTimeoutId) {
                    win.value = 0;
                }
                
                for (let i = 0; i < response.gameResult.length; i++) {
                    const result = response.gameResult[i];
                    const isLast = i === response.gameResult.length - 1;
                    
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
                    
                    // --- ZAPISUJEMY DANE DO POCZEKALNI OD RAZU PO ZATRZYMANIU ---
                    if (isLast) {
                        pendingWinAmount = result.cumulativeWinMoney / SCALAR;
                        pendingTargetBalance = finalBalance;
                        pendingWinSound = getWinSoundKey(result); 
                        // QUICK SPIN: Odblokowanie przycisku dla gracza
                        isSpinning.value = false; 
                    }

                    // 4. showWinsDelay - Oddech na zobaczenie siatki symboli
                    await new Promise(resolve => setTimeout(resolve, GAME_SETTINGS.timings.showWinsDelay));
                    
                    if (mySpinId !== activeSpinId) return; 

                    win.value = result.cumulativeWinMoney / SCALAR;
                    winShownTime = performance.now(); // Zapisujemy czas w normalnym biegu
                    
                    let timeSpentOnPopup = 0;

                    // --- LOGIKA DARMOWYCH SPINÓW ---
                    if (result.numFreeSpinsAwarded > 0 && !freeSpinsPopupShown) {
                        freeSpinsPopupShown = true; 

                        if (!musicWasFaded) {
                            EventBus.emit('bg-music-fade-out', AUDIO_SETTINGS.fades.bgMusicFadeOut);
                            musicWasFaded = true; 
                        }
                        EventBus.emit('play-audio', 'win-scatter', AUDIO_SETTINGS.volumes.scatterPopup, 0);
                        EventBus.emit('show-free-spins-announcement', result.numFreeSpinsAwarded);

                        await new Promise(resolve => {
                            const onFinished = () => {
                                EventBus.off('free-spins-popup-finished', onFinished);
                                resolve();
                            };
                            EventBus.on('free-spins-popup-finished', onFinished);
                        });
                        
                        timeSpentOnPopup = GAME_SETTINGS.timings.freeSpinsPopupTime;
                    }

                    // --- LOGIKA NORMALNEJ WYGRANEJ ---
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
                        if (mySpinId === activeSpinId) {
                            EventBus.emit('trigger-fountain');
                        }
                    }

                    // --- PRZELEWANIE WYGRANEJ NA SALDO ---
                    if (isLast) {
                        if (win.value > 0) {
                            // Czekamy 1s od pokazania wygranej
                            transferTimeoutId = setTimeout(() => {
                                if (mySpinId === activeSpinId) {
                                    transferTimeoutId = null;
                                    animateTransfer();
                                }
                            }, 1000);
                        } else {
                            balance.value = finalBalance;
                            pendingTargetBalance = null; 
                        }
                    }
                    
                    // --- SYNCHRONIZACJA CZASU KOLEJNEGO SPINA ---
                    if (!isLast) {
                        if (hasWin) {
                            // PRO LOGIKA: Kolejny spin rusza dokładnie po skończeniu animacji symboli
                            const baseCooldown = isLongAnimation ? GAME_SETTINGS.timings.cooldownWin : 1280;
                            const waitTime = baseCooldown - timeSpentOnPopup;
                            await new Promise(resolve => setTimeout(resolve, Math.max(0, waitTime)));
                        }
                    }
                }
            }
            
            if (mySpinId === activeSpinId) {
                if (musicWasFaded) {
                    EventBus.emit('stop-audio', 'win-scatter', AUDIO_SETTINGS.fades.scatterFadeOut);
                    EventBus.emit('bg-music-fade-in', AUDIO_SETTINGS.fades.bgMusicFadeIn, AUDIO_SETTINGS.volumes.bgMusic);
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