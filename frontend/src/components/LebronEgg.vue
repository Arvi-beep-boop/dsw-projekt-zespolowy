<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { EventBus } from '../game/EventBus';

const TOTAL_FRAMES = 31;
const DURATION_MS = 4000;
const FRAME_INTERVAL = DURATION_MS / TOTAL_FRAMES;
const SECRET_CODE = 'lebronking';

const isActive = ref(false);
const currentFrame = ref(1);

let inputBuffer = '';
let animInterval = null;

function onKeyDown(e) {

  if (e.key.length !== 1) return;

  inputBuffer += e.key.toLowerCase();


  if (inputBuffer.length > SECRET_CODE.length) {
    inputBuffer = inputBuffer.slice(-SECRET_CODE.length);
  }

  if (inputBuffer === SECRET_CODE) {
    inputBuffer = '';
    triggerAnimation();
  }
}

function triggerAnimation() {

  if (animInterval) {
    clearInterval(animInterval);
  }

  currentFrame.value = 1;
  isActive.value = true;
  EventBus.emit('lebron-flash');

  animInterval = setInterval(() => {
    currentFrame.value++;
    if (currentFrame.value > TOTAL_FRAMES) {
      clearInterval(animInterval);
      animInterval = null;
      isActive.value = false;
      currentFrame.value = 1;
    }
  }, FRAME_INTERVAL);
}

function getFrameSrc(frame) {
  const num = String(frame).padStart(3, '0');
  return `/assets/animations/lebronegg/ezgif-frame-${num}.png`;
}

onMounted(() => {
  window.addEventListener('keydown', onKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown);
  if (animInterval) clearInterval(animInterval);
});
</script>

<template>
  <Transition name="lebron-fade">
    <div v-if="isActive" class="lebron-overlay">

      <div class="lebron-grow left">
        <img :src="getFrameSrc(currentFrame)" class="lebron-bounce" alt="" />
      </div>

      <div class="lebron-grow right">
        <img :src="getFrameSrc(currentFrame)" class="lebron-bounce" alt="" />
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.lebron-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  pointer-events: none;
  overflow: hidden;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}


.lebron-grow {
  height: 100vh;
  flex-shrink: 0;
  animation: lebron-grow 1.5s ease-out forwards;
  transform-origin: bottom left;
}

.lebron-grow.right {
  transform-origin: bottom right;
}


.lebron-bounce {
  height: 100%;
  width: auto;
  object-fit: contain;
  display: block;
  animation: lebron-bounce 0.4s ease-in-out infinite alternate;
}


.lebron-grow.right .lebron-bounce {
  transform: scaleX(-1);
}


@keyframes lebron-grow {
  0%   { transform: scale(0.3); opacity: 0; }
  10%  { opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}


@keyframes lebron-bounce {
  from { transform: translateY(0); }
  to   { transform: translateY(-10px); }
}


.lebron-fade-leave-active {
  transition: opacity 0.5s ease;
}
.lebron-fade-leave-to {
  opacity: 0;
}
</style>
