import angular from "angular"
import type { ICompileService, IRootScopeService } from "angular"
import { beforeEach, describe, expect, it } from "vitest"
import { NgbModule } from "../ngb.module"

describe("ngbToast", () => {
    let $compile: ICompileService
    let $rootScope: IRootScopeService

    beforeEach(() => {
        angular.mock.module(NgbModule.name)
        angular.mock.inject((_$compile_: ICompileService, _$rootScope_: IRootScopeService) => {
            $compile = _$compile_
            $rootScope = _$rootScope_
        })
    })

    it("sets bootstrap toast semantics on host element", () => {
        const scope = $rootScope.$new()
        const element = $compile(`<ngb-toast>Toast message</ngb-toast>`)(scope)
        scope.$digest()

        expect(element.attr("role")).toBe("alert")
        expect(element.attr("aria-atomic")).toBe("true")
        expect(element.hasClass("toast")).toBe(true)
        expect(element.hasClass("show")).toBe(true)
    })
})
