import type {
    ICompileService,
    IDeferred,
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

type EmbeddedViewRef<C = any> = {
    context: C
    rootNodes: JQLite
    destroy: () => void
}

type TemplateRef<C = any> = {
    createEmbeddedView: (context?: C) => EmbeddedViewRef<C>
}

type ModalScope = IScope & {
    activeModal: NgbActiveModal,
    [key: string]: any
}

export enum NgbModalDismissReasons {
    BACKDROP_CLICK = 'backdrop-click',
    ESC = 'esc',
}

export class NgbModal {
    private currentActiveInstances: any[] = []

    constructor(
        private $rootScope: IRootScopeService,
        private $compile: ICompileService,
        private $q: IQService,
        private $config: NgbModalConfig,
        private activeModalFactory: NgbActiveModalFactory
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

    open(target: string, config?: NgbModalOptions): Promise<ModalRef>
    open(target: TemplateRef, config?: NgbModalOptions): Promise<ModalRef>

    public open(target: string | TemplateRef, config?: NgbModalOptions) {
        const isComponent = angular.isString(target)

        if (isComponent) return this.openComponent(target, config);
        return this.openTemplate(target, config)
    }

    private async openComponent(name: string, config?: NgbModalOptions) {
        const deferred = this.$q.defer<ModalRef>()
        const parentScope = this.$rootScope.$new(true)

        const modalScope = parentScope.$new() as ModalScope
        const backdropScope = parentScope.$new()
        const windowScope = parentScope.$new()

        const modalRef = new ModalRef(parentScope, this.$q)
        const activeModal = this.activeModalFactory.create(modalRef)

        modalScope.activeModal = activeModal
        angular.extend(modalScope, config?.bindings)

        const attrs = Object.keys(config?.bindings || {})
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

        const hasBackdrop = config?.backdrop ?? this.$config.backdrop

        let backdrop: JQLite | undefined
        if (hasBackdrop) {
            backdrop = this.appendBackdrop(backdropScope, config)
        }

        const window = this.createWindow(
            compiled,
            activeModal,
            windowScope,
            config
        )

        const listener = parentScope.$on(NgbModalCloseEvent, async (event, instance) => {
            listener()
            event.stopPropagation?.()

            const windowCtrl = angular.element(window).controller(NgbModalWindowComponent.$name) as NgbModalWindowComponent | undefined
            const backdropCtrl = angular.element(backdrop ?? "").controller(NgbModalBackdropComponent.$name) as NgbModalBackdropComponent | undefined

            await this.$q.all([windowCtrl?.remove(), backdropCtrl?.remove()])
            parentScope.$destroy()

            this.currentActiveInstances = this.currentActiveInstances.filter(ctrl => ctrl !== instance)
        })

        return deferred.promise
    }

    private async openTemplate(target: TemplateRef, config?: NgbModalOptions) {
        const deferred = this.$q.defer<ModalRef>()
        const root = this.$rootScope.$new(true)

        const windowScope = root.$new()
        const backdropScope = root.$new()

        const modalRef = new ModalRef(root, this.$q)
        const activeModal = this.activeModalFactory.create(modalRef)

        const view = target.createEmbeddedView({ $implicit: modalRef, ...config?.bindings })
        const container = angular.element("<div></div>")

        modalRef.componentInstance = view.context
        container.append(view.rootNodes)

        const hasBackdrop = config?.backdrop ?? this.$config.backdrop

        let backdrop: JQLite | undefined
        if (hasBackdrop) {
            backdrop = this.appendBackdrop(backdropScope, config)
        }

        const window = this.createWindow(
            container,
            activeModal,
            windowScope,
            config
        )

        const listener = root.$on(NgbModalCloseEvent, (event, instance) => {
            listener()
            event.stopPropagation?.()

            const windowCtrl = angular.element(window).controller(NgbModalWindowComponent.$name) as NgbModalWindowComponent | undefined
            const backdropCtrl = angular.element(backdrop ?? "").controller(NgbModalBackdropComponent.$name) as NgbModalBackdropComponent | undefined

            const finish = this.$q.all([windowCtrl?.remove(), backdropCtrl?.remove()])

            const onFinish = () => {
                root.$destroy()
                view.destroy()

                this.currentActiveInstances = this.currentActiveInstances.filter(ctrl => ctrl !== instance)
            }

            finish.then(onFinish)
        })

        deferred.resolve(modalRef)
        return deferred.promise
    }

    //#region $angular

    static get $name() {
        return "ngbModal"
    }

    static get $inject() {
        return ['$rootScope', '$compile', '$q', NgbModalConfig.$name, NgbActiveModalFactory.$name]
    }

    //#endregion
}

export class ModalRef {
    private currentResult!: IDeferred<any>
    private currentComponentInstance!: any

    get componentInstance() {
        return this.currentComponentInstance
    }

    set componentInstance(instance) {
        this.currentComponentInstance = instance
    }

    get result() {
        return this.currentResult.promise
    }

    constructor(
        private scope: IScope,
        private $q: IQService,
    ) {
        this.currentResult = this.$q.defer()
    }

    public close(result: any) {
        this.currentResult.resolve(result)
        this.clear()
    }

    public dismiss(reason?: any) {
        this.currentResult.reject(reason)
        this.clear()
    }

    private clear() {
        this.scope.$emit(NgbModalCloseEvent, this.componentInstance)
    }
}
