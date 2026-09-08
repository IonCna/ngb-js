import template from "@ngb/carousel/ngb-carousel.component.html";
import { NgbCarouselConfig } from "@ngb/carousel/ngb-carousel-config.service";
import {
  type NgbCarouselCtx,
  NgbSlideEventDirection,
  ngbCarouselTransitionIn,
  ngbCarouselTransitionOut,
} from "@ngb/carousel/ngb-carousel-transition";
import { NgbSlide } from "@ngb/carousel/ngb-slide.directive";
import { type NgbTransitionOptions, ngbCompleteTransition, ngbRunTransition } from "@ngb/utils";
import {
  type AfterContentChecked,
  type AfterContentInit,
  type AfterViewInit,
  afterNextRender,
  ChangeDetectorRef,
  Component,
  ContentChildren,
  DestroyRef,
  ElementRef,
  EventEmitter,
  HostBinding,
  HostListener,
  Injector,
  Input,
  inject,
  NgZone,
  Output,
  PLATFORM_ID,
  type QueryList,
  takeUntilDestroyed,
} from "ngjs-core";
import { isPlatformBrowser } from "ngjs-core/common";
import { BehaviorSubject, combineLatest, NEVER, type Observable, timer, zip } from "rxjs";
import { distinctUntilChanged, map, startWith, switchMap, take } from "rxjs/operators";

let carouselId = 0;

/**
 * El carousel es un componente para crear y controlar slideshows.
 *
 * Permite configurar intervalos, cambiar la forma en que el usuario interactúa
 * con los slides y expone una API programática.
 */
@Component({
  selector: "ngb-carousel",
  exportAs: "ngbCarousel",
  transclude: true,
  template,
})
export class NgbCarousel implements AfterContentChecked, AfterContentInit, AfterViewInit {
  @ContentChildren(NgbSlide) slides!: QueryList<NgbSlide>;

  public NgbSlideEventSource = NgbSlideEventSource;

  private _config = inject(NgbCarouselConfig);
  private _platformId = inject(PLATFORM_ID);
  private _ngZone = inject(NgZone);
  private _cd = inject(ChangeDetectorRef);
  private _container = inject(ElementRef);
  private _destroyRef = inject(DestroyRef);
  private _injector = inject(Injector);

  private _interval$ = new BehaviorSubject(this._config.interval);
  private _mouseHover$ = new BehaviorSubject(false);
  private _focused$ = new BehaviorSubject(false);
  private _pauseOnHover$ = new BehaviorSubject(this._config.pauseOnHover);
  private _pauseOnFocus$ = new BehaviorSubject(this._config.pauseOnFocus);
  private _pause$ = new BehaviorSubject(false);
  private _wrap$ = new BehaviorSubject(this._config.wrap);

  id = `ngb-carousel-${carouselId++}`;

  // host: { class: 'carousel slide', '[style.display]': '"block"', tabIndex: '0' }
  @HostBinding("class.carousel") readonly _hostClassCarousel = true;
  @HostBinding("class.slide") readonly _hostClassSlide = true;
  @HostBinding("style.display") readonly _hostDisplay = "block";
  @HostBinding("attr.tabindex") readonly _hostTabindex = 0;

  /**
   * Flag para activar/desactivar las animaciones.
   *
   * @since 8.0.0
   */
  @Input() animation = this._config.animation;

  /**
   * El id del slide que debe mostrarse **inicialmente**.
   *
   * Para interacciones posteriores usar `select()`, `next()`, etc. y el output `(slide)`.
   *
   * `binding: "@"`: `@Input()` con string literal (`active-id="slide-2"`) — ver CORE_GAPS.
   */
  @Input({ binding: "@" }) activeId!: string;

  /**
   * Tiempo en milisegundos antes de mostrar el siguiente slide.
   */
  @Input()
  set interval(value: number) {
    this._interval$.next(value);
  }

  get interval() {
    return this._interval$.value;
  }

  /**
   * Si es `true`, el carousel 'envuelve' pasando del último slide al primero.
   */
  @Input()
  set wrap(value: boolean) {
    this._wrap$.next(value);
  }

  get wrap() {
    return this._wrap$.value;
  }

  /**
   * Si es `true`, permite navegar con las flechas izquierda/derecha del teclado.
   */
  @Input() keyboard = this._config.keyboard;

  /**
   * Si es `true`, pausa el cambio de slides cuando el mouse está sobre el slide.
   *
   * @since 2.2.0
   */
  @Input()
  set pauseOnHover(value: boolean) {
    this._pauseOnHover$.next(value);
  }

  get pauseOnHover() {
    return this._pauseOnHover$.value;
  }

  /**
   * Si es `true`, pausa el cambio de slides cuando el foco está dentro del carousel.
   */
  @Input()
  set pauseOnFocus(value: boolean) {
    this._pauseOnFocus$.next(value);
  }

  get pauseOnFocus() {
    return this._pauseOnFocus$.value;
  }

  /**
   * Si es `true`, las flechas de navegación 'anterior'/'siguiente' son visibles.
   *
   * @since 2.2.0
   */
  @Input() showNavigationArrows = this._config.showNavigationArrows;

  /**
   * Si es `true`, los indicadores de navegación al pie del slide son visibles.
   *
   * @since 2.2.0
   */
  @Input() showNavigationIndicators = this._config.showNavigationIndicators;

  /**
   * Evento emitido justo antes de que empiece la transición del slide.
   */
  @Output() slide = new EventEmitter<NgbSlideEvent>();

  /**
   * Evento emitido justo después de completar la transición del slide.
   *
   * @since 8.0.0
   */
  @Output() slid = new EventEmitter<NgbSlideEvent>();

  /*
   * Guarda los ids de los paneles en transición para permitir sólo la reversión.
   */
  private _transitionIds: [string, string] | null = null;

  @HostListener("mouseenter")
  _onMouseEnter() {
    this.mouseHover = true;
  }

  @HostListener("mouseleave")
  _onMouseLeave() {
    this.mouseHover = false;
  }

  @HostListener("focusin")
  _onFocusIn() {
    this.focused = true;
  }

  @HostListener("focusout")
  _onFocusOut() {
    this.focused = false;
  }

  @HostListener("keydown.arrowleft")
  _onArrowLeftKey() {
    if (this.keyboard) this.arrowLeft();
  }

  @HostListener("keydown.arrowright")
  _onArrowRightKey() {
    if (this.keyboard) this.arrowRight();
  }

  set mouseHover(value: boolean) {
    this._mouseHover$.next(value);
  }

  get mouseHover() {
    return this._mouseHover$.value;
  }

  set focused(value: boolean) {
    this._focused$.next(value);
  }

  get focused() {
    return this._focused$.value;
  }

  arrowLeft() {
    this.focus();
    this.prev(NgbSlideEventSource.ARROW_LEFT);
  }

  arrowRight() {
    this.focus();
    this.next(NgbSlideEventSource.ARROW_RIGHT);
  }

  ngAfterContentInit() {
    // setInterval() no funciona bien con SSR/protractor: sólo en el browser y
    // fuera de Angular.
    if (isPlatformBrowser(this._platformId)) {
      this._ngZone.runOutsideAngular(() => {
        const hasNextSlide$ = combineLatest([
          this.slide.pipe(
            map((slideEvent) => slideEvent.current),
            startWith(this.activeId),
          ),
          this._wrap$,
          this.slides.changes.pipe(startWith(null)),
        ]).pipe(
          map(([currentSlideId, wrap]) => {
            const slideArr = this.slides.toArray();
            const currentSlideIdx = this._getSlideIdxById(currentSlideId);
            return wrap ? slideArr.length > 1 : currentSlideIdx < slideArr.length - 1;
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
            map(
              ([pause, pauseOnHover, mouseHover, pauseOnFocus, focused, interval, hasNextSlide]: [
                boolean,
                boolean,
                boolean,
                boolean,
                boolean,
                number,
                boolean,
              ]) =>
                pause || (pauseOnHover && mouseHover) || (pauseOnFocus && focused) || !hasNextSlide ? 0 : interval,
            ),
            distinctUntilChanged(),
            switchMap((interval) => (interval > 0 ? timer(interval, interval) : NEVER)),
            takeUntilDestroyed(this._destroyRef),
          )
          .subscribe(() => this._ngZone.run(() => this.next(NgbSlideEventSource.TIMER)));
      });
    }

    this.slides.changes.pipe(takeUntilDestroyed(this._destroyRef)).subscribe(() => {
      this._transitionIds?.forEach((id) => {
        ngbCompleteTransition(this._getSlideElement(id));
      });
      this._transitionIds = null;

      this._cd.markForCheck();

      // Esto tiene que hacerse asincrónicamente, después de que el DOM se
      // estabilice, si no todos los cambios se deshacen.
      afterNextRender(
        {
          mixedReadWrite: () => {
            for (const { id } of this.slides) {
              const element = this._getSlideElement(id);
              if (id === this.activeId) {
                element.classList.add("active");
              } else {
                element.classList.remove("active");
              }
            }
          },
        },
        { injector: this._injector },
      );
    });
  }

  ngAfterContentChecked() {
    const activeSlide = this._getSlideById(this.activeId);
    this.activeId = activeSlide ? activeSlide.id : this.slides.length ? this.slides.first.id : "";
  }

  ngAfterViewInit() {
    // Inicializa la clase 'active' (no la maneja el template)
    if (this.activeId) {
      const element = this._getSlideElement(this.activeId);
      if (element) {
        element.classList.add("active");
      }
    }
  }

  /**
   * Navega al slide con el identificador dado.
   */
  select(slideId: string, source?: NgbSlideEventSource) {
    this._cycleToSelected(slideId, this._getSlideEventDirection(this.activeId, slideId), source);
  }

  /**
   * Navega al slide anterior.
   */
  prev(source?: NgbSlideEventSource) {
    this._cycleToSelected(this._getPrevSlide(this.activeId), NgbSlideEventDirection.END, source);
  }

  /**
   * Navega al slide siguiente.
   */
  next(source?: NgbSlideEventSource) {
    this._cycleToSelected(this._getNextSlide(this.activeId), NgbSlideEventDirection.START, source);
  }

  /**
   * Pausa el ciclado de slides.
   */
  pause() {
    this._pause$.next(true);
  }

  /**
   * Reinicia el ciclado de slides de principio a fin.
   */
  cycle() {
    this._pause$.next(false);
  }

  /**
   * Pone el foco en el carousel.
   */
  focus() {
    this._container.nativeElement.focus();
  }

  private _cycleToSelected(slideIdx: string, direction: NgbSlideEventDirection, source?: NgbSlideEventSource) {
    const transitionIds = this._transitionIds;
    if (transitionIds && (transitionIds[0] !== slideIdx || transitionIds[1] !== this.activeId)) {
      // Reversión prevenida
      return;
    }

    const selectedSlide = this._getSlideById(slideIdx);
    if (selectedSlide && selectedSlide.id !== this.activeId) {
      this._transitionIds = [this.activeId, slideIdx];
      this.slide.emit({
        prev: this.activeId,
        current: selectedSlide.id,
        direction: direction,
        paused: this._pause$.value,
        source,
      });

      const options: NgbTransitionOptions<NgbCarouselCtx> = {
        animation: this.animation,
        runningTransition: "stop",
        context: { direction },
      };

      // biome-ignore lint/suspicious/noExplicitAny: port textual de @ng-bootstrap
      const transitions: Array<Observable<any>> = [];
      const activeSlide = this._getSlideById(this.activeId);
      if (activeSlide) {
        const activeSlideTransition = ngbRunTransition(
          this._ngZone,
          this._getSlideElement(activeSlide.id),
          ngbCarouselTransitionOut,
          options,
        );
        activeSlideTransition.subscribe(() => {
          activeSlide.slid.emit({ isShown: false, direction, source });
        });
        transitions.push(activeSlideTransition);
      }

      const previousId = this.activeId;
      this.activeId = selectedSlide.id;
      const nextSlide = this._getSlideById(this.activeId);
      const transition = ngbRunTransition(
        this._ngZone,
        this._getSlideElement(selectedSlide.id),
        ngbCarouselTransitionIn,
        options,
      );
      transition.subscribe(() => {
        nextSlide?.slid.emit({ isShown: true, direction, source });
      });
      transitions.push(transition);

      zip(...transitions)
        .pipe(take(1))
        .subscribe(() => {
          this._transitionIds = null;
          this.slid.emit({
            prev: previousId,
            // biome-ignore lint/style/noNonNullAssertion: garantizado por el `if (selectedSlide && ...)` de arriba (upstream)
            current: selectedSlide!.id,
            direction: direction,
            paused: this._pause$.value,
            source,
          });
        });
    }

    // Se llega acá después del intervalo o de cualquier llamada externa (next/prev/select)
    this._cd.markForCheck();
  }

  private _getSlideEventDirection(currentActiveSlideId: string, nextActiveSlideId: string): NgbSlideEventDirection {
    const currentActiveSlideIdx = this._getSlideIdxById(currentActiveSlideId);
    const nextActiveSlideIdx = this._getSlideIdxById(nextActiveSlideId);

    return currentActiveSlideIdx > nextActiveSlideIdx ? NgbSlideEventDirection.END : NgbSlideEventDirection.START;
  }

  private _getSlideById(slideId: string): NgbSlide | null {
    return this.slides.find((slide) => slide.id === slideId) || null;
  }

  private _getSlideIdxById(slideId: string): number {
    const slide = this._getSlideById(slideId);
    return slide != null ? this.slides.toArray().indexOf(slide) : -1;
  }

  private _getNextSlide(currentSlideId: string): string {
    const slideArr = this.slides.toArray();
    const currentSlideIdx = this._getSlideIdxById(currentSlideId);
    const isLastSlide = currentSlideIdx === slideArr.length - 1;

    return isLastSlide
      ? this.wrap
        ? slideArr[0].id
        : slideArr[slideArr.length - 1].id
      : slideArr[currentSlideIdx + 1].id;
  }

  private _getPrevSlide(currentSlideId: string): string {
    const slideArr = this.slides.toArray();
    const currentSlideIdx = this._getSlideIdxById(currentSlideId);
    const isFirstSlide = currentSlideIdx === 0;

    return isFirstSlide
      ? this.wrap
        ? slideArr[slideArr.length - 1].id
        : slideArr[0].id
      : slideArr[currentSlideIdx - 1].id;
  }

  private _getSlideElement(slideId: string): HTMLElement {
    return this._container.nativeElement.querySelector(`#slide-${slideId}`);
  }
}

/**
 * Evento de cambio de slide emitido justo después de completar la transición.
 */
export interface NgbSlideEvent {
  /** El id del slide anterior. */
  prev: string;

  /** El id del slide actual. */
  current: string;

  /** La dirección del evento de slide. `'start' | 'end'`. */
  direction: NgbSlideEventDirection;

  /** Si se llamó `pause()` (y no hubo `cycle()` después). @since 5.1.0 */
  paused: boolean;

  /** Origen que disparó el cambio. `'timer' | 'arrowLeft' | 'arrowRight' | 'indicator'`. @since 5.1.0 */
  source?: NgbSlideEventSource;
}

/**
 * Evento de cambio de un slide individual, emitido al completar la transición.
 *
 * @since 8.0.0
 */
export interface NgbSingleSlideEvent {
  /** `true` si el slide se muestra, `false` si no. */
  isShown: boolean;

  /** La dirección del evento de slide. `'start' | 'end'`. */
  direction: NgbSlideEventDirection;

  /** Origen que disparó el cambio. */
  source?: NgbSlideEventSource;
}

export enum NgbSlideEventSource {
  TIMER = "timer",
  ARROW_LEFT = "arrowLeft",
  ARROW_RIGHT = "arrowRight",
  INDICATOR = "indicator",
}
