<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { EventBus } from '../game/EventBus';

const coins = ref([]);
let coinId = 0;

const spawnFountain = () => {
    const numCoins = 60; // 30 on each side
    const newCoins = [];

    for (let i = 0; i < numCoins; i++) {
        // Half on the left (0), half on the right (1)
        const side = i < numCoins / 2 ? 'left' : 'right';
        
        // Zmiana: Przesuwamy bazę bliżej środka, żeby wchodziły na grę (25% z lewej, 75% z prawej)
        const baseX = side === 'left' ? 25 : 75;
        // Większy rozrzut na osi X przy starcie
        const randomX = baseX + (Math.random() * 15 - 7.5); 

        // Większy rozrzut lotu (tx) żeby "wpadały" bardziej do środka i na boki
        const tx = (Math.random() * 300 - 150) + 'px'; // -150px do 150px
        const ty = -(Math.random() * 500 + 400) + 'px'; // wyższy i silniejszy wyrzut w górę
        const rot = (Math.random() * 1080) + 'deg'; // więcej obrotów
        
        // Szybsza animacja: trwają krócej i wyskakują gwałtowniej
        const duration = (Math.random() * 0.6 + 0.8) + 's'; // 0.8s do 1.4s
        const delay = (Math.random() * 0.3) + 's'; // max 0.3s opóźnienia

        newCoins.push({
            id: coinId++,
            x: randomX + '%',
            y: '80%', // Start near the bottom
            tx, ty, rot, duration, delay
        });
    }

    coins.value = [...coins.value, ...newCoins];

    // Cleanup coins po 2 sekundach (dopasowane do reszty gry)
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
        <div class="coin-inner">€</div>
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
    pointer-events: none; /* Ignore clicks */
    z-index: 50; /* Above background, below main machine if possible, or over it */
    overflow: hidden;
}

.coin {
    position: absolute;
    width: 60px; /* Zwiększone z 35px */
    height: 60px; /* Zwiększone z 35px */
    border-radius: 50%;
    background: radial-gradient(circle at 30% 30%, #ffdf00, #d4af37 60%, #996515);
    border: 3px solid #b8860b; /* Nieco grubsza ramka */
    box-shadow: 
        inset 0 0 8px rgba(255, 255, 255, 0.8),
        inset 0 0 15px rgba(0, 0, 0, 0.2),
        0 6px 12px rgba(0, 0, 0, 0.5); /* Mocniejszy cień ze względu na rozmiar */
    display: flex;
    justify-content: center;
    align-items: center;
    transform-origin: center;
    /* CSS animation properties */
    animation-name: coin-fly;
    animation-timing-function: cubic-bezier(0.25, 1, 0.5, 1); /* fast up, slow down */
    animation-fill-mode: forwards;
    opacity: 0;
    z-index: 500; /* Zapewnia, że będą zawsze na wierzchu */
}

.coin-inner {
    font-family: 'Georgia', serif;
    font-weight: bold;
    font-size: 32px; /* Zwiększone z 18px */
    color: #ffd700;
    text-shadow: 2px 2px 3px rgba(0,0,0,0.6); /* Mocniejszy cień tekstu */
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
