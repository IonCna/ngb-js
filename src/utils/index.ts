import type { IAugmentedJQuery } from "angular";
import angular from "angular";

export { FOCUSABLE_ELEMENTS_SELECTOR } from "@ngb/utils/focus-trap";
export type { INgbEvent } from "@ngb/utils/transition";
export { ngbCollapsingTransition } from "@ngb/utils/transition/ngb-collapse-transition";
export {
  type NgbTransitionOptions,
  type NgbTransitionStartFn,
  ngbCompleteTransition,
  ngbRunTransition,
} from "@ngb/utils/transition/ngb-transition";

export function reflow(element: IAugmentedJQuery) {
  return (toNativeElement(element) || document.body).getBoundingClientRect();
}

export function getValueInRange(value: number, max: number, min = 0): number {
  return Math.max(Math.min(value, max), min);
}

export function toNativeElement<T = HTMLElement>(element: IAugmentedJQuery) {
  const [native] = Array.from(element);
  return native as T;
}

export function isInteger(value: any): value is number {
  return typeof value === "number" && Number.isFinite(value) && Math.floor(value) === value && angular.isNumber(value);
}

export function padNumber(value: number) {
  if (angular.isNumber(value)) {
    return `0${value}`.slice(-2);
  }

  return "";
}

export function closest(element: IAugmentedJQuery, selector?: string) {
  if (!selector) return null;
  const target = toNativeElement(element);

  if (typeof target.closest === "undefined") return null;

  return target.closest(selector);
}

export function toInteger(value: any): number {
  return parseInt(`${value}`, 10);
}

export function isNumber(value: any): value is number {
  return !Number.isNaN(toInteger(value));
}

/**
 * @example
 * let name = 'contentType'
 * let kebab = camelToKebabCase(name) = 'content-type'
 */
export function camelToKebabCase(str: string) {
  return str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
}

/**
 * @example
 * let name = 'ContentType'
 * let camel = kebabToCamelCase(name) = 'contentType'
 */
export function kebabToCamelCase(str: string) {
  return str
    .toLowerCase()
    .split("-")
    .filter(Boolean)
    .map((p, i) => (i === 0 ? p : p.charAt(0).toUpperCase() + p.slice(1)))
    .join("");
}

export function getActiveElement(root: Document | ShadowRoot = document): Element | null {
  const activeEl = root?.activeElement;

  if (!activeEl) {
    return null;
  }

  return activeEl.shadowRoot ? getActiveElement(activeEl.shadowRoot) : activeEl;
}
