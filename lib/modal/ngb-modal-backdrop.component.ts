import angular from "angular";
import type { IAugmentedJQuery, IComponentController, IComponentOptions, IDocumentService, IPromise, IQService } from "angular";
import { NgbModalConfig } from "./ngb-modal-config.service";
import { NgbModalDismissReasons, type NgbModalOptions } from "./ngb-modal.module"
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
        private $q: IQService,
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

        const isStr = angular.isString(this.config?.container)

        if (isStr) {
            const target = this.config.container as string
            const searched = this.body[0].querySelector(target)

            !searched && console.warn("custom container not found - ", target)

            this.container = angular.element(
                searched ?? this.body
            )

            this.container.append(this.$element)
            this.ngbRunTransition?.(this.$element, () => this.$element.addClass("show"))
            return
        }

        this.container = angular.element(this.config.container ?? this.body)

        this.container.append(this.$element)

        if (!this.animation) {
            this.$element.addClass("show")
            return
        }

        this.ngbRunTransition?.(this.$element, () => this.$element.addClass("show"))
    }

    public async remove(reason: any = NgbModalDismissReasons.BACKDROP_CLICK) {
        const deferred = this.$q.defer<void>()
        
        if (!this.animation) {
            this.$element.remove()

            deferred.resolve(reason)
            return
        }

        await this.ngbRunTransition?.(this.$element, () => {
            this.$element.removeClass("show")
        })
        this.$element.remove()
        deferred.resolve(reason)

        return deferred.promise
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
        return ['$element', '$document', NgbModalConfig.$name, '$q', NgbAnimationFactory.$name]
    }

    //#endregion
}
