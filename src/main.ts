import angular, { type IController } from "angular"
import { NgbModule } from "@ngb"
import "node_modules/bootstrap/dist/css/bootstrap.css"
import { NgbModal } from "@/modal/ngb-modal.service"

class ModalDemoContentController implements IController {
    public ngbActiveModal!: {
        close: (result?: any) => void
        dismiss: (reason?: any) => void
    }

    $onInit() {
        void this.ngbActiveModal
    }

    static get $name() {
        return "modalDemoContent"
    }

    static get $factory(): angular.IComponentOptions {
        return {
            bindings: {
                ngbActiveModal: "<"
            },
            controller: ModalDemoContentController,
            controllerAs: "$",
            template: `
                <div class="modal-header">
                    <h5 class="modal-title">Ngb Modal Demo</h5>
                    <button type="button" class="btn-close" aria-label="Close" ng-click="$.ngbActiveModal.dismiss('x')"></button>
                </div>
                <div class="modal-body">
                    Contenido de prueba para modal.
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" ng-click="$.ngbActiveModal.dismiss('cancel')">Cancelar</button>
                    <button type="button" class="btn btn-primary" ng-click="$.ngbActiveModal.close('ok')">Aceptar</button>
                </div>
            `
        }
    }
}

const app = angular.module("ngb.test", [NgbModule.name])

class AppController implements IController {
    private collapse = true
    public alertClosed = false
    public progressValue = 68
    public stripedProgress = 42
    public dropdownOpen = false
    public activeNavId: number = 0
    public lastModalResult = "sin abrir"

    constructor(private ngbModal: NgbModal) { }

    get isCollapsed() {
        return this.collapse
    }

    set isCollapsed(value: boolean) {
        this.collapse = value
    }

    public onAlertClosed() {
        this.alertClosed = true
    }

    public openDemoModal() {
        this.ngbModal.open("modalDemoContent", { backdrop: true, animation: true })
            .then(modalRef => {
                modalRef.result
                    .then(result => {
                        this.lastModalResult = `close: ${result ?? ""}`
                    })
                    .catch(reason => {
                        this.lastModalResult = `dismiss: ${reason ?? ""}`
                    })
            })
    }

    static get $inject() {
        return [NgbModal.$name]
    }

    static get $name() {
        return "ngb.app"
    }
}

app.component(ModalDemoContentController.$name, ModalDemoContentController.$factory)
app.controller(AppController.$name, AppController)
