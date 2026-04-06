import Phaser from 'phaser';

export default class Reel extends Phaser.GameObjects.Container {
    constructor(scene, x, y, symbolKeys, symW, symH) {
        super(scene, x, y);

        // Dodajemy komponent do sceny
        this.scene.add.existing(this);

        this.symbolWidth = symW; 
        this.symbolHeight = symH;
        this.visibleSlots = 3;

        // Cała "taśma" symboli
        this.symbolStrip = symbolKeys;
        this.stripIndex = 0;

        // Tworzymy Object Pool - 5 symboli (3 widoczne + 1 góra + 1 dół)
        this.poolSize = this.visibleSlots + 2;
        this.activeSymbols = [];

        this.isSpinning = false;
        this.spinSpeed = 30; // Zwiększona prędkość przesuwania

        this.initPool();
    }

    initPool() {
        for (let i = 0; i < this.poolSize; i++) {
            const textureKey = this.symbolStrip[i % this.symbolStrip.length];
            const posY = (i - 1) * this.symbolHeight;

            const symbol = this.scene.add.sprite(0, posY, textureKey);
            symbol.setOrigin(0, 0);

            // Adjust scale if needed for placeholders
            symbol.setDisplaySize(this.symbolWidth, this.symbolHeight);

            this.add(symbol);
            this.activeSymbols.push(symbol);
        }

        this.stripIndex = this.poolSize;
    }

    startSpin() {
        this.isSpinning = true;
        this.stopping = false;
    }

    stopSpin() {
        // Zamiast zatrzymać od razu, wchodzimy w tryb dociągania do siatki
        this.stopping = true;
    }

    updateReel() {
        if (!this.isSpinning) return;

        let moveAmount = this.spinSpeed;

        if (this.stopping) {
            // Obliczamy przesunięcie pierwszego symbolu względem "idealnej" siatki
            let remainder = this.activeSymbols[0].y % this.symbolHeight;
            if (remainder < 0) remainder += this.symbolHeight;

            let distToSnap = this.symbolHeight - remainder;
            if (distToSnap === this.symbolHeight) distToSnap = 0;

            // Jeżeli jesteśmy bardzo blisko siatki (bliżej niż krok prędkości)
            if (distToSnap <= this.spinSpeed && distToSnap > 0) {
                moveAmount = distToSnap;
                this.isSpinning = false;
                this.stopping = false;
            } else if (distToSnap === 0) {
                moveAmount = 0;
                this.isSpinning = false;
                this.stopping = false;
            }
        }

        if (moveAmount > 0) {
            // Najpierw bezpiecznie przesuwamy wszystkie symbole
            this.activeSymbols.forEach(symbol => {
                symbol.y += moveAmount;
            });

            // Dopiero potem weryfikujemy czy któryś wyleciał z widoku
            this.activeSymbols.forEach(symbol => {
                if (symbol.y >= this.symbolHeight * (this.visibleSlots + 1)) {
                    // Czysta relokacja niwelująca bug gapów / Math.min
                    symbol.y -= this.symbolHeight * this.poolSize;

                    const nextTexture = this.symbolStrip[this.stripIndex % this.symbolStrip.length];
                    symbol.setTexture(nextTexture);
                    symbol.setDisplaySize(this.symbolWidth, this.symbolHeight);

                    this.stripIndex++;
                }
            });
        }
    }
}
