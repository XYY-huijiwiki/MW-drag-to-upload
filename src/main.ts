import { createApp } from "vue";

import i18n from "./locales";
import "./style.css";
import App from "./App.vue";

const div = document.createElement("div");
div.id = __APP_ID__;
document.body.appendChild(div);

createApp(App).use(i18n).mount(`#${__APP_ID__}`);
