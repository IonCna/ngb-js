import type {IAugmentedJQuery, IComponentController, IComponentOptions} from "angular";
import type {NgbDatepickerKeyboardService} from "@ngb/datepicker/ngb-datepicker-keyboard.service.ts";

export class NgbDatepickerMonth implements IComponentController {
    constructor(
        private $element: IAugmentedJQuery,
        private _keyboardService: NgbDatepickerKeyboardService,
    ) {}

    $postLink() {
        this.$element.attr("role", "grid");
        this.$element.on("keydown", this.onKeyDown);
    }

    private onKeyDown() {}

    static get $name() {
        return 'ngbDatepickerMonth';
    }

    static get $factory(): IComponentOptions {
        return {
            controllerAs: "$",
            controller: NgbDatepickerMonth,
        }
    }

    static get $inject() {
        return ["$element"]
    }
}