import type { IController, IDirective } from "angular";

export class NgbToastHeader implements IController {
    static get $name() {
        return "ngbToastHeader"
    }

    static get $factory(): () => IDirective {
        return () => ({
            bindToController: true,
            controllerAs: "$",
            controller: NgbToastHeader,
            scope: true
        })
    }
}