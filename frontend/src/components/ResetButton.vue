<script setup>
defineEmits(['reset'])
</script>

<template>
<button
class="btn-gold-3d reset-btn"
@click="$emit('reset')"
>
    RESET
</button>
</template>

<style scoped>
.reset-btn {
    width: 100%;
    height: 100%;
    border-radius: 0.4em;
    font-family: var(--font-primary);
    font-size: 1.4em;
    margin: 0;
    padding: 0;

}
</style>