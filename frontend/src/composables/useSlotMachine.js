import { ref } from 'vue';
import { fetchInitialState, spinReelsAPI, reloadBalance, SYMBOL_MAP } from '../api/gameApi';
import { EventBus } from '../game/EventBus';
import { getWinSoundKey } from '../utils/audioHelpers';
import { AUDIO_SETTINGS, GAME_SETTINGS } from '../game/settings';
import { mockScatterResponse } from '../api/mockScatter';

export function useSlotMachine() {
    // ====================================================
    // 1. ZMIENNE KONFIGURACYJNE
    // Podstawowe ustawienia i stałe używane w logice maszyny.
    // ====================================================
    
    // Mnożnik używany do operacji finansowych na liczbach całkowitych.
    // Unikamy w ten sposób znanych w JavaScript błędów zaokrągleń przy pracy na ułamkach.
    const SCALAR = 100;

    // ====================================================
    // 2. REAKTYWNE ZMIENNE STANU (VUE)
    // Dane podpięte bezpośrednio pod interfejs użytkownika (UI).
    // ====================================================
    const balance = ref(0);
    const win = ref(0);
    const currentBet = ref(1);
    const availableBets = ref([1, 2, 5, 10, 20, 50, 100]);
    const isSpinning = ref(false);
    
    // ====================================================
    // 3. WEWNĘTRZNE ZMIENNE KONTROLNE
    // Zmienne zarządzające przepływem logiki, stanem animacji 
    // oraz obsługą asynchronicznych opóźnień w grze.
    // ====================================================
    
    // Unikalne ID dla każdego kliknięcia przycisku "Spin".
    // Służy do przerywania starszych, wciąż działających w tle funkcji, gdy gracz zacznie nowy obrót.
    let activeSpinId = 0;
    
    // Przechowuje aktualny etap maszyny dotyczący wypłat wygranych (IDLE, WAITING_*, TRANSFERRING).
    // Pozwala to na precyzyjne przerwanie odpowiedniego etapu przy "szybkim kliknięciu".
    let payoutPhase = 'IDLE'; 
    
    // Zapisuje odniesienie (timer) do zaplanowanych opóźnień wyświetlenia wygranej.
    // Dzięki temu możemy łatwo anulować czekanie za pomocą clearTimeout.
    let payoutTimer = null;
    
    // Zapisuje ID aktualnej klatki animacji przelewania monet.
    // Pozwala w dowolnej chwili zatrzymać ten proces przez cancelAnimationFrame.
    let transferAnimFrameId = null;
    
    // Przechowują kwotę wygranej i przypisany do niej dźwięk do momentu, 
    // aż maszyna będzie graficznie gotowa na ich pokazanie.
    let currentWinAmount = 0;
    let currentWinSound = null;
    
    // Flaga zapobiegająca wielokrotnemu uruchamianiu wyciszania muzyki tła.
    let musicWasFaded = false;
    
    // Ustawienie developerskie. Jeśli aktywne, pierwszy spin zawsze wczyta
    // testowy plik darmowych gier zamiast wysyłać zapytanie do serwera.
    let isFirstSpinDev = GAME_SETTINGS.dev?.mockScatterFirstSpin || false;

    // ====================================================
    // 4. METODY POMOCNICZE
    // Funkcje odpowiadające za mniejsze, powtarzalne zadania.
    // ====================================================

    // Płynnie przelewa środki z pola wygranej (win) do głównego salda (balance).
    // Używa requestAnimationFrame, aby odświeżać liczby równo z klatkami monitora (zazwyczaj 60 FPS).
    const startTransferAnim = (customDuration = null) => {
        payoutPhase = 'TRANSFERRING';
        const startWin = win.value;
        let currentWin = startWin;
        
        // Zależnie od wygranej animacja trwa krócej lub dłużej (maksymalnie 1.5 sekundy).
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

            // Kontynuuj pętlę dopóki nie przelejemy 100% środków
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

    // ====================================================
    // 5. GŁÓWNY KONTROLER CYKLU OBROTU (SPIN)
    // Zbiera dane z API i nadzoruje całą asynchroniczną 
    // sekwencję zdarzeń pomiędzy silnikiem graficznym a Vue.
    // ====================================================
    const handleSpin = async (forcedResultID = null) => {
        if (isSpinning.value) return;

        // Czyszczenie ekranu i liczników przed nowym rzutem
        EventBus.emit('clear-win-animations');
        EventBus.emit('fs-counter-destroy'); 

        let clearWinText = true;
        let freeSpinsPopupShown = false; 

        const totalSpinTime = GAME_SETTINGS.timings.spinDurationBeforeStop + GAME_SETTINGS.timings.reelsStopDuration; 
        const dynamicHoldTime = Math.round(totalSpinTime * 0.5); 
        const dynamicAnimTime = totalSpinTime - dynamicHoldTime - 50; 

        // --- Obsługa Szybkiego Spina (Quick Spin) ---
        // Sprawdzamy czy gracz kliknął ekran w trakcie oczekiwania na animację wygranej.
        // Jeśli tak, anulujemy opóźnienia i natychmiast pokazujemy wynik.
        if (payoutPhase === 'WAITING_150' || payoutPhase === 'WAITING_1000') {
            clearTimeout(payoutTimer);
            EventBus.emit('clear-win-animations'); 

            // Jeśli grała muzyka scattera, wymuszamy szybki powrót do normalnego tła
            if (musicWasFaded) {
                EventBus.emit('crossfade-to-bg');
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
            
            // Odtwarza skróconą wersję animacji przelewania wygranej
            payoutTimer = setTimeout(() => {
                if (payoutPhase !== 'WAITING_QUICK_SPIN') return;
                EventBus.emit('trigger-fountain', currentWinAmount);
                startTransferAnim(dynamicAnimTime); 
            }, dynamicHoldTime); 
        } 
        // Jeśli gracz przyspieszył w trakcie wpadania monet na konto, 
        // ucinamy animację i dopisujemy od razu całą kwotę.
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
        const backendBet = currentBet.value * SCALAR;

        // ====================================================
        // FUNKCJE WEWNĘTRZNE KONTROLERA
        // Rozbicie potężnej logiki na mniejsze, czytelne etapy.
        // ====================================================
        
        // Decyduje, skąd pobrać dane. Używa pliku mock.js dla trybu DEV 
        // lub uderza do prawdziwego API, jeśli gramy normalnie.
        const fetchGameData = async () => {
            if (isFirstSpinDev) {
                console.info("DEV MODE: Wczytywanie z testowego obiektu JSON (Mock Scatter).");
                isFirstSpinDev = false; 
                await new Promise(r => setTimeout(r, 200)); 
                return mockScatterResponse;
            }
            return await spinReelsAPI(backendBet, forcedResultID);
        };

        // Zleca Phaserowi start obrotu, czeka określony czas 
        // i wysyła komendę do zatrzymania bębnów na konkretnych symbolach.
        const executeReelsAnimation = async (result) => {
            EventBus.emit('spin-start');

            // Jeśli wygrano darmowe spiny, wycisza muzykę chwilę przed zatrzymaniem bębnów
            if (result.numFreeSpinsAwarded > 0 && !freeSpinsPopupShown && !musicWasFaded) {
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
            
            // Kod zawiesza się tutaj do momentu, aż Phaser potwierdzi, 
            // że wszystkie bębny fizycznie zatrzymały się na ekranie.
            await new Promise(resolve => {
                const onReelsStopped = () => {
                    EventBus.off('all-reels-stopped', onReelsStopped);
                    resolve();
                };
                EventBus.on('all-reels-stopped', onReelsStopped);
            });
        };

        // Obsługuje rzuty wewnętrzne (pomiędzy początkiem a końcem darmowych gier).
        // Wyświetla animacje wygranych, ale nie przelewa ich jeszcze na główne saldo.
        const processIntermediateSpin = async (result) => {
            await new Promise(resolve => setTimeout(resolve, GAME_SETTINGS.timings.showWinsDelay));
            // Bezpiecznik: jeśli po opóźnieniu ID jest inne, przerywamy funkcję
            if (mySpinId !== activeSpinId) return; 

            win.value = result.cumulativeWinMoney / SCALAR;
            let timeSpentOnPopup = 0;

            // Faza wejścia do darmowych spinów: odpala dźwięki scattera i napis "FREE SPINS"
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

            // Przeszukuje zwycięskie linie w poszukiwaniu rzadkich symboli (np. Lebron).
            // Wymagają one dłuższego czasu wyświetlania na ekranie.
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
            
            EventBus.emit('clear-win-animations');
        };

        // Obsługuje końcówkę sesji (zwykłego rzutu lub ostatniego z darmowych spinów).
        // Dodaje monety do salda, czyści interfejs i przywraca stan IDLE.
        const processFinalSpin = (result, finalBalance, isSequence) => {
            // Niszczymy licznik scatterów, bo darmowe gry się skończyły
            if (isSequence) EventBus.emit('fs-counter-destroy');

            // Jeśli animacja przelewania wygranej nadal działa w tle, przerywamy ją i natychmiast rozliczamy kwotę do końca.
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
            
            // Odblokowujemy przycisk "Spin" natychmiast po zatrzymaniu bębnów, nie czekając na animacje wygranych.
            isSpinning.value = false;

            if (musicWasFaded) {
                EventBus.emit('crossfade-to-bg'); 
                musicWasFaded = false;
            }

            // Uruchamia sekwencję nagradzania gracza: 
            // czeka chwilę -> gra dźwięk -> włącza fontannę -> przelewa kwotę na główne saldo.
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
        };

        // ====================================================
        // GŁÓWNA PĘTLA WYKONAWCZA KONTROLERA
        // Pobiera tablicę wyników z API (jeden dla zwykłego obrotu, wiele dla darmowych gier)
        // i puszcza je jeden po drugim przez funkcje opisane wyżej.
        // ====================================================
        try {
            const response = await fetchGameData();
            const finalBalance = response.newBalance / SCALAR;

            if (response?.gameResult?.length > 0) {
                const totalResults = response.gameResult.length;

                for (let i = 0; i < totalResults; i++) {
                    const result = response.gameResult[i];
                    const isLast = i === totalResults - 1;
                    
                    if (mySpinId !== activeSpinId) return;
                    
                    // Aktualizuje wizualny licznik darmowych gier przed odpaleniem bębnów
                    if (totalResults > 1 && i > 0) {
                        EventBus.emit('fs-counter-update', totalResults - i); 
                    }

                    await executeReelsAnimation(result);
                    
                    // Decyduje o tym, czy rozliczać wygraną końcową, czy rzucać dalej.
                    if (!isLast) {
                        await processIntermediateSpin(result);
                    } else {
                        processFinalSpin(result, finalBalance, totalResults > 1);
                        return; 
                    }
                }
            }
        } catch (error) {
            console.error("Błąd podczas przetwarzania żądania obrotu (spin API):", error);
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
            console.error("Błąd przy próbie przeładowania salda:", error);
        }
    };

    return {
        balance, win, currentBet, availableBets, isSpinning,
        handleBetChange, handleSpin, handleReload, loadInitialState
    };
}