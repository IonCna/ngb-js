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

export function padNumber(value: any) {
  if (isNumber(value)) {
    return `0${value}`.slice(-2);
  }

  return "";
}

export function regExpEscape(text: string) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

export function reflow(element: HTMLElement) {
  return (element || document.body).getBoundingClientRect();
}

export function getActiveElement(element: Document | ShadowRoot): Element | null {
  const activeElement = element.activeElement;

  if (!activeElement) {
    return null;
  }

  return activeElement.shadowRoot ? getActiveElement(activeElement.shadowRoot) : activeElement;
}

export function runInZone<T>(zone: NgZone): OperatorFunction<T, T> {
  return (source) =>
    new Observable((subscriber) => {
      const next = (value: T) => zone.run(() => subscriber.next(value));
      const error = (error: any) => zone.run(() => subscriber.error(error));
      const complete = () => zone.run(() => subscriber.complete());

      return source.subscribe({ next, error, complete });
    });
}

export function removeAccents(str: string): string {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export function closest(element: HTMLElement, selector?: string) {
  if (!selector) {
    return null;
  }

  return element.closest(selector);
}
