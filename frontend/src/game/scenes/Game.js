import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import Reel from '../components/Reel';
import { SYMBOL_MAP, WIN_LINES } from '../../api/gameApi'; 
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
                volume: AUDIO_SETTINGS.volumes.bgMusic || 0.1
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

        // --- ZWYKŁE AUDIO ---
        EventBus.on('play-audio', (key, volume = 1, delay = 0) => {
            // TARCZA 1: Blokujemy próby odpalenia scattera jako zwykłego dźwięku (żeby nie było echa)
            if (key === 'win-scatter') return; 

            const playLogic = () => this.sound.play(key, { volume: volume });
            if (delay > 0) this.time.delayedCall(delay, playLogic);
            else playLogic();
        });

        EventBus.on('stop-audio', (key, duration = 1000) => {
            const sounds = this.sound.getAll(key);
            sounds.forEach(sound => {
                if (sound && sound.isPlaying) {
                    this.tweens.add({
                        targets: sound, volume: 0, duration: duration,
                        onComplete: () => { sound.stop(); sound.destroy(); }
                    });
                } else if (sound) sound.destroy();
            });
        });

       // --- CROSSFADE (SCATTER <-> TŁO) ---
        // Wyciszanie tła przed czasem
        EventBus.on('pre-fade-bg', () => {
            if (this.bgMusic) {
                this.tweens.add({
                    targets: this.bgMusic,
                    volume: 0,
                    duration: AUDIO_SETTINGS.fades?.bgMusicFadeOut || 1000 
                });
            }
        });

        // Sam cios Scattera
        EventBus.on('play-scatter-sound', () => {
            if (!this.scatterMusic || !this.scatterMusic.isPlaying) {
                if (this.scatterMusic) this.scatterMusic.destroy();
                this.scatterMusic = this.sound.add('win-scatter', { 
                    volume: AUDIO_SETTINGS.volumes?.scatterPopup || 0.5 
                }); 
                this.scatterMusic.play();
            }
        });

        EventBus.on('crossfade-to-bg', () => {
            if (this.scatterMusic && this.scatterMusic.isPlaying) {
                this.tweens.add({
                    targets: this.scatterMusic,
                    volume: 0,
                    // Ciągnie czas wyciszania scattera z settings.js (domyślnie 750)
                    duration: AUDIO_SETTINGS.fades.scatterFadeOut || 750,
                    onComplete: () => {
                        this.scatterMusic.stop(); 
                        this.scatterMusic.destroy();
                        this.scatterMusic = null;
                    }
                });
            }

            if (this.bgMusic) {
                this.tweens.add({
                    targets: this.bgMusic,
                    volume: AUDIO_SETTINGS.volumes.bgMusic || 0.1,
                    // Ciągnie czas powrotu tła z settings.js (domyślnie 750)
                    duration: AUDIO_SETTINGS.fades.bgMusicFadeIn || 750 
                });
            }
        });

        // --- CZYSZCZENIE ANIMACJI ---
        EventBus.on('clear-win-animations', () => {
            this.clearWinAnimations();
        });

        EventBus.on('spin-start', () => {
            this.clearWinAnimations();
            this.sound.play('reels-spin-1600', { volume: AUDIO_SETTINGS.volumes.reelsSpin });
            this.reels.forEach(reel => {
                reel.isSpinning = false; 
                reel.startSpin();
            });
        });
        
        EventBus.on('spin-stop', (backendGrid) => {
            const matrix = backendGrid.grid || backendGrid;
            const vol = AUDIO_SETTINGS.volumes.reelsStop; 
            const totalStopDuration = GAME_SETTINGS.timings.reelsStopDuration;
            
            const delay1 = 0;
            const delay2 = Math.round(totalStopDuration * 0.43); 
            const delay3 = totalStopDuration;                  
            
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

                if (backendGrid.winLineWinData && backendGrid.winLineWinData.length > 0) {
                    this.time.delayedCall(postSpinDelay, () => this.showWins(backendGrid.winLineWinData, backendGrid.grid));
                }
            });
        });

        EventBus.on('lebron-flash', () => {
            this.showLebronFlash();
        });

        EventBus.on('fs-counter-create', (count) => this.createFreeSpinCounter(count));
        EventBus.on('fs-counter-update', (count) => this.updateFreeSpinCounter(count));
        EventBus.on('fs-counter-destroy', () => this.destroyFreeSpinCounter());

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
        if (this.reels.some(r => r.isSpinning)) return; 

        const w = this.scale.width;
        const h = this.scale.height;
        const colW = Math.ceil(w / 3);
        const rowH = Math.ceil(h / 3);

        const winningRows = new Set();

        let isLongAnimation = false;
        winLineWinData.forEach(winData => {
            const symbolKey = SYMBOL_MAP[winData.symbol]?.toUpperCase();
            if (symbolKey === 'H1' || symbolKey === 'COIN' || symbolKey === 'LEBRON') { 
                isLongAnimation = true;
            }
        });

        const animDuration = isLongAnimation ? (GAME_SETTINGS.timings?.winAnimationDuration || 2640) : 1280;

        winLineWinData.forEach(winData => {
            const lineCoords = WIN_LINES[winData.winLineId];
            if (!lineCoords) return;
            lineCoords.forEach(c => winningRows.add(c.row));

            const symbolId = winData.symbol;
            if (!symbolId) return;

            const symbolKey = SYMBOL_MAP[symbolId].toLowerCase(); 
            const animKey = `${symbolKey}-win-anim`;
            const frameKey = `${symbolKey}-win-frame-1`;

            if (!this.anims.exists(animKey)) {
                return;
            }

            for (let i = 0; i < lineCoords.length; i++) {
                const coord = lineCoords[i];
                if (!coord) continue;

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

        this.time.delayedCall(animDuration, () => {
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

        const maxWidth = this.scale.width * 0.90;
        const dynamicScale = Math.min(maxWidth / textObj.width, 4);

        textObj.setShadow(0, 0, '#ffff00', 30, false, true);

        const gradientProxy = { offset: 0 };
        const rainbowTween = this.tweens.add({
            targets: gradientProxy,
            offset: 1,
            duration: 500, 
            repeat: -1,
            onUpdate: () => {
                if (!textObj || !textObj.active) return; // Zapobieganie błędom drawImage
                
                const ctx = textObj.context;
                const w = textObj.width || 400;
                const gradient = ctx.createLinearGradient(0, 0, w, 0);
                
                const p1 = (0 + gradientProxy.offset) % 1;
                const p2 = (0.33 + gradientProxy.offset) % 1;
                const p3 = (0.66 + gradientProxy.offset) % 1;
                
                const stops = [
                    { p: p1, c: '#ff0055' }, 
                    { p: p2, c: '#ffee00' }, 
                    { p: p3, c: '#00eeff' }  
                ].sort((a, b) => a.p - b.p);

                gradient.addColorStop(stops[0].p, stops[0].c);
                gradient.addColorStop(stops[1].p, stops[1].c);
                gradient.addColorStop(stops[2].p, stops[2].c);
                
                textObj.setFill(gradient);
            }
        });

        textObj.setAngle(-8);
        const wobbleTween = this.tweens.add({
            targets: textObj,
            angle: 8,
            duration: 120,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        const thirdTime = Math.round(totalTime / 3);
        const popInTime = thirdTime;
        const holdTime = thirdTime;
        const popOutTime = totalTime - popInTime - holdTime; 

        this.tweens.add({
            targets: textObj,
            scale: dynamicScale,
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
                            wobbleTween.stop(); 
                            textObj.destroy();
                            EventBus.emit('free-spins-popup-finished');
                        }
                    });
                });
            }
        });
    }

    createFreeSpinCounter(initialCount) {
        if (this.fsCounterGroup) this.fsCounterGroup.destroy(true);

        const marginR = GAME_SETTINGS.hud?.fsCounterMarginRight || 80;
        const marginB = GAME_SETTINGS.hud?.fsCounterMarginBottom || 80;
        const x = this.scale.width - marginR;
        const y = this.scale.height - marginB;

        this.fsCounterGroup = this.add.container(x, y);
        this.fsCounterGroup.setDepth(500);

        if (!this.textures.exists('fs-rainbow-bg')) {
            const canvas = document.createElement('canvas');
            canvas.width = 100; canvas.height = 100;
            const ctx = canvas.getContext('2d');
            const grd = ctx.createLinearGradient(0, 0, 100, 100);
            grd.addColorStop(0, "rgba(255, 0, 128, 0.8)");
            grd.addColorStop(0.5, "rgba(0, 200, 255, 0.8)");
            grd.addColorStop(1, "rgba(255, 255, 0, 0.8)");
            ctx.fillStyle = grd;
            ctx.beginPath(); 
            ctx.arc(50, 50, 48, 0, Math.PI * 2); 
            ctx.fill();
            this.textures.addCanvas('fs-rainbow-bg', canvas);
        }
        
        const bgImage = this.add.image(0, 0, 'fs-rainbow-bg');
        this.fsCounterGroup.add(bgImage);

        this.tweens.add({
            targets: bgImage,
            angle: -360,
            duration: 12000, 
            repeat: -1
        });

        if (!this.textures.exists('fs-smooth-aura')) {
            const canvas = document.createElement('canvas');
            canvas.width = 140; canvas.height = 140; 
            const ctx = canvas.getContext('2d');
            
            const grd = ctx.createConicGradient(0, 70, 70);
            grd.addColorStop(0, "#ff0000");
            grd.addColorStop(0.16, "#ff00ff");
            grd.addColorStop(0.33, "#0000ff");
            grd.addColorStop(0.5, "#00ffff");
            grd.addColorStop(0.66, "#00ff00");
            grd.addColorStop(0.83, "#ffff00");
            grd.addColorStop(1, "#ff0000");

            ctx.strokeStyle = grd;
            ctx.lineWidth = 8;
            ctx.shadowBlur = 12; 
            ctx.shadowColor = "rgba(255, 255, 255, 0.6)";

            ctx.beginPath();
            ctx.arc(70, 70, 52, 0, Math.PI * 2);
            ctx.stroke();

            this.textures.addCanvas('fs-smooth-aura', canvas);
        }

        const aura = this.add.image(0, 0, 'fs-smooth-aura');
        this.fsCounterGroup.add(aura);
        
        this.tweens.add({
            targets: aura,
            angle: 360,
            duration: 6000,
            repeat: -1
        });

        this.fsText = this.add.text(0, 0, initialCount, {
            fontFamily: 'Arial, black',
            fontSize: '50px',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.fsText.setShadow(0, 0, '#ffffff', 5, false, true); 
        this.fsCounterGroup.add(this.fsText);

        const colorProxy = { hue: 0 };
        this.tweens.add({
            targets: colorProxy,
            hue: 360,
            duration: 4000, 
            repeat: -1,
            onUpdate: () => {
                if (!this.fsText || !this.fsText.active) return; // Zapobieganie błędom drawImage
                
                const ctx = this.fsText.context;
                const gradient = ctx.createLinearGradient(-25, -25, 25, 25);
                
                const c1 = Phaser.Display.Color.HSLToColor(colorProxy.hue / 360, 1, 0.6);
                const c2 = Phaser.Display.Color.HSLToColor(((colorProxy.hue + 60) % 360) / 360, 1, 0.6);
                
                gradient.addColorStop(0, c1.rgba);
                gradient.addColorStop(1, c2.rgba);
                
                this.fsText.setFill(gradient);
            }
        });

        this.tweens.add({
            targets: this.fsText,
            scale: 1.15,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        this.fsCounterGroup.setScale(0);
        this.tweens.add({
            targets: this.fsCounterGroup,
            scale: 1,
            duration: 500,
            ease: 'Back.out'
        });
    }

    updateFreeSpinCounter(count) {
        if (!this.fsText) return;
        this.fsText.setText(count);
        
        this.tweens.add({
            targets: this.fsCounterGroup,
            scale: 1.2,
            duration: 150,
            yoyo: true,
            ease: 'Back.out'
        });
    }

    destroyFreeSpinCounter() {
        if (this.fsCounterGroup) {
            this.tweens.add({
                targets: this.fsCounterGroup,
                alpha: 0,
                scale: 0,
                duration: 400,
                onComplete: () => {
                    this.fsCounterGroup.destroy(true);
                    this.fsCounterGroup = null;
                }
            });
        }
    }

    update() {
        this.reels.forEach(reel => reel.updateReel());
    }

    changeScene() {
        this.scene.start('GameOver');
    }
}