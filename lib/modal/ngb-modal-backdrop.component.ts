import angular from "angular";
import type { IAugmentedJQuery, IComponentController, IComponentOptions, IDocumentService, IPromise } from "angular";
import { NgbModalConfig } from "./ngb-modal-config.service";
import type { NgbModalOptions } from "./ngb-modal.module"
import { NgbAnimationFactory } from "@/ngb-animation.factory"

export class NgbModalBackdropComponent implements IComponentController {
    private body!: JQLite
    private container!: JQLite
    private config!: NgbModalOptions

    private animation!: boolean
    private ngbRunTransition?: ($element: IAugmentedJQuery, startFn: () => void) => IPromise<void>

    constructor(
        private $element: JQLite,
        private $document: IDocumentService,
        private $ngbConfig: NgbModalConfig,
        private ngbAnimationFactory: NgbAnimationFactory
    ) { }

    $onInit(): void {
        this.body = this.$document.find("body")
        this.animation = this.config?.animation ?? this.$ngbConfig.animation
        this.ngbRunTransition = this.ngbAnimationFactory.$create()
    }

    $postLink(): void {
        this.config?.backdropClass && this.$element.addClass(this.config.backdropClass)

        this.$element.addClass("modal-backdrop")
        this.animation && this.$element.addClass("fade")
        this.$element.css("z-index", `${1050 + (((this.config.__stackLevel ?? 1) - 1) * 20)}`)

        this.container = angular.isString(this.config?.container)
            ? this.resolveContainer(this.config.container as string)
            : angular.element(this.config.container ?? this.body)
        this.container.append(this.$element)
        this.enter()
    }

    public async remove() {
        if (this.animation) {
            await this.ngbRunTransition?.(this.$element, () => this.$element.removeClass("show"))
        }
        this.$element.remove()
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

    static get $name() {
        return "ngbModalBackdrop"
    }

    static get $factory(): IComponentOptions {
        return {
            controller: this,
            bindings: {
                config: "<"
            }
        }
    }

    static get $inject() {
        return ['$element', '$document', NgbModalConfig.$name, NgbAnimationFactory.$name]
    }

    //#endregion
}
