import type { IAugmentedJQuery, IComponentController, IComponentOptions, ITranscludeFunction } from "angular"

export class NgbProgressbarStacked implements IComponentController {
    constructor(private $element: IAugmentedJQuery, private $transclude: ITranscludeFunction) {}

    $postLink(): void {
        this.$element.addClass("progress-stacked")

        this.$transclude(clone => {
            if(!clone) return
            this.$element.append(clone)
        }, this.$element)
    }

    static get $name() {
        return "ngbProgressbarStacked"
    }

    static get $inject() {
        return ["$element", "$transclude"]
    }

    static get $factory(): IComponentOptions {
        return {
            controller: NgbProgressbarStacked,
            controllerAs: "$",
            transclude: true
        }
    }
}