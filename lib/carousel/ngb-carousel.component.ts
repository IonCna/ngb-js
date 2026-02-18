import type { IAugmentedJQuery, IComponentController, IComponentOptions, IIntervalService, IPromise, IScope, ITimeoutService } from "angular";
import type { NgbSlideEventSource, NgbSlideEvent } from "./ngb-carousel.module"
import { NgbCarouselConfig } from "./ngb-carousel-config.service"
import { NgbSlide } from "./ngb-slide.directive"
import angular from "angular";
import { NGB_CAROUSEL_COUNTER } from "./ngb-carousel.module"
import { NgbAnimationFactory } from "@/ngb-animation.factory"
import { NgbCarouselSlideRegisterEvent } from "./ngb-carousel.events"

interface Slide {
    id: string
    container: JQLite
    slide: NgbSlide
}

enum CarouselKeyBoardKeys {
    ARROW_RIGHT = "ArrowRight",
    ARROW_LEFT = "ArrowLeft"
}

export class NgbCarousel implements IComponentController {
    private activeId!: string
    private animation!: boolean
    private interval!: number
    private keyboard!: boolean
    private pauseOnFocus!: boolean
    private pauseOnHover!: boolean
    private showNavigationArrows!: boolean
    private showNavigationIndicators!: boolean
    private wrap!: boolean
    private slid?: ({ $event }: { $event: NgbSlideEvent }) => void
    private slide?: ({ $event }: { $event: NgbSlideEvent }) => void

    private innerContainer!: JQLite
    private slides: Map<number, Slide> = new Map()
    private index = 0

    private activeInterval?: IPromise<any>
    private currentSlide!: Slide
    private isPaused: boolean = false
    private isFocused: boolean = false
    private isAnimating!: boolean

    private timeDebounce?: IPromise<void>
    private controls?: JQLite[]
    private ngbRunTransition?: ($element: IAugmentedJQuery, startFn: () => void) => IPromise<void>
    private readonly boundKeyboardHandler = (event: JQueryEventObject) => this.onKeyboardPress(event)
    private readonly boundFocusInHandler = () => this.onFocusin()
    private readonly boundFocusOutHandler = () => this.onFocusout()
    private readonly boundMouseEnterHandler = () => this.onHoverEnter()
    private readonly boundMouseLeaveHandler = () => this.onHoverLeave()

    constructor(
        private $element: JQLite,
        private carouselConfig: NgbCarouselConfig,
        private $scope: IScope,
        private $interval: IIntervalService,
        private $timeout: ITimeoutService,
        private $counter: number,
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

        this.innerContainer = angular.element("<div></div>")
        this.innerContainer.addClass("carousel-inner")

        this.$element.append(
            this.innerContainer
        )

        let counter = 0

        this.$scope.$on(NgbCarouselSlideRegisterEvent, (event, slide: NgbSlide, container: JQLite, id: string) => {
            event.preventDefault()
            event.stopPropagation?.()

            this.innerContainer.append(container)

            this.slides.set(counter++, { slide, container, id })

            if (this.timeDebounce) {
                this.$timeout.cancel(this.timeDebounce)
            }

            this.timeDebounce = this.$timeout(() => {

                const $default = this.slides.get(0)

                if ($default) {
                    this.currentSlide = $default
                    this.currentSlide.container.addClass("active")
                }

                this.showNavigationArrows && this.buildArrows()
                if (this.showNavigationIndicators) {
                    this.controls = this.buildIndicators()
                }

                this.toggleIndex()
                this.keyboard && this.$element.on("keydown", this.boundKeyboardHandler)

                if (this.pauseOnFocus) {
                    this.$element.on("focusin", this.boundFocusInHandler)
                    this.$element.on("focusout", this.boundFocusOutHandler)
                }

                if (this.pauseOnHover) {
                    this.$element.on("mouseenter", this.boundMouseEnterHandler)
                    this.$element.on("mouseleave", this.boundMouseLeaveHandler)
                }

                if (this.slides.size > 1) {
                    this.activeInterval = this.$interval(this.next.bind(this, "timer"), this.interval)
                }
            }, 0)
        })
    }

    $onDestroy(): void {
        this.$counter--
        if (this.activeInterval) this.$interval.cancel(this.activeInterval);
        if (this.timeDebounce) this.$timeout.cancel(this.timeDebounce)

        this.$element.off("keydown", this.boundKeyboardHandler)
        this.$element.off("focusin", this.boundFocusInHandler)
        this.$element.off("focusout", this.boundFocusOutHandler)
        this.$element.off("mouseenter", this.boundMouseEnterHandler)
        this.$element.off("mouseleave", this.boundMouseLeaveHandler)
    }

    private onKeyboardPress({ key }: JQueryEventObject) {
        if (key == CarouselKeyBoardKeys.ARROW_LEFT) {
            this.prev("arrowLeft")
        }

        if (key == CarouselKeyBoardKeys.ARROW_RIGHT) {
            this.next("arrowRight")
        }
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
        if (this.pauseOnFocus && this.isFocused) return;
        this.cycle()
    }

    public select(slideId: string, source: NgbSlideEventSource) {
        const entries = Array.from(this.slides.entries())
        const next = entries.find(([, slide]) => slide.id === slideId)
        if (!next || !this.currentSlide || this.currentSlide.id === slideId) return

        const [nextIndex, nextSlide] = next
        this.currentSlide.slide.setActive(false, {
            direction: "start",
            isShown: false,
            source
        })
        nextSlide.slide.setActive(true, {
            direction: "start",
            isShown: true,
            source
        })

        this.toggleIndex()
        this.index = nextIndex
        this.toggleIndex()

        this.currentSlide = nextSlide
        this.activeId = slideId
    }

    public prev(source: NgbSlideEventSource) {
        if (this.isAnimating) return
        this.isAnimating = true

        this.slide?.({
            $event: {
                current: "",
                direction: "end",
                paused: this.isPaused,
                source,
                prev: ""
            }
        })

        if (source != "timer") {
            this.silentPause()
        }

        this.toggleIndex()
        this.index = (this.index - 1 + this.slides.size) % this.slides.size;
        this.toggleIndex()

        const { container: $prev, slide: $slidePrev } = this.slides.get(this.index)!
        const { container: $current, slide: $slideCurrent } = this.currentSlide

        $current.addClass("carousel-item-end")
        $prev.addClass("carousel-item-prev")

        const preventAnimationCancel = this.$timeout(() => {
            this.isAnimating = false
        }, 500)

        requestAnimationFrame(async () => this.$scope.$evalAsync(async () => {
            $slidePrev.setActive(true, {
                direction: "end",
                isShown: true,
                source
            })

            $prev.removeClass("carousel-item-prev")
            await this.ngbRunTransition?.($current as IAugmentedJQuery, () => {})
            this.$timeout.cancel(preventAnimationCancel)

            $slideCurrent.setActive(false, {
                direction: "start",
                source,
                isShown: false
            })

            $current.removeClass("carousel-item-end")

            this.currentSlide = this.slides.get(this.index)!
            this.isAnimating = false
            if (source != "timer") {
                this.silentCycle()
            }

            this.slid?.({
                $event: {
                    paused: this.isPaused,
                    source,
                    direction: "end",
                    prev: "",
                    current: ""
                }
            })
        }))
    }

    private silentPause() {
        if (this.activeInterval) {
            this.$interval.cancel(this.activeInterval)
        }
    }

    private toggleIndex() {
        const target = this.controls?.[this.index]
        target?.toggleClass("active")
    }

    private silentCycle() {
        this.activeInterval = this.$interval(this.next.bind(this, "timer"), this.interval)
    }

    public next(source: NgbSlideEventSource) {
        if (this.isAnimating) return
        this.isAnimating = true

        if (source != "timer") {
            this.silentPause()
        }

        this.toggleIndex()
        this.index = (this.index + 1) % this.slides.size;
        this.toggleIndex()

        const { container: $next, slide: $slideNext } = this.slides.get(this.index)!
        const { container: $current, slide: $slideCurrent } = this.currentSlide

        $current.addClass("carousel-item-start")
        $next.addClass("carousel-item-next")

        requestAnimationFrame(async () => this.$scope.$evalAsync(async () => {
            $slideNext.setActive(true, {
                direction: "start",
                isShown: true,
                source
            })

            $next.removeClass("carousel-item-next")
            await this.ngbRunTransition?.($current as IAugmentedJQuery, () => {})

            $slideCurrent.setActive(false, {
                direction: "start",
                source,
                isShown: false
            })

            $current.removeClass("carousel-item-start")

            this.currentSlide = this.slides.get(this.index)!
            this.isAnimating = false

            if (source != "timer") {
                this.silentCycle()
            }
        }))
    }

    public pause() {
        if (this.activeInterval) {
            this.$interval.cancel(this.activeInterval)
            this.isPaused = true
        }
    }

    public cycle() {
        this.activeInterval = this.$interval(this.next.bind(this, "timer"), this.interval)
        this.isPaused = false
    }

    public focus() {
        this.$element[0].focus()
        this.isFocused = true
    }

    private buildIndicators() {
        const container = angular.element("<div></div>")
        container.addClass("carousel-indicators")
        container.attr("role", "tablist")

        const buttons = Array.from({ length: this.slides.size }, (_, index) => {
            const button = angular.element("<button></button>")
            button.attr("type", "button")
            button.attr("role", "tab")
            button.attr("data-bs-target", "")
            button.attr("aria-labelledby", `slide-ngb-slide-${index}`)
            button.attr("aria-controls", `slide-ngb-slide-${index}`)

            button.on("click", () => this.select(`slide-ngb-slide-${index}`, "indicator"))

            container.append(button)
            return button
        })

        this.$element.append(container)
        return buttons
    }

    private buildArrows() {
        const buildSpans = () => Array.from({ length: 2 }, () => angular.element("<span></span>"))

        const [prev, next] = Array.from({ length: 2 }, (_, index) => {
            const state = index == 0 ? "prev" : "next"

            const button = angular.element("<button></button>")
            button.attr("type", "button")
            button.attr("aria-labelledby", `ngb-carousel-${this.$counter++}-previous`)
            button.addClass(`carousel-control-${state}`)

            const [label, icon] = buildSpans()
            label.attr("aria-hidden", "true")
            label.addClass(`carousel-control-${state}-icon`)

            icon.addClass("visually-hidden")
            icon.attr("id", `ngb-carousel-${this.$counter++}-${state}`)
            icon.append(state == "prev" ? "Previous" : "Next")

            button.append(label)
            button.append(icon)

            return button
        })

        prev.on("click", () => this.$scope.$evalAsync(() => this.prev("arrowLeft")))
        next.on("click", () => this.$scope.$evalAsync(() => this.next("arrowRight")))

        this.$element.append(prev)
        this.$element.append(next)
    }

    //#region $angular

    static get $name() {
        return "ngbCarousel"
    }

    static get $factory(): IComponentOptions {
        return {
            controllerAs: "$",
            controller: this,
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
            }
        }
    }

    static get $inject() {
        return ['$element', NgbCarouselConfig.$name, '$scope', '$interval', '$timeout', NGB_CAROUSEL_COUNTER, NgbAnimationFactory.$name]
    }

    //#endregion
}
