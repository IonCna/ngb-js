import type {TemplateRef} from "ngjs-core";
import type {IDirective} from "angular";

export class NgbPaginationPrevious {
    public templateRef!: TemplateRef<any>;

    static get $name() {
        return "ngbPaginationPrevious";
    }

    static $factory(): IDirective {
        return {
            restrict: "A",
            bindToController: true,
            controller: NgbPaginationPrevious,
            require: {
                templateRef: "ngTemplate",
            }
        }
    }
}