export const sharedLegacyScripts = [
  "/lib/bootstrap/dist/js/bootstrap.bundle.min.js",
  "/data/legacy/page-model-data.js",
  "/js/nepali-datepicker-init.js",
];

export const compatibilityScript = "/js/legacy-page-fixes.js";

export const domReadyReplayScript = `
  (function () {
    if (window.__kaamLegacyDomReadyReplay) return;
    window.__kaamLegacyDomReadyReplay = true;
    var originalAddEventListener = document.addEventListener.bind(document);
    document.addEventListener = function (type, listener, options) {
      if (type === "DOMContentLoaded" && document.readyState !== "loading" && typeof listener === "function") {
        window.setTimeout(function () {
          listener.call(document, new Event("DOMContentLoaded"));
        }, 0);
        return;
      }
      return originalAddEventListener(type, listener, options);
    };
  })();
`;
