import angular from "angular"
import type { IRootScopeService } from "angular"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { NgbModule } from "../ngb.module"
import { NgbModal } from "./ngb-modal.service"

class ModalSpecContentController {
    static get $name() {
        return "modalSpecContent"
    }

    static get $factory(): angular.IComponentOptions {
        return {
            bindings: {
                ngbActiveModal: "<"
            },
            controllerAs: "$",
            controller: ModalSpecContentController,
            template: `
                <div class="modal-body">
                    <button type="button" id="first-btn">First</button>
                    <button type="button" id="last-btn">Last</button>
                </div>
            `
        }
    }
}

describe("ngbModal", () => {
    let $rootScope: IRootScopeService
    let ngbModal: NgbModal

    beforeEach(() => {
        angular.module("modal.spec.module", [NgbModule.name]).component(
            ModalSpecContentController.$name,
            ModalSpecContentController.$factory
        )

        angular.mock.module("modal.spec.module")
        angular.mock.inject((_$rootScope_: IRootScopeService, _ngbModal_: NgbModal) => {
            $rootScope = _$rootScope_
            ngbModal = _ngbModal_
        })
    })

    afterEach(() => {
        document.body.innerHTML = ""
    })

    const tick = async () => {
        await Promise.resolve()
        $rootScope.$digest()
    }

    it("traps focus and restores it to opener when modal closes", async () => {
        const opener = document.createElement("button")
        opener.textContent = "open"
        document.body.append(opener)
        opener.focus()

        ngbModal.open("modalSpecContent", { animation: false })
        $rootScope.$digest()
        await tick()

        const modal = document.body.querySelector(".modal") as HTMLElement
        expect(modal).toBeTruthy()

        const firstBtn = modal.querySelector("#first-btn") as HTMLButtonElement
        const lastBtn = modal.querySelector("#last-btn") as HTMLButtonElement
        expect(document.activeElement).toBe(firstBtn)

        lastBtn.focus()
        document.body.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab" }))
        expect(document.activeElement).toBe(firstBtn)

        document.body.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }))
        await tick()
        await tick()

        expect(document.activeElement).toBe(opener)
    })

    it("supports stacked modals and ESC closes only top modal", async () => {
        const opener1 = document.createElement("button")
        const opener2 = document.createElement("button")
        document.body.append(opener1, opener2)

        opener1.focus()
        ngbModal.open("modalSpecContent", { animation: false })
        $rootScope.$digest()
        await tick()

        opener2.focus()
        ngbModal.open("modalSpecContent", { animation: false })
        $rootScope.$digest()
        await tick()

        expect(document.body.querySelectorAll(".modal").length).toBe(2)

        document.body.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }))
        await tick()
        await tick()
        expect(document.body.querySelectorAll(".modal").length).toBe(1)

        document.body.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }))
        await tick()
        await tick()
        expect(document.body.querySelectorAll(".modal").length).toBe(0)
    })
})
