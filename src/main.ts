import { createApp } from "vue";

import i18n from "./locales";
import "./style.css";
import App from "./App.vue";
import isSafari from "./utils/isSafari";

function isBlackList(): boolean {
  const blackList = ["Project:控制中心", "特殊:文件上传", "特殊:上传文件"];
  const currentTitle = mw.config.get("wgPageName");
  return blackList.some((item) => currentTitle.includes(item));
}

function init() {
  const div = document.createElement("div");
  div.id = __APP_ID__;
  document.body.appendChild(div);
  createApp(App).use(i18n).mount(`#${__APP_ID__}`);
}

if (isSafari()) {
  mw.notify(i18n.global.t("safariWarning"));
} else if (isBlackList()) {
  // do nothing
} else {
  init();
}
