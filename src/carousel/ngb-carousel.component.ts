import template from "@ngb/carousel/ngb-carousel.component.html";
import { NgbCarouselConfig } from "@ngb/carousel/ngb-carousel-config.service";
import {
  type NgbCarouselCtx,
  NgbSlideEventDirection,
  ngbCarouselTransitionIn,
  ngbCarouselTransitionOut,
} from "@ngb/carousel/ngb-carousel-transition";

import type { NgbSlide } from "@ngb/carousel/ngb-slide.directive";
import { type INgbEvent, type NgbTransitionOptions, ngbRunTransition, toNativeElement } from "@ngb/utils";
import { DigestService } from "@ngb/utils/digest.service";
import type { IAugmentedJQuery, IComponentController, IComponentOptions, IOnChangesObject, IScope } from "angular";
import angular from "angular";
import {
  BehaviorSubject,
  combineLatest,
  distinctUntilChanged,
  map,
  NEVER,
  type Observable,
  Subject,
  skip,
  switchMap,
  take,
  takeUntil,
  timer,
  zip,
} from "rxjs";

let carouselCounter = 0;

export interface INgbCarousel {
  select(slideId: string, source: NgbSlideEventSource): void;
  prev(source: unknown): void;
  next(source: unknown): void;
  pause(): void;
  cycle(): void;
  focus(): void;
}

export class NgbCarousel implements IComponentController, INgbCarousel {
  protected activeId?: string;
  protected animation!: boolean;
  protected interval!: number;
  protected keyboard!: boolean;
  protected pauseOnFocus!: boolean;
  protected pauseOnHover!: boolean;
  protected showNavigationArrows!: boolean;
  protected showNavigationIndicators!: boolean;
  protected wrap!: boolean;
  protected NgbSlideEventSource = NgbSlideEventSource;

  protected slide?: ({ $event }: INgbEvent<NgbSlideEvent>) => void;
  protected slid?: ({ $event }: INgbEvent<NgbSlideEvent>) => void;

  public id!: string;

  private _transitionIds: [string, string] | null = null;
  private slides: NgbSlide[] = [];

  private _container?: IAugmentedJQuery;

  private _interval$ = new BehaviorSubject(0);
  private _mouseHover$ = new BehaviorSubject(false);
  private _focused$ = new BehaviorSubject(false);
  private _pauseOnHover$ = new BehaviorSubject(false);
  private _pauseOnFocus$ = new BehaviorSubject(false);
  private _pause$ = new BehaviorSubject(false);
  private _wrap$ = new BehaviorSubject(false);
  private _activeId$ = new BehaviorSubject<string>("");
  private _slides$ = new BehaviorSubject<NgbSlide[]>([]);
  private _destroy$ = new Subject<void>();

  constructor(
    private readonly $element: IAugmentedJQuery,
    private readonly $ngbCarouselConfig: NgbCarouselConfig,
    private readonly $digestService: DigestService,
  ) {}

  $onInit(): void {
    this.animation = this.animation ?? this.$ngbCarouselConfig.animation;
    this.interval = this.interval ?? this.$ngbCarouselConfig.interval;
    this.keyboard = this.keyboard ?? this.$ngbCarouselConfig.keyboard;
    this.pauseOnFocus = this.pauseOnFocus ?? this.$ngbCarouselConfig.pauseOnFocus;
    this.pauseOnHover = this.pauseOnHover ?? this.$ngbCarouselConfig.pauseOnHover;
    this.showNavigationArrows = this.showNavigationArrows ?? this.$ngbCarouselConfig.showNavigationArrows;
    this.showNavigationIndicators = this.showNavigationIndicators ?? this.$ngbCarouselConfig.showNavigationIndicators;
    this.wrap = this.wrap ?? this.$ngbCarouselConfig.wrap;

    this._interval$.next(this.interval);
    this._pauseOnHover$.next(this.pauseOnHover);
    this._pauseOnFocus$.next(this.pauseOnFocus);
    this._wrap$.next(this.wrap);

    this.id = `ngb-carousel-${carouselCounter++}`;
  }

  $onChanges(changes: IOnChangesObject): void {
    if (changes.interval) this._interval$.next(this.interval);
    if (changes.wrap) this._wrap$.next(this.wrap);
    if (changes.pauseOnHover) this._pauseOnHover$.next(this.pauseOnHover);
    if (changes.pauseOnFocus) this._pauseOnFocus$.next(this.pauseOnFocus);
  }

