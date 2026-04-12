import type { IComponentController, IComponentOptions } from "angular"
import template from "@demo/features/demo-modal/demo-modal.component.html?raw"

const SIZES = ["", "sm", "lg", "xl"]
const BACKDROPS: Array<boolean | "static"> = [true, false, "static"]

export class DemoModalComponent implements IComponentController {
    public lastResult = "—"
    public lastDismissed = "—"
    public animation = true
    public centered = false
    public scrollable = false
    public backdrop: boolean | "static" = true
    public keyboard = true
    public size = ""
    public fullscreen = false

    constructor(private ngbModal: any) {}

    private buildOptions() {
        const opts: Record<string, any> = {
            animation: this.animation,
            centered: this.centered,
            scrollable: this.scrollable,
            backdrop: this.backdrop,
            keyboard: this.keyboard,
            fullscreen: this.fullscreen,
        }
        if (this.size) opts["size"] = this.size
        return opts
    }

    public open() {
        const modalRef = this.ngbModal.open("ngbDemoModalContent", this.buildOptions())

        // modalRef.closed.subscribe((result: any) => {
        //     this.lastResult = result
        // })

        // modalRef.dismissed.subscribe((reason: any) => {
        //     this.lastDismissed = String(reason)
        // })
    }

    public openMultiple() {
        for (let i = 1; i <= 3; i++) {
            this.ngbModal.open("ngbDemoModalContent", this.buildOptions())
        }
    }

    public dismissAll() {
        this.ngbModal.dismissAll("dismissAll clicked")
    }

    public hasOpenModals(): boolean {
        return this.ngbModal.hasOpenModals()
    }

    public toggleAnimation() { this.animation = !this.animation }
    public toggleCentered() { this.centered = !this.centered }
    public toggleScrollable() { this.scrollable = !this.scrollable }
    public toggleKeyboard() { this.keyboard = !this.keyboard }
    public toggleFullscreen() { this.fullscreen = !this.fullscreen }

    public cycleSize() {
        const idx = SIZES.indexOf(this.size)
        this.size = SIZES[(idx + 1) % SIZES.length]
    }

    public cycleBackdrop() {
        const idx = BACKDROPS.indexOf(this.backdrop)
        this.backdrop = BACKDROPS[(idx + 1) % BACKDROPS.length]
    }

    static get $name() {
        return "ngbDemoModal"
    }

    static get $inject() {
        return ["ngb.modal.service"]
    }

    static get $factory(): IComponentOptions {
        return {
            controller: DemoModalComponent,
            controllerAs: "$",
            template
        }
    }
}
