import { NgbScrollSpyConfig } from "@ngb/scrollspy/ngb-scrollspy-config.service";
import { toFragmentElement } from "@ngb/scrollspy/scrollspy.utils";
import { DigestService } from "@ngb/utils/digest.service";
import type { IAugmentedJQuery } from "angular";
import angular from "angular";
import { distinctUntilChanged, type Observable, Subject, type Subscription } from "rxjs";

const MATCH_THRESHOLD = 3;

export type NgbScrollSpyProcessChanges = (
  state: {
    entries: IntersectionObserverEntry[];
    rootElement: HTMLElement;
    fragments: Set<Element>;
    scrollSpy: NgbScrollSpyService;
    options: NgbScrollSpyOptions;
  },
  changeActive: (active: string) => void,
  context: object,
) => void;

export interface NgbScrollSpyOptions {
  /**
   * An optional initial fragment to scroll to when the service starts.
   */
  initialFragment?: string | HTMLElement | IAugmentedJQuery;

  /**
   * An optional list of fragments to observe when the service starts.
   * You can alternatively use `.addFragment()` to add fragments.
   */
  fragments?: (string | HTMLElement | IAugmentedJQuery)[];

  /**
   * An optional function that is called when the `IntersectionObserver` detects a change.
   * It is used to determine if currently active fragment should be changed.
   *
   * You can override this function to provide your own scrollspy logic.
   * It provides:
   *  - a scrollspy `state` (observer entries, root element, fragments, scrollSpy instance, etc.)
   *  - a `changeActive` function that should be called with the new active fragment
   *  - a `context` that is persisted between calls
   */
  processChanges?: NgbScrollSpyProcessChanges;

  /**
   * An optional `IntersectionObserver` root element. If not provided, the document element will be used.
   */
  root?: HTMLElement | IAugmentedJQuery;

  /**
   * An optional `IntersectionObserver` margin for the root element.
   */
  rootMargin?: string;

  /**
   * An optional default scroll behavior to use when using the `.scrollTo()` method.
   */
  scrollBehavior?: "auto" | "smooth";

  /**
   * An optional `IntersectionObserver` threshold.
   */
  threshold?: number | number[];
}

/**
 * Scroll options passed to the `.scrollTo()` method.
 * An extension of the standard `ScrollOptions` interface.
 *
 * @since 15.1.0
 */
export interface NgbScrollToOptions extends ScrollOptions {
  /**
   * Scroll behavior as defined in the `ScrollOptions` interface.
   */
  behavior?: "auto" | "smooth";
}

export class NgbScrollSpyService {
  private _observer: IntersectionObserver | null = null;

  private _containerElement: IAugmentedJQuery | null = null;
  private _fragments = new Set<Element>();
  private _preRegisteredFragments = new Set<string | HTMLElement | IAugmentedJQuery>();

  private _active$ = new Subject<string>();
  private _distinctActive$ = this._active$.pipe(distinctUntilChanged());
  private _activeSubscription: Subscription;
  private _active = "";

  private _scrollBehavior: "auto" | "smooth";

  constructor(
    private $config: NgbScrollSpyConfig,
    private $digestService: DigestService,
  ) {
    this._scrollBehavior = this.$config.scrollBehavior;
    this._activeSubscription = this._distinctActive$.subscribe((active) => {
      this._active = active;
      this.$digestService.runInsideDigest();
    });
  }

  /**
   * Getter for the currently active fragment id. Returns empty string if none.
   */
  get active(): string {
    return this._active;
  }

  /**
   * An observable emitting the currently active fragment. Emits empty string if none.
   */
  get active$(): Observable<string> {
    return this._distinctActive$;
  }

