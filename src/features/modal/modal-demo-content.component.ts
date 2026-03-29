import type { IComponentOptions, IController } from "angular"

type ActiveModal = {
    close: (result?: unknown) => void
    dismiss: (reason?: unknown) => void
}

export class ModalDemoContentComponent implements IController {
    public title = "Demo modal"
    public ngbActiveModal!: ActiveModal

    static get $name() {
        return "ngbModalDemoContent"
    }

    static get $factory(): IComponentOptions {
        return {
            controllerAs: "$",
            controller: ModalDemoContentComponent,
            bindings: {
                title: "<",
                ngbActiveModal: "<"
            },
            template: `
                <div class="modal-header">
                    <h5 class="modal-title">{{ $.title }}</h5>
                    <button type="button" class="btn-close" aria-label="Close" ng-click="$.ngbActiveModal.dismiss('x')"></button>
                </div>

                <div class="modal-body">
                    <p class="mb-0">Contenido del modal de prueba.</p>
                </div>

                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" ng-click="$.ngbActiveModal.dismiss('cancel')">Cancelar</button>
                    <button type="button" class="btn btn-primary" ng-click="$.ngbActiveModal.close('ok')">Aceptar</button>
                </div>
            `
        }
    }
}
