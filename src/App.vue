<script setup lang="ts">
import { ref, watch } from "vue";
import { darkTheme, useOsTheme } from "naive-ui";
import { useDropZone } from "@vueuse/core";
import { cloneDeep, debounce } from "lodash-es";

import { t } from "@/locales";
import { uploadFile } from "@/mwApi";

const osTheme = useOsTheme();

type Licenses = "合理使用" | "已获授权" | "公有领域";
const licenceOptions = [
  {
    label: t("license.fairuse"),
    value: "合理使用",
  },
  {
    label: t("license.authorized"),
    value: "已获授权",
  },
  {
    label: t("license.publicdomain"),
    value: "公有领域",
  },
];

type UploadListItem = {
  filename: string;
  file: File;
  categories: string[];
  license?: Licenses;
  source: string;
  check: {
    status: "loading" | "ready" | "warning" | "error" | "uploaded";
    content: string;
  };
  thumbUrl: string;
};
const files = ref<UploadListItem[]>([]);

function removeFile(idx: number) {
  files.value.splice(idx, 1);
}

const showModal = ref(false);

async function onDrop(f: File[] | null) {
  if (!f) return;
  const newFiles = Array.from(f).map(
    (file) =>
      ({
        filename: file.name,
        file,
        categories: [],
        source: "",
        check: {
          status: "loading",
          content: "",
        },
        thumbUrl: file.type.startsWith("image/")
          ? URL.createObjectURL(file)
          : "https://huiji-public.huijistatic.com/xyy/uploads/6/6d/File-type-default.png",
      } satisfies UploadListItem)
  );
  for (let index = 0; index < newFiles.length; index++) {
    files.value.push(newFiles[index]);
    await handleUpload(files.value.length - 1, true);
  }
}
const { isOverDropZone } = useDropZone(document, {
  onDrop,
  preventDefaultForUnhandled: false,
});
watch(isOverDropZone, (val) => {
  if (val) {
    // When files are dragged in, show the modal
    showModal.value = true;
  }
});

function generateText(file: UploadListItem) {
  return (
    `{{${file.license}}}\n` +
    (file.source ? `{{文件来源|${file.source}}}\n` : "") +
    file.categories.map((cat) => `[[分类:${cat}]]`).join("\n")
  );
}

type ApplyToAllOptions =
  | {
      type: "license";
      value: Licenses | undefined;
    }
  | {
      type: "source";
      value: string;
    }
  | {
      type: "categories";
      value: string[];
    };
function applyToAll({ type, value }: ApplyToAllOptions) {
  files.value.forEach((file) => {
    if (type === "license" && value !== undefined) {
      file.license = value;
    } else if (type === "categories") {
      file.categories = cloneDeep(value);
    } else if (type === "source") {
      file.source = value;
    }
  });
}

async function handleUpload(
  idx: number,
  validateOnly = false,
  ignoreWarnings = false
) {
  const file = files.value[idx];
  if (file.check.status === "uploaded") {
    // already uploaded
    return;
  }
  if (file.file.size > 10 * 1024 * 1024) {
    file.check = {
      status: "error",
      content: t("error.tooLarge"),
    };
    return;
  }
  file.check = {
    status: "loading",
    content: t("status.checking"),
  };

  try {
    const response = await uploadFile({
      filename: file.filename,
      file: file.file,
      text: generateText(file),
      validateOnly,
      ignoreWarnings,
    });
    if ("upload" in response) {
      if (response.upload.result === "Success") {
        file.check = {
          status: validateOnly ? "ready" : "uploaded",
          content: "",
        };
      } else if (response.upload.result === "Warning") {
        file.check = {
          status: "warning",
          content: JSON.stringify(response.upload.warnings, null, 2),
        };
      }
    } else {
      file.check = {
        status: "error",
        content: JSON.stringify(response, null, 2),
      };
    }
  } catch (error: unknown) {
    file.check = {
      status: "error",
      content: String(error) || t("error.unknown"),
    };
    throw error;
  }
}

async function uploadAll(ignoreWarnings = false) {
  for (let idx = 0; idx < files.value.length; idx++) {
    await handleUpload(idx, false, ignoreWarnings);
  }
}

async function syncFilenameUndebounced(v: string, idx: number) {
  files.value[idx].filename = v;
  await handleUpload(idx, true);
}
const syncFilename = debounce(syncFilenameUndebounced, 500);
</script>

