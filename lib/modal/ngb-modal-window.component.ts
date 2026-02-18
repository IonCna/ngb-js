import angular from "angular"
import type { IAugmentedJQuery, IComponentController, IComponentOptions, IDocumentService, IPromise } from "angular"
import { NgbModalDismissReasons } from "@/modal/ngb-modal.model"
import type { NgbModalOptions } from "./ngb-modal.module"
import { NgbModalConfig } from "./ngb-modal-config.service"
import { NgbAnimationFactory } from "@/ngb-animation.factory"
import type { NgbActiveModal } from "@/modal/ngb-active-modal.factory"
import { NgbModalStackService } from "@/modal/ngb-modal-stack.service"
import template from "@/modal/ngb-modal-window.component.html?raw"

const ESC_KEY = "Escape"
const TAB_KEY = "Tab"

export class NgbModalWindowComponent implements IComponentController {
    public modal!: JQLite
    private ngbActiveModal!: NgbActiveModal
    private body!: JQLite
    private config!: NgbModalOptions
    private container!: JQLite
    private keyboard!: boolean
    private isPlayingStaticAnimation!: boolean
    private dialog!: JQLite

    private animation!: boolean
    public fullscreenClass: string | null = null
    private readonly boundDocumentClick = (event: JQueryEventObject) => this.onDocumentClick(event)
    private readonly boundKeyDown = (event: JQueryEventObject) => this.onKeyDown(event)
    private ngbRunTransition?: ($element: IAugmentedJQuery, startFn: () => void) => IPromise<void>

    constructor(
        private $element: JQLite,
        private $document: IDocumentService,
        private $ngbConfig: NgbModalConfig,
        private ngbAnimationFactory: NgbAnimationFactory,
        private modalStackService: NgbModalStackService
    ) { }

    $onInit(): void {
        this.animation = this.config?.animation ?? this.$ngbConfig.animation
        if (this.config?.fullscreen) {
            const isStr = angular.isString(this.config.fullscreen)
            this.fullscreenClass = isStr
                ? `modal-fullscreen-${this.config.fullscreen}-down`
                : "modal-fullscreen"
        }
        this.ngbRunTransition = this.ngbAnimationFactory.$create()
    }

    $onDestroy() {
        this.$element.off("click", this.boundDocumentClick);
        this.body?.off("keydown", this.boundKeyDown)
    }

    $postLink() {
        this.body = this.$document.find("body")
        this.keyboard = this.config?.keyboard ?? true

        const [host] = Array.from(this.$element)
        const dialogHost = host.querySelector("[dialog-host]")
        const modalHost = host.querySelector("[modal-host]")
        if (!dialogHost || !modalHost) return

        this.dialog = angular.element(dialogHost)
        angular.element(modalHost).append(this.modal)

        this.config?.windowClass && this.$element.addClass(this.config?.windowClass)

        this.config?.ariaDescribedBy && this.$element.attr("aria-describedby", this.config.ariaDescribedBy);
        this.config?.ariaLabelledBy && this.$element.attr("aria-labelledby", this.config.ariaLabelledBy!)

        this.$element.addClass("modal")
        this.animation && this.$element.addClass("fade")
        this.$element.css("display", "block")
        this.$element.attr("tabindex", "-1")
        this.$element.attr("aria-modal", "true")
        this.$element.attr("role", this.config?.role ?? "dialog")
        this.$element.css("z-index", `${1055 + (((this.config.__stackLevel ?? 1) - 1) * 20)}`)

        if (this.config.__stackId) {
            this.modalStackService.registerModalElement(this.config.__stackId, this.$element[0] as HTMLElement)
        }

        this.$element.on("click", this.boundDocumentClick)

        this.keyboard && this.body.on("keydown", this.boundKeyDown)

        const isStr = angular.isString(this.config?.container)
        this.container = isStr ? this.resolveContainer(this.config.container as string) : angular.element(this.config.container ?? this.body)
        this.container.append(this.$element)
        this.enter()
        this.focusInitialElement()
    }

    public async remove() {
        if (this.animation) {
            await this.ngbRunTransition?.(this.$element, () => this.$element.removeClass("show"))
        }
        this.$element.remove()
        this.modal.remove()
    }

    private onKeyDown(event: JQueryEventObject) {
        if (!this.modalStackService.isTop(this.config.__stackId)) return

        if (event.key === TAB_KEY) {
            this.trapFocus(event)
            return
        }

        if (event.key !== ESC_KEY) return
        void this.close(NgbModalDismissReasons.ESC)
    }

    private async close(reason = NgbModalDismissReasons.BACKDROP_CLICK) {
        const beforeDismissExist = angular.isFunction(this.config?.beforeDismiss)

        if (!beforeDismissExist) {
            this.ngbActiveModal.dismiss(reason)
            return true
        }

        const { beforeDismiss } = this.config!
        const result = await beforeDismiss!()

        if (!result) return false

        this.ngbActiveModal.dismiss(reason)
        return true
    }

    private onDocumentClick(event: JQueryEventObject) {
        if (!this.modalStackService.isTop(this.config.__stackId)) return
        if (this.isPlayingStaticAnimation) return
        this.isPlayingStaticAnimation = true

        if (this.dialog[0].contains(event.target)) {
            this.isPlayingStaticAnimation = false
            return
        }

        const isBtnOrLink = event.target instanceof HTMLButtonElement || event.target instanceof HTMLAnchorElement
        if (isBtnOrLink) {
            this.isPlayingStaticAnimation = false
            return
        }

        const isStatic = angular.isString(this.config?.backdrop)
        const hasBackdrop = this.config?.backdrop ?? this.$ngbConfig.backdrop
        if (hasBackdrop === false) {
            this.isPlayingStaticAnimation = false
            return
        }

        if (isStatic) {
            const modalStaticClass = "modal-static"
            this.$element.css("overflow-y", "hidden")

            const handler = () => {
                this.$element.off("transitionend", handler)
                this.$element.removeClass(modalStaticClass)
                this.$element.css("overflow-y", "")
                this.isPlayingStaticAnimation = false
            }

            this.$element.on("transitionend", handler)
            this.$element.addClass(modalStaticClass)

            return
        }

        event.preventDefault()
        void this.close().then(dismissed => {
            if (!dismissed) {
                this.isPlayingStaticAnimation = false
            }
        })
    }

    private focusInitialElement() {
        const focusables = this.getFocusableElements()
        if (focusables.length > 0) {
            const [focusable] = focusables
            focusable.focus()
            
            return
        }

        const [native] = Array.from(this.$element)
        native.focus()
    }

    private getFocusableElements() {
        const [dialogEl] = Array.from(this.dialog) as HTMLElement[]
        if (!dialogEl) return [] as HTMLElement[]

        const selector = [
            "a[href]",
            "button:not([disabled])",
            "textarea:not([disabled])",
            "input:not([disabled])",
            "select:not([disabled])",
            "[tabindex]:not([tabindex='-1'])"
        ].join(",")

        return Array.from(dialogEl.querySelectorAll(selector))
            .filter(el => el instanceof HTMLElement && !el.hasAttribute("disabled")) as HTMLElement[]
    }

    private trapFocus(event: JQueryEventObject) {
        const nativeEvent = event as unknown as KeyboardEvent
        const focusables = this.getFocusableElements()
        if (focusables.length === 0) {
            nativeEvent.preventDefault()
            ;(this.$element[0] as HTMLElement).focus()
            return
        }

        const active = document.activeElement as HTMLElement | null
        const first = focusables[0]
        const last = focusables[focusables.length - 1]
        const isShift = nativeEvent.shiftKey

        if (!isShift && active === last) {
            nativeEvent.preventDefault()
            first.focus()
            return
        }

        if (isShift && active === first) {
            nativeEvent.preventDefault()
            last.focus()
        }
    }

    private resolveContainer(target: string) {
        const searched = this.body[0].querySelector(target)
        if (!searched) {
            console.warn("custom container not found - ", target)
        }

        return angular.element(searched ?? this.body)
    }

    private enter() {
        if (!this.animation) {
            this.$element.addClass("show")
            return
        }

        this.ngbRunTransition?.(this.$element, () => this.$element.addClass("show"))
    }

    //#region $angular

    static get $inject() {
        return ['$element', '$document', NgbModalConfig.$name, NgbAnimationFactory.$name, NgbModalStackService.$name]
    }

    static get $name() {
        return 'ngbModalWindow';
    }

    static get $factory(): IComponentOptions {
        return {
            bindings: {
                modal: '<',
                ngbActiveModal: "<",
                config: "<"
            },
            controller: NgbModalWindowComponent,
            controllerAs: "$",
            template
        };
    }

    //#endregion
}
