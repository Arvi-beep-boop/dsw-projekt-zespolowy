import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import Reel from '../components/Reel';
import { SYMBOL_MAP, WIN_LINES } from '../../api/gameApi'; // Import słownika symbolów i linii wygrywających
import { AUDIO_SETTINGS, GAME_SETTINGS } from '../settings';

export class Game extends Scene {
    constructor() {
        super('Game');
        this.reels = [];
        this.activeWinAnimations = [];
    }

    create ()
    {
        const w = this.scale.width;
        const h = this.scale.height;
        this.cameras.main.setBackgroundColor(0x222222);

        if (!this.sound.get('bg-music')) {
            this.bgMusic = this.sound.add('bg-music', { 
                loop: true,
                volume: 0.5
            });
            this.bgMusic.play();
        }

        
        const stripPattern1 = ['H1', 'L1', 'M2', 'WILD', 'L2', 'SCATTER', 'H2', 'L3', 'M1'];
        const stripPattern2 = ['L3', 'WILD', 'H1', 'M1', 'SCATTER', 'L1', 'H2', 'L2', 'M2'];
        const stripPattern3 = ['M2', 'L2', 'H2', 'SCATTER', 'L1', 'WILD', 'M1', 'L3', 'H1'];

        const reelStrip1 = Array.from({ length: 89 }, (_, i) => stripPattern1[i % stripPattern1.length]);
        const reelStrip2 = Array.from({ length: 89 }, (_, i) => stripPattern2[i % stripPattern2.length]);
        const reelStrip3 = Array.from({ length: 89 }, (_, i) => stripPattern3[i % stripPattern3.length]);

        const colW = Math.ceil(w / 3);
        const rowH = Math.ceil(h / 3);

        const reel1 = new Reel(this, 0, 0, reelStrip1, colW, rowH);
        const reel2 = new Reel(this, colW, 0, reelStrip2, colW, rowH);
        const reel3 = new Reel(this, colW * 2, 0, reelStrip3, colW, rowH);
        this.reels = [reel1, reel2, reel3];
        
        const gridGfx = this.add.graphics();
        gridGfx.lineStyle(4, 0xc5b081, 0.4);
        gridGfx.beginPath();
        gridGfx.moveTo(colW, 0); gridGfx.lineTo(colW, h);
        gridGfx.moveTo(colW * 2, 0); gridGfx.lineTo(colW * 2, h);
        gridGfx.moveTo(0, rowH); gridGfx.lineTo(w, rowH);
        gridGfx.moveTo(0, rowH * 2); gridGfx.lineTo(w, rowH * 2);
        gridGfx.strokePath();
        gridGfx.setDepth(100);
        
        EventBus.on('show-free-spins-announcement', (numSpins) => {
            this.showFreeSpinsPopup(numSpins);
        });

        EventBus.on('play-audio', (key, volume = 1, delay = 0) => {
            const playLogic = () => {
                // --- BLOKADA DUBLOWANIA SCATTERA ---
                if (key === 'win-scatter') {
                    // Pobieramy WSZYSTKIE instancje tego dźwięku
                    const existingSounds = this.sound.getAll('win-scatter');
                    // Sprawdzamy czy którakolwiek z nich aktualnie gra
                    if (existingSounds.some(s => s.isPlaying)) return;
                }

                this.sound.play(key, { volume: volume });
            };

            if (delay > 0) {
                this.time.delayedCall(delay, playLogic);
            } else {
                playLogic();
            }
        });

        // wyłączenie scattera
        EventBus.on('stop-audio', (key, duration = 1000) => {
            // Zmieniamy get na getAll, żeby wyłapać wszystkie instancje
            const sounds = this.sound.getAll(key);
            
            sounds.forEach(sound => {
                if (sound && sound.isPlaying) {
                    this.tweens.add({
                        targets: sound,
                        volume: 0,
                        duration: duration,
                        onComplete: () => {
                            sound.stop();
                            sound.destroy(); // usuwa użyty dźwięk z pamięci
                        }
                    });
                } else if (sound) {
                    // Jeśli jakiś stary dźwięk "wisi" zatrzymany, od razu go czyścimy
                    sound.destroy(); 
                }
            });
        });

        EventBus.on('bg-music-fade-out', (duration = 300) => {
            if (this.bgMusic) {
                // Tween płynnie zmienia głośność od obecnej do 0 w określonym czasie
                this.tweens.add({
                    targets: this.bgMusic,
                    volume: 0,
                    duration: duration
                });
            }
        });

        

        // Płynne podgłośnienie muzyki w tle (fade in)
        EventBus.on('bg-music-fade-in', (duration = 300, targetVolume = 0.5) => {
            if (this.bgMusic) {
                this.tweens.add({
                    targets: this.bgMusic,
                    volume: targetVolume,
                    duration: duration
                });
            }
        });

        EventBus.on('spin-start', () => {
            if (this.reels.some(r => r.isSpinning)) return;
            // Czyszczenie animacji po poprzednim spinie
            this.clearWinAnimations();
            this.sound.play('reels-spin', { volume: 0.5 });
            this.reels.forEach(reel => reel.startSpin());
        });
        
        EventBus.on('spin-stop', (backendGrid) => {
            const matrix = backendGrid.grid || backendGrid;
            const vol = AUDIO_SETTINGS.volumes.reelsStop; 
            const totalStopDuration = GAME_SETTINGS.timings.reelsStopDuration;
            
            // Zachowanie proporcji: 0 dla pierwszego, ~43% dla drugiego, 100% dla trzeciego
            const delay1 = 0;
            const delay2 = Math.round(totalStopDuration * 0.43); // 43% całego czasu
            const delay3 = totalStopDuration;                   // 100% całego czasu
            
            const targetReel0 = [ matrix[0][0], matrix[1][0], matrix[2][0] ].map(id => SYMBOL_MAP[id]);
            const targetReel1 = [ matrix[0][1], matrix[1][1], matrix[2][1] ].map(id => SYMBOL_MAP[id]);
            const targetReel2 = [ matrix[0][2], matrix[1][2], matrix[2][2] ].map(id => SYMBOL_MAP[id]);

            this.time.delayedCall(delay1, () => {
                this.reels[0].stopSpin(targetReel0);
                this.sound.play('reels-stop-1', { volume: vol }); 
            });

            this.time.delayedCall(delay2, () => {
                this.reels[1].stopSpin(targetReel1);
                this.sound.play('reels-stop-2', { volume: vol }); 
            });

            this.time.delayedCall(delay3, () => {
                this.reels[2].stopSpin(targetReel2, () => {
                    EventBus.emit('all-reels-stopped', backendGrid);
                });
                this.sound.play('reels-stop-3', { volume: vol });
                
                const postSpinDelay = GAME_SETTINGS.timings.showWinsDelay;

                // Po zatrzymaniu ostatniego bębna, pokazujemy animacje wygranych (z lekkim opóźnieniem)
                if (backendGrid.winLineWinData && backendGrid.winLineWinData.length > 0) {
                    this.time.delayedCall(postSpinDelay, () => this.showWins(backendGrid.winLineWinData, backendGrid.grid));
                }
            });
        });

        EventBus.on('lebron-flash', () => {
            this.showLebronFlash();
        });

        EventBus.emit('current-scene-ready', this);
    }
    
