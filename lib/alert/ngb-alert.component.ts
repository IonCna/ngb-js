import type { IAugmentedJQuery, IComponentController, IComponentOptions, IScope } from "angular";
import { NgbAlertConfig } from "@/alert/ngb-alert-config.service"
import template from "@/alert/ngb-alert.component.html?raw"

export interface INgbAlert {
    close(): void
}

export class NgbAlert implements IComponentController, INgbAlert {
    protected animation?: boolean
    protected dismissible?: boolean
    protected type?: string
    protected closed?: () => void

    private closingInProgress = false
    protected isClosed = false
    private isVisible = true

    constructor(
        private $element: IAugmentedJQuery,
        private ngbAlertConfig: NgbAlertConfig,
        private $scope: IScope
    ) { }

    $onInit(): void {
        this.animation = this.animation ?? this.ngbAlertConfig.animation
        this.dismissible = this.dismissible ?? this.ngbAlertConfig.dismissible
        this.type = this.type ?? this.ngbAlertConfig.type
    }

    $postLink(): void {
    }

    close() {
        if (this.closingInProgress || this.isClosed) return
        this.closingInProgress = true

        if (!this.animation) {
            this.isClosed = true
            this.isVisible = false
            this.$element.addClass("d-none")
            this.closed?.()
            return
        }
    }

    static get $name() {
        return "ngbAlert"
    }

    static get $inject() {
        return [
            "$element",
            NgbAlertConfig.$name,
            "$scope"
        ]
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