  $postLink() {
    this.$element.addClass("carousel slide d-block");
    this.$element.attr("tabIndex", 0);
    this._container = this.$element;

    if (this.keyboard)
      this.$element.on("keydown", (event) => {
        const keys: Record<string, () => void> = {
          ArrowRight: () => this.arrowRight(),
          ArrowLeft: () => this.arrowLeft(),
        };

        const arrowTo = keys[event.key];
        if (!arrowTo) return;

        event.preventDefault();
        arrowTo();
      });

    this.$element.on("mouseenter", () => this._mouseHover$.next(true));
    this.$element.on("mouseleave", () => this._mouseHover$.next(false));
    this.$element.on("focusin", () => this._focused$.next(true));
    this.$element.on("focusout", () => this._focused$.next(false));

    const hasNextSlide$ = combineLatest([this._activeId$, this._wrap$, this._slides$]).pipe(
      map(([currentSlideId, wrap, slides]) => {
        const currentSlideIdx = slides.findIndex((s) => s.id === currentSlideId);
        return wrap ? slides.length > 1 : currentSlideIdx < slides.length - 1;
      }),
      distinctUntilChanged(),
    );

    combineLatest([
      this._pause$,
      this._pauseOnHover$,
      this._mouseHover$,
      this._pauseOnFocus$,
      this._focused$,
      this._interval$,
      hasNextSlide$,
    ])
      .pipe(
        map(([pause, pauseOnHover, mouseHover, pauseOnFocus, focused, interval, hasNextSlide]) =>
          pause || (pauseOnHover && mouseHover) || (pauseOnFocus && focused) || !hasNextSlide ? 0 : interval,
        ),
        distinctUntilChanged(),
        switchMap((interval) => (interval > 0 ? timer(interval, interval) : NEVER)),
        takeUntil(this._destroy$),
      )
      .subscribe(() => {
        this.next(NgbSlideEventSource.TIMER);
        this.$digestService.runInsideDigest();
      });

    this._slides$.pipe(skip(1), takeUntil(this._destroy$)).subscribe(() => {
      this._transitionIds = null;
      this.$digestService.runOutsideDigest(() => this._syncActiveSlideClass());
    });

    this.$digestService.runOutsideDigest(() => this._syncActiveSlideClass());
  }

  $doCheck(): void {
    const activeSlide = this._getSlideById(this.activeId);
    const [first] = this.slides;
    const newActiveId = activeSlide ? activeSlide.id : this.slides.length ? first.id : "";

    if (newActiveId !== this.activeId) {
      this.activeId = newActiveId;
      this._activeId$.next(newActiveId);
    }
  }

  $onDestroy(): void {
    this.$element.off("keydown");
    this.$element.off("mouseenter");
    this.$element.off("mouseleave");
    this.$element.off("focusin");
    this.$element.off("focusout");

    this._destroy$.next();
    this._destroy$.complete();
  }

  focus(): void {
    if (!this._container) throw new Error("[ngb-carousel]: container do not exist");
    toNativeElement(this._container).focus();
  }

  arrowLeft() {
    this.focus();
    this.prev(NgbSlideEventSource.ARROW_LEFT);
  }

  arrowRight() {
    this.focus();
    this.next(NgbSlideEventSource.ARROW_RIGHT);
  }

  register(slide: NgbSlide) {
    this.slides = [...this.slides, slide];
    this._slides$.next(this.slides);
  }

  unregister(slide: NgbSlide) {
    this.slides = this.slides.filter((s) => s !== slide);
    this._slides$.next(this.slides);
  }

  prev(source?: NgbSlideEventSource) {
    this._cycleToSelected(this._getPrevSlide(this.activeId), NgbSlideEventDirection.END, source);
  }

  next(source?: NgbSlideEventSource) {
    this._cycleToSelected(this._getNextSlide(this.activeId), NgbSlideEventDirection.START, source);
  }

  select(slideId: string, source?: NgbSlideEventSource) {
    this._cycleToSelected(slideId, this._getSlideEventDirection(this.activeId, slideId), source);
  }

  cycle(): void {
    this._pause$.next(false);
  }

  pause(): void {
    this._pause$.next(true);
  }

  private _syncActiveSlideClass() {
    if (this._transitionIds || !this.activeId) return;

    for (const slide of this.slides) {
      this._getSlideElement(slide.id).toggleClass("active", slide.id === this.activeId);
    }
  }

