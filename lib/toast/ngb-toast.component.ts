import type { IAugmentedJQuery, IComponentController, IComponentOptions, IPromise, IScope, ITranscludeFunction } from "angular";
import { NgbToastConfig } from "@/toast/ngb-toast-config.service"
import { NgbAnimationFactory } from "@/ngb-animation.factory"
import template from "@/toast/ngb-toast.component.html?raw"
import angular from "angular";

export class NgbToast implements IComponentController {
    protected animation?: boolean
    protected autohide?: boolean
    protected delay?: number
    protected header?: string

    protected hidden?: () => void
    protected shown?: () => void

    private closingInProgress = false
    private isClosed = false
    private headerTransclude?: ITranscludeFunction
    protected elementTranscluded = false
    private ngbRunTransition?: ($element: IAugmentedJQuery, startFn: () => void) => IPromise<void>

    constructor(
        private $element: IAugmentedJQuery,
        private ngbToastConfig: NgbToastConfig,
        private ngbAnimationFactory: NgbAnimationFactory,
        protected $scope: IScope
    ) { }

    $onInit(): void {
        this.animation = this.animation ?? this.ngbToastConfig.animation
        this.autohide = this.autohide ?? this.ngbToastConfig.autohide
        this.delay = this.delay ?? this.ngbToastConfig.delay

        this.ngbRunTransition = this.ngbAnimationFactory.$create()
    }

    $postLink(): void {
        this.$element.attr("role", "alert")
        this.$element.attr("aria-atomic", "true")
        this.$element.addClass("toast show d-block")

        if (this.animation) {
            this.$element.addClass("fade")
        }

        this.renderHeader()
    }

    public registerHeaderTransclude($transclude: ITranscludeFunction): void {
        this.headerTransclude = $transclude
        this.elementTranscluded = true

        this.renderHeader()
    }

    private renderHeader(): void {
        if (!this.headerTransclude) return

        const [host] = Array.from(this.$element)
        const wrapper = host.querySelector("[wrapper]")
        if (!wrapper) return

        const ngWrapper = angular.element(wrapper)
        ngWrapper.empty()

        this.headerTransclude(clone => {
            if (!clone?.length) return
            ngWrapper.append(clone)
        }, this.$element)
    }

    protected async close() {
        if (this.closingInProgress || this.isClosed) return
        this.closingInProgress = true

        if (!this.animation) {
            this.$element.removeClass("show showing")
            this.isClosed = true
            return
        }

        await this.ngbRunTransition?.(this.$element, () => {
            this.$element.addClass("showing")
        })

        this.$element.removeClass("show showing")
        this.isClosed = true
    }

    static get $name() {
        return "ngbToast"
    }

    static get $inject() {
        return [
            "$element",
            NgbToastConfig.$name,
            NgbAnimationFactory.$name,
            "$scope"
        ]
    }

    static get $factory(): IComponentOptions {
        return {
            bindings: {
                animation: "<?",
                autohide: "<?",
                delay: "<?",
                header: "@?",
                hidden: "&?ngbHidden",
                shown: "&?"
            },
            controllerAs: "$",
            transclude: true,
            controller: NgbToast,
            template
        }
    }
}
