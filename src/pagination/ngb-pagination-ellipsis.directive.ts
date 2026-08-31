import type {TemplateRef} from "ngjs-core";
import type {IDirective} from "angular";

export class NgbPaginationEllipsis {
    public templateRef!: TemplateRef<any>;

    static get $name() {
        return "ngbPaginationEllipsis";
    }

    static $factory(): IDirective {
        return {
            restrict: "A",
            bindToController: true,
            controller: NgbPaginationEllipsis,
            require: {
                templateRef: "ngTemplate",
            }
        }
    }
}
