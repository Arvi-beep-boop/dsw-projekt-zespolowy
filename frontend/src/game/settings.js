export const AUDIO_SETTINGS = {
    volumes: {
        bgMusic: 0.5,         // Muzyka w tle
        reelsSpin: 0.4,       // Dźwięk kręcących się bębnów
        reelsStop: 0.15,      // Uderzenie bębna przy zatrzymaniu
        win: 0.9,             // Zwykłe wygrane z linii (postacie itp.)
        scatterPopup: 0.5     // Dźwięk wyskakiwania napisu FREE SPINS
    },
    fades: {
        bgMusicFadeOut: 1000, // Czas wyciszania muzyki tła przy scatterze
        bgMusicFadeIn: 750,   // Czas przywracania muzyki tła
        scatterFadeOut: 750   // Czas wyciszania dźwięku scattera na końcu
    }
};

export const GAME_SETTINGS = {
    timings: {
        // --- 1. RUCH BĘBNÓW ---
        // Jak długo bębny kręcą się w pełnym pędzie przed hamowaniem
        spinDurationBeforeStop: 600,   
        // Czas od zatrzymania 1. bębna do zatrzymania 3. bębna
        reelsStopDuration: 1000,      

        // --- 2. WYNIK I CELEBRACJA ---
        // Pauza na "zobaczenie" symboli zaraz po zatrzymaniu bębnów
        showWinsDelay: 150,           
        
        // Czas trwania efektów wizualnych (błyskawice, animacje postaci)
        // Wyliczone: 31 klatek / 11.74 FPS = 2640ms
        winAnimationDuration: 2640,   

        // Czas blokady logiki gry podczas wygranej (zsynchronizowany z Phaserem)
        cooldownWin: 2640,            

        // --- DODATKI ---
        // Czas trwania animacji napisu "X FREE SPINS"
        // 1/3 czasu wpada, 1/3 stoi, 1/3 ucieka
        freeSpinsPopupTime: 1300      
    }
};