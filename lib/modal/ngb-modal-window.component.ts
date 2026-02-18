import angular from "angular"
import type { IAugmentedJQuery, IComponentController, IComponentOptions, IDocumentService, IPromise, IQService } from "angular"
import { NgbModalDismissReasons } from "./ngb-modal.service"
import type { NgbModalOptions } from "./ngb-modal.module"
import { NgbModalConfig } from "./ngb-modal-config.service"
import { NgbAnimationFactory } from "@/ngb-animation.factory"
import type { NgbActiveModal } from "@/modal/ngb-active-modal.factory"
import template from "@/modal/ngb-modal-window.component.html?raw"

const ESC_KEY = "Escape"

export class NgbModalWindowComponent implements IComponentController {
    public modal!: JQLite
    private ngbActiveModal!: NgbActiveModal
    private body!: JQLite
    private config!: NgbModalOptions
    private container!: JQLite
    private keyboard!: boolean
    private isPlayingStaticAnimation!: boolean
    private dialog!: JQLite
    private originalBodyOverflow = ""
    private originalBodyPaddingRight = ""

    private animation!: boolean
    public fullscreenClass: string | null = null
    private readonly boundDocumentClick = (event: JQueryEventObject) => this.onDocumentClick(event)
    private readonly boundKeyDown = (event: JQueryEventObject) => this.onKeyDown(event)
    private ngbRunTransition?: ($element: IAugmentedJQuery, startFn: () => void) => IPromise<void>

    constructor(
        private $element: JQLite,
        private $document: IDocumentService,
        private $ngbConfig: NgbModalConfig,
        private $q: IQService,
        private ngbAnimationFactory: NgbAnimationFactory
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
        this.restoreBodyStyles()
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

        this.lockBodyScroll()

        this.$element.on("click", this.boundDocumentClick)

        this.keyboard && this.body.on("keydown", this.boundKeyDown)

        const isStr = angular.isString(this.config?.container)

        if (isStr) {
            const target = this.config.container as string
            const searched = this.body[0].querySelector(target)

            !searched && console.warn("custom container not found - ", target)

            this.container = angular.element(
                searched ?? this.body
            )

            if (!this.animation) {
                this.$element.addClass("show")
                this.container.append(this.$element)
                return
            }

            this.container.append(this.$element)
            this.ngbRunTransition?.(this.$element, () => this.$element.addClass("show"))

            return
        }

        this.container = angular.element(this.config.container ?? this.body)

        if (!this.animation) {
            this.$element.addClass("show")
            this.container.append(this.$element)
            return
        }

        this.container.append(this.$element)
        this.ngbRunTransition?.(this.$element, () => this.$element.addClass("show"))
    }

    public async remove() {
        const deferred = this.$q.defer<boolean>()

        if (!this.animation) {
            this.restoreBodyStyles()
            this.$element.remove()
            this.modal.remove()

            deferred.resolve(true)
            return
        }

        await this.ngbRunTransition?.(this.$element, () => {
            this.$element.removeClass("show")
        })
        this.restoreBodyStyles()
        this.$element.remove()
        this.modal.remove()
        deferred.resolve(true)
        return deferred.promise
    }

    private onKeyDown(event: JQueryEventObject) {
        if (event.key !== ESC_KEY) return
        this.close(NgbModalDismissReasons.ESC)
    }

    private async close(reason = NgbModalDismissReasons.BACKDROP_CLICK) {
        const beforeDismissExist = angular.isFunction(this.config?.beforeDismiss)

        if (!beforeDismissExist) {
            this.ngbActiveModal.dismiss(reason)
            return
        }

        const { beforeDismiss } = this.config!
        const result = await beforeDismiss!()

        if (!result) return

        this.ngbActiveModal.dismiss(reason)
    }

    private onDocumentClick(event: JQueryEventObject) {
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
        this.close()
    }

    private getScrollbarWidth() {
        return Math.max(0, window.innerWidth - document.documentElement.clientWidth)
    }

    private lockBodyScroll() {
        const [bodyEl] = Array.from(this.body) as HTMLElement[]
        if (!bodyEl) return

        this.originalBodyOverflow = bodyEl.style.overflow
        this.originalBodyPaddingRight = bodyEl.style.paddingRight

        this.body.addClass("modal-open")
        this.body.css("overflow", "hidden")

        const width = this.getScrollbarWidth()
        if (width > 0) {
            this.body.css("padding-right", `${width}px`)
        }
    }

    private restoreBodyStyles() {
        const [bodyEl] = Array.from(this.body) as HTMLElement[]
        if (!bodyEl) return

        this.body.removeClass("modal-open")
        this.body.css("overflow", this.originalBodyOverflow)
        this.body.css("padding-right", this.originalBodyPaddingRight)
    }

    //#region $angular

    static get $inject() {
        return ['$element', '$document', NgbModalConfig.$name, '$q', NgbAnimationFactory.$name]
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
