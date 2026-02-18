import type { IController, IDirective, ITranscludeFunction } from "angular";
import type { NgbToast } from "@/toast/ngb-toast.component"

export class NgbToastHeader implements IController {
    private ngbToast!: NgbToast

    constructor(private $transclude: ITranscludeFunction) {}

    $onInit(): void {
        this.ngbToast.registerHeaderTransclude(this.$transclude)
    }

    static get $name() {
        return "ngbToastHeader"
    }

    static get $factory(): () => IDirective {
        return () => ({
            bindToController: true,
            controllerAs: "$",
            transclude: "element",
            require: {
                ngbToast: "^ngbToast"
            },
            controller: NgbToastHeader,
            scope: true
        })
    }

    static get $inject() {
        return ["$transclude"]
    }
}
