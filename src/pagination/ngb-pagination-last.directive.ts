import type {TemplateRef} from "ngjs-core";
import type {IDirective} from "angular";

export class NgbPaginationLast {
    public templateRef!: TemplateRef<any>;

    static get $name() {
        return "ngbPaginationLast";
    }

    static $factory(): IDirective {
        return {
            restrict: "A",
            bindToController: true,
            controller: NgbPaginationLast,
            require: {
                templateRef: "ngTemplate",
            }
        }
    }
}