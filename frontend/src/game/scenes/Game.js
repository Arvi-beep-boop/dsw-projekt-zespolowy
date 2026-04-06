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

        // Przykładowa taśma 89 symboli
        const stripPattern1 = ['sym1', 'sym2', 'sym3', 'sym4', 'sym1', 'sym3', 'sym2'];
        const stripPattern2 = ['sym4', 'sym1', 'sym2', 'sym3', 'sym3', 'sym1', 'sym2'];
        const stripPattern3 = ['sym2', 'sym3', 'sym4', 'sym1', 'sym2', 'sym4', 'sym1'];
        
        const reelStrip1 = Array.from({ length: 89 }, (_, i) => stripPattern1[i % stripPattern1.length]);
        const reelStrip2 = Array.from({ length: 89 }, (_, i) => stripPattern2[i % stripPattern2.length]);
        const reelStrip3 = Array.from({ length: 89 }, (_, i) => stripPattern3[i % stripPattern3.length]);
        
        // Utworzenie 3 bębnów
        const colW = w / 3;
        const rowH = h / 3;
        
        const reel1 = new Reel(this, 0, 0, reelStrip1, colW, rowH);
        const reel2 = new Reel(this, colW, 0, reelStrip2, colW, rowH);
        const reel3 = new Reel(this, colW * 2, 0, reelStrip3, colW, rowH);

        this.reels = [reel1, reel2, reel3];

        // Maskowanie nie jest tu potrzebne, o ile bębny idealnie mieszczą się w oknie canvasa
        // Ponieważ canvas utnie "nadmiar" u góry i na dole.

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
