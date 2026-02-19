import type { IAugmentedJQuery, IComponentController, IComponentOptions, IPromise } from "angular";
import { NgbAlertConfig } from "@/alert/ngb-alert-config.service"
import template from "@/alert/ngb-alert.component.html?raw"
import { NgbAnimationFactory } from "@/ngb-animation.factory"
import angular from "angular";

export class NgbAlert implements IComponentController {
    protected animation?: boolean
    protected dismissible?: boolean
    protected type?: string
    protected closed?: () => void

    private closingInProgress = false
    protected isClosed = false

    private ngbRunTransition?: ($element: IAugmentedJQuery, startFn: () => void) => IPromise<void>

    constructor(
        private $element: IAugmentedJQuery,
        private ngbAlertConfig: NgbAlertConfig,
        private ngbAnimationFactory: NgbAnimationFactory
    ) { }

    $onInit(): void {
        this.animation = this.animation ?? this.ngbAlertConfig.animation
        this.dismissible = this.dismissible ?? this.ngbAlertConfig.dismissible
        this.type = this.type ?? this.ngbAlertConfig.type

        this.ngbRunTransition = this.ngbAnimationFactory.$create()
    }

    protected async close() {
        if (this.closingInProgress || this.isClosed) return
        this.closingInProgress = true

        if (!this.animation) {
            this.isClosed = true
            this.$element.addClass("d-none")
            this.closed?.()
            return
        }

        const [native] = Array.from(this.$element)
        const nativeWrapper = native.querySelector(".alert")

        if(!nativeWrapper) {
            throw new Error("wrapper not found")
        }

        const wrapper = angular.element(nativeWrapper)

        await this.ngbRunTransition?.(wrapper, () => {
            wrapper.removeClass("show")
        })

        this.isClosed = true
        wrapper.addClass("d-none")
        this.closed?.()
    }

    static get $name() {
        return "ngbAlert"
    }

    static get $inject() {
        return ["$element", NgbAlertConfig.$name, NgbAnimationFactory.$name]
    }

    static get $factory(): IComponentOptions {
        return {
            bindings: {
                animation: "<?",
                dismissible: "<?",
                type: "@?",
                closed: "&?"
            },
            transclude: true,
            controller: NgbAlert,
            controllerAs: "$",
            template
        }
    }
}
