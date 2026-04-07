import type {
    IComponentController,
    IComponentOptions,
} from "angular";

import { NgbCarouselConfig } from "./ngb-carousel-config.service";
import { NgbAnimationFactory } from "@/ngb-animation.factory";
import template from "@/carousel/ngb-carousel.component.html?raw";

export interface INgbCarousel {
    select(slideId: string, source: unknown): void
    prev(source: unknown): void
    next(source: unknown): void
    pause(): void
    cycle(): void
    focus(): void
}

export class NgbCarousel implements IComponentController, INgbCarousel {
    private activeId?: string
    private animation?: boolean
    private interval?: number
    private keyboard?: boolean
    private pauseOnFocus?: boolean
    private pauseOnHover?: boolean
    private showNavigationArrows?: boolean
    private showNavigationIndicators?: boolean
    private wrap?: boolean

    static get $name() {
        return "ngbCarousel"
    }

    static get $factory(): IComponentOptions {
        return {
            controllerAs: "$",
            controller: NgbCarousel,
            transclude: true,
            bindings: {
                activeId: "<?",
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
            NgbAnimationFactory.$name
        ]
    }
}

/**
 *  
    private slid?: ({ $event }: { $event: NgbSlideEvent }) => void
    private slide?: ({ $event }: { $event: NgbSlideEvent }) => void

    private innerContainer!: JQLite
    private slides: Map<number, Slide> = new Map()
    public orderedSlides: Slide[] = []
    public index = 0

    private activeInterval?: IPromise<any>
    private currentSlide?: Slide
    private isPaused = false
    private isFocused = false
    private isAnimating = false
    private ngbRunTransition?: ($element: IAugmentedJQuery, startFn: () => void) => IPromise<void>

    private handlersBound = false
    private slideCounter = 0

    private readonly boundKeyboardHandler = (event: JQueryEventObject) => this.onKeyboardPress(event)
    private readonly boundFocusInHandler = () => this.onFocusin()
    private readonly boundFocusOutHandler = () => this.onFocusout()
    private readonly boundMouseEnterHandler = () => this.onHoverEnter()
    private readonly boundMouseLeaveHandler = () => this.onHoverLeave()

    constructor(
        private $element: JQLite,
        private carouselConfig: NgbCarouselConfig,
        private $interval: IIntervalService,
        private $timeout: ITimeoutService,
        private ngbAnimationFactory: NgbAnimationFactory
    ) { }

    $onInit(): void {
        this.activeId = this.activeId ?? ""
        this.animation = this.animation ?? this.carouselConfig.animation
        this.interval = this.interval ?? this.carouselConfig.interval
        this.keyboard = this.keyboard ?? this.carouselConfig.keyboard
        this.pauseOnFocus = this.pauseOnFocus ?? this.carouselConfig.pauseOnFocus
        this.pauseOnHover = this.pauseOnHover ?? this.carouselConfig.pauseOnHover
        this.showNavigationArrows = this.showNavigationArrows ?? this.carouselConfig.showNavigationArrows
        this.showNavigationIndicators = this.showNavigationIndicators ?? this.carouselConfig.showNavigationIndicators
        this.wrap = this.wrap ?? this.carouselConfig.wrap
        this.ngbRunTransition = this.ngbAnimationFactory.$create()
    }

    $postLink(): void {
        this.$element.addClass("carousel slide")
        this.$element.css("display", "block")
        this.$element.attr("tabindex", 0)

        const host = this.$element[0].querySelector("[carousel-inner-host]")
        if (!host) return

        this.innerContainer = angular.element(host)
        for (const [, { container }] of this.getOrderedSlides()) {
            this.innerContainer.append(container)
        }

        this.refreshOrderedSlides()
        this.initializeCarousel()
    }

    $onDestroy(): void {
        this.silentPause()
        this.$element.off("keydown", this.boundKeyboardHandler)
        this.$element.off("focusin", this.boundFocusInHandler)
        this.$element.off("focusout", this.boundFocusOutHandler)
        this.$element.off("mouseenter", this.boundMouseEnterHandler)
        this.$element.off("mouseleave", this.boundMouseLeaveHandler)
    }

    public registerSlide(slide: NgbSlide, container: JQLite, id: string) {
        this.slides.set(this.slideCounter++, { slide, container, id })

        if (this.innerContainer) {
            this.innerContainer.append(container)
            this.refreshOrderedSlides()
            this.initializeCarousel()
        }
    }

    private initializeCarousel() {
        if (!this.orderedSlides.length) return

        const selected = this.activeId
            ? this.orderedSlides.find(slide => slide.id === this.activeId)
            : undefined
        const initialSlide = selected ?? this.orderedSlides[0]
        const initialIndex = this.orderedSlides.findIndex(slide => slide.id === initialSlide.id)

        this.index = initialIndex >= 0 ? initialIndex : 0
        this.currentSlide = this.orderedSlides[this.index]
        this.activeId = this.currentSlide.id

        this.orderedSlides.forEach((slide, idx) => {
            slide.container.toggleClass("active", idx === this.index)
        })

        this.bindInteractionHandlers()
        this.silentPause()
        if (this.interval > 0 && this.orderedSlides.length > 1 && !this.isPaused) {
            this.silentCycle()
        }
    }

    private bindInteractionHandlers() {
        if (this.handlersBound) return

        this.keyboard && this.$element.on("keydown", this.boundKeyboardHandler)

        if (this.pauseOnFocus) {
            this.$element.on("focusin", this.boundFocusInHandler)
            this.$element.on("focusout", this.boundFocusOutHandler)
        }

        if (this.pauseOnHover) {
            this.$element.on("mouseenter", this.boundMouseEnterHandler)
            this.$element.on("mouseleave", this.boundMouseLeaveHandler)
        }

        this.handlersBound = true
    }

    private refreshOrderedSlides() {
        this.orderedSlides = this.getOrderedSlides().map(([, slide]) => slide)
    }

    private getOrderedSlides() {
        return Array.from(this.slides.entries()).sort(([a], [b]) => a - b)
    }

    private onKeyboardPress({ key }: JQueryEventObject) {
        if (key === CarouselKeyBoardKeys.ARROW_LEFT) this.prev("arrowLeft")
        if (key === CarouselKeyBoardKeys.ARROW_RIGHT) this.next("arrowRight")
    }

    private onFocusin = () => {
        this.pause()
        this.isFocused = true
    }

    private onFocusout = () => {
        this.cycle()
        this.isFocused = false
    }

    private onHoverEnter() {
        this.pause()
    }

    private onHoverLeave() {
        if (this.pauseOnFocus && this.isFocused) return
        this.cycle()
    }

    public select(slideId: string, source: NgbSlideEventSource) {
        if (!this.currentSlide) return

        const nextIndex = this.orderedSlides.findIndex(slide => slide.id === slideId)
        if (nextIndex < 0 || nextIndex === this.index) return
        const direction = nextIndex > this.index ? "start" : "end"
        this.transitionTo(nextIndex, direction, source)
    }

    public prev(source: NgbSlideEventSource) {
        if (this.isAnimating || !this.currentSlide || this.orderedSlides.length < 2) return
        if (!this.wrap && this.index === 0) return
        const nextIndex = (this.index - 1 + this.orderedSlides.length) % this.orderedSlides.length
        this.transitionTo(nextIndex, "end", source)
    }

    public next(source: NgbSlideEventSource) {
        if (this.isAnimating || !this.currentSlide || this.orderedSlides.length < 2) return
        if (!this.wrap && this.index === this.orderedSlides.length - 1) return
        const nextIndex = (this.index + 1) % this.orderedSlides.length
        this.transitionTo(nextIndex, "start", source)
    }

    private transitionTo(nextIndex: number, direction: "start" | "end", source: NgbSlideEventSource): void {
        if (this.isAnimating || !this.currentSlide || this.orderedSlides.length < 2) return
        if (nextIndex < 0 || nextIndex >= this.orderedSlides.length || nextIndex === this.index) return

        this.isAnimating = true

        if (source !== "timer") this.silentPause()

        const previousId = this.currentSlide.id
        const nextSlide = this.orderedSlides[nextIndex]
        const movementClass = direction === "start" ? "carousel-item-next" : "carousel-item-prev"
        const transitionClass = direction === "start" ? "carousel-item-start" : "carousel-item-end"
        const { container: $current, slide: $slideCurrent } = this.currentSlide
        const { container: $next, slide: $slideNext } = nextSlide
        const currentId = nextSlide.id

        this.slide?.({
            $event: {
                current: currentId,
                direction,
                paused: this.isPaused,
                source,
                prev: previousId
            }
        })

        $current.addClass(transitionClass)
        $next.addClass(movementClass)

        const preventAnimationCancel = this.$timeout(() => {
            this.isAnimating = false
        }, 500)

        $slideNext.setActive(true, { direction, isShown: true, source })

        const finalizeTransition = () => {
            this.$timeout.cancel(preventAnimationCancel)
            $slideCurrent.setActive(false, { direction, source, isShown: false })
            $current.removeClass(transitionClass)

            this.index = nextIndex
            this.currentSlide = nextSlide
            this.activeId = nextSlide.id
            this.isAnimating = false
            if (source !== "timer") this.silentCycle()

            this.slid?.({
                $event: {
                    paused: this.isPaused,
                    source,
                    direction,
                    prev: previousId,
                    current: currentId
                }
            })
        }

        const transition = this.ngbRunTransition?.($current, () => {
            $next.removeClass(movementClass)
        })

        if (!transition) {
            finalizeTransition()
            return
        }

        transition.then(() => finalizeTransition()).catch(_err => {
            this.$timeout.cancel(preventAnimationCancel)
            this.isAnimating = false
            if (source !== "timer") this.silentCycle()
        })
    }

    public pause() {
        this.silentPause()
        this.isPaused = true
    }

    public cycle() {
        this.silentPause()
        this.silentCycle()
        this.isPaused = false
    }

    public focus() {
        this.$element[0].focus()
        this.isFocused = true
    }

    private silentPause() {
        if (this.activeInterval) {
            this.$interval.cancel(this.activeInterval)
            this.activeInterval = undefined
        }
    }

    private silentCycle() {
        if (this.interval <= 0 || this.orderedSlides.length < 2) return
        this.activeInterval = this.$interval(this.next.bind(this, "timer"), this.interval)
    }

 */