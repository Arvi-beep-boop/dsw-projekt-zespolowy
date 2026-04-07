import { Scene } from 'phaser';

export class Preloader extends Scene {
    constructor() {
        super('Preloader');
    }

    preload() {
        this.load.setPath('assets');
        
        this.load.image('logo', 'logo.png');
        this.load.image('star', 'star.png');

        // Slot symbol assets
        this.load.image('H1', 'reels/H1.webp');
        this.load.image('H2', 'reels/H2.webp');
        this.load.image('L1', 'reels/L1.webp');
        this.load.image('L2', 'reels/L2.webp');
        this.load.image('L3', 'reels/L3.webp');
        this.load.image('M1', 'reels/M1.webp');
        this.load.image('M2', 'reels/M2.webp');
        this.load.image('SCATTER', 'reels/SCATTER.webp');
        this.load.image('WILD', 'reels/WILD.webp');
    }

    create() {
        this.scene.start('Game');
    }
}
