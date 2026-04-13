import type { IAugmentedJQuery, IComponentController, IComponentOptions, IDeferred, IDocumentService, IPromise, IQService, IScope, ITimeoutService } from "angular";
import template from "@/modal/ngb-modal-window.component.html?raw"
import {
    type NgbModalUpdatableOptions
} from "@/modal/ngb-modal-config.service"
import angular from "angular";
import { ngbRunTransition, toNativeElement, type INgbEvent, type NgbTransitionOptions } from "@/utils";
import { ngbModalBumpBackdropTransition, ngbModalWindowFadeInTransition, ngbModalWindowFadeOutTransition } from "./ngb-modal-window-transition";
import { getFocusableBoundaryElements } from "@/utils/focus-trap";
import { ModalDismissReasons } from "./ngb-modal-dismiss-reasons";

type NgbModalWindowUpdatableOption = Extract<keyof NgbModalUpdatableOptions, keyof NgbModalWindow>;

const WINDOW_ATTRIBUTES: NgbModalWindowUpdatableOption[] = [
    'animation',
    'ariaLabelledBy',
    'ariaDescribedBy',
    // @ts-expect-error
    'backdrop',
    'centered',
    'fullscreen',
    // @ts-expect-error
    'keyboard',
    // @ts-expect-error
    'role',
    // @ts-expect-error
    'scrollable',
    'size',
    'windowClass',
    'modalDialogClass',
] as const;

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
    protected dismissEvent?: ({ $event }: INgbEvent<any>) => void

    private _elWithFocus!: IAugmentedJQuery | null;
    private _dialogEl?: IAugmentedJQuery
    private _closed?: IDeferred<void>

    constructor(
        private $scope: IScope,
        private $element: IAugmentedJQuery,
        private $q: IQService,
        private $timeout: ITimeoutService,
        private $document: IDocumentService
    ) { }

    $onInit(): void {
        this._closed = this.$q.defer()
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

        this._show()
    }

    $onChanges(): void {
        this.$element.toggleClass("fade", this.animation)

        if (this.ariaDescribedBy) {
            this.$element.attr("aria-labelledby", this.ariaDescribedBy)
        }

        if (this.ariaDescribedBy) {
            this.$element.attr("aria-describedby", this.ariaDescribedBy)
        }

        this.$element.attr("role", this.role)
    }

    get $fullscreenClass(): string {
        const isStr = angular.isString(this.fullscreen)
        const staticStr = isStr ? `modal-fullscreen-${this.fullscreen}-down` : ''

        return this.fullscreen === true ? 'modal-fullscreen' : staticStr
    }

    get $modalSizeClass() {
        return this.size ? `modal-${this.size}` : ''
    }

    get $modalCentredClass() {
        return this.centered ? 'modal-dialog-centered' : ''
    }

    get $modalScrollableClass() {
        return this.scrollable ? 'modal-dialog-scrollable' : ''
    }

    get $modalDialogClass() {
        return this.modalDialogClass ? this.modalDialogClass : ''
    }

    public dismiss(reason: any): void {
        this.dismissEvent?.({ $event: reason })
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
            // TODO aquí también ver traducción a Subject
            // this.hidden()
        })

        this._disableEventHandling()
        this._restoreFocus()

        return transitions
    }

    public updateOptions(options: NgbModalUpdatableOptions) {
        this.$scope.$evalAsync(() => WINDOW_ATTRIBUTES.forEach(option => {
            if (angular.isDefined(options[option])) {
                (this as any)[option] = options[option]
            }
        }));
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
            // TODO traducir Subject a AngularJS scope.$on?
            // shown()
        })

        this._enableEventHandling()
        this._setFocus()
    }

    private _setFocus() {
        const native = toNativeElement(this.$element)
        const document = toNativeElement<Document>(this.$document)
        if (!native.contains(document.activeElement)) {
            const autoFocusable = native.querySelector("[ngb-auto-focus]") as HTMLElement
            const [firstFocusable] = getFocusableBoundaryElements(this.$element)

            const elementToFocus = autoFocusable || firstFocusable || native
            elementToFocus.focus()
        }
    }

    private _enableEventHandling() {
        const onKeyDown = (event: JQueryEventObject) => {
            if (event.key !== "Escape") return

            if (this.keyboard && event.defaultPrevented) requestAnimationFrame(() => {
                this.dismiss(ModalDismissReasons.ESC)
            })

            if (this.backdrop === "static") {
                this._bumpBackdrop()
            }
        }

        this.$element.on("keydown", onKeyDown)

        this._closed?.promise.then(() => {
            this.$element.off("keydown", onKeyDown)
        })
    }

    private _disableEventHandling() {
        this._closed?.resolve()
    }

    private _restoreFocus() {
        const body = toNativeElement<HTMLBodyElement>(
            this.$document.find("body")
        )

        const elWithFocus = toNativeElement(this._elWithFocus ?? this.$document.find("body"))

        const validElementToFocus = elWithFocus && elWithFocus["focus"] && body.contains(elWithFocus)
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
        return ["$scope", "$element", "$q", "$timeout", "$document"]
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
                dismissEvent: "&?dismiss"
            }
        }
    }
}