  private _cycleToSelected(slideIdx: string, direction: NgbSlideEventDirection, source?: NgbSlideEventSource) {
    const transitionIds = this._transitionIds;
    if (transitionIds && (transitionIds[0] !== slideIdx || transitionIds[1] !== this.activeId)) return;

    const selectedSlide = this._getSlideById(slideIdx);

    if (selectedSlide && selectedSlide.id !== this.activeId) {
      this._transitionIds = [this.activeId ?? "", slideIdx];
      this.slide?.({
        $event: {
          prev: this.activeId ?? "",
          current: selectedSlide.id,
          direction,
          paused: this._pause$.value,
          source,
        },
      });

      const options: NgbTransitionOptions<NgbCarouselCtx> = {
        animation: this.animation ?? this.$ngbCarouselConfig.animation,
        runningTransition: "stop",
        context: { direction },
      };

      const transitions: Observable<void>[] = [];
      const activeSlide = this._getSlideById(this.activeId);

      if (activeSlide) {
        const activeTransition = ngbRunTransition(
          this._getSlideElement(activeSlide.id),
          ngbCarouselTransitionOut,
          options,
        );

        activeTransition.subscribe(() =>
          activeSlide.slid?.({
            $event: {
              direction,
              source,
              isShown: false,
            },
          }),
        );

        transitions.push(activeTransition);
      }

      const previousId = this.activeId;
      this.activeId = selectedSlide.id;
      this._activeId$.next(this.activeId);
      const nextSlide = this._getSlideById(this.activeId);

      const transition = ngbRunTransition(this._getSlideElement(selectedSlide.id), ngbCarouselTransitionIn, options);

      transition.subscribe(() =>
        nextSlide?.slid?.({
          $event: {
            isShown: true,
            direction,
            source,
          },
        }),
      );

      transitions.push(transition);

      zip(...transitions)
        .pipe(take(1))
        .subscribe(() => {
          this._transitionIds = null;

          this.slid?.({
            $event: {
              prev: previousId ?? "",
              current: selectedSlide.id,
              direction,
              paused: this._pause$.value,
              source,
            },
          });
        });
    }

    this.$digestService.runInsideDigest();
  }

  private _getSlideEventDirection(
    currentActiveSlideId: string | undefined,
    nextActiveSlideId: string,
  ): NgbSlideEventDirection {
    const currentActiveSlideIdx = this._getSlideIdxById(currentActiveSlideId);
    const nextActiveSlideIdx = this._getSlideIdxById(nextActiveSlideId);

    return currentActiveSlideIdx > nextActiveSlideIdx ? NgbSlideEventDirection.END : NgbSlideEventDirection.START;
  }

  private _getNextSlide(currentSlideId: string | undefined): string {
    const currentSlideIdx = this._getSlideIdxById(currentSlideId);
    const isLastSlide = currentSlideIdx === this.slides.length - 1;

    return isLastSlide
      ? this.wrap
        ? this.slides[0].id
        : this.slides[this.slides.length - 1].id
      : this.slides[currentSlideIdx + 1].id;
  }

  private _getPrevSlide(currentSlideId: string | undefined): string {
    const currentSlideIdx = this._getSlideIdxById(currentSlideId);
    const isFirstSlide = currentSlideIdx === 0;

    return isFirstSlide
      ? this.wrap
        ? this.slides[this.slides.length - 1].id
        : this.slides[0].id
      : this.slides[currentSlideIdx - 1].id;
  }

  private _getSlideElement(slideId: string) {
    if (!this._container) throw new Error("");

    const el = toNativeElement(this._container).querySelector(`#slide-${slideId}`);
    if (!el) throw new Error("[ngb-carousel]: ngb-slide id not found");

    return angular.element(el);
  }

  private _getSlideById(slideId?: string): NgbSlide | null {
    return this.slides.find((slide) => slide.id === slideId) || null;
  }

  private _getSlideIdxById(slideId: string | undefined): number {
    const slide = this._getSlideById(slideId);
    return slide != null ? this.slides.indexOf(slide) : -1;
  }

  static get $name() {
    return "ngbCarousel";
  }

  static get $factory(): IComponentOptions {
    return {
      controllerAs: "$",
      controller: NgbCarousel,
      transclude: true,
      bindings: {
        activeId: "@?",
        animation: "<?",
        interval: "<?",
        keyboard: "<?",
        pauseOnFocus: "<?",
        pauseOnHover: "<?",
        showNavigationArrows: "<?",
        showNavigationIndicators: "<?",
        wrap: "<?",
        slid: "&?",
        slide: "&?",
      },
      template,
    };
  }

  static get $inject() {
    return ["$element", NgbCarouselConfig.$name, DigestService.$name];
  }
}

export interface NgbSlideEvent {
  prev: string;
  current: string;
  direction: NgbSlideEventDirection;
  paused: boolean;
  source?: NgbSlideEventSource;
}

export interface NgbSingleSlideEvent {
  isShown: boolean;
  direction: NgbSlideEventDirection;
  source?: NgbSlideEventSource;
}

export enum NgbSlideEventSource {
  TIMER = "timer",
  ARROW_LEFT = "arrowLeft",
  ARROW_RIGHT = "arrowRight",
  INDICATOR = "indicator",
}
