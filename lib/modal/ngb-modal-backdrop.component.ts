import type { IAugmentedJQuery, IComponentController, IComponentOptions, IQService, IScope, ITimeoutService } from "angular";
import { NgbModalConfig, type NgbModalUpdatableOptions } from "@/modal/ngb-modal-config.service"
import angular from "angular";
import { ngbRunTransition } from "@/utils";
import { ngbModalBackdropFadeInTransition, ngbModalBackdropFadeOutTransition } from "@/modal/ngb-modal-backdrop-transition"

const BACKDROP_ATTRIBUTES = ['animation', 'backdropClass'] as const satisfies readonly (keyof NgbModalUpdatableOptions)[];
type NgbModalBackdropAttribute = (typeof BACKDROP_ATTRIBUTES)[number];

export class NgbModalBackdrop implements IComponentController {
    animation?: boolean
    backdropClass?: string

    private _options: Partial<Pick<NgbModalUpdatableOptions, NgbModalBackdropAttribute>> = {}

    constructor(
        private $element: IAugmentedJQuery,
        private $scope: IScope,
        private $ngbModalConfig: NgbModalConfig,
        private $q: IQService,
        private $timeout: ITimeoutService
    ) {}
    
    $postLink(): void {
        const backdropClass = this.backdropClass ? this.backdropClass : ''

        this.$element.addClass(`modal-backdrop ${backdropClass}`)
        this.$element.css({ "z-index": "1055" })

        this.$scope.$evalAsync(() => ngbRunTransition(this.$q, this.$timeout, this.$element, ngbModalBackdropFadeInTransition, {
            animation: this.animation ?? this.$ngbModalConfig.animation,
            runningTransition: "continue"
        }))
    }

    $onChanges(): void {
        this.$element.toggleClass("show", !!this.animation)
        this.$element.toggleClass("fade", this.animation)
    }

    hide() {
        return ngbRunTransition(this.$q, this.$timeout, this.$element, ngbModalBackdropFadeOutTransition, {
            animation: this.animation ?? this.$ngbModalConfig.animation,
            runningTransition: "stop"
        })
    }

    updateOptions(options: NgbModalUpdatableOptions) {
        BACKDROP_ATTRIBUTES.forEach(attr => {
            if(!(attr in options)) return

            const value = options[attr]
            const isDefined = angular.isDefined(value)
            if(!isDefined) return

            this._setOption(attr, value)
        })

        this.$scope.$evalAsync()
    }

    private _setOption<K extends NgbModalBackdropAttribute>(attr: K, value: NgbModalUpdatableOptions[K]) {
        this.$scope.$evalAsync(() => {
            this._options[attr] = value
        })
    }

    static get $name() {
        return "ngbModalBackdrop"
    }

    static get $inject() {
        return [
            "$element",
            "$scope",
            NgbModalConfig.$name,
            "$q",
            "$timeout"
        ]
    }

    static get $factory(): IComponentOptions {
        return {
            controller: NgbModalBackdrop,
            controllerAs: "$",
            bindings: {
                animation: "<?",
                backdropClass: "@?"
            }
        }
    }
}
