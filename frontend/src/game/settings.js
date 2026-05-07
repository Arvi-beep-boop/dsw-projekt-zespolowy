export const AUDIO_SETTINGS = {
    volumes: {
        reelsStop: 0.15,
        win: 0.9
    }
};

export const GAME_SETTINGS = {
    timings: {
        // --- 1. PRZYGOTOWANIE ---
        // Odstęp przed startem kolejnego obrotu (w darmowych spinach / auto)
        autoSpinInterval: 600,        

        // --- 2. RUCH BĘBNÓW ---
        // Jak długo bębny kręcą się w pełnym pędzie przed hamowaniem
        spinDurationBeforeStop: 600,   
        // Czas od zatrzymania 1. bębna do zatrzymania 3. bębna
        reelsStopDuration: 1000,      

        // --- 3. WYNIK I CELEBRACJA ---
        // Pauza na "zobaczenie" symboli zaraz po zatrzymaniu bębnów
        showWinsDelay: 150,           
        
        // Czas trwania efektów wizualnych (błyskawice, animacje postaci)
        // Wyliczone idealnie: 31 klatek / 11.74 FPS = 2640ms
        winAnimationDuration: 2640,   

        // Czas blokady logiki gry podczas wygranej (zsynchronizowany z Phaserem)
        cooldownWin: 2640,            

        // --- DODATKI ---
        // Czas trwania animacji napisu "X FREE SPINS"
        freeSpinsPopupTime: 2000      
    }
};