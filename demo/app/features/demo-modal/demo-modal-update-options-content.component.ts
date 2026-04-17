import type { IComponentController, IComponentOptions } from "angular"
import template from "@demo/features/demo-modal/demo-modal-update-options-content.component.html?raw"
import type { NgbActiveModal } from "@ngb"


export class DemoModalUpdateOptionsContentComponent implements IComponentController {
    public ngbActiveModal!: NgbActiveModal
    public centered = false
    public size = ""
    public fullscreen = false
    public windowClass = ""
    public modalDialogClass = ""

    public toggleCentered() {
        this.centered = !this.centered
        this.update()
    }

    public cycleSize() {
        const sizes = ["", "sm", "lg", "xl"]
        const index = sizes.indexOf(this.size)

        this.size = sizes[(index + 1) % sizes.length]
        this.update()
    }

    public toggleFullscreen() {
        this.fullscreen = !this.fullscreen
        this.update()
    }

    public toggleClasses() {
        const enabled = this.windowClass || this.modalDialogClass

        this.windowClass = enabled ? "" : "border border-success"
        this.modalDialogClass = enabled ? "" : "shadow-lg"
        this.update()
    }

    private update() {
        this.ngbActiveModal.update({
            centered: this.centered,
            size: this.size,
            fullscreen: this.fullscreen,
            windowClass: this.windowClass,
            modalDialogClass: this.modalDialogClass,
        })
    }

    static get $name() {
        return "ngbDemoModalUpdateOptionsContent"
    }

    static get $factory(): IComponentOptions {
        return {
            controller: DemoModalUpdateOptionsContentComponent,
            controllerAs: "$",
            template,
            bindings: {
                ngbActiveModal: "<"
            }
        }
    }
}
