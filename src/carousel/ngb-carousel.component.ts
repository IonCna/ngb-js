import angular from "angular";

import type {
    IAugmentedJQuery,
    IComponentController,
    IComponentOptions,
    IIntervalService,
    IPromise,
    IQService,
    IScope,
    ITimeoutService,
} from "angular";

import {
    ngbRunTransition,
    toNativeElement,
    type INgbEvent,
    type NgbTransitionOptions
} from "@ngb/utils"

import type { NgbSlide } from "@ngb/carousel/ngb-slide.directive";
import { NgbCarouselConfig } from "@ngb/carousel/ngb-carousel-config.service"
import { ngbCarouselTransitionIn, ngbCarouselTransitionOut, NgbSlideEventDirection, type NgbCarouselCtx } from "@ngb/carousel/ngb-carousel-transition"
import template from "@ngb/carousel/ngb-carousel.component.html";

let carouselCounter = 0

export interface INgbCarousel {
    select(slideId: string, source: NgbSlideEventSource): void
    prev(source: unknown): void
    next(source: unknown): void
    pause(): void
    cycle(): void
    focus(): void
}

export class NgbCarousel implements IComponentController, INgbCarousel {
    protected activeId?: string
    protected animation?: boolean
    protected interval?: number
    protected keyboard?: boolean
    protected pauseOnFocus?: boolean
    protected pauseOnHover?: boolean
    protected showNavigationArrows?: boolean
    protected showNavigationIndicators?: boolean
    protected wrap?: boolean
    protected NgbSlideEventSource = NgbSlideEventSource

    protected slide?: ({ $event }: INgbEvent<NgbSlideEvent>) => void
    protected slid?: ({ $event }: INgbEvent<NgbSlideEvent>) => void

    public id?: string

    private _transitionIds: [string, string] | null = null
    private slides: NgbSlide[] = []

    private _container?: IAugmentedJQuery
    private _paused = false
    private _mouseHover = false
    private _focused = false
    private _activeInterval?: IPromise<void>

    constructor(
        private $element: IAugmentedJQuery,
        private $ngbCarouselConfig: NgbCarouselConfig,
        private $interval: IIntervalService,
        private $timeout: ITimeoutService,
        private $scope: IScope,
        private $q: IQService
    ) { }

    $onInit(): void {
        this.animation = this.animation ?? this.$ngbCarouselConfig.animation
        this.interval = this.interval ?? this.$ngbCarouselConfig.interval
        this.keyboard = this.keyboard ?? this.$ngbCarouselConfig.keyboard
        this.pauseOnFocus = this.pauseOnFocus ?? this.$ngbCarouselConfig.pauseOnFocus
        this.pauseOnHover = this.pauseOnHover ?? this.$ngbCarouselConfig.pauseOnHover
        this.showNavigationArrows = this.showNavigationArrows ?? this.$ngbCarouselConfig.showNavigationArrows
        this.showNavigationIndicators = this.showNavigationIndicators ?? this.$ngbCarouselConfig.showNavigationIndicators
        this.showNavigationArrows = this.showNavigationArrows ?? this.$ngbCarouselConfig.showNavigationArrows
        this.wrap = this.wrap ?? this.$ngbCarouselConfig.wrap

        this.id = `ngb-carousel-${carouselCounter++}`
    }

    $postLink() {
        this.$element.addClass("carousel slide d-block")
        this.$element.attr("tabIndex", 0)
        this._container = this.$element.parent()

        this._scheduleActiveSlideSync()

        if (this.keyboard) this.$element.on("keydown", (event) => {
            const keys: Record<string, () => void> = {
                ["ArrowRight"]: () => this.arrowRight(),
                ["ArrowLeft"]: () => this.arrowLeft()
            }

            const arrowTo = keys[event.key]
            if (!arrowTo) return

            event.preventDefault()
            arrowTo()
        })

        this.$element.on("mouseenter", () => {
            this._mouseHover = true
            this._syncCycle()
        })

        this.$element.on("mouseleave", () => {
            this._mouseHover = false
            this._syncCycle()
        })

        this.$element.on("focusin", () => {
            this._focused = true
            this._syncCycle()
        })

        this.$element.on("focusout", () => {
            this._focused = false
            this._syncCycle()
        })

        this._syncCycle()
    }

