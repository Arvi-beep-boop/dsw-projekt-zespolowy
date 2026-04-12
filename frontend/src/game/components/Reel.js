import Phaser from 'phaser';

export default class Reel extends Phaser.GameObjects.Container {
    constructor(scene, x, y, symbolKeys, symW, symH) {
        super(scene, x, y);
        this.scene.add.existing(this);
        this.symbolWidth = symW;
        this.symbolHeight = symH;
        this.visibleSlots = 3;
        this.symbolStrip = symbolKeys;
        this.stripIndex = 0;
        this.poolSize = this.visibleSlots + 2;
        this.activeSymbols = [];
        this.isSpinning = false;
        this.spinSpeed = 30;
        this.targetSymbols = null;

        this.initPool();
    }

    initPool() {
        for (let i = 0; i < this.poolSize; i++) {
            const textureKey = this.symbolStrip[i % this.symbolStrip.length];
            const posY = (i - 1) * this.symbolHeight;
            const symbol = this.scene.add.sprite(0, posY, textureKey);
            symbol.setOrigin(0, 0);
            symbol.setDisplaySize(this.symbolWidth, this.symbolHeight);
            this.add(symbol);
            this.activeSymbols.push(symbol);
        }
        this.stripIndex = this.poolSize;
    }

    startSpin() {
        this.isSpinning = true;
        this.stopping = false;
        this.targetSymbols = null;
    }
    
    stopSpin(targetSymbolsArray) {
        this.stopping = true;
        this.targetSymbols = targetSymbolsArray; // Np. ['H1', 'WILD', 'L2']
    }

    updateReel() {
        if (!this.isSpinning) return;

        let moveAmount = this.spinSpeed;
        let snappingThisFrame = false;

        if (this.stopping) {
            let remainder = this.activeSymbols[0].y % this.symbolHeight;
            if (remainder < 0) remainder += this.symbolHeight;

            let distToSnap = this.symbolHeight - remainder;
            if (distToSnap === this.symbolHeight) distToSnap = 0;

            if (distToSnap <= this.spinSpeed && distToSnap > 0 || distToSnap === 0) {
                moveAmount = distToSnap;
                this.isSpinning = false;
                this.stopping = false;
                snappingThisFrame = true;
            }
        }

        if (moveAmount > 0) {
            this.activeSymbols.forEach(symbol => {
                symbol.y += moveAmount;
            });
            
            this.activeSymbols.forEach(symbol => {
                if (symbol.y >= this.symbolHeight * (this.visibleSlots + 1)) {
                    symbol.y = Math.round(symbol.y - this.symbolHeight * this.poolSize);

                    const nextTexture = this.symbolStrip[this.stripIndex % this.symbolStrip.length];
                    symbol.setTexture(nextTexture);
                    symbol.setDisplaySize(this.symbolWidth, this.symbolHeight);

                    this.stripIndex++;
                }
            });
        }
        
        if (snappingThisFrame && this.targetSymbols) {
            let sortedSymbols = [...this.activeSymbols].sort((a, b) => a.y - b.y);

            sortedSymbols[1].setTexture(this.targetSymbols[0]); // Górny wiersz
            sortedSymbols[2].setTexture(this.targetSymbols[1]); // Środkowy wiersz
            sortedSymbols[3].setTexture(this.targetSymbols[2]); // Dolny wiersz

            this.targetSymbols = null;
        }
    }
}