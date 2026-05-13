export const AUDIO_SETTINGS = {
    volumes: {
        // Globalna głośność ścieżki dźwiękowej odtwarzanej w tle
        bgMusic: 0.5,           
        // Głośność mechanicznego dźwięku obracających się bębnów
        reelsSpin: 0.4,         
        // Głośność akcentu dźwiękowego odtwarzanego w momencie zatrzymania pojedynczego bębna
        reelsStop: 0.15,        
        // Poziom głośności standardowych efektów dźwiękowych przy wygranej z linii
        win: 0.9,               
        // Głośność powiadomienia tekstowego oraz głównego motywu dźwiękowego trybu darmowych gier
        scatterPopup: 0.5,      
        // Poziom głośności efektu wypłacania monet podczas transferu do salda głównego
        coinFountain: 0.7
    },
    fades: {
        // Czas (ms) zanikania muzyki z tła podczas aktywacji darmowych gier
        bgMusicFadeOut: 1000,   
        // Czas (ms) powrotu muzyki z tła po zakończeniu trybu darmowych gier
        bgMusicFadeIn: 500,     
        // Czas (ms) wygaszania motywu darmowych gier przy powrocie do standardowego widoku maszyny
        scatterFadeOut: 1400,
        // Wyprzedzenie (ms), z jakim muzyka tła zacznie cichnąć przed zatrzymaniem ostatniego bębna, 
        // zaprojektowane w celu uzyskania ciszy potęgującej uderzenie dźwięku Scattera
        preFadeTime: 1000       
    }
};

export const GAME_SETTINGS = {
    timings: {
        // --- 1. MECHANIKA BĘBNÓW ---
        // Gwarantowany czas (ms) pełnego obrotu bębnów przed zainicjowaniem sekwencji hamowania
        spinDurationBeforeStop: 600,   
        // Całkowity czas (ms) przewidziany na sekwencyjne zatrzymanie wszystkich bębnów (od pierwszego do ostatniego)
        reelsStopDuration: 1000,      

        // --- 2. PREZENTACJA WYNIKÓW ---
        // Okno czasowe (ms) pomiędzy pełnym zatrzymaniem układu a rozpoczęciem animacji i dźwięków wygranych
        showWinsDelay: 150,           
        
        // Wymuszony czas (ms) wyświetlania rozszerzonych animacji specjalnych (np. symbole Lebron, Moneta). 
        // Wyliczone dla pełnego cyklu klatek.
        winAnimationDuration: 2640,   

        // Blokada czasowa (ms) wstrzymująca logikę maszyny przed kolejnym spinem, 
        // synchronizująca interfejs logiki z cyklem życia animacji w silniku Phaser
        cooldownWin: 2640,            

        // --- 3. ELEMENTY INTERFEJSU ---
        // Całkowity czas (ms) ekspozycji powiadomienia o darmowych spinach 
        // (zautomatyzowany podział na fazy: animacja wejścia, utrzymanie, animacja wyjścia)
        freeSpinsPopupTime: 1600 
    },
    hud: {
        // Margines dolny (px) do pozycjonowania licznika darmowych spinów w przestrzeni Canvas
        fsCounterMarginBottom: 80, 
        // Margines prawy (px) do pozycjonowania licznika darmowych spinów w przestrzeni Canvas
        fsCounterMarginRight: 80 
    },
    dev: {
        // Flaga nadpisująca zapytanie do API testowym obiektem JSON przy pierwszym spinie.
        // Ułatwia testowanie trybu Scatter bez konieczności czekania na fizyczne wylosowanie go z serwera.
        mockScatterFirstSpin: false 
    },
};