import type { IAugmentedJQuery } from "angular";
import angular from "angular";
import type { NgZone } from "ngjs-core";
import { Observable, type OperatorFunction } from "rxjs";

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

export function runInZone<T>(zone: NgZone): OperatorFunction<T, T> {
  return (source) =>
    new Observable((observer) => {
      const next = (value: T) => zone.run(() => observer.next(value));
      const error = (reason: unknown) => zone.run(() => observer.error(reason));
      const complete = () => zone.run(() => observer.complete());

      return source.subscribe({ next, error, complete });
    });
}

export function getValueInRange(value: number, max: number, min = 0): number {
  return Math.max(Math.min(value, max), min);
}

export function toNativeElement<T = HTMLElement>(element: IAugmentedJQuery) {
  const [native] = Array.from(element);
  return native as T;
}

export function isInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && Math.floor(value) === value && angular.isNumber(value);
}

export function toString(value: any): string {
  return value !== undefined && value !== null ? `${value}` : '';
}

export function padNumber(value: number) {
  if (isNumber(value)) {
    return `0${value}`.slice(-2);
  }

  return "";
}

export function regExpEscape(text: string) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

export function removeAccents(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export function closest(element: IAugmentedJQuery, selector?: string) {
  if (!selector) return null;
  const target = toNativeElement(element);

  if (typeof target.closest === "undefined") return null;

  return target.closest(selector);
}

export function toInteger(value: unknown): number {
  return parseInt(`${value}`, 10);
}

export function isNumber(value: unknown): value is number {
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

export function assertAttribute(element: IAugmentedJQuery, attrName: string, ...params: (string | undefined | null)[]) {
  for (const attr of params) {
    if (!attr) continue;

    element.attr(attrName, attr);
    return;
  }

  element.removeAttr(attrName);
}
