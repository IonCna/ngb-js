import type { IAugmentedJQuery, IComponentController, IComponentOptions, IDeferred, IDocumentService, ILogService, IPromise, IQService, IScope, ITimeoutService } from "angular";
import template from "@ngb/modal/ngb-modal-window.component.html"
import {
    type NgbModalUpdatableOptions
} from "@ngb/modal/ngb-modal-config.service"
import angular from "angular";
import { ngbRunTransition, toNativeElement, type NgbTransitionOptions } from "@ngb/utils";
import { ngbModalBumpBackdropTransition, ngbModalWindowFadeInTransition, ngbModalWindowFadeOutTransition } from "@ngb/modal/ngb-modal-window-transition";
import { getFocusableBoundaryElements } from "@ngb/utils/focus-trap";
import { ModalDismissReasons } from "@ngb/modal/ngb-modal-dismiss-reasons";

const WINDOW_ATTRIBUTES = [
    'animation',
    'ariaLabelledBy',
    'ariaDescribedBy',
    'backdrop',
    'centered',
    'fullscreen',
    'keyboard',
    'role',
    'scrollable',
    'size',
    'windowClass',
    'modalDialogClass',
] as const;

type WindowAttribute = (typeof WINDOW_ATTRIBUTES)[number];
type WindowOptions = Partial<Record<WindowAttribute, unknown>> & NgbModalUpdatableOptions;

export class NgbModalWindow implements IComponentController {
    public animation?: boolean;
    public ariaLabelledBy?: string;
    public ariaDescribedBy?: string;
    public backdrop: boolean | string = true;
    public centered?: string;
    public fullscreen?: string | boolean;
    public keyboard = true;
    public role: string = 'dialog';
    public scrollable?: string;
    public size?: string;
    public windowClass?: string;
    public modalDialogClass?: string;
    
    private _elWithFocus: Element | null = null;
    private _dialogEl?: IAugmentedJQuery
    private _eventHandlingStop?: IDeferred<void>
    private _shown!: IDeferred<void>
    private _hidden!: IDeferred<void>
    private _dismissListener?: (reason: any) => void
    private _appliedWindowClass?: string

    constructor(
        private $scope: IScope,
        private $element: IAugmentedJQuery,
        private $q: IQService,
        private $timeout: ITimeoutService,
        private $document: IDocumentService,
        private $log: ILogService
    ) { }

    $onInit(): void {
        const document = toNativeElement<Document>(this.$document)

        this._shown = this.$q.defer()
        this._hidden = this.$q.defer()
        this._elWithFocus = document.activeElement
    }

    $onDestroy(): void {
        this._disableEventHandling()
    }

    $postLink(): void {
        this.$element.addClass("modal d-block")
        this.$element.attr("tabindex", -1)
        this.$element.attr("aria-modal", "true")

        const nativeDialog = toNativeElement(this.$element).querySelector(".modal-dialog")

        if (!nativeDialog) throw new Error("modal-dialog element is not present in template!")
        this._dialogEl = angular.element(nativeDialog)

        this.$timeout(() => this._show(), 0)
    }

    $onChanges(): void {
        this.$element.toggleClass("fade", this.animation)

        if (this._appliedWindowClass) this._appliedWindowClass.split(/\s+/).filter(Boolean).forEach(className => {
            this.$element.removeClass(className)
        })

        if (this.windowClass) this.windowClass.split(/\s+/).filter(Boolean).forEach(className => {
            this.$element.addClass(className)
        })

        this._appliedWindowClass = this.windowClass

        if (this.ariaLabelledBy) this.$element.attr("aria-labelledby", this.ariaLabelledBy)
        else this.$element.removeAttr("aria-labelledby")


        if (this.ariaDescribedBy) this.$element.attr("aria-describedby", this.ariaDescribedBy)
        else this.$element.removeAttr("aria-describedby")

        if (this.role) this.$element.attr("role", this.role)
        else this.$element.removeAttr("role")
    }

    public dismiss(reason: any): void {
        this._dismissListener?.(reason)
    }

    public onDismiss(listener: (reason: any) => void): void {
        this._dismissListener = listener
    }

    get shown(): IPromise<void> {
        return this._shown.promise
    }

    get hidden(): IPromise<void> {
        return this._hidden.promise
    }

    public hide(): IPromise<void> {
        const context: NgbTransitionOptions<any> = {
            animation: Boolean(this.animation),
            runningTransition: 'stop'
        };

        const windowTransition = ngbRunTransition(
            this.$q,
            this.$timeout,
            this.$element,
            ngbModalWindowFadeOutTransition,
            context
        )

        if (!this._dialogEl) throw new Error("dialog element is undefined")

        const dialogTransition = ngbRunTransition(
            this.$q,
            this.$timeout,
            this._dialogEl,
            angular.noop,
            context
        )

        const transitions = this.$q.all([windowTransition, dialogTransition]).then(() => {
            this._hidden.resolve()
        })

        this._disableEventHandling()
        this._restoreFocus()

        return transitions
    }

