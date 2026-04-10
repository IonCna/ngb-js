import type { IAugmentedJQuery, IController, IDirective, ITranscludeFunction } from "angular";

export class NgbContent implements IController {
    protected $render!: ITranscludeFunction
    private parent!: IAugmentedJQuery

    constructor(private $element: IAugmentedJQuery) {}

    $onInit(): void {
        if(!this.$render) throw new Error("[ngb-content]: needs a $transcludeFn to work")
    }

    $postLink(): void {
        this.parent = this.$element.parent()

        this.$render(clone => {
            if(!clone) return
            this.parent.append(clone)
        }, this.parent)
    }

    static get $name() {
        return "ngbContent"
    }

    static get $inject() {
        return ["$element"]
    }

    static get $factory(): () => IDirective {
        return () => ({
            bindToController: true,
            scope: {
                $render: "<"
            },
            restrict: "E",
            transclude: "element",
            controller: NgbContent
        })
    }
}