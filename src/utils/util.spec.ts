import { describe, expect, it } from "vitest";
import {
  closest,
  getActiveElement,
  getValueInRange,
  isDefined,
  isInteger,
  isNumber,
  isPromise,
  isString,
  padNumber,
  regExpEscape,
  removeAccents,
  toString as stringify,
  toInteger,
} from "./util";

describe("utility functions", () => {
  it("finds the closest matching ancestor", () => {
    expect(closest(document.body)).toBeNull();
    expect(closest(document.body, "html")).toBe(document.documentElement);
    expect(closest(document.documentElement, "body")).toBeNull();
  });

  it("converts values to integers", () => {
    expect(toInteger(0)).toBe(0);
    expect(toInteger(10)).toBe(10);
    expect(toInteger(0.9)).toBe(0);
    expect(toInteger("10.9")).toBe(10);
  });

  it("converts nullish and primitive values to strings", () => {
    expect(stringify("foo")).toBe("foo");
    expect(stringify(null)).toBe("");
    expect(stringify(undefined)).toBe("");
    expect(stringify(10)).toBe("10");
    expect(stringify(false)).toBe("false");
  });

  it("clamps values to a range", () => {
    expect(getValueInRange(5, 10, 0)).toBe(5);
    expect(getValueInRange(11, 10, 0)).toBe(10);
    expect(getValueInRange(-1, 10, 0)).toBe(0);
    expect(getValueInRange(-1, 10)).toBe(0);
  });

  it("recognizes strings, numbers, integers and defined values", () => {
    expect(isString("")).toBe(true);
    expect(isString(2048)).toBe(false);
    expect(isNumber("10.5")).toBe(true);
    expect(isNumber("nope")).toBe(false);
    expect(isInteger(-110)).toBe(true);
    expect(isInteger(14.1)).toBe(false);
    expect(isInteger("2048")).toBe(false);
    expect(isDefined(0)).toBe(true);
    expect(isDefined(null)).toBe(false);
    expect(isDefined(undefined)).toBe(false);
  });

  it("recognizes promises and thenables", () => {
    expect(isPromise(Promise.resolve())).toBeTruthy();
    // biome-ignore lint/suspicious/noThenProperty: this deliberately verifies the public thenable contract
    const thenable = Object.defineProperty({}, "then", { value: () => undefined });
    expect(isPromise(thenable)).toBeTruthy();
    expect(isPromise({})).toBeFalsy();
    expect(isPromise(null)).toBeFalsy();
  });

  it("pads valid numbers and rejects invalid numbers", () => {
    expect(padNumber(3)).toBe("03");
    expect(padNumber(12)).toBe("12");
    expect(padNumber("x")).toBe("");
  });

  it("escapes regular-expression metacharacters", () => {
    expect(regExpEscape("a.b[c] (d)+")).toBe("a\\.b\\[c\\]\\ \\(d\\)\\+");
  });

  it("removes combining accents", () => {
    // `\u` escapes para que el encoding del archivo no corrompa los acentos.
    const accented =
      "àâäéèêëîïôöûüùç" +
      "ÂÊÎÔÛÄËÏÖÜÁ";
    expect(removeAccents(accented)).toBe("aaaeeeeiioouuucAEIOUAEIOUA");
  });


  it("returns the deepest focused element, including shadow DOM", () => {
    const host = document.createElement("div");
    const shadow = host.attachShadow({ mode: "open" });
    const input = document.createElement("input");
    shadow.appendChild(input);
    document.body.appendChild(host);
    input.focus();

    expect(getActiveElement(document)).toBe(input);
    host.remove();
  });
});
