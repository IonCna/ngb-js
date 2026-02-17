import type { IController, IDirective } from "angular";
import type { NgbToast } from "@/toast/ngb-toast.component"

export class NgbToastHeader implements IController {
    private ngbToast!: NgbToast

    static get $name() {
        return "ngbToastHeader"
    }

    static get $factory(): () => IDirective {
        return () => ({
            bindToController: true,
            controllerAs: "$",
            require: {
                ngbToast: "^ngbToast"
            },
            controller: NgbToastHeader,
            scope: true
        })
    }
}