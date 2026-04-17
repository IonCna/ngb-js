import type { IAugmentedJQuery, ICompileService, IDocumentService, IQService, IScope, ITimeoutService } from "angular"
import { ngbRunTransition, type NgbTransitionStartFn } from "."
import angular from "angular"

export interface ComponentRef<T = any> {
    componentInstance: T,
    $scope: IScope,
    $element: IAugmentedJQuery
}

export interface IPopupService {
    open(): void
    close(): void
}

const popupTransition: NgbTransitionStartFn = (element) => {
    element.removeClass("show")
}

class PopupService<T> {
    private _windowRef: ComponentRef<T> | null = null
    private _contentRef: ComponentRef<T> | null = null

    constructor(
        private $document: IDocumentService,
        private $compile: ICompileService,
        private $timeout: ITimeoutService,
        private $q: IQService
    ) { }

    open() {}
    close(animation = false) {
        if(!this._windowRef) {
            return this.$q.resolve()
        }

        return ngbRunTransition(this.$q, this.$timeout, this._windowRef?.$element, popupTransition, {
            animation, runningTransition: "stop"
        }).then(() => {
            this._contentRef?.$scope.$destroy()
            this._contentRef = null

            this._windowRef?.$scope.$destroy()
            this._windowRef = null
        })
    }

    private _getContentRef(content?: string, context?: any): ComponentRef {
        
    }
}

export class PopupFactory {
    constructor(
        private $document: IDocumentService,
        private $compile: ICompileService,
        private $timeout: ITimeoutService,
        private $q: IQService
    ) { }

    $create(_componentType: string) {
        return new PopupService(this.$document, this.$compile, this.$timeout, this.$q)
    }

    static get $inject() {
        return ["$document", "$compile", "$timeout", "$q"]
    }

    static get $name() {
        return "ngb.popup.factory"
    }
}