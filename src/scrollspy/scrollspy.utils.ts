import type { NgbScrollSpyOptions, NgbScrollSpyProcessChanges, NgbScrollSpyService } from "@ngb/scrollspy/scrollspy.service";

type FragmentTarget = string | HTMLElement;
type FragmentContainer = Element;

interface DefaultProcessChangesContext {
  initialized?: boolean;
  gapFragment: Element | null;
  visibleFragments?: Set<Element>;
}

export function toFragmentElement(container: FragmentContainer | null, id?: FragmentTarget | null): HTMLElement | null {
  if (!container || id == null) {
    return null;
  }

  return typeof id === "string" ? container.querySelector<HTMLElement>(`#${CSS.escape(id)}`) : id;
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

    const preSelectedFragment = toFragmentElement(rootElement, options?.initialFragment);
    if (preSelectedFragment) {
      scrollSpy.scrollTo(preSelectedFragment);
      return;
    }
  }

  const visibleFragments = context.visibleFragments!;

  for (const entry of entries) {
    const { isIntersecting, target: fragment } = entry;

    if (isIntersecting) {
      if (context.gapFragment) {
        visibleFragments.delete(context.gapFragment);
        context.gapFragment = null;
      }

      visibleFragments.add(fragment);
      continue;
    }

    visibleFragments.delete(fragment);

    if (visibleFragments.size > 0 || scrollSpy.active === "") {
      continue;
    }

    if (entry.boundingClientRect.top < entry.rootBounds!.top) {
      context.gapFragment = fragment;
      visibleFragments.add(context.gapFragment);
      continue;
    }

    if (fragment === orderedFragments[0]) {
      context.gapFragment = null;
      visibleFragments.clear();
      changeActive("");
      return;
    }

    const fragmentIndex = orderedFragments.indexOf(fragment);
    context.gapFragment = orderedFragments[fragmentIndex - 1] || null;
    if (context.gapFragment) {
      visibleFragments.add(context.gapFragment);
    }
  }

  for (const fragment of orderedFragments) {
    if (visibleFragments.has(fragment)) {
      changeActive(fragment.id);
      break;
    }
  }
};
