<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { EventBus } from '../game/EventBus';
import { AUDIO_SETTINGS } from '../game/settings';

// ==========================================
//    PANEL STEROWANIA FIZYKĄ FONTANNY
// ==========================================
const CONFIG = {
    // --- TIMING I PROCESOR ---
    COIN_COUNT: 160,                // Ilość monet w jednej salwie.

    // --- OPTYMALIZACJA ---
    ENABLE_SHADOW: 0,               // 1 = Włączone cienie monet, 0 = Wyłączone (zwiększa FPS).
    
    // --- FIZYKA LOTU ---
    GRAVITY: 0.42,                  // Siła przyciągania (ciężar monet).
    START_Y: 85,                    // Pionowy punkt startu (85% wysokości ekranu).
    START_X_LEFT: 25,               // Punkt startu lewej strony (25% szerokości).
    START_X_RIGHT: 75,              // Punkt startu prawej strony (75% szerokości).
    TARGET_PEAK_Y: 5,               // Docelowa wysokość lotu (5% od góry ekranu).
    PEAK_VARIANCE: 45,              // Losowość wysokości (rozrzut szczytowy).

    // --- DYNAMIKA ---
    SPEED_MULT: 2.2,                // Globalny mnożnik prędkości (cały czas animacji).
    SPREAD_WIDTH: 0.8,              // Szerokość wachlarza na boki.
    MAX_ROTATIONS_PER_SEC: 3,       // Maksymalne obroty monety na sekundę.
    MIN_ROTATION_FACTOR: 0.2,       // Minimalne obroty (20% z maksymalnych).

    // --- EFEKT 3D ---
    BASE_SIZE: 32,                  // Bazowy rozmiar tekstury monety (px).
    START_SCALE: 0.6,               // Skala startowa (z głębi).
    MAX_SCALE: 1.8,                 // Bazowa skala końcowa (blisko ekranu).
    SCALE_VARIANCE: 0.8,            // Losowość wielkości monet.
    GROWTH_SPEED: 0.02,             // Szybkość powiększania się w locie.

    // --- RZADKIE MONETY (TIERS) ---
    ENABLE_RARE_COINS: 1,           // 1 = Włączone, 0 = Tylko zwykłe monety.
    RARE_SIZE_FACTOR: 8,            // Mnożnik wielkości dla wszystkich rzadkich monet.
    CHANCE_MEGA: 2,                 // Szansa (%) na monety MEGA (x4).
    CHANCE_LARGE: 4,                // Szansa (%) na monety LARGE (x2).
    CHANCE_BIG: 8,                  // Szansa (%) na monety BIG (x1.4).
    MULT_MEGA: 4.0,                 // Bazowy mnożnik dla MEGA.
    MULT_LARGE: 2.0,                // Bazowy mnożnik dla LARGE.
    MULT_BIG: 1.4                   // Bazowy mnożnik dla BIG.
};
// ==========================================

const coinSound = new Audio('/assets/audio/coins.wav');
coinSound.preload = 'auto';

// Cache ma tylko wielkość monety + mały margines na cienie
const coinCache = document.createElement('canvas');
const cacheSize = CONFIG.BASE_SIZE + 20; 

const preRenderCoin = () => {
    coinCache.width = cacheSize;
    coinCache.height = cacheSize;
    const c = coinCache.getContext('2d');
    const center = cacheSize / 2;
    const radius = CONFIG.BASE_SIZE / 2;

    if (CONFIG.ENABLE_SHADOW === 1) {
        c.shadowColor = 'rgba(0, 0, 0, 0.4)';
        c.shadowBlur = 8;
        c.shadowOffsetY = 4;
    }

    const grad = c.createRadialGradient(center, center, 0, center, center, radius);
    grad.addColorStop(0, '#fce566');
    grad.addColorStop(1, '#d4a017');

    c.beginPath();
    c.arc(center, center, radius, 0, Math.PI * 2);
    c.fillStyle = grad;
    c.fill();
    
    c.shadowColor = 'transparent'; 
    c.lineWidth = 1;
    c.strokeStyle = 'rgba(0, 0, 0, 0.2)';
    c.stroke();

    c.fillStyle = '#8b6914';
    c.font = `bold ${CONFIG.BASE_SIZE * 0.5}px serif`;
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillText('₳', center, center);
};

