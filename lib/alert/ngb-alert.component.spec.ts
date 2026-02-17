import angular from "angular"
import type { ICompileService, IRootScopeService } from "angular"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { NgbModule } from "../ngb.module"

describe("ngbAlert", () => {
    let $compile: ICompileService
    let $rootScope: IRootScopeService

    beforeEach(() => {
        angular.mock.module(NgbModule.name)
        angular.mock.inject((_$compile_: ICompileService, _$rootScope_: IRootScopeService) => {
            $compile = _$compile_
            $rootScope = _$rootScope_
        })
    })

    it("renders bootstrap classes and closes when dismiss button is clicked", () => {
        const scope = $rootScope.$new() as IRootScopeService & { onClosed: () => void }
        const onClosed = vi.fn()
        scope.onClosed = onClosed

        const element = $compile(`
            <ngb-alert dismissible="true" animation="false" type="success" closed="onClosed()">
                Alert text
            </ngb-alert>
        `)(scope)
        scope.$digest()

        expect(element.hasClass("alert")).toBe(true)
        expect(element.hasClass("show")).toBe(true)
        expect(element.hasClass("alert-success")).toBe(true)
        expect(element.hasClass("alert-dismissible")).toBe(true)
        expect(element.attr("role")).toBe("alert")

        const button = angular.element(element[0].querySelector(".btn-close"))
        expect(button.length).toBe(1)
        button.triggerHandler("click")
        scope.$digest()

        expect(element.hasClass("d-none")).toBe(true)
        expect(onClosed).toHaveBeenCalledTimes(1)
    })
})