<template>
  <n-config-provider
    :theme="osTheme == 'dark' ? darkTheme : null"
    inline-theme-disabled
  >
    <n-modal-provider>
      <n-modal v-model:show="showModal">
        <n-card
          style="width: 600px"
          :title="t('modal.title')"
          :bordered="false"
          role="dialog"
          aria-modal="true"
        >
          <!-- close button -->
          <template #header-extra>
            <n-button @click="showModal = false" circle quaternary>
              <template #icon>
                <dismiss-24-regular />
              </template>
            </n-button>
          </template>

          <!-- upload prompt -->
          <drop-zone v-show="isOverDropZone || files.length === 0">
            {{ t("modal.dropPrompt") }}
          </drop-zone>

          <!-- upload list -->
          <div v-show="!(isOverDropZone || files.length === 0)">
            <template v-for="(file, idx) in files" :key="file.filename">
              <n-divider v-if="idx > 0"></n-divider>
              <n-flex :wrap="false">
                <!-- thumb -->
                <div class="relative flex-none w-32 h-32">
                  <n-tooltip :delay="0" display-directive="show">
                    <template #trigger>
                      <div>
                        <img
                          :src="file.thumbUrl"
                          :alt="t('img.alt')"
                          class="w-32 h-32 object-contain bg-black rounded"
                          :class="{
                            'ring-red-500 ring-2':
                              file.check.status === 'error',
                            'ring-yellow-500 ring-2':
                              file.check.status === 'warning',
                          }"
                        />
                        <n-el
                          class="right-1 bottom-1 rounded-sm absolute bg-(--card-color) p-1 text-xs"
                        >
                          {{
                            file.check.status === "loading"
                              ? `🤔 ${t("status.checking")}`
                              : file.check.status === "ready"
                              ? `👍🏼 ${t("status.ready")}`
                              : file.check.status === "uploaded"
                              ? `✅ ${t("status.uploaded")}`
                              : file.check.status === "warning"
                              ? `⚠️ ${t("status.warning")}`
                              : `❌ ${t("status.error")}`
                          }}
                        </n-el>
                      </div>
                    </template>
                    <template #default>
                      <template
                        v-if="['warning', 'error'].includes(file.check.status)"
                      >
                        <shadow-pre :content="file.check.content" />
                      </template>
                      <template v-else>
                        {{ file.check.content }}
                      </template>
                    </template>
                  </n-tooltip>
                </div>
                <n-flex vertical class="w-full">
                  <n-flex>
                    <n-input
                      :placeholder="t('input.filename')"
                      :default-value="file.filename"
                      @input="(v) => syncFilename(v, idx)"
                      size="small"
                      maxlength="255"
                      class="flex-1 w-0"
                    ></n-input>
                    <n-button
                      type="error"
                      size="small"
                      tertiary
                      @click="removeFile(idx)"
                    >
                      {{ t("btn.remove") }}
                    </n-button>
                  </n-flex>
                  <n-flex>
                    <n-select
                      size="small"
                      class="flex-1 w-0"
                      :placeholder="t('input.license')"
                      :options="licenceOptions"
                      v-model:value="file.license"
                    ></n-select>
                    <n-button
                      size="small"
                      class="flex-none"
                      tertiary
                      :disabled="file.license === undefined"
                      @click="
                        applyToAll({ type: 'license', value: file.license })
                      "
                    >
                      {{ t("btn.applyAll") }}
                    </n-button>
                  </n-flex>
                  <n-flex>
                    <n-input
                      class="flex-1 w-0"
                      :placeholder="t('input.source')"
                      v-model:value="file.source"
                      size="small"
                      maxlength="255"
                    ></n-input>
                    <n-button
                      class="flex-none"
                      size="small"
                      tertiary
                      :disabled="file.source === ''"
                      @click="
                        applyToAll({ type: 'source', value: file.source })
                      "
                    >
                      {{ t("btn.applyAll") }}
                    </n-button>
                  </n-flex>
                  <n-flex>
                    <n-form-item
                      feedback-class="hidden"
                      :label="t('input.categories')"
                      class="flex-1 w-0"
                      size="small"
                      label-placement="left"
                    >
                      <n-dynamic-tags
                        v-model:value="file.categories"
                      ></n-dynamic-tags>
                    </n-form-item>
                    <n-button
                      class="flex-none"
                      size="small"
                      tertiary
                      @click="
                        applyToAll({
                          type: 'categories',
                          value: file.categories,
                        })
                      "
                    >
                      {{ t("btn.applyAll") }}
                    </n-button>
                  </n-flex>
                </n-flex>
              </n-flex>
            </template>
          </div>
          <template #footer>
            <n-flex justify="end">
              <!-- force upload -->
              <n-button type="warning" @click="uploadAll(true)">
                {{ t("btn.uploadWithWarnings") }}
              </n-button>
              <!-- normal upload -->
              <n-button type="primary" @click="uploadAll()">
                {{ t("btn.upload") }}
              </n-button>
            </n-flex>
          </template>
        </n-card>
      </n-modal>
    </n-modal-provider>
  </n-config-provider>
</template>
