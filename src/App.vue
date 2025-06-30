<script setup lang="ts">
import { ref, watch } from "vue";
import { darkTheme, useOsTheme } from "naive-ui";
import { useDropZone } from "@vueuse/core";
import { uploadFile } from "./mwApi";
import { cloneDeep, debounce } from "lodash-es";

const osTheme = useOsTheme();

type Licenses = "合理使用" | "已获授权" | "公有领域";
const licenceOptions = [
  {
    label: "合理使用（这个文件受到著作权保护，但在羊羊百科属于合理使用）",
    value: "合理使用",
  },
  {
    label: "已获授权（这个文件受到著作权保护，著作权方已授权羊羊百科使用）",
    value: "已获授权",
  },
  {
    label: "公有领域（这个文件属于公有领域）",
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
    await handleUpload(index, true);
  }
}
const { isOverDropZone } = useDropZone(document, {
  onDrop,
  preventDefaultForUnhandled: false,
});
watch(isOverDropZone, (val) => {
  if (val) {
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
      content: "Datei ist zu groß (max. 10 MB).",
    };
    return;
  }
  file.check = {
    status: "loading",
    content: "Prüfe Datei...",
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
          content: "Datei ist gültig.",
        };
      } else if (response.upload.result === "Warning") {
        file.check = {
          status: "warning",
          content: Object.keys(response.upload.warnings).join(", "),
        };
      } else {
        file.check = {
          status: "error",
          content: "Unbekannter Upload-Status",
        };
      }
    } else {
      file.check = {
        status: "error",
        content: response.error.code || "Unbekannter Fehler",
      };
    }
  } catch (error: unknown) {
    file.check = {
      status: "error",
      content: String(error) || "Unbekannter Fehler",
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
      <n-modal v-model:show="showModal" @close="">
        <n-card
          style="width: 600px"
          title="Datei-Upload bestätigen"
          :bordered="false"
          role="dialog"
          aria-modal="true"
        >
          <!-- upload prompt -->
          <div class="mt-2" v-show="isOverDropZone">
            Bitte ziehen Sie die Dateien hierher, um sie hochzuladen.
          </div>

          <!-- upload list -->
          <div v-show="!isOverDropZone">
            <template v-for="(file, idx) in files" :key="file.filename">
              <n-divider v-if="idx > 0"></n-divider>
              <n-flex :wrap="false">
                <!-- thumb -->
                <div class="relative flex-none w-32 h-32">
                  <n-tooltip :delay="0">
                    <template #trigger>
                      <div>
                        <img
                          :src="file.thumbUrl"
                          alt="Vorschaubild"
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
                              ? "🤔 Prüfe..."
                              : file.check.status === "ready"
                              ? "👍🏼 Bereit"
                              : file.check.status === "uploaded"
                              ? "✅ Hochgeladen"
                              : file.check.status === "warning"
                              ? "⚠️ Warnung"
                              : "❌ Fehler"
                          }}
                        </n-el>
                      </div>
                    </template>
                    <template #default>
                      {{ file.check.content }}
                    </template>
                  </n-tooltip>
                </div>
                <n-flex vertical class="w-full">
                  <n-flex>
                    <n-input
                      placeholder="Dateiname"
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
                      Entfernen
                    </n-button>
                  </n-flex>
                  <n-flex>
                    <n-select
                      size="small"
                      class="flex-1 w-0"
                      placeholder="Lizenz auswählen"
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
                      Auf alle anwenden
                    </n-button>
                  </n-flex>
                  <n-flex>
                    <n-input
                      class="flex-1 w-0"
                      placeholder="Quelle der Datei (z.B. Webseite, Buch)"
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
                      Auf alle anwenden
                    </n-button>
                  </n-flex>
                  <n-flex>
                    <n-form-item
                      feedback-class="hidden"
                      label="Kategorien"
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
                      Auf alle anwenden
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
                Hochladen (mit Warnungen ignorieren)
              </n-button>
              <!-- normal upload -->
              <n-button type="primary" @click="uploadAll()">
                Hochladen
              </n-button>
            </n-flex>
          </template>
        </n-card>
      </n-modal>
    </n-modal-provider>
  </n-config-provider>
</template>
