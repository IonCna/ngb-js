import "./test-framework-shim";
import angular from "angular";
import "angular-mocks";

globalThis.angular = angular;

if (typeof window !== "undefined") {
  window.angular = angular;
}

// jsdom no expone `CSS` como global (solo, a veces, `window.CSS`). El scrollspy
// usa `CSS.escape` para armar selectores de fragmento.
if (typeof globalThis.CSS === "undefined" || typeof globalThis.CSS.escape !== "function") {
  const cssEscape = (value: string): string => String(value).replace(/[^\w-]/g, (ch) => `\\${ch}`);
  globalThis.CSS = { ...(globalThis.CSS ?? {}), escape: cssEscape } as typeof globalThis.CSS;
}
