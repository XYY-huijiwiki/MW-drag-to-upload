// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { getNavigator, isString, strIndexOf } from "@nevware21/ts-utils";

export default function isSafari(userAgentStr?: string) {
  if (!userAgentStr || !isString(userAgentStr)) {
    let navigator = getNavigator() || ({} as Navigator);
    userAgentStr = navigator ? (navigator.userAgent || "").toLowerCase() : "";
  }

  const ua = (userAgentStr || "").toLowerCase();
  return strIndexOf(ua, "safari") >= 0 && strIndexOf(ua, "chrome") === -1;
}
