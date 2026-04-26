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

        // Load 27 animation frames for l1, l2, l3 wins (bez spacji w nazwie folderu)
        for (let i = 1; i <= 27; i++) {
            const frameNum = String(i).padStart(3, '0');
            this.load.image(`l1-win-frame-${i}`, `animations/l1win/ezgif-frame-${frameNum}.png`);
            this.load.image(`l2-win-frame-${i}`, `animations/l2win/ezgif-frame-${frameNum}.png`);
            this.load.image(`l3-win-frame-${i}`, `animations/l3win/ezgif-frame-${frameNum}.png`);
        }
    }

    create() {
        // Create the animation from the loaded frames
        const l1Frames = [];
        const l2Frames = [];
        const l3Frames = [];
        for (let i = 1; i <= 27; i++) {
            l1Frames.push({ key: `l1-win-frame-${i}` });
            l2Frames.push({ key: `l2-win-frame-${i}` });
            l3Frames.push({ key: `l3-win-frame-${i}` });
        }
        
        this.anims.create({
            key: 'l1-win-anim',
            frames: l1Frames,
            frameRate: 15, // Zwolnione tempo, by klatki starczyły na zbliżenie się do ~3 sekund bez pętli
            repeat: 0 // Do not loop
        });
        
        this.anims.create({
            key: 'l2-win-anim',
            frames: l2Frames,
            frameRate: 15, // Takie same wartości jak l1
            repeat: 0
        });

        this.anims.create({
            key: 'l3-win-anim',
            frames: l3Frames,
            frameRate: 15, // Takie same wartości dla wszystkich wygranych
            repeat: 0
        });

        this.scene.start('Game');
    }
}
