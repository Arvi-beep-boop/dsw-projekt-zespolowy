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

        // Load 15 animation frames for l1, l2, l3 wins
        for (let i = 1; i <= 15; i++) {
            const frameNum = String(i).padStart(3, '0');
            this.load.image(`l1-win-frame-${i}`, `animations/l1win/ezgif-frame-${frameNum}.png`);
            this.load.image(`l2-win-frame-${i}`, `animations/l2win/ezgif-frame-${frameNum}.png`);
            this.load.image(`l3-win-frame-${i}`, `animations/l3win/ezgif-frame-${frameNum}.png`);
        }

        // Load 15 animation frames for m1 win
        for (let i = 1; i <= 15; i++) {
            const frameNum = String(i).padStart(3, '0');
            this.load.image(`m1-win-frame-${i}`, `animations/m1win/ezgif-frame-${frameNum}.png`);
        }

        // Load 15 animation frames for m2 win
        for (let i = 1; i <= 15; i++) {
            const frameNum = String(i).padStart(3, '0');
            this.load.image(`m2-win-frame-${i}`, `animations/m2win/ezgif-frame-${frameNum}.png`);
        }

        // Load 31 animation frames for h1 win
        for (let i = 1; i <= 31; i++) {
            const frameNum = String(i).padStart(3, '0');
            this.load.image(`h1-win-frame-${i}`, `animations/h1win/ezgif-frame-${frameNum}.png`);
        }

        // Load 15 animation frames for h2 win
        for (let i = 1; i <= 15; i++) {
            const frameNum = String(i).padStart(3, '0');
            this.load.image(`h2-win-frame-${i}`, `animations/h2win/ezgif-frame-${frameNum}.png`);
        }

        // Load 15 animation frames for scatter win
        for (let i = 1; i <= 15; i++) {
            const frameNum = String(i).padStart(3, '0');
            this.load.image(`scatter-win-frame-${i}`, `animations/scatterwin/ezgif-frame-${frameNum}.png`);
        }
    }

    create() {
        // Create the animation from the loaded frames
        const l1Frames = [];
        const l2Frames = [];
        const l3Frames = [];
        for (let i = 1; i <= 15; i++) {
            l1Frames.push({ key: `l1-win-frame-${i}` });
            l2Frames.push({ key: `l2-win-frame-${i}` });
            l3Frames.push({ key: `l3-win-frame-${i}` });
        }
        
        this.anims.create({
            key: 'l1-win-anim',
            frames: l1Frames,
            frameRate: 11.74,
            repeat: 0
        });
        
        this.anims.create({
            key: 'l2-win-anim',
            frames: l2Frames,
            frameRate: 11.74,
            repeat: 0
        });

        this.anims.create({
            key: 'l3-win-anim',
            frames: l3Frames,
            frameRate: 11.74,
            repeat: 0
        });

        // M1 win animation (11.74 FPS – taki sam klatkaż jak reszta)
        const m1Frames = [];
        for (let i = 1; i <= 15; i++) {
            m1Frames.push({ key: `m1-win-frame-${i}` });
        }
        this.anims.create({
            key: 'm1-win-anim',
            frames: m1Frames,
            frameRate: 11.74, // Takie same wartości jak reszta animacji
            repeat: 0
        });

        // M2 win animation (11.74 FPS – taki sam klatkaż jak l1/l2/l3)
        const m2Frames = [];
        for (let i = 1; i <= 15; i++) {
            m2Frames.push({ key: `m2-win-frame-${i}` });
        }
        this.anims.create({
            key: 'm2-win-anim',
            frames: m2Frames,
            frameRate: 11.74, // Takie same wartości jak reszta animacji
            repeat: 0
        });

        // H1 win animation (11.74 FPS – taki sam klatkaż jak reszta)
        const h1Frames = [];
        for (let i = 1; i <= 31; i++) {
            h1Frames.push({ key: `h1-win-frame-${i}` });
        }
        this.anims.create({
            key: 'h1-win-anim',
            frames: h1Frames,
            frameRate: 11.74, // Takie same wartości jak reszta animacji
            repeat: 0
        });

        // H2 win animation (11.74 FPS – taki sam klatkaż jak reszta)
        const h2Frames = [];
        for (let i = 1; i <= 15; i++) {
            h2Frames.push({ key: `h2-win-frame-${i}` });
        }
        this.anims.create({
            key: 'h2-win-anim',
            frames: h2Frames,
            frameRate: 11.74,
            repeat: 0
        });

        // SCATTER win animation (11.74 FPS – taki sam klatkaż jak reszta)
        const scatterFrames = [];
        for (let i = 1; i <= 15; i++) {
            scatterFrames.push({ key: `scatter-win-frame-${i}` });
        }
        this.anims.create({
            key: 'scatter-win-anim',
            frames: scatterFrames,
            frameRate: 11.74,
            repeat: 0
        });

        this.scene.start('Game');
    }
}