    clearWinAnimations() {
        this.activeWinAnimations.forEach(anim => {
            if (anim) anim.destroy();
        });
        this.activeWinAnimations = [];
        EventBus.emit('win-lines-clear');
    }

    showWins(winLineWinData, grid) {
        if (!winLineWinData || winLineWinData.length === 0) return;
        if (this.reels.some(r => r.isSpinning)) return; // Blokuje animację, jeśli gracz już zakręcił ponownie

        const w = this.scale.width;
        const h = this.scale.height;
        const colW = Math.ceil(w / 3);
        const rowH = Math.ceil(h / 3);

        const winningRows = new Set();

        winLineWinData.forEach(winData => {
            const lineCoords = WIN_LINES[winData.winLineId];
            if (!lineCoords) return;
            lineCoords.forEach(c => winningRows.add(c.row));

            // Najbezpieczniejsza metoda: odczytujemy ID symbolu bezpośrednio z tego, co zwrócił backend (WinLineData)
            const symbolId = winData.symbol;
            if (!symbolId) return; // Zabezpieczenie na wypadek braku danych

            const symbolKey = SYMBOL_MAP[symbolId].toLowerCase(); // Zmienia np. 'L3' na 'l3'
            
            const animKey = `${symbolKey}-win-anim`;
            const frameKey = `${symbolKey}-win-frame-1`;

            console.log(`🎰 Wygrywająca linia: ID=${winData.winLineId}, Symbol=${symbolKey.toUpperCase()}`);

            // Sprawdzamy czy mamy taką animację
            if (!this.anims.exists(animKey)) {
                console.warn(`⚠️ Brak animacji w grze: ${animKey}! Symbol ${symbolKey.toUpperCase()} jeszcze jej nie posiada.`);
                return;
            }

            // Dla wygrywającej linii renderujemy animację na każdym symbolu
            for (let i = 0; i < lineCoords.length; i++) {
                const coord = lineCoords[i];
                if (!coord) continue;

                // Obliczamy środek kafelka na siatce
                const posX = (coord.col * colW) + (colW / 2);
                const posY = (coord.row * rowH) + (rowH / 2);

                const animSprite = this.add.sprite(posX, posY, frameKey);
                animSprite.setDepth(200);
                animSprite.setDisplaySize(colW, rowH);
                animSprite.play(animKey);
                this.activeWinAnimations.push(animSprite);

                const flashSprite = this.add.sprite(posX, posY, 'flash-frame-1');
                flashSprite.setDepth(210);
                flashSprite.setDisplaySize(colW, rowH);
                flashSprite.setBlendMode(Phaser.BlendModes.ADD);
                flashSprite.setAlpha(0.75);
                flashSprite.play('flash-line-anim');
                this.activeWinAnimations.push(flashSprite);
            }
        });

        EventBus.emit('win-lines-active', [...winningRows]);

        this.time.delayedCall(2300, () => {
            this.clearWinAnimations();
        });
    }

