<template>
  <n-element class="drop-zone">
    {{ t("modal.dropPrompt") }}
  </n-element>
</template>

<script setup lang="ts">
import { t } from "@/locales";
</script>

<style scoped>
.drop-zone {
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: var(--border-radius);
  padding: 24px;
  opacity: 1;
  transition: opacity 0.3s var(--cubic-bezier-ease-in-out),
    border-color 0.3s var(--cubic-bezier-ease-in-out),
    background-color 0.3s var(--cubic-bezier-ease-in-out);
  background-color: var(--action-color);
  border: 1px dashed var(--border-color);
}
</style>
