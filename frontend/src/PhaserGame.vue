<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import { EventBus } from './game/EventBus';
import StartGame from './game/main';

// Save the current scene instance
const scene = ref();
const game = ref();

const emit = defineEmits(['current-active-scene']);

onMounted(() => {
    game.value = StartGame('game-container');

    // Obserwator zmian rozmiaru pola gry
    const container = document.getElementById('game-container');
    if (container) {
        const resizeObserver = new ResizeObserver(() => {
            if (game.value && game.value.scale) {
                game.value.scale.refresh();
            }
        });
        resizeObserver.observe(container);
    }

    EventBus.on('current-scene-ready', (currentScene) => {
        emit('current-active-scene', currentScene);
        scene.value = currentScene;
    });
});

onUnmounted(() => {

    if (game.value)
    {
        game.value.destroy(true);
        game.value = null;
    }
    
});

defineExpose({ scene, game });
</script>

<template>
    <div id="game-container"></div>
</template>

<style scoped>
#game-container {
    width: 100%;
    height: 100%;
    position: relative;
}

#game-container :deep(canvas) {
    position: absolute !important;
    top: 0;
    left: 0;
    width: 100% !important;
    height: 100% !important;
}
</style>