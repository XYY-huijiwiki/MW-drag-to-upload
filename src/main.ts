import { createApp } from "vue";

import "./style.css";
import App from "./App.vue";

const div = document.createElement("div");
div.id = __APP_ID__;
document.body.appendChild(div);

createApp(App).mount(`#${__APP_ID__}`);
