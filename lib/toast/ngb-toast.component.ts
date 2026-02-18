import type { IAugmentedJQuery, IComponentController, IComponentOptions, IScope, ITranscludeFunction } from "angular";
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

    constructor(
        private $element: IAugmentedJQuery,
        private ngbToastConfig: NgbToastConfig,
        private ngbAnimationFactory: NgbAnimationFactory,
        private $scope: IScope
    ) { }

    $onInit(): void {
        this.animation = this.animation ?? this.ngbToastConfig.animation
        this.autohide = this.autohide ?? this.ngbToastConfig.autohide
        this.delay = this.delay ?? this.ngbToastConfig.delay
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
        const scopeWithPostDigest = this.$scope as IScope & { $$postDigest: (fn: () => void) => void }
        scopeWithPostDigest.$$postDigest(() => this.renderHeader())
    }

    private renderHeader(): void {
        if (!this.headerTransclude) return

        const host = this.$element[0] as HTMLElement | undefined
        const wrapper = host?.querySelector("[ngbtoastheaderwrapper]")
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

        const ngbRunTransition = this.ngbAnimationFactory.$create()

        await ngbRunTransition(this.$element, () => {
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
