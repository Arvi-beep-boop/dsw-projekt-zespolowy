<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { EventBus } from '../game/EventBus';

const TOTAL_FRAMES = 31;
const FRAME_INTERVAL = 130;

const activeRows = ref([]);
const currentFrame = ref(1);
let animInterval = null;

function getFrameSrc(frame) {
    const num = String(frame).padStart(3, '0');
    return `/assets/animations/win/ezgif-frame-${num}.png`;
}

function startFrameLoop() {
    stopFrameLoop();
    currentFrame.value = 1;
    animInterval = setInterval(() => {
        currentFrame.value = (currentFrame.value % TOTAL_FRAMES) + 1;
    }, FRAME_INTERVAL);
}

function stopFrameLoop() {
    if (animInterval) {
        clearInterval(animInterval);
        animInterval = null;
    }
}

const onWinActive = (rows) => {
    activeRows.value = rows;
    startFrameLoop();
};

const onWinClear = () => {
    activeRows.value = [];
    stopFrameLoop();
};

onMounted(() => {
    EventBus.on('win-lines-active', onWinActive);
    EventBus.on('win-lines-clear', onWinClear);
});

onUnmounted(() => {
    EventBus.off('win-lines-active', onWinActive);
    EventBus.off('win-lines-clear', onWinClear);
    stopFrameLoop();
});
</script>

<template>
  <div v-if="activeRows.length > 0" class="win-indicator-layer">
    <template v-for="row in activeRows" :key="row">
      <img
        :src="getFrameSrc(currentFrame)"
        class="win-img left"
        :class="'row-' + row"
        alt="WIN"
      />
      <img
        :src="getFrameSrc(currentFrame)"
        class="win-img right"
        :class="'row-' + row"
        alt="WIN"
      />
    </template>
  </div>
</template>

<style scoped>
.win-indicator-layer {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 200;
}

.win-img {
    position: absolute;
    height: calc(100% / 3 * 0.75);
    width: auto;
    object-fit: contain;
    mix-blend-mode: screen;
    animation: win-pop 0.3s ease-out forwards;
}

.win-img.left {
    right: 100%;
    margin-right: 20px;
}

.win-img.right {
    left: 100%;
    margin-left: 20px;
}

.win-img.row-0 { top: calc(100% / 3 * 0.5 - 100% / 3 * 0.75 / 2); }
.win-img.row-1 { top: calc(100% / 3 * 1.5 - 100% / 3 * 0.75 / 2); }
.win-img.row-2 { top: calc(100% / 3 * 2.5 - 100% / 3 * 0.75 / 2); }

@keyframes win-pop {
    0% {
        transform: scale(0.3);
        opacity: 0;
    }
    60% {
        transform: scale(1.15);
        opacity: 1;
    }
    100% {
        transform: scale(1);
        opacity: 1;
    }
}
</style>