  /**
   * Starts the scrollspy service and observes specified fragments.
   */
  start(options?: NgbScrollSpyOptions) {
    this._cleanup();

    const { root, rootMargin, scrollBehavior, threshold, fragments, processChanges } = { ...options };
    const rootElement = toFragmentElement(document.documentElement, root ?? document.documentElement);

    if (!rootElement) {
      return;
    }

    this._containerElement = angular.element(rootElement);
    this._scrollBehavior = scrollBehavior ?? this.$config.scrollBehavior;
    const processChangesFn = processChanges ?? this.$config.processChanges;

    const context = {};
    this._observer = new IntersectionObserver(
      (entries) =>
        processChangesFn(
          {
            entries,
            rootElement,
            fragments: this._fragments,
            scrollSpy: this,
            options: { ...options },
          },
          (active: string) => this._active$.next(active),
          context,
        ),
      {
        root: rootElement,
        ...(rootMargin && { rootMargin }),
        ...(threshold && { threshold }),
      },
    );

    // merging fragments added before starting and the ones passed as options
    for (const element of [...this._preRegisteredFragments, ...(fragments ?? [])]) {
      this.observe(element);
    }

    this._preRegisteredFragments.clear();
  }

  /**
   * Stops the service and unobserves all fragments.
   */
  stop() {
    this._cleanup();
    this._active$.next("");
  }

  /**
   * Scrolls to a fragment, it must be known to the service and contained in the root element.
   * An id or an element reference can be passed.
   */
  scrollTo(fragment: string | HTMLElement | IAugmentedJQuery, options?: NgbScrollToOptions) {
    const { behavior } = { behavior: this._scrollBehavior, ...options };
    const containerElement = toFragmentElement(document.documentElement, this._containerElement);

    if (!containerElement) {
      return;
    }

    const fragmentElement = toFragmentElement(containerElement, fragment);

    if (!fragmentElement) {
      return;
    }

    const heightPx = fragmentElement.offsetTop - containerElement.offsetTop;

    containerElement.scrollTo({ top: heightPx, behavior });

    let lastOffset = containerElement.scrollTop;
    let matchCounter = 0;

    // we should update the active section only after scrolling is finished
    // and there is no clean way to do it at the moment
    this.$digestService.runOutsideDigest(() => {
      const updateActiveWhenScrollingIsFinished = () => {
        const sameOffsetAsLastTime = lastOffset === containerElement.scrollTop;

        if (sameOffsetAsLastTime) {
          matchCounter++;
        } else {
          matchCounter = 0;
        }

        if (!sameOffsetAsLastTime || (sameOffsetAsLastTime && matchCounter < MATCH_THRESHOLD)) {
          lastOffset = containerElement.scrollTop;

          requestAnimationFrame(updateActiveWhenScrollingIsFinished);
          return;
        }

        this._active$.next(fragmentElement.id);
      };

      requestAnimationFrame(updateActiveWhenScrollingIsFinished);
    });
  }

  /**
   * Adds a fragment to observe. It must be contained in the root element.
   * An id or an element reference can be passed.
   */
  observe(fragment: string | HTMLElement | IAugmentedJQuery) {
    if (!this._observer) {
      this._preRegisteredFragments.add(fragment);
      return;
    }

    const fragmentElement = toFragmentElement(this._containerElement, fragment);

    if (!fragmentElement || this._fragments.has(fragmentElement)) {
      return;
    }

    this._fragments.add(fragmentElement);
    this._observer.observe(fragmentElement);
  }

  /**
   * Unobserves a fragment.
   * An id or an element reference can be passed.
   */
  unobserve(fragment: string | HTMLElement | IAugmentedJQuery) {
    if (!this._observer) {
      this._preRegisteredFragments.delete(fragment);
      return;
    }

    const fragmentElement = toFragmentElement(this._containerElement, fragment);

    if (!fragmentElement) {
      return;
    }

    this._fragments.delete(fragmentElement);

    // we're removing and re-adding all current fragments to recompute active one
    this._observer.disconnect();

    for (const fragment of this._fragments) {
      this._observer.observe(fragment);
    }
  }

  $onDestroy() {
    this._cleanup();
    this._activeSubscription.unsubscribe();
    this._active$.complete();
  }

  private _cleanup() {
    this._fragments.clear();
    this._observer?.disconnect();
    this._scrollBehavior = this.$config.scrollBehavior;
    this._observer = null;
    this._containerElement = null;
  }

  static get $name() {
    return "ngb.scrollspy.service";
  }

  static get $inject() {
    return [NgbScrollSpyConfig.$name, DigestService.$name];
  }
}
