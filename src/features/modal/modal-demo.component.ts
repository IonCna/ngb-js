import type { IComponentOptions } from "angular"
import { NgbModal } from "@/modal/ngb-modal.service"
import { ModalDemoContentComponent } from "./modal-demo-content.component"

export class ModalDemoComponent {
    public lastResult = "sin interaccion"

    constructor(private ngbModal: NgbModal) { }

    public openModal() {
        this.ngbModal
            .open(ModalDemoContentComponent.$name, {
                animation: false,
                bindings: {
                    title: "NgbModal demo"
                }
            })
            .then(ref => ref.result
                .then(result => {
                    this.lastResult = `close: ${String(result)}`
                })
                .catch(reason => {
                    this.lastResult = `dismiss: ${String(reason)}`
                }))
            .catch(() => {
                this.lastResult = "error al abrir modal"
            })
    }

    static get $name() {
        return "ngbModalDemo"
    }

    static get $inject() {
        return [NgbModal.$name]
    }

    static get $factory(): IComponentOptions {
        return {
            controllerAs: "$",
            controller: ModalDemoComponent,
            template: `
                <div class="vstack gap-2">
                    <button type="button" class="btn btn-primary btn-sm align-self-start" ng-click="$.openModal()">
                        Abrir modal
                    </button>
                    <p class="small text-muted mb-0">Resultado: {{ $.lastResult }}</p>
                </div>
            `
        }
    }
}
