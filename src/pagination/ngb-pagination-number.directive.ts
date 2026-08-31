import type {TemplateRef} from "ngjs-core";
import type {IDirective} from "angular";

export class NgbPaginationNumber {
    public templateRef!: TemplateRef<any>;

    static get $name() {
        return "ngbPaginationNumber";
    }

    static $factory(): IDirective {
        return {
            restrict: "A",
            bindToController: true,
            controller: NgbPaginationNumber,
            require: {
                templateRef: "ngTemplate",
            }
        }
    }
}