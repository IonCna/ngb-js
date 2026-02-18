import type { IController, IDirective } from "angular"

export class NgbNavPane implements IController {
    constructor(
        private $element: JQLite
    ) {}

    $postLink(): void {
        this.$element.addClass("tab-pane fade show active")
        this.$element.attr("role", "tabpanel")
    }

    //#region $angular

    static get $name() {
        return "ngbNavPane"
    }

    static get $inject() {
        return ['$element']
    }

    static get $factory(): () => IDirective {
        return () => ({
            controller: this,
            restrict: "A",
            bindToController: true,
        })
    }

    //#endregion
}