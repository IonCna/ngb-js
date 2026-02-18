import type { IController, IDirective } from "angular";

export class NgbDropdownAnchor implements IController {

    constructor(
        private $element: JQLite
    ) { }

    $postLink(): void {
        this.$element.addClass("dropdown-toggle")
    }

    static get $inject() {
        return ['$element']
    }

    static get $name() {
        return "ngbDropdownAnchor"
    }

    static get $factory(): () => IDirective {
        return () => ({
            controller: this,
            restrict: "A"
        })
    }
}