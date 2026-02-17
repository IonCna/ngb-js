import angular from "angular"
import type { IFilterService } from "angular"
import { beforeEach, describe, expect, it } from "vitest"
import { NgbModule } from "../ngb.module"

describe("ngbPercent filter", () => {
    beforeEach(() => {
        angular.mock.module(NgbModule.name)
    })

    it("formats decimals as percentages", () => {
        angular.mock.inject(($filter: IFilterService) => {
            const ngbPercent: (n: number) => string = $filter("ngbPercent")

            expect(ngbPercent(0.375)).toBe("37.5%")
            expect(ngbPercent(1)).toBe("100%")
        })
    })

    it("returns 0% for invalid values", () => {
        angular.mock.inject(($filter: IFilterService) => {
            const ngbPercent: (n?: number) => string = $filter("ngbPercent")

            expect(ngbPercent(undefined)).toBe("0%")
            expect(ngbPercent(Number.NaN)).toBe("0%")
        })
    })
})
