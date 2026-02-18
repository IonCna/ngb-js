import type {
    ICompileService,
    IQService,
    IRootScopeService,
    IScope
} from "angular"

import { type NgbModalOptions, NgbModalWindowComponent, NgbModalBackdropComponent } from "./ngb-modal.module"

import { kebabCase } from "@/utils"
import { NgbModalConfig } from "./ngb-modal-config.service"
import angular from "angular"
import { NgbActiveModalFactory, type NgbActiveModal } from "@/modal/ngb-active-modal.factory"
import { NgbModalCloseEvent } from "@/modal/ngb-modal.events"
import { ModalRef, NgbModalRefFactory } from "@/modal/ngb-modal-ref.factory"
import { NgbModalStackFactory } from "@/modal/ngb-modal-stack.factory"

type ModalScope = IScope & {
    activeModal: NgbActiveModal,
    [key: string]: any
}

export enum NgbModalDismissReasons {
    BACKDROP_CLICK = "backdrop-click",
    ESC = "esc",
}

export class NgbModal {
    private currentActiveInstances: any[] = []

    constructor(
        private $rootScope: IRootScopeService,
        private $compile: ICompileService,
        private $q: IQService,
        private $config: NgbModalConfig,
        private activeModalFactory: NgbActiveModalFactory,
        private modalRefFactory: NgbModalRefFactory,
        private modalStackFactory: NgbModalStackFactory
    ) { }

    get activeInstances() {
        return this.currentActiveInstances
    }

    private appendBackdrop(backdropScope: IScope, config?: NgbModalOptions) {
        const scope = backdropScope as IScope & {
            config: NgbModalOptions
        }

        scope.config = config || {}

        const linkFn = this.$compile('<ngb-modal-backdrop config="config" ></ngb-modal-backdrop>')
        return linkFn(scope)
    }

    private createWindow(
        modalCompiled: JQLite,
        activeModal: NgbActiveModal,
        windowScope: IScope,
        config?: NgbModalOptions) {
        const scope = windowScope as IScope & {
            modal: JQLite,
            config: NgbModalOptions,
            ngbActiveModal: NgbActiveModal
        }

        scope.modal = modalCompiled
        scope.config = config || {}
        scope.ngbActiveModal = activeModal

        const linkFn = this.$compile('<ngb-modal-window config="config" ngb-active-modal="ngbActiveModal" modal="modal"></ngb-modal-window>')
        return linkFn(scope)
    }

    public open(target: string, config?: NgbModalOptions) {
        return this.openComponent(target, config)
    }

    private async openComponent(name: string, config?: NgbModalOptions) {
        const deferred = this.$q.defer<ModalRef>()
        const parentScope = this.$rootScope.$new(true)
        const stack = this.modalStackFactory.open(document.activeElement)
        const localConfig: NgbModalOptions = {
            ...(config || {}),
            __stackId: stack.id,
            __stackLevel: stack.level
        }

        const modalScope = parentScope.$new() as ModalScope
        const backdropScope = parentScope.$new()
        const windowScope = parentScope.$new()

        const modalRef = this.modalRefFactory.create(parentScope)
        const activeModal = this.activeModalFactory.create(modalRef)

        modalScope.activeModal = activeModal
        angular.extend(modalScope, localConfig.bindings)

        const attrs = Object.keys(localConfig.bindings || {})
            .map(key => `${kebabCase(key)}="${key}"`)
            .join(' ');

        const linkFn = this.$compile(`<${kebabCase(name)} ${attrs} ngb-active-modal="activeModal"></${kebabCase(name)}>`)
        const compiled = linkFn(modalScope)

        const watcher = modalScope.$watch(() => compiled.controller(name), instance => {
            if (!instance) return

            this.currentActiveInstances.push(instance)
            modalRef.componentInstance = instance

            watcher()

            deferred.resolve(modalRef)
        });

        const hasBackdrop = localConfig.backdrop ?? this.$config.backdrop

        let backdrop: JQLite | undefined
        if (hasBackdrop) {
            backdrop = this.appendBackdrop(backdropScope, localConfig)
        }

        const window = this.createWindow(
            compiled,
            activeModal,
            windowScope,
            localConfig
        )

        const listener = parentScope.$on(NgbModalCloseEvent, async (event, instance) => {
            listener()
            event.stopPropagation?.()

            const windowCtrl = angular.element(window).controller(NgbModalWindowComponent.$name) as NgbModalWindowComponent | undefined
            const backdropCtrl = angular.element(backdrop ?? "").controller(NgbModalBackdropComponent.$name) as NgbModalBackdropComponent | undefined

            await this.$q.all([windowCtrl?.remove(), backdropCtrl?.remove()])
            parentScope.$destroy()
            this.modalStackFactory.close(stack.id)

            this.currentActiveInstances = this.currentActiveInstances.filter(ctrl => ctrl !== instance)
        })

        return deferred.promise
    }

    //#region $angular

    static get $name() {
        return "ngbModal"
    }

    static get $inject() {
        return ['$rootScope', '$compile', '$q', NgbModalConfig.$name, NgbActiveModalFactory.$name, NgbModalRefFactory.$name, NgbModalStackFactory.$name]
    }

    //#endregion
}
