import type { IAugmentedJQuery, IComponentController, IComponentOptions, IScope, ITranscludeFunction } from "angular"
import { NgbHostSynchronizerFactory } from "@/ngb-sync-host.factory"

export class NgbProgressbarStacked implements IComponentController {
    constructor(
        private ngbSyncHostFactory: NgbHostSynchronizerFactory,
        private $element: IAugmentedJQuery,
        private $transclude: ITranscludeFunction,
        private $scope: IScope
    ) { }

    $onInit(): void {
        this.$transclude(clone => {
            if (!clone) return
            this.$element.append(clone)
        }, this.$element)
    }

    $postLink(): void {
        this.ngbSyncHostFactory.$create(this.$element, this.$scope, {
            classNames: {
                "progress-stacked": () => true
            }
        })
    }

    static get $name() {
        return "ngbProgressbarStacked"
    }

    static get $inject() {
        return [NgbHostSynchronizerFactory.$name, "$element", "$transclude", "$scope"]
    }

    static get $factory(): IComponentOptions {
        return {
            controller: NgbProgressbarStacked,
            controllerAs: "$",
            transclude: true,
        }
    }
}