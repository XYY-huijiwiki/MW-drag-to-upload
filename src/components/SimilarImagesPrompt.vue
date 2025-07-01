<template>
  <template v-if="lcs.length >= 5 && isPossible">
    <n-alert :show-icon="false">
      <template #default>
        <n-checkbox v-model:checked="enableVariantCode">
          {{ t("similar-images-prompt.enable-prompt") }}
        </n-checkbox>
        <div v-show="enableVariantCode" class="mt-2">
          <n-form>
            <n-form-item
              :label="t('similar-images-prompt.main-variant')"
              label-placement="left"
              feedback-class="hidden"
            >
              <n-select v-model:value="selectedIndex" :options="options" />
            </n-form-item>
            <n-form-item
              :label="t('similar-images-prompt.code-preview')"
              label-placement="left"
              feedback-class="hidden"
            >
              <shadow-pre :content="code" />
            </n-form-item>
          </n-form>
        </div>
      </template>
    </n-alert>
    <n-divider />
  </template>
</template>

<script setup lang="ts">
import { t } from "@/locales";
import generateVariantGallery from "@/utils/variantsInterlink";
import { longestCommonSubstring } from "string-algorithms";
import { computed } from "vue";

const props = defineProps<{
  filenames: string[];
}>();
const selectedIndex = defineModel<number>("selectedIndex", { required: true });
const enableVariantCode = defineModel<boolean>("enableVariantCode", {
  required: true,
});
const lcs = computed(() => {
  if (props.filenames.length < 2) return "";
  const result = longestCommonSubstring(props.filenames);
  if (result.length > 0) {
    return result[0];
  } else {
    return "";
  }
});
const isPossible = computed(() => {
  return props.filenames.join().match(/(电脑版|手机版|方形图| en\.)/) !== null;
});
const code = computed(() => {
  return generateVariantGallery(props.filenames, selectedIndex.value);
});
const options = computed(() => {
  return props.filenames.map((filename, index) => ({
    label: filename,
    value: index,
  }));
});
</script>

<style scoped></style>
