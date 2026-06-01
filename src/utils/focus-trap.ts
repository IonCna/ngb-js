import { toNativeElement } from "@ngb/utils";
import type { IAugmentedJQuery, IPromise } from "angular";

export const FOCUSABLE_ELEMENTS_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  'input:not([disabled]):not([type="hidden"])',
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[contenteditable]",
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

export function getFocusableBoundaryElements(element: IAugmentedJQuery) {
  const el = toNativeElement(element);
  const list = Array.from(el.querySelectorAll(FOCUSABLE_ELEMENTS_SELECTOR) as NodeListOf<HTMLElement>).filter(
    (el) => el.tabIndex !== -1,
  );

  const [first] = list;
  const last = list[list.length - 1];
  return [first, last] as const;
}

export function ngbFocusTrap(element: IAugmentedJQuery, stopFocusTrap: IPromise<void>, refocusOnClick = false) {
  const nativeElement = toNativeElement(element);
  let lastFocusedElement: HTMLElement | null = null;

  const onFocus = (event: JQueryEventObject) => {
    lastFocusedElement = event.target as HTMLElement;
  };

  const onClick = () => {
    lastFocusedElement?.focus();
  };

  const onKeydown = (event: JQueryEventObject) => {
    if (event.key !== "Tab") return;

    const [first, last] = getFocusableBoundaryElements(element);

    if (!first || !last) return;

    const focusedElement = lastFocusedElement ?? event.target;
    const isFirstOrFocused = focusedElement === first || focusedElement === nativeElement;

    if (isFirstOrFocused && event.shiftKey) {
      last.focus();
      event.preventDefault();
    }

    if (focusedElement === last && !event.shiftKey) {
      first.focus();
      event.preventDefault();
    }
  };

  element.on("focusin", onFocus);
  element.on("keydown", onKeydown);

  if (refocusOnClick) {
    element.on("click", onClick);
  }

  stopFocusTrap.then(null, null, () => {
    element.off("focusin", onFocus);
    element.off("click", onClick);
    element.off("keydown", onKeydown);
  });
}
