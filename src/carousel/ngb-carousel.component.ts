import template from "@ngb/carousel/ngb-carousel.component.html";
import { NgbCarouselConfig } from "@ngb/carousel/ngb-carousel-config.service";
import {
  type NgbCarouselCtx,
  NgbSlideEventDirection,
  ngbCarouselTransitionIn,
  ngbCarouselTransitionOut,
} from "@ngb/carousel/ngb-carousel-transition";

import { NgbSlide } from "@ngb/carousel/ngb-slide.directive";
import {
  type INgbEvent,
  type NgbTransitionOptions,
  ngbCompleteTransition,
  ngbRunTransition,
  toNativeElement,
} from "@ngb/utils";
import { DigestService } from "@ngb/utils/digest.service";
import type { IAugmentedJQuery, IComponentController, IComponentOptions, IOnChangesObject, IScope } from "angular";
import angular from "angular";
import { ContentChildren, QueryList, TemplateRef } from "ngjs-core";
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

interface IPostDigestScope extends IScope {
  $$postDigest(callback: () => void): void;
}

export interface INgbCarousel {
  select(slideId: string, source: NgbSlideEventSource): void;
  prev(source: unknown): void;
  next(source: unknown): void;
  pause(): void;
  cycle(): void;
  focus(): void;
}

export class NgbCarousel implements IComponentController, INgbCarousel {
  public activeId?: string;
  public animation!: boolean;
  public interval!: number;
  public keyboard!: boolean;
  public pauseOnFocus!: boolean;
  public pauseOnHover!: boolean;
  public showNavigationArrows!: boolean;
  public showNavigationIndicators!: boolean;
  public wrap!: boolean;
  public readonly NgbSlideEventSource = NgbSlideEventSource;

  public slide?: ({ $event }: INgbEvent<NgbSlideEvent>) => void;
  public slid?: ({ $event }: INgbEvent<NgbSlideEvent>) => void;

  public id!: string;

  @ContentChildren(NgbSlide)
  private contentSlides!: QueryList<NgbSlide>;

  @ContentChildren(NgbSlide, { read: TemplateRef })
  private slideTemplates!: QueryList<TemplateRef<unknown>>;

  public readonly slides = new QueryList<NgbSlide>();

  private _transitionIds: [string, string] | null = null;
  private _container?: IAugmentedJQuery;

  private _interval$ = new BehaviorSubject(0);
  private _mouseHover$ = new BehaviorSubject(false);
  private _focused$ = new BehaviorSubject(false);
  private _pauseOnHover$ = new BehaviorSubject(false);
  private _pauseOnFocus$ = new BehaviorSubject(false);
  private _pause$ = new BehaviorSubject(false);
  private _wrap$ = new BehaviorSubject(false);
  private _activeId$ = new BehaviorSubject<string>("");
  private _slides$ = new BehaviorSubject<readonly NgbSlide[]>([]);
  private _destroy$ = new Subject<void>();

  constructor(
    private readonly $element: IAugmentedJQuery,
    private readonly $scope: IPostDigestScope,
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
    this._activeId$.next(this.activeId ?? "");

    this.id = `ngb-carousel-${carouselCounter++}`;
  }

  $onChanges(changes: IOnChangesObject): void {
    if (changes.interval) this._interval$.next(this.interval);
    if (changes.wrap) this._wrap$.next(this.wrap);
    if (changes.pauseOnHover) this._pauseOnHover$.next(this.pauseOnHover);
    if (changes.pauseOnFocus) this._pauseOnFocus$.next(this.pauseOnFocus);
  }

  $postLink() {
    this.$element.addClass("carousel slide");
    this.$element.css("display", "block");
    this.$element.attr("tabindex", 0);
    this._container = this.$element;

    this.$element.on("keydown", (event) => {
      if (!this.keyboard) return;

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
      this._transitionIds?.forEach((id) => {
        ngbCompleteTransition(this._getSlideElement(id));
      });
      this._transitionIds = null;
      this.$scope.$$postDigest(() => this._syncActiveSlideClass());
    });

    this._syncSlides();
    this.contentSlides.changes.pipe(takeUntil(this._destroy$)).subscribe(() => this._syncSlides());
    this.slides.changes.pipe(takeUntil(this._destroy$)).subscribe((slides) => {
      this._slides$.next(slides.toArray());
    });
    this._slides$.next(this.slides.toArray());

    this.$scope.$$postDigest(() => this._syncActiveSlideClass());
  }

  $doCheck(): void {
    const activeSlide = this._getSlideById(this.activeId);
    const newActiveId = activeSlide ? activeSlide.id : (this.slides.first?.id ?? "");

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
    this.slides.destroy();
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

  getSlideTemplate(index: number): TemplateRef<unknown> | undefined {
    const slide = this.slides.get(index);
    const contentIndex = slide ? this.contentSlides.toArray().indexOf(slide) : -1;
    return contentIndex >= 0 ? this.slideTemplates.get(contentIndex) : undefined;
  }

  private _syncSlides(): void {
    this.slides.reset(this.contentSlides.filter((slide) => slide.carousel === this));
    this.slides.notifyOnChanges();
  }

  private _syncActiveSlideClass() {
    if (this._transitionIds || !this.activeId) return;

    for (const slide of this.slides) {
      this._findSlideElement(slide.id)?.toggleClass("active", slide.id === this.activeId);
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
          this.$digestService,
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

      const transition = ngbRunTransition(
        this.$digestService,
        this._getSlideElement(selectedSlide.id),
        ngbCarouselTransitionIn,
        options,
      );

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
    const slides = this.slides.toArray();
    const currentSlideIdx = this._getSlideIdxById(currentSlideId);
    const isLastSlide = currentSlideIdx === slides.length - 1;

    return isLastSlide ? (this.wrap ? slides[0].id : slides[slides.length - 1].id) : slides[currentSlideIdx + 1].id;
  }

  private _getPrevSlide(currentSlideId: string | undefined): string {
    const slides = this.slides.toArray();
    const currentSlideIdx = this._getSlideIdxById(currentSlideId);
    const isFirstSlide = currentSlideIdx === 0;

    return isFirstSlide ? (this.wrap ? slides[slides.length - 1].id : slides[0].id) : slides[currentSlideIdx - 1].id;
  }

  private _getSlideElement(slideId: string) {
    const element = this._findSlideElement(slideId);
    if (!element) throw new Error("[ngb-carousel]: ngb-slide id not found");
    return element;
  }

  private _findSlideElement(slideId: string): IAugmentedJQuery | null {
    if (!this._container) return null;
    const element = toNativeElement(this._container).querySelector(`#slide-${slideId}`);
    return element ? angular.element(element) : null;
  }

  private _getSlideById(slideId?: string): NgbSlide | null {
    return this.slides.find((slide) => slide.id === slideId) || null;
  }

  private _getSlideIdxById(slideId: string | undefined): number {
    const slide = this._getSlideById(slideId);
    return slide != null ? this.slides.toArray().indexOf(slide) : -1;
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
    return ["$element", "$scope", NgbCarouselConfig.$name, DigestService.$name];
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
