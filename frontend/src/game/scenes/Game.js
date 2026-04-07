import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import Reel from '../components/Reel';

export class Game extends Scene {
    constructor() {
        super('Game');
        this.reels = [];
    }

    create ()
    {
        const w = this.scale.width;
        const h = this.scale.height;

        this.cameras.main.setBackgroundColor(0x222222);

        // Przykładowa taśma 89 symboli używająca prawdziwych grafik
        const stripPattern1 = ['H1', 'L1', 'M2', 'WILD', 'L2', 'SCATTER', 'H2', 'L3', 'M1'];
        const stripPattern2 = ['L3', 'WILD', 'H1', 'M1', 'SCATTER', 'L1', 'H2', 'L2', 'M2'];
        const stripPattern3 = ['M2', 'L2', 'H2', 'SCATTER', 'L1', 'WILD', 'M1', 'L3', 'H1'];
        
        const reelStrip1 = Array.from({ length: 89 }, (_, i) => stripPattern1[i % stripPattern1.length]);
        const reelStrip2 = Array.from({ length: 89 }, (_, i) => stripPattern2[i % stripPattern2.length]);
        const reelStrip3 = Array.from({ length: 89 }, (_, i) => stripPattern3[i % stripPattern3.length]);
        
        // Utworzenie 3 bębnów
        // Zaokrąglenie w górę (Math.ceil) zapobiega błędom subpikselowym nakładania się krawędzi (np. niedobór 1px w 3 kolumnie)
        const colW = Math.ceil(w / 3);
        const rowH = Math.ceil(h / 3);
        
        const reel1 = new Reel(this, 0, 0, reelStrip1, colW, rowH);
        const reel2 = new Reel(this, colW, 0, reelStrip2, colW, rowH);
        const reel3 = new Reel(this, colW * 2, 0, reelStrip3, colW, rowH);

        this.reels = [reel1, reel2, reel3];

        // Rysowanie siatki (linii oddzielających)
        const gridGfx = this.add.graphics();
        gridGfx.lineStyle(4, 0xc5b081, 0.4); // Złoty kolor z przezroczystością, dopasowany do UI
        
        gridGfx.beginPath();
        // Pionowe linie oddzielające kolumny
        gridGfx.moveTo(colW, 0);
        gridGfx.lineTo(colW, h);
        gridGfx.moveTo(colW * 2, 0);
        gridGfx.lineTo(colW * 2, h);
        
        // Poziome linie oddzielające rzędy
        gridGfx.moveTo(0, rowH);
        gridGfx.lineTo(w, rowH);
        gridGfx.moveTo(0, rowH * 2);
        gridGfx.lineTo(w, rowH * 2);
        gridGfx.strokePath();

        gridGfx.setDepth(100); // Rysuj siatkę na samym wierzchu (nad symbolami)

        // Nasłuchiwanie na przycisk z UI Vue
        EventBus.on('spin', () => {
            // Zapobiega wielokrotnemu klikaniu podczas kręcenia
            if (this.reels.some(r => r.isSpinning)) return;

            // Startujemy wszystkie bębny
            this.reels.forEach(reel => reel.startSpin());

            // Zatrzymujemy kolejne bębny z opóźnieniem: 1s, 1.5s, 2s
            this.time.delayedCall(1000, () => this.reels[0].stopSpin());
            this.time.delayedCall(1500, () => this.reels[1].stopSpin());
            this.time.delayedCall(2000, () => this.reels[2].stopSpin());
        });

        EventBus.emit('current-scene-ready', this);
    }

    update() {
        this.reels.forEach(reel => reel.updateReel());
    }

    changeScene() {
        this.scene.start('GameOver');
    }
}