    public updateOptions(options: NgbModalUpdatableOptions) {
        const source: WindowOptions = options

        this.$scope.$evalAsync(() => {
            WINDOW_ATTRIBUTES.forEach(option => {
                if (angular.isDefined(source[option])) {
                    Object.assign(this, { [option]: source[option] })
                }
            })

            this.$onChanges()
        });
    }

    private _show() {
        const context: NgbTransitionOptions<any> = {
            animation: Boolean(this.animation),
            runningTransition: "continue"
        }

        const windowTransition = ngbRunTransition(this.$q, this.$timeout, this.$element, ngbModalWindowFadeInTransition, context)

        if (!this._dialogEl) throw new Error("dialog element is undefined")

        const dialogTransition = ngbRunTransition(
            this.$q,
            this.$timeout,
            this._dialogEl,
            angular.noop,
            context
        )

        this.$q.all([windowTransition, dialogTransition]).then(() => {
            this._shown.resolve()
        })

        this._enableEventHandling()
        this._setFocus()
    }

    private _setFocus() {
        const native = toNativeElement(this.$element)
        const document = toNativeElement<Document>(this.$document)
        if (!native.contains(document.activeElement)) {
            const autoFocusable = native.querySelector("[ngbAutofocus]") as HTMLElement
            const [firstFocusable] = getFocusableBoundaryElements(this.$element)

            const elementToFocus = autoFocusable || firstFocusable || native
            elementToFocus.focus()
        }
    }

    private _enableEventHandling() {
        this._disableEventHandling()
        this._eventHandlingStop = this.$q.defer()

        const eventHandlingStop = this._eventHandlingStop.promise
        const native = toNativeElement(this.$element)
        const dialog = this._dialogEl
        let preventClose = false
        let onMouseUp: ((event: JQueryEventObject) => void) | undefined

        const onKeyDown = (event: JQueryEventObject) => {
            this.$log.info("ngbModalWindow keydown", event)

            if (event.key !== "Escape") return

            if (this.keyboard) {
                requestAnimationFrame(() => {
                    if (!event.defaultPrevented) this.$scope.$evalAsync(() => {
                        this.dismiss(ModalDismissReasons.ESC)
                    })
                })

                return
            }

            if (this.backdrop === "static") {
                this._bumpBackdrop()
            }
        }

        const onDialogMouseDown = () => {
            this.$log.info("ngbModalWindow dialog mousedown")

            preventClose = false
            onMouseUp = (event: JQueryEventObject) => {
                this.$log.info("ngbModalWindow mouseup", event)

                const mouseUpHandler = onMouseUp
                onMouseUp = undefined

                if (mouseUpHandler) {
                    this.$element.off("mouseup", mouseUpHandler)
                }

                if (event.target === native) {
                    preventClose = true
                }
            }

            this.$element.on("mouseup", onMouseUp)
        }

        const onClick = (event: JQueryEventObject) => {
            this.$log.info("ngbModalWindow click", event)

            if (event.target === native) {
                if (this.backdrop === "static") {
                    this._bumpBackdrop()
                }

                if (this.backdrop === true && !preventClose) {
                    this.$scope.$evalAsync(() => {
                        this.dismiss(ModalDismissReasons.BACKDROP_CLICK)
                    })
                }
            }

            preventClose = false
        }

        this.$element.on("keydown", onKeyDown)
        dialog?.on("mousedown", onDialogMouseDown)
        this.$element.on("click", onClick)

        eventHandlingStop.then(() => {
            this.$element.off("keydown", onKeyDown)
            dialog?.off("mousedown", onDialogMouseDown)
            this.$element.off("click", onClick)

            if (onMouseUp) {
                this.$element.off("mouseup", onMouseUp)
            }
        })
    }

    private _disableEventHandling() {
        this._eventHandlingStop?.resolve()
        this._eventHandlingStop = undefined
    }

    private _restoreFocus() {
        const body = toNativeElement<HTMLBodyElement>(
            this.$document.find("body")
        )

        const elWithFocus = this._elWithFocus
        const validElementToFocus = elWithFocus instanceof HTMLElement && body.contains(elWithFocus)
        const elementToFocus: HTMLElement = validElementToFocus ? elWithFocus : body

        this.$timeout(() => {
            elementToFocus.focus()
        }, 0, false)

        this._elWithFocus = null
    }

    private _bumpBackdrop() {
        if (this.backdrop !== "static") return;

        ngbRunTransition(this.$q, this.$timeout, this.$element, ngbModalBumpBackdropTransition, {
            animation: Boolean(this.animation),
            runningTransition: "continue"
        })
    }

    static get $name() {
        return "ngbModalWindow"
    }

    static get $inject() {
        return ["$scope", "$element", "$q", "$timeout", "$document", "$log"]
    }

    static get $factory(): IComponentOptions {
        return {
            controller: NgbModalWindow,
            controllerAs: "$",
            template,
            bindings: {
                animation: "<?",
                ariaLabelledBy: "<?",
                ariaDescribedBy: "<?",
                backdrop: "<?",
                centered: "<?",
                fullscreen: "<?",
                keyboard: "<?",
                role: "<?",
                scrollable: "<?",
                size: "<?",
                windowClass: "<?",
                modalDialogClass: "<?",
            }
        }
    }
}
