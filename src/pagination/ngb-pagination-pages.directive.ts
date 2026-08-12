import type {TemplateRef} from "ngjs-core";
import type {IDirective} from "angular";

export class NgbPaginationPages {
    public templateRef!: TemplateRef<any>;

    static get $name() {
        return "ngbPaginationNumber";
    }

    static $factory(): IDirective {
        return {
            restrict: "A",
            bindToController: true,
            controller: NgbPaginationPages,
            require: {
                templateRef: "ngTemplate",
            }
        }
    }
}