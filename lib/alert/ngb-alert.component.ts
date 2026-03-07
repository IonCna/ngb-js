import type { IAugmentedJQuery, IComponentController, IComponentOptions } from "angular";
import { NgbAlertConfig } from "@/alert/ngb-alert-config.service"
import template from "@/alert/ngb-alert.component.html?raw"
import { NgbAnimationFactory, type AnimationFunction } from "@/ngb-animation.factory"
import { NgbSyncHostFactory, type HostSynchronizer } from "@/ngb-sync-host.factory"
import angular from "angular";

export class NgbAlert implements IComponentController {
    protected animation?: boolean
    protected dismissible?: boolean
    protected type?: string
    protected closed?: () => void

    private closingInProgress = false
    protected isClosed = false

    private ngbRunTransition?: AnimationFunction
    private ngbHostSynchronizer?: HostSynchronizer

    constructor(
        private $element: IAugmentedJQuery,
        private ngbAlertConfig: NgbAlertConfig,
        private ngbAnimationFactory: NgbAnimationFactory,
        private ngbSyncHostFactory: NgbSyncHostFactory
    ) { }

    $onInit(): void {
        this.animation = this.animation ?? this.ngbAlertConfig.animation
        this.dismissible = this.dismissible ?? this.ngbAlertConfig.dismissible
        this.type = this.type ?? this.ngbAlertConfig.type

        this.ngbRunTransition = this.ngbAnimationFactory.$create()
        this.ngbHostSynchronizer = this.ngbSyncHostFactory.$create(this.$element, {
            classNames: ["alert", "show", "d-block", this.type ? "alert-" + this.type : ""],
            attributes: { "role": "alert" }
        })

        this.ngbHostSynchronizer.syncClasses({
            "fade": () => this.animation!,
            "alert-dismissible": () => this.dismissible!
        })
    }

    $onChanges(onChangesObj: angular.IOnChangesObject): void {
        const animation = onChangesObj["animation"]
        const dismissible = onChangesObj["dismissible"]

        this.ngbHostSynchronizer?.syncClasses({
            "fade": () => animation?.currentValue,
            "alert-dismissible": () => dismissible?.currentValue
        })
    }

    protected async close() {
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
        return ["$element", NgbAlertConfig.$name, NgbAnimationFactory.$name, NgbSyncHostFactory.$name]
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
