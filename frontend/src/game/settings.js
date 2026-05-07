export const AUDIO_SETTINGS = {
    volumes: {
        reelsStop: 0.3,
        win: 0.9
    }
};

export const GAME_SETTINGS = {
    timings: {
        // --- CHRONOLOGIA POJEDYNCZEGO SPINA ---
        
        // 1. Przerwa przed startem kolejnego spina (w trybie auto/free spins)
        autoSpinInterval: 600,        
        
        // 2. Czas pełnego "kręcenia się" bębnów zanim dostaną sygnał do hamowania
        spinDurationBeforeStop: 600,   
        
        // 3. Czas hamowania bębnów (od uderzenia pierwszego do uderzenia trzeciego), proporcja ustawiona na sztywno w game.js dla sekundy - 0ms, 300ms, 700ms
        reelsStopDuration: 1000,      
        
        // 4. Krótki "oddech" po zatrzymaniu całości na zobaczenie siatki, zanim wybuchną animacje
        showWinsDelay: 150,           
        
        // 5a. Czas trwania animacji i podziwiania ZWYKŁEJ WYGRANEJ przed końcem tury
        cooldownWin: 3400,            
        
        // 5b. Czas oczekiwania po PRZEGRANYM spinie przed zakończeniem tury
        cooldownNormal: 1200,         

        // --- FREE SPINY / SCATTER ---
        
        // Czas trwania animacji napisu "X FREE SPINS" (powiększanie i znikanie)
        freeSpinsPopupTime: 2000      
    }
};