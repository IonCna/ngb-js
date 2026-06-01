import type { Options } from "@popperjs/core";
import { offset as offsetMod } from "@popperjs/core";

export function addPopperOffset(offset: number[]) {
  return (options: Partial<Options>) => {
    options.modifiers?.push(offsetMod, {
      name: "offset",
      options: { offset: () => offset },
    });

    return options;
  };
}
