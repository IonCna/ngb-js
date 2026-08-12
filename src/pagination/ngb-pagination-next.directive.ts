import type {TemplateRef} from "ngjs-core";
import type {IDirective} from "angular";

export class NgbPaginationNext {
    public templateRef!: TemplateRef<any>;

    static get $name() {
        return "ngbPaginationNext";
    }

    static $factory(): IDirective {
        return {
            restrict: "A",
            bindToController: true,
            controller: NgbPaginationNext,
            require: {
                templateRef: "ngTemplate",
            }
        }
    }
}