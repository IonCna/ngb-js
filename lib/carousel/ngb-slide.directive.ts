import type { IController, IDirective, ITranscludeFunction } from "angular";
import type { NgbSlideEventDirection } from "@/carousel/ngb-carousel-transition";
import type { NgbCarousel } from "@/carousel/ngb-carousel.component"

export class NgbSlide implements IController {
    public id!: string
    protected slid?: () => NgbSlideEventDirection
    protected carousel!: NgbCarousel

    constructor(public readonly $transclude: ITranscludeFunction) {}

    $onInit(): void {
        this.id = this.id ?? `ngb-slide-`
        if(!this.carousel) throw new Error("ngb-slide only can be used inside of ngb-carousel component");
    }

    $postLink(): void {
        this.carousel.register(this)
    }

    static get $factory(): () => IDirective {
        return () => ({
            require: {
                carousel: "^ngbCarousel"
            },
            controller: NgbSlide,
            scope: {
                slid: "&?",
                id: "@?"
            },
            bindToController: true,
            controllerAs: "$",
            restrict: "A",
            transclude: "element"
        })
    }

    static get $inject() {
        return ["$transclude"]
    }

    static get $name() {
        return "ngbSlide"
    }

    //#endregion
}

/**
 *     private slid?: ($event: NgbSingleSlideEvent) => void
    private currentId: string
    private carousel!: NgbCarousel

    private container!: JQLite

    constructor(
        private $counter: number,
        private $element: JQLite
    ) {
        this.currentId = `slide-ngb-slide-${this.$counter++}`
    }

    $postLink(): void {
        this.container = angular.element("<div></div>")
        this.container.attr("role", "tabpanel")
        this.container.addClass("carousel-item")

        const id = this.$element.attr("id")
        this.currentId = id ?? this.currentId
        this.container.attr("id", this.currentId)
        this.container.attr("aria-labelledby", this.currentId)

        const classList = this.$element.attr("class")?.split(/\s+/).filter(Boolean) ?? []
        for (const className of classList) {
            if (className !== "ngb-slide") {
                this.container.addClass(className)
            }
        }

        this.container.append(this.$element.contents())

        this.carousel.registerSlide(this, this.container, this.currentId)
    }

    $onDestroy(): void {
        this.$counter--
    }

    public setActive(isActive: boolean, event: NgbSingleSlideEvent) {
        this.container.toggleClass("active", isActive)
        const { direction, isShown, source } = event

        this.slid?.({ direction, isShown, source })
    }
 */