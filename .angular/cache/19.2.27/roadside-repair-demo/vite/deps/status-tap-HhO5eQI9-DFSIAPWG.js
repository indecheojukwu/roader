import {
  findClosestIonContent,
  scrollToTop
} from "./chunk-K7JEHNS4.js";
import {
  componentOnReady
} from "./chunk-24GZO7HD.js";
import "./chunk-K7HJBWQB.js";
import {
  readTask,
  writeTask
} from "./chunk-U52VT4MN.js";
import {
  __async
} from "./chunk-SCNEKAWF.js";

// node_modules/@ionic/core/dist/esm/status-tap-HhO5eQI9.js
var startStatusTap = () => {
  const win = window;
  win.addEventListener("statusTap", () => {
    readTask(() => {
      const width = win.innerWidth;
      const height = win.innerHeight;
      const el = document.elementFromPoint(width / 2, height / 2);
      if (!el) {
        return;
      }
      const contentEl = findClosestIonContent(el);
      if (contentEl) {
        new Promise((resolve) => componentOnReady(contentEl, resolve)).then(() => {
          writeTask(() => __async(null, null, function* () {
            contentEl.style.setProperty("--overflow", "hidden");
            yield scrollToTop(contentEl, 300);
            contentEl.style.removeProperty("--overflow");
          }));
        });
      }
    });
  });
};
export {
  startStatusTap
};
/*! Bundled license information:

@ionic/core/dist/esm/status-tap-HhO5eQI9.js:
  (*!
   * (C) Ionic http://ionicframework.com - MIT License
   *)
*/
//# sourceMappingURL=status-tap-HhO5eQI9-DFSIAPWG.js.map
