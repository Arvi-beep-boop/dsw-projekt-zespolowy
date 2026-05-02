<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { EventBus } from '../game/EventBus';

const coins = ref([]);
let coinId = 0;

const spawnFountain = () => {
    const numCoins = 60;
    const newCoins = [];

    for (let i = 0; i < numCoins; i++) {
        const side = i < numCoins / 2 ? 'left' : 'right';
        
        const baseX = side === 'left' ? 25 : 75;
        const randomX = baseX + (Math.random() * 15 - 7.5); 

        const tx = (Math.random() * 300 - 150) + 'px';
        const ty = -(Math.random() * 500 + 400) + 'px';
        const rot = (Math.random() * 1080) + 'deg';
        
        const duration = (Math.random() * 0.6 + 0.8) + 's';
        const delay = (Math.random() * 0.3) + 's';

        newCoins.push({
            id: coinId++,
            x: randomX + '%',
            y: '80%',
            tx, ty, rot, duration, delay
        });
    }

    coins.value = [...coins.value, ...newCoins];

    setTimeout(() => {
        const idsToRemove = new Set(newCoins.map(c => c.id));
        coins.value = coins.value.filter(c => !idsToRemove.has(c.id));
    }, 2000);
};

onMounted(() => {
    EventBus.on('trigger-fountain', spawnFountain);
});

onUnmounted(() => {
    EventBus.off('trigger-fountain', spawnFountain);
});
</script>

<template>
  <div class="fountain-container">
    <div 
        v-for="coin in coins" 
        :key="coin.id" 
        class="coin"
        :style="{
            left: coin.x,
            top: coin.y,
            '--tx': coin.tx,
            '--ty': coin.ty,
            '--rot': coin.rot,
            animationDuration: coin.duration,
            animationDelay: coin.delay
        }"
    >
        <div class="coin-face">
            <div class="coin-rim"></div>
            <div class="coin-emblem">₳</div>
            <div class="coin-shine"></div>
        </div>
    </div>
  </div>
</template>

<style scoped>
.fountain-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 50;
    overflow: hidden;
}

.coin {
    position: absolute;
    width: 55px;
    height: 55px;
    transform-origin: center;
    animation-name: coin-fly;
    animation-timing-function: cubic-bezier(0.25, 1, 0.5, 1);
    animation-fill-mode: forwards;
    opacity: 0;
    z-index: 500;
    perspective: 200px;
}

.coin-face {
    position: relative;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background:
        radial-gradient(ellipse 60% 40% at 35% 25%, rgba(255,255,255,0.6) 0%, transparent 60%),
        radial-gradient(ellipse 80% 80% at 50% 50%, #fce566 0%, #d4a017 40%, #b8860b 70%, #8b6914 100%);
    box-shadow:
        inset 0 2px 4px rgba(255, 255, 220, 0.9),
        inset 0 -3px 6px rgba(100, 60, 0, 0.6),
        0 4px 8px rgba(0, 0, 0, 0.5),
        0 1px 0 #a67c00;
    overflow: hidden;
}

.coin-rim {
    position: absolute;
    inset: 3px;
    border-radius: 50%;
    border: 2px solid rgba(255, 235, 150, 0.5);
    box-shadow:
        inset 0 0 3px rgba(180, 130, 0, 0.8),
        0 0 2px rgba(255, 215, 0, 0.3);
    background: conic-gradient(
        from 0deg,
        rgba(255, 230, 100, 0.15) 0deg,
        transparent 20deg,
        rgba(255, 230, 100, 0.1) 40deg,
        transparent 60deg,
        rgba(255, 230, 100, 0.15) 80deg,
        transparent 100deg,
        rgba(255, 230, 100, 0.1) 120deg,
        transparent 140deg,
        rgba(255, 230, 100, 0.15) 160deg,
        transparent 180deg,
        rgba(255, 230, 100, 0.1) 200deg,
        transparent 220deg,
        rgba(255, 230, 100, 0.15) 240deg,
        transparent 260deg,
        rgba(255, 230, 100, 0.1) 280deg,
        transparent 300deg,
        rgba(255, 230, 100, 0.15) 320deg,
        transparent 340deg,
        rgba(255, 230, 100, 0.1) 360deg
    );
}

.coin-emblem {
    position: absolute;
    inset: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    font-family: 'Georgia', 'Times New Roman', serif;
    font-weight: 900;
    font-size: 28px;
    color: #c99a2e;
    text-shadow:
        0 1px 0 #e8c252,
        0 -1px 0 #8b6508,
        1px 0 0 #a07818,
        -1px 0 0 #a07818,
        0 0 6px rgba(255, 215, 0, 0.4);
    -webkit-text-stroke: 0.5px rgba(139, 101, 8, 0.5);
}

.coin-shine {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: linear-gradient(
        135deg,
        rgba(255, 255, 255, 0.4) 0%,
        rgba(255, 255, 255, 0.1) 30%,
        transparent 50%,
        transparent 100%
    );
}

@keyframes coin-fly {
    0% {
        transform: translate(0, 0) rotate(0deg) scale(0.5);
        opacity: 1;
    }
    10% {
        transform: translate(calc(var(--tx) * 0.2), calc(var(--ty) * 0.5)) rotate(calc(var(--rot) * 0.2)) scale(1.2);
        opacity: 1;
    }
    80% {
        opacity: 1;
    }
    100% {
        transform: translate(var(--tx), var(--ty)) rotate(var(--rot)) scale(1);
        opacity: 0;
    }
}
</style>
