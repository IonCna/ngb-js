import type {TemplateRef} from "ngjs-core";
import type {IDirective} from "angular";

export class NgbPaginationFirst {
    public templateRef!: TemplateRef<any>;

    static get $name() {
        return "ngbPaginationFirst";
    }

    static $factory(): IDirective {
        return {
            restrict: "A",
            bindToController: true,
            controller: NgbPaginationFirst,
            require: {
                templateRef: "ngTemplate",
            }
        }
    }
}
