import type { ICompileService, IController, IDirective, IOnChangesObject } from "angular";
import { NgbNav } from "./ngb-nav.directive"
import { navMap } from "./ngb-nav.module"
import angular from "angular";
import { NgbNavChangeOutletEvent } from "./ngb-nav.events";

export class NgbNavOutlet implements IController {
    private ngbNavOutlet!: NgbNav
    private isChanging: boolean = false
    private outletWatcher?: () => void

    constructor(
        private $element: JQLite,
        private $compile: ICompileService
    ) { }

    $postLink(): void {
        this.$element.addClass("tab-content mt-2");
    }

    $onDestroy(): void {
        this.outletWatcher?.()
    }

    $onChanges(onChangesObj: IOnChangesObject): void {
        const isFirst = onChangesObj.ngbNavOutlet.isFirstChange()
        if (isFirst) return

        this.render()
    }

    private render(id?: any) {
        if(this.isChanging) return
        this.isChanging = true

        const nav = navMap.get(this.ngbNavOutlet)!
        const container = angular.element("<div ngb-nav-pane></div>")
        container.addClass("tab-pane")

        const targetId = id ?? nav.config.activeId
        const target = nav.contents.get(targetId)
        if (!target) {
            this.isChanging = false
            return
        }

        const { toggleFn, transcludeFn } = target
        this.$element.empty()

        transcludeFn((clone, scope) => {
            if (!clone || !scope) return

            const linkFn = this.$compile(container)
            const compiled = linkFn(scope)

            compiled.append(clone)

            this.$element.append(compiled)
            toggleFn(true)
        }, container)

        if (!this.outletWatcher) {
            this.outletWatcher = nav.scope.$on(NgbNavChangeOutletEvent, (event, nextId) => {
                event.stopPropagation?.()
                event.preventDefault()
                this.render(nextId)
            })
        }

        this.isChanging = false
    }

    //#region $angular

    static get $name() {
        return "ngbNavOutlet"
    }

    static get $inject() {
        return ['$element', '$compile']
    }

    static get $factory(): () => IDirective {
        return () => ({
            controller: this,
            bindToController: true,
            restrict: "A",
            scope: {
                ngbNavOutlet: "<"
            }
        })
    }

    //#endregion
}
