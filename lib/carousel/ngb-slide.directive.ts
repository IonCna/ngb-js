import type { IController, IDirective } from "angular";
import type { NgbSingleSlideEvent } from "./ngb-carousel.module"
import angular from "angular";
import type { NgbCarousel } from "./ngb-carousel.component";
import { NGB_CAROUSEL_SLIDE_COUNTER } from "./ngb-carousel.module"
import { NgbCarouselSlideRegisterEvent } from "./ngb-carousel.events"

export class NgbSlide implements IController {
    private slid?: ($event: NgbSingleSlideEvent) => void
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

        const id = this.container.attr("id")
        
        this.currentId = id ?? this.currentId
        this.container.attr("id", this.currentId)

        this.container.append(this.$element.contents())

        this.carousel["$scope"].$emit(NgbCarouselSlideRegisterEvent, this, this.container, this.currentId)
    }

    $onDestroy(): void {
        this.$counter--
    }

    public setActive(isActive: boolean, event: NgbSingleSlideEvent) {
        this.container.toggleClass("active", isActive)
        const { direction, isShown, source } = event

        this.slid?.({ direction, isShown, source })
    }

    //#region $angular

    static get $factory(): () => IDirective {
        return () => ({
            require: {
                carousel: "^ngbCarousel"
            },
            scope: false,
            controller: this,
            bindToController: {
                slid: "&?"
            },
            restrict: "A",
        })
    }

    static get $inject() {
        return [NGB_CAROUSEL_SLIDE_COUNTER, "$element"]
    }

    static get $name() {
        return "ngbSlide"
    }

    //#endregion
}
