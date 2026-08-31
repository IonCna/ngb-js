import type {
  NgbScrollSpyOptions,
  NgbScrollSpyProcessChanges,
  NgbScrollSpyService,
} from "@ngb/scrollspy/scrollspy.service";
import { toNativeElement } from "@ngb/utils";
import type { IAugmentedJQuery } from "angular";
import angular from "angular";

type FragmentTarget = string | HTMLElement | IAugmentedJQuery;
type FragmentContainer = Element | IAugmentedJQuery;

interface DefaultProcessChangesContext {
  initialized?: boolean;
  gapFragment: Element | null;
  visibleFragments?: Set<Element>;
}

function getNativeElement<T extends Element>(element: T | IAugmentedJQuery | null): T | null {
  if (!element) {
    return null;
  }

  return element instanceof Element ? element : toNativeElement<T>(element);
}

export function toFragmentElement(container: FragmentContainer | null, id?: FragmentTarget | null): HTMLElement | null {
  if (!container || id == null) {
    return null;
  }

  const containerElement = getNativeElement(container);

  if (!containerElement) {
    return null;
  }

  return angular.isString(id)
    ? containerElement.querySelector<HTMLElement>(`#${CSS.escape(id)}`)
    : getNativeElement(id);
}

function getOrderedFragments(container: Element, fragments: Set<Element>): Element[] {
  const selector = [...fragments].map(({ id }) => `#${CSS.escape(id)}`).join(",");
  return Array.from(container.querySelectorAll(selector));
}

export const defaultProcessChanges: NgbScrollSpyProcessChanges = (
  state: {
    entries: IntersectionObserverEntry[];
    rootElement: HTMLElement;
    fragments: Set<Element>;
    scrollSpy: NgbScrollSpyService;
    options: NgbScrollSpyOptions;
  },
  changeActive: (active: string) => void,
  ctx: object,
) => {
  const { rootElement, fragments, scrollSpy, options, entries } = state;
  const orderedFragments = getOrderedFragments(rootElement, fragments);
  const context = ctx as DefaultProcessChangesContext;

  if (!context.initialized) {
    context.initialized = true;
    context.gapFragment = null;
    context.visibleFragments = new Set<Element>();

    // special case when one of the fragments was pre-selected
    const preSelectedFragment = toFragmentElement(rootElement, options?.initialFragment);
    if (preSelectedFragment) {
      scrollSpy.scrollTo(preSelectedFragment);
      return;
    }
  }

  const visibleFragments = context.visibleFragments!;

  for (const entry of entries) {
    const { isIntersecting, target: fragment } = entry;

    // 1. an entry became visible
    if (isIntersecting) {
      // if we were in-between two elements, we have to clear it up
      if (context.gapFragment) {
        visibleFragments.delete(context.gapFragment);
        context.gapFragment = null;
      }

      visibleFragments.add(fragment);
      continue;
    }

    // 2. an entry became invisible
    visibleFragments.delete(fragment);

    // nothing is visible anymore, but something just was actually
    if (visibleFragments.size > 0 || scrollSpy.active === "") {
      continue;
    }

    // 2.1 scrolling down - keeping the same element
    if (entry.boundingClientRect.top < entry.rootBounds!.top) {
      context.gapFragment = fragment;
      visibleFragments.add(context.gapFragment);
      continue;
    }

    // 2.2 scrolling up and no more fragments above
    if (fragment === orderedFragments[0]) {
      context.gapFragment = null;
      visibleFragments.clear();
      changeActive("");
      return;
    }

    // 2.3 scrolling up - getting previous fragment
    const fragmentIndex = orderedFragments.indexOf(fragment);
    context.gapFragment = orderedFragments[fragmentIndex - 1] || null;
    if (context.gapFragment) {
      visibleFragments.add(context.gapFragment);
    }
  }

  // getting the first visible element in the DOM order of the fragments
  for (const fragment of orderedFragments) {
    if (visibleFragments.has(fragment)) {
      changeActive(fragment.id);
      break;
    }
  }
};
