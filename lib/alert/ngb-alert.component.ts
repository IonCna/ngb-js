import type { IAugmentedJQuery, IComponentController, IComponentOptions, ILogService, IQService, ITimeoutService } from "angular";
import { NgbAlertConfig } from "@/alert/ngb-alert-config.service"
import { ngbRunTransition } from "@/utils/transition/ngb-transition"
import { ngbAlertFadingTransition } from "@/alert/ngb-alert-transition"
import template from "@/alert/ngb-alert.component.html?raw"

export interface INgbAlert {
    close(): void
}

export class NgbAlert implements IComponentController, INgbAlert {
    protected animation?: boolean
    protected dismissible?: boolean
    protected type?: string
    protected closed?: () => void

    constructor(
        private $element: IAugmentedJQuery,
        private ngbAlertConfig: NgbAlertConfig,
        private $q: IQService,
        private $timeout: ITimeoutService,
        private $log: ILogService
    ) { }

    $onInit(): void {
        this.animation = this.animation ?? this.ngbAlertConfig.animation
        this.dismissible = this.dismissible ?? this.ngbAlertConfig.dismissible
        this.type = this.type ?? this.ngbAlertConfig.type
    }

    $postLink(): void {
        this.$element.attr("role", "alert")
        this.$element.addClass("alert d-block show")

        const type = `alert-${this.type}`
        this.$element.addClass(type)
    }

    $onChanges(): void {
        this.$element.toggleClass("fade", this.animation)
        this.$element.toggleClass("alert-dismissible", this.dismissible)
    }

    close() {
        const deferred = this.$q.defer<boolean>()

        const transition = ngbRunTransition(this.$q, this.$timeout, this.$element, ngbAlertFadingTransition, {
            animation: this.animation ?? this.ngbAlertConfig.animation,
            runningTransition: 'continue'
        })

        transition.then(() => {
            this.closed?.()
            this.$log.info("[ngb.alert]: was closed")
            deferred.resolve(true)
        })

        return deferred.promise
    }

    static get $name() {
        return "ngbAlert"
    }

    static get $inject() {
        return [
            "$element",
            NgbAlertConfig.$name,
            "$q",
            "$timeout",
            "$log"
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
