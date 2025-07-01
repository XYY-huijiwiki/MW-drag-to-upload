<template>
  <div ref="shadowHost"></div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from "vue";

const props = defineProps<{
  content?: string;
}>();

const shadowHost = ref<HTMLElement | null>(null);
let shadowRoot: ShadowRoot | null = null;

function renderPre() {
  if (shadowRoot) {
    shadowRoot.innerHTML = `<pre style="text-wrap: auto;">${
      props.content ?? ""
    }</pre>`;
  }
}

onMounted(() => {
  if (shadowHost.value) {
    shadowRoot = shadowHost.value.attachShadow({ mode: "open" });
    renderPre();
  }
});

watch(
  () => props.content,
  () => {
    renderPre();
  }
);
</script>