    showLebronFlash() {
        const w = this.scale.width;
        const h = this.scale.height;
        const colW = Math.ceil(w / 3);
        const rowH = Math.ceil(h / 3);

        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                const posX = (col * colW) + (colW / 2);
                const posY = (row * rowH) + (rowH / 2);

                const flashSprite = this.add.sprite(posX, posY, 'flash-frame-1');
                flashSprite.setDepth(210);
                flashSprite.setDisplaySize(colW, rowH);
                flashSprite.setBlendMode(Phaser.BlendModes.ADD);
                flashSprite.setAlpha(0.75);
                flashSprite.play('flash-line-anim');
                this.activeWinAnimations.push(flashSprite);
            }
        }

        this.time.delayedCall(4000, () => {
            this.clearWinAnimations();
        });
    }

    showFreeSpinsPopup(numSpins) {
        const x = this.scale.width / 2;
        const y = this.scale.height / 2;
        const totalTime = GAME_SETTINGS.timings.freeSpinsPopupTime;

        const textStr = `${numSpins} FREE SPINS`;
        const textObj = this.add.text(x, y, textStr, {
            fontFamily: 'Arial, black',
            fontSize: '60px',
            fontStyle: 'bold',
            stroke: '#ffffff',
            strokeThickness: 8
        }).setOrigin(0.5).setDepth(1000).setScale(0);

        // 1. Świecenie (Glow) - mocny żółty
        textObj.setShadow(0, 0, '#ffff00', 30, false, true);

        // 2. Tęcza przesuwająca się od lewej do prawej
        const gradientProxy = { offset: 0 };
        const rainbowTween = this.tweens.add({
            targets: gradientProxy,
            offset: 1,
            duration: 500, 
            repeat: -1,
            onUpdate: () => {
                const ctx = textObj.context;
                const w = textObj.width || 400;
                const gradient = ctx.createLinearGradient(0, 0, w, 0);
                
                const p1 = (0 + gradientProxy.offset) % 1;
                const p2 = (0.33 + gradientProxy.offset) % 1;
                const p3 = (0.66 + gradientProxy.offset) % 1;
                
                const stops = [
                    { p: p1, c: '#ff0055' }, // Róż
                    { p: p2, c: '#ffee00' }, // Żółć
                    { p: p3, c: '#00eeff' }  // Cyjan (jasnoniebieski)
                ].sort((a, b) => a.p - b.p);

                gradient.addColorStop(stops[0].p, stops[0].c);
                gradient.addColorStop(stops[1].p, stops[1].c);
                gradient.addColorStop(stops[2].p, stops[2].c);
                
                textObj.setFill(gradient); // Pełne nasycenie, 0% przezroczystości
            }
        });

        // 3. Uderzenie w ekran ("w szybę"), pauza i zniknięcie
        const popInTime = 400;
        const popOutTime = 300;
        const holdTime = totalTime - popInTime - popOutTime;

        this.tweens.add({
            targets: textObj,
            scale: 3.5, // Duży i wyraźny
            ease: 'Back.out', 
            duration: popInTime,
            onComplete: () => {
                this.time.delayedCall(holdTime, () => {
                    this.tweens.add({
                        targets: textObj,
                        scale: 0,
                        ease: 'Back.in', 
                        duration: popOutTime,
                        onComplete: () => {
                            rainbowTween.stop();
                            textObj.destroy();
                            EventBus.emit('free-spins-popup-finished');
                        }
                    });
                });
            }
        });
    }

    update() {
        this.reels.forEach(reel => reel.updateReel());
    }

    changeScene() {
        this.scene.start('GameOver');
    }
}