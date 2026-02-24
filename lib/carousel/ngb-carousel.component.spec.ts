import angular from "angular"
import type { ICompileService, IProvideService, IRootScopeService } from "angular"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { NgbModule } from "../ngb.module"
import { NgbAnimationFactory } from "../ngb-animation.factory"

describe("ngbCarousel", () => {
    let $compile: ICompileService
    let $rootScope: IRootScopeService

    beforeEach(() => {
        angular.mock.module(NgbModule.name)
        angular.mock.module(($provide: IProvideService) => {
            $provide.value(NgbAnimationFactory.$name, {
                $create: () => (_: JQLite, startFn: () => void) => {
                    startFn()
                    return Promise.resolve()
                }
            })
        })
        angular.mock.inject((_$compile_: ICompileService, _$rootScope_: IRootScopeService) => {
            $compile = _$compile_
            $rootScope = _$rootScope_
        })
    })

    afterEach(() => {
        document.body.innerHTML = ""
    })

    const tick = async (scope: IRootScopeService) => {
        await Promise.resolve()
        scope.$digest()
    }

    it("renders with active slide from activeId and indicators", () => {
        const scope = $rootScope.$new()
        const element = $compile(`
            <ngb-carousel
                animation="false"
                interval="0"
                active-id="'slide-2'"
                show-navigation-arrows="true"
                show-navigation-indicators="true">
                <div ngb-slide id="slide-1">Slide 1</div>
                <div ngb-slide id="slide-2">Slide 2</div>
                <div ngb-slide id="slide-3">Slide 3</div>
            </ngb-carousel>
        `)(scope)
        angular.element(document.body).append(element)
        scope.$digest()

        const host = element[0] as HTMLElement
        expect(host.classList.contains("carousel")).toBe(true)
        expect(host.classList.contains("slide")).toBe(true)

        const activeSlide = host.querySelector(".carousel-item.active") as HTMLElement
        expect(activeSlide).toBeTruthy()
        expect(activeSlide.id).toBe("slide-2")

        const indicators = host.querySelectorAll(".carousel-indicators button")
        expect(indicators.length).toBe(3)
        expect(indicators[1].classList.contains("active")).toBe(true)
        element.remove()
    })

    it("moves to next slide when next control is clicked", async () => {
        const scope = $rootScope.$new()
        const element = $compile(`
            <ngb-carousel
                animation="false"
                interval="0"
                active-id="'slide-1'"
                show-navigation-arrows="true"
                show-navigation-indicators="true">
                <div ngb-slide id="slide-1">Slide 1</div>
                <div ngb-slide id="slide-2">Slide 2</div>
                <div ngb-slide id="slide-3">Slide 3</div>
            </ngb-carousel>
        `)(scope)
        angular.element(document.body).append(element)
        scope.$digest()

        const host = element[0] as HTMLElement
        const ctrl = element.controller("ngbCarousel") as { next: (source: "arrowRight") => void }
        ctrl.next("arrowRight")
        scope.$digest()
        await tick(scope)
        await tick(scope)

        const activeSlide = host.querySelector(".carousel-item.active") as HTMLElement
        expect(activeSlide.id).toBe("slide-2")
        element.remove()
    })
})
