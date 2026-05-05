import type { IController, IDirective, ITranscludeFunction } from "angular";
import type { NgbToast } from "@ngb/toast/ngb-toast.component"

export class NgbToastHeader implements IController {
    private ngbToast!: NgbToast

    constructor(public readonly $transclude: ITranscludeFunction) {}

    $onInit(): void {
        this.ngbToast.register(this)
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
            controller: NgbToastHeader
        })
    }

    static get $inject() {
        return ["$transclude"]
    }
}
