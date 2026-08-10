import { afterEach, beforeEach } from "vitest";

if (typeof window !== "undefined") {
  let specContext: Record<string, unknown> = {};
  const testWindow = window as typeof window & {
    mocha: Record<string, unknown>;
    beforeEach: (hook: () => void) => void;
    afterEach: (hook: () => void) => void;
  };

  testWindow.mocha = {};
  testWindow.beforeEach = (hook: () => void) =>
    beforeEach(() => {
      specContext = {};
      return hook.call(specContext);
    });
  testWindow.afterEach = (hook: () => void) => afterEach(() => hook.call(specContext));
}
