import type { IController, IDirective } from "angular";

export class NgbNavItemRole implements IController {
    //#region $angular

    static get $name() {
        return "ngbNavItemRole"
    }

    static get $factory(): () => IDirective {
        return () => ({
            controller: this,
            bindToController: true
        })
    }

    //#endregion
}