    $doCheck(): void {
        const activeSlide = this._getSlideById(this.activeId)
        const [first] = this.slides

        this.activeId = activeSlide ? activeSlide.id : this.slides.length ? first.id : '';
    }

    $onDestroy(): void {
        this.$element.off("keydown")
        this.$element.off("mouseenter")
        this.$element.off("mouseleave")
        this.$element.off("focusin")
        this.$element.off("focusout")

        this._stopCycle()
    }

    focus(): void {
        if (!this._container) throw new Error("[ngb-carousel]: container do not exist");
        toNativeElement(this._container).focus()
    }

    arrowLeft() {
        this.focus()
        this.prev(NgbSlideEventSource.ARROW_LEFT)
    }

    arrowRight() {
        this.focus()
        this.next(NgbSlideEventSource.ARROW_RIGHT)
    }

    register(slide: NgbSlide) {
        this.slides = [...this.slides, slide]
        this._scheduleActiveSlideSync()
        this._syncCycle()
    }

    prev(source?: NgbSlideEventSource) {
        if (!this.activeId) throw new Error("[ngb-carousel]: activeId is undefined");
        this._cycleToSelected(this._getPrevSlide(this.activeId), NgbSlideEventDirection.END, source);
    }

    next(source?: NgbSlideEventSource) {
        if (!this.activeId) throw new Error("[ngb-carousel]: activeId is undefined");
        this._cycleToSelected(this._getNextSlide(this.activeId), NgbSlideEventDirection.START, source);
    }

    select(slideId: string, source?: NgbSlideEventSource) {
        if (!this.activeId) throw new Error("[ngb-carousel]: activeId is undefined");
        this._cycleToSelected(slideId, this._getSlideEventDirection(this.activeId, slideId), source)
    }

    cycle(): void {
        this._paused = false
        this._syncCycle()
    }

    pause(): void {
        this._paused = true
        this._syncCycle()
    }

    private get _canCycle() {
        const hasNextSlide = this.wrap
            ? this.slides.length > 1
            : this.activeId != null && this._getSlideIdxById(this.activeId) < this.slides.length - 1

        return !this._paused
            && !(this.pauseOnHover && this._mouseHover)
            && !(this.pauseOnFocus && this._focused)
            && !!this.interval
            && this.interval > 0
            && hasNextSlide
    }

    private _syncCycle() {
        this._stopCycle()

        if (!this._canCycle) return

        this._activeInterval = this.$interval(() => {
            this.next(NgbSlideEventSource.TIMER)
        }, this.interval ?? this.$ngbCarouselConfig.interval)
    }

    private _stopCycle() {
        if (!this._activeInterval) return
        this.$interval.cancel(this._activeInterval)
        this._activeInterval = undefined
    }

    private _scheduleActiveSlideSync() {
        this.$timeout(() => this._syncActiveSlideClass(), 0, false)
    }

    private _syncActiveSlideClass() {
        if (this._transitionIds || !this.activeId) return

        for (const slide of this.slides) {
            this._getSlideElement(slide.id).toggleClass("active", slide.id === this.activeId)
        }
    }

    private _cycleToSelected(slideIdx: string, direction: NgbSlideEventDirection, source?: NgbSlideEventSource) {
        const transitionIds = this._transitionIds;
        if (transitionIds && (transitionIds[0] !== slideIdx || transitionIds[1] !== this.activeId)) return;

        const selectedSlide = this._getSlideById(slideIdx);

        if (selectedSlide && selectedSlide.id !== this.activeId) {
            if (!this.activeId) throw new Error("[ngb-carousel]: ");
            this._transitionIds = [this.activeId, slideIdx];
            const currentTransitionIds = this._transitionIds

            this.slide?.({
                $event: {
                    prev: this.activeId,
                    current: selectedSlide.id,
                    direction,
                    paused: this._paused,
                    source
                }
            })

            const options: NgbTransitionOptions<NgbCarouselCtx> = {
                animation: this.animation ?? this.$ngbCarouselConfig.animation,
                runningTransition: 'stop',
                context: { direction }
            };

            const transitions: IPromise<void>[] = []
            const activeSlide = this._getSlideById(this.activeId)

            if (activeSlide) {
                const activeTransition = ngbRunTransition(
                    this.$q,
                    this.$timeout,
                    this._getSlideElement(activeSlide.id),
                    ngbCarouselTransitionOut,
                    options
                )

                activeTransition.then(() => activeSlide.slid?.({
                    $event: {
                        direction,
                        source,
                        isShown: false
                    }
                }))

                transitions.push(activeTransition)
            }

            const previousId = this.activeId;
            this.activeId = selectedSlide.id;
            const nextSlide = this._getSlideById(this.activeId);

            const transition = ngbRunTransition(
                this.$q,
                this.$timeout,
                this._getSlideElement(selectedSlide.id),
                ngbCarouselTransitionIn,
                options
            )

            transition.then(() => nextSlide?.slid?.({
                $event: {
                    isShown: true,
                    direction,
                    source
                }
            }))

            transitions.push(transition);

            this.$q.all(transitions)
                .then(() => {
                    if (this._transitionIds !== currentTransitionIds) return

                    this.slid?.({
                        $event: {
                            prev: previousId,
                            current: selectedSlide.id,
                            direction,
                            paused: this._paused,
                            source,
                        }
                    })
                })
                .finally(() => {
                    if (this._transitionIds !== currentTransitionIds) return

                    this._transitionIds = null
                    this._syncCycle()
                })
        }

        this.$scope.$evalAsync()
    }

    private _getSlideIdxById(slideId: string): number {
        const slide = this._getSlideById(slideId)
        return slide != null ? this.slides.indexOf(slide) : -1
    }

    private _getSlideEventDirection(currentActiveSlideId: string, nextActiveSlideId: string): NgbSlideEventDirection {
        const currentActiveSlideIdx = this._getSlideIdxById(currentActiveSlideId)
        const nextActiveSlideIdx = this._getSlideIdxById(nextActiveSlideId)

        return currentActiveSlideIdx > nextActiveSlideIdx ? NgbSlideEventDirection.END : NgbSlideEventDirection.START
    }

    private _getNextSlide(currentSlideId: string) {
        const currentSlideIdx = this._getSlideIdxById(currentSlideId)
        const isLastSlide = currentSlideIdx == this.slides.length - 1

        const slideWrapped = this.wrap ? this.slides[0].id : this.slides[this.slides.length - 1].id
        return isLastSlide ? slideWrapped : this.slides[currentSlideIdx + 1].id
    }

    private _getPrevSlide(currentSlideId: string): string {
        const currentSlideIdx = this._getSlideIdxById(currentSlideId)
        const isFirstSlide = currentSlideIdx === 0

        const slideWrapped = this.wrap ? this.slides[this.slides.length - 1].id : this.slides[0].id
        return isFirstSlide ? slideWrapped : this.slides[currentSlideIdx - 1].id
    }

    private _getSlideElement(slideId: string) {
        if (!this._container) throw new Error("");

        const el = toNativeElement(this._container).querySelector(`#slide-${slideId}`)
        if (!el) throw new Error("[ngb-carousel]: ngb-slide id not found");

        return angular.element(el)
    }

    private _getSlideById(slideId?: string): NgbSlide | null {
        return this.slides.find((slide) => slide.id === slideId) || null;
    }

    static get $name() {
        return "ngbCarousel"
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
                slide: "&?"
            },
            template
        }
    }

    static get $inject() {
        return [
            '$element',
            NgbCarouselConfig.$name,
            '$interval',
            '$timeout',
            '$scope',
            "$q"
        ]
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
    TIMER = 'timer',
    ARROW_LEFT = 'arrowLeft',
    ARROW_RIGHT = 'arrowRight',
    INDICATOR = 'indicator',
}
