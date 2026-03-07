import type { IAugmentedJQuery, IComponentController, IComponentOptions, IScope } from "angular";
import { NgbAlertConfig } from "@/alert/ngb-alert-config.service"
import template from "@/alert/ngb-alert.component.html?raw"
import { NgbAnimationFactory, type AnimationFunction } from "@/ngb-animation.factory"
import { NgbHostSynchronizerFactory, type IHostSynchronizer } from "@/ngb-sync-host.factory"

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

    private ngbRunTransition?: AnimationFunction
    private ngbHostSynchronizer?: IHostSynchronizer

    constructor(
        private $element: IAugmentedJQuery,
        private ngbAlertConfig: NgbAlertConfig,
        private ngbAnimationFactory: NgbAnimationFactory,
        private ngbSyncHostFactory: NgbHostSynchronizerFactory,
        private $scope: IScope
    ) { }

    $onInit(): void {
        this.animation = this.animation ?? this.ngbAlertConfig.animation
        this.dismissible = this.dismissible ?? this.ngbAlertConfig.dismissible
        this.type = this.type ?? this.ngbAlertConfig.type

        this.ngbRunTransition = this.ngbAnimationFactory.$create()

        this.ngbHostSynchronizer = this.ngbSyncHostFactory.$create(this.$element, this.$scope, {
            classNames: {
                "alert show d-block": () => true,
                [`alert-${this.type}`]: () => Boolean(this.type),
                "fade": () => Boolean(this.animation),
                "alert-dismissible": () => Boolean(this.dismissible)
            },
            attributes: {
                "role": () => "alert"
            }
        })
    }

    $onChanges(): void {
        this.ngbHostSynchronizer?.apply({
            classNames: {
                "fade": () => Boolean(this.animation),
                "alert-dismissible": () => Boolean(this.dismissible)
            }
        })
    }

    close() {
        if (this.closingInProgress || this.isClosed) return
        this.closingInProgress = true

        if (!this.animation) {
            this.isClosed = true
            this.$element.removeClass("show")
            this.closed?.()
            return
        }

        this.ngbRunTransition?.(this.$element, () => this.$element.removeClass("show")).then(() => {
            this.isClosed = true
            this.closed?.()
        })

    }

    static get $name() {
        return "ngbAlert"
    }

    static get $inject() {
        return [
            "$element",
            NgbAlertConfig.$name,
            NgbAnimationFactory.$name,
            NgbHostSynchronizerFactory.$name,
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
