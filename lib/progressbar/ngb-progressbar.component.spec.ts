import angular from "angular"
import type { ICompileService, IRootScopeService } from "angular"
import { beforeEach, describe, expect, it } from "vitest"
import { NgbModule } from "../ngb.module"

describe("ngbProgressbar", () => {
    let $compile: ICompileService
    let $rootScope: IRootScopeService

    beforeEach(() => {
        angular.mock.module(NgbModule.name)
        angular.mock.inject((_$compile_: ICompileService, _$rootScope_: IRootScopeService) => {
            $compile = _$compile_
            $rootScope = _$rootScope_
        })
    })

    it("renders host aria attributes and width from value/max", () => {
        const scope = $rootScope.$new() as IRootScopeService & {
            value: number
            max: number
        }
        scope.value = 25
        scope.max = 100

        const element = $compile(`
            <ngb-progressbar
                value="value"
                max="max"
                aria-label="Download"
                show-value="true"
                striped="true"
                animated="true"
                type="success"
                text-type="dark">
            </ngb-progressbar>
        `)(scope)
        scope.$digest()

        const progressBar = element[0].querySelector(".progress-bar") as HTMLElement

        expect(element.hasClass("progress")).toBe(true)
        expect(element.attr("role")).toBe("progressbar")
        expect(element.attr("aria-valuenow")).toBe("25")
        expect(element.attr("aria-valuemax")).toBe("100")
        expect(element.attr("aria-label")).toBe("Download")
        expect(progressBar.style.width).toBe("25%")
        expect(progressBar.classList.contains("progress-bar-striped")).toBe(true)
        expect(progressBar.classList.contains("progress-bar-animated")).toBe(true)
        expect(progressBar.textContent?.trim()).toBe("25%")
    })

    it("sets host width when inside ngb-progressbar-stacked", () => {
        const scope = $rootScope.$new() as IRootScopeService & { value: number }
        scope.value = 20

        const element = $compile(`
            <ngb-progressbar-stacked>
                <ngb-progressbar value="value"></ngb-progressbar>
            </ngb-progressbar-stacked>
        `)(scope)
        scope.$digest()

        const stacked = element[0] as HTMLElement
        const progress = stacked.querySelector("ngb-progressbar") as HTMLElement
        const progressBar = stacked.querySelector(".progress-bar") as HTMLElement

        expect(stacked.classList.contains("progress-stacked")).toBe(true)
        expect(progress.style.width).toBe("20%")
        expect(progressBar.style.width).toBe("100%")
    })
})