const canvasRef = ref(null);
let ctx = null;
let lastTime = 0;
let animationFrame = null;
let isRunning = false;
let hasPlayedSound = false;
let frameCount = 0; // Licznik do optymalizacji sortowania
let coins = [];

class Coin {
    constructor(canvasWidth, canvasHeight, side) {
        const startXPercent = side === 'left' ? CONFIG.START_X_LEFT : CONFIG.START_X_RIGHT;
        this.x = canvasWidth * (startXPercent / 100);
        this.y = canvasHeight * (CONFIG.START_Y / 100);
        
        // Zabezpieczenie przed błędem NaN w fizyce przy dziwnych rozdzielczościach
        const targetPeakPixels = canvasHeight * ((CONFIG.TARGET_PEAK_Y + (Math.random() * CONFIG.PEAK_VARIANCE)) / 100);
        const distanceToPeak = Math.max(0, this.y - targetPeakPixels); 
        this.vy = -Math.sqrt(2 * CONFIG.GRAVITY * distanceToPeak);
        
        const spread = (canvasWidth * 0.012) * CONFIG.SPREAD_WIDTH;
        this.vx = (Math.random() * spread - (spread / 2)) + (2.2 * (side === 'left' ? 1 : -1));
        
        this.scale = CONFIG.START_SCALE;
        this.rotation = Math.random() * Math.PI * 2;
        const maxVRot = (CONFIG.MAX_ROTATIONS_PER_SEC * 2 * Math.PI) / 60;
        this.vRot = (Math.random() * (maxVRot * (1 - CONFIG.MIN_ROTATION_FACTOR)) + (maxVRot * CONFIG.MIN_ROTATION_FACTOR)) * (Math.random() > 0.5 ? 1 : -1);
        
        this.isDead = false;

        let rarityMult = 1.0;
        let growthBoost = 1.0;
        if (CONFIG.ENABLE_RARE_COINS === 1) {
            const roll = Math.random() * 100;
            if (roll < CONFIG.CHANCE_MEGA) { rarityMult = CONFIG.MULT_MEGA * CONFIG.RARE_SIZE_FACTOR; growthBoost = 1.8; }
            else if (roll < CONFIG.CHANCE_MEGA + CONFIG.CHANCE_LARGE) { rarityMult = CONFIG.MULT_LARGE * CONFIG.RARE_SIZE_FACTOR; growthBoost = 1.4; }
            else if (roll < CONFIG.CHANCE_MEGA + CONFIG.CHANCE_LARGE + CONFIG.CHANCE_BIG) { rarityMult = CONFIG.MULT_BIG * CONFIG.RARE_SIZE_FACTOR; growthBoost = 1.2; }
        }
        this.finalMaxScale = (CONFIG.MAX_SCALE + (Math.random() * CONFIG.SCALE_VARIANCE - (CONFIG.SCALE_VARIANCE / 2))) * rarityMult;
        this.currentGrowthSpeed = CONFIG.GROWTH_SPEED * growthBoost;
    }

    update(dt, canvasHeight) {
        this.vy += CONFIG.GRAVITY * dt;
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.rotation += this.vRot * dt;
        if (this.scale < this.finalMaxScale) this.scale += this.currentGrowthSpeed * dt;
        // Moneta umiera jak wyleci na dół za ekran
        if (this.y > canvasHeight + (this.finalMaxScale * 100)) this.isDead = true;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.scale(this.scale, this.scale); 
        ctx.drawImage(coinCache, -cacheSize / 2, -cacheSize / 2);
        ctx.restore();
    }
}

const loop = (timestamp) => {
    if (!ctx || !canvasRef.value || (!isRunning && coins.length === 0)) {
        isRunning = false;
        lastTime = 0;
        return;
    }

    if (!lastTime) lastTime = timestamp;
    const elapsed = Math.min(timestamp - lastTime, 100); 
    const dt = (elapsed / (1000 / 60)) * CONFIG.SPEED_MULT;
    lastTime = timestamp;

    ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height);

    if (coins.length === 0) {
        isRunning = false;
        lastTime = 0;
        return;
    }

    // --- ODPALENIE DŹWIĘKU TYLKO PODCZAS RYSOWANIA PIERWSZEJ KLATKI ---
    if (!hasPlayedSound && AUDIO_SETTINGS.volumes.coinFountain > 0) {
        coinSound.volume = AUDIO_SETTINGS.volumes.coinFountain;
        coinSound.currentTime = 0;
        coinSound.play().catch(err => console.warn("Audio blocked:", err));
        hasPlayedSound = true; // Blokujemy, żeby zagrało tylko raz na wystrzał
    }

    frameCount++;
    if (frameCount % 3 === 0) {
        coins.sort((a, b) => a.scale - b.scale);
    }

    for (let i = coins.length - 1; i >= 0; i--) {
        const coin = coins[i];
        coin.update(dt, canvasRef.value.height);
        coin.draw(ctx);
        if (coin.isDead) coins.splice(i, 1);
    }
    animationFrame = requestAnimationFrame(loop);
};

const spawnFountain = (winAmount = 500) => {
    if (!canvasRef.value) return;

    // --- KALKULATOR MONET ---
    let spawnCount = 5; // Minimum 5 monet dla wygranych <= 10
    
    if (winAmount > 10) {
        if (winAmount >= 2000) {
            spawnCount = CONFIG.COIN_COUNT; // Maksymalnie 112 monet
        } else {
            // Proporcjonalne skalowanie pomiędzy 10 a 500
            const progress = (winAmount - 10) / (2000 - 10);
            spawnCount = Math.round(5 + progress * (CONFIG.COIN_COUNT - 5));
        }
    }

    // Reset flagi dźwięku
    hasPlayedSound = false; 

    // Używamy policzonego spawnCount zamiast sztywnego CONFIG.COIN_COUNT
    for (let i = 0; i < spawnCount; i++) {
        const side = i < spawnCount / 2 ? 'left' : 'right';
        coins.push(new Coin(canvasRef.value.width, canvasRef.value.height, side));
    }

    if (!isRunning) {
        isRunning = true;
        lastTime = 0;
        animationFrame = requestAnimationFrame(loop);
    }
};

// --- KILL SWITCH: Błyskawiczne ubijanie fontanny ---
const killFountain = () => {
    isRunning = false;
    hasPlayedSound = false;
    coins = [];
    coinSound.pause();
    coinSound.currentTime = 0;
    
    if (animationFrame) {
        cancelAnimationFrame(animationFrame);
        animationFrame = null;
    }
    if (ctx && canvasRef.value) {
        ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height);
    }
};

const handleResize = () => {
    if (canvasRef.value) {
        canvasRef.value.width = window.innerWidth;
        canvasRef.value.height = window.innerHeight;
    }
};

onMounted(() => {
    preRenderCoin();
    ctx = canvasRef.value.getContext('2d', { alpha: true });
    handleResize();
    window.addEventListener('resize', handleResize);
    
    // Nasłuchiwanie eventów
    EventBus.on('trigger-fountain', spawnFountain);
    EventBus.on('kill-fountain', killFountain);
});

onUnmounted(() => {
    isRunning = false;
    cancelAnimationFrame(animationFrame);
    window.removeEventListener('resize', handleResize);
    
    // Sprzątanie nasłuchu
    EventBus.off('trigger-fountain', spawnFountain);
    EventBus.off('kill-fountain', killFountain);
});
</script>

<template>
    <canvas ref="canvasRef" class="fountain-canvas"></canvas>
</template>

<style scoped>
.fountain-canvas {
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    pointer-events: none;
    z-index: 9999;
    will-change: transform;
    transform: translateZ(0);
}
</style>