import { afterEach, beforeEach } from "vitest";

if (typeof window !== "undefined") {
  let specContext: Record<string, unknown> = {};

  window.mocha = {};
  window.beforeEach = (hook: () => void) =>
    beforeEach(() => {
      specContext = {};
      return hook.call(specContext);
    });
  window.afterEach = (hook: () => void) => afterEach(() => hook.call(specContext));
}
