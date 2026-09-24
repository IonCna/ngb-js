import type { NgZone } from "ngjs-core";
import { Observable, type OperatorFunction } from "rxjs";

export function toInteger(value: any): number {
  return parseInt(`${value}`, 10);
}

export function toString(value: any): string {
  return value !== undefined && value !== null ? `${value}` : "";
}

export function getValueInRange(value: number, max: number, min = 0): number {
  return Math.max(Math.min(value, max), min);
}

export function isString(value: any): value is string {
  return typeof value === "string";
}

export function isNumber(value: any): value is number {
  return !isNaN(toInteger(value));
}

export function isInteger(value: any): value is number {
  return typeof value === "number" && isFinite(value) && Math.floor(value) === value;
}

export function isDefined(value: any): boolean {
  return value !== undefined && value !== null;
}

export function isPromise<T>(value: any): value is Promise<T> {
  return value && value.then;
}

export function padNumber(value: number): string {
  if (isNumber(value)) {
    return `0${value}`.slice(-2);
  }
  return "";
}

export function regExpEscape(text: string): string {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

export function closest(element: HTMLElement, selector?: string): HTMLElement | null {
  if (!selector || typeof element.closest === "undefined") {
    return null;
  }
  return element.closest(selector);
}

export function reflow(element: HTMLElement): DOMRect {
  return (element || document.body).getBoundingClientRect();
}

export function runInZone<T>(zone: NgZone): OperatorFunction<T, T> {
  return (source) =>
    new Observable((observer) => {
      const next = (value: T) => zone.run(() => observer.next(value));
      const error = (error: any) => zone.run(() => observer.error(error));
      const complete = () => zone.run(() => observer.complete());
      return source.subscribe({ next, error, complete });
    });
}

export function removeAccents(str: string): string {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export function getActiveElement(root: Document | ShadowRoot = document): Element | null {
  const activeElement = root?.activeElement;
  if (!activeElement) {
    return null;
  }
  return activeElement.shadowRoot ? getActiveElement(activeElement.shadowRoot) : activeElement;
}
