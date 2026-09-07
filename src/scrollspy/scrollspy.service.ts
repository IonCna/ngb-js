import { NgbScrollSpyConfig } from "@ngb/scrollspy/ngb-scrollspy-config.service";
import { toFragmentElement } from "@ngb/scrollspy/scrollspy.utils";
import { ChangeDetectorRef, DOCUMENT, inject, Injectable, NgZone, type OnDestroy } from "ngjs-core";
import { distinctUntilChanged, type Observable, Subject } from "rxjs";
import type { NgbScrollSpyRef } from "./ngb-scrollspy-item.directive";

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

export interface NgbScrollSpyOptions extends Pick<IntersectionObserverInit, "root" | "rootMargin" | "threshold"> {
  changeDetectorRef?: ChangeDetectorRef;
  initialFragment?: string | HTMLElement;
  fragments?: (string | HTMLElement)[];
  processChanges?: NgbScrollSpyProcessChanges;
  root?: HTMLElement;
  rootMargin?: string;
  scrollBehavior?: "auto" | "smooth";
  threshold?: number | number[];
}

export interface NgbScrollToOptions extends ScrollOptions {
  behavior?: "auto" | "smooth";
}

@Injectable({ providedIn: "root" })
export class NgbScrollSpyService implements NgbScrollSpyRef, OnDestroy {
  private _observer: IntersectionObserver | null = null;
  private _containerElement: HTMLElement | null = null;
  private _fragments = new Set<Element>();
  private _preRegisteredFragments = new Set<string | HTMLElement>();
  private _active$ = new Subject<string>();
  private _distinctActive$ = this._active$.pipe(distinctUntilChanged());
  private _active = "";

  private _config = inject(NgbScrollSpyConfig);
  private _document = inject(DOCUMENT);
  private _scrollBehavior = this._config.scrollBehavior;
  private _diChangeDetectorRef = inject<ChangeDetectorRef>(ChangeDetectorRef, { optional: true });
  private _changeDetectorRef = this._diChangeDetectorRef;
  private _zone = inject(NgZone);
  private _activeSubscription = this._distinctActive$.subscribe((active) => {
    this._active = active;
    this._changeDetectorRef?.markForCheck();
  });

  get active(): string {
    return this._active;
  }

  get active$(): Observable<string> {
    return this._distinctActive$;
  }

  start(options?: NgbScrollSpyOptions): void {
    this._cleanup();

    const { root, rootMargin, scrollBehavior, threshold, fragments, changeDetectorRef, processChanges } = {
      ...options,
    };
    this._containerElement = root ?? this._document.documentElement;
    this._changeDetectorRef = changeDetectorRef ?? this._diChangeDetectorRef;
    this._scrollBehavior = scrollBehavior ?? this._config.scrollBehavior;
    const processChangesFn = processChanges ?? this._config.processChanges;

    const context = {};
    this._observer = new IntersectionObserver(
      (entries) =>
        processChangesFn(
          {
            entries,
            rootElement: this._containerElement!,
            fragments: this._fragments,
            scrollSpy: this,
            options: { ...options },
          },
          (active: string) => this._active$.next(active),
          context,
        ),
      {
        root: root ?? this._document,
        ...(rootMargin && { rootMargin }),
        ...(threshold && { threshold }),
      },
    );

    for (const element of [...this._preRegisteredFragments, ...(fragments ?? [])]) {
      this.observe(element);
    }

    this._preRegisteredFragments.clear();
  }

  stop(): void {
    this._cleanup();
    this._active$.next("");
  }

  scrollTo(fragment: string | HTMLElement, options?: NgbScrollToOptions): void {
    const { behavior } = { behavior: this._scrollBehavior, ...options };

    if (this._containerElement) {
      const fragmentElement = toFragmentElement(this._containerElement, fragment);

      if (fragmentElement) {
        const heightPx = fragmentElement.offsetTop - this._containerElement.offsetTop;

        this._containerElement.scrollTo({ top: heightPx, behavior });

        let lastOffset = this._containerElement.scrollTop;
        let matchCounter = 0;
        const containerElement = this._containerElement;

        this._zone.runOutsideAngular(() => {
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
            } else {
              this._zone.run(() => this._active$.next(fragmentElement.id));
            }
          };

          requestAnimationFrame(updateActiveWhenScrollingIsFinished);
        });
      }
    }
  }

  observe(fragment: string | HTMLElement): void {
    if (!this._observer) {
      this._preRegisteredFragments.add(fragment);
      return;
    }

    const fragmentElement = toFragmentElement(this._containerElement, fragment);

    if (fragmentElement && !this._fragments.has(fragmentElement)) {
      this._fragments.add(fragmentElement);
      this._observer.observe(fragmentElement);
    }
  }

  unobserve(fragment: string | HTMLElement): void {
    if (!this._observer) {
      this._preRegisteredFragments.delete(fragment);
      return;
    }

    const fragmentElement = toFragmentElement(this._containerElement, fragment);

    if (fragmentElement) {
      this._fragments.delete(fragmentElement);
      this._observer.disconnect();

      for (const fragment of this._fragments) {
        this._observer.observe(fragment);
      }
    }
  }

  ngOnDestroy(): void {
    this._cleanup();
    this._activeSubscription.unsubscribe();
    this._active$.complete();
  }

  private _cleanup(): void {
    this._fragments.clear();
    this._observer?.disconnect();
    this._changeDetectorRef = this._diChangeDetectorRef;
    this._scrollBehavior = this._config.scrollBehavior;
    this._observer = null;
    this._containerElement = null;
  }
}
