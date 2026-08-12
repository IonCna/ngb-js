import type {IController, IDirective} from "angular";
import type {TemplateRef} from "ngjs-core";

export class NgbDatepickerContent implements IController {
    public ngTemplate!: TemplateRef<any>;

    static get $name() {
        return 'ngbDatepickerContent';
    }

    static factory(): IDirective {
        return {
            controller: NgbDatepickerContent,
            bindToController: true,
            restrict: 'A',
            require: {
                ngTemplate: "ngTemplate"
            }
        }
    }
}

