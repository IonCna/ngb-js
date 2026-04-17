import type { IAugmentedJQuery, IComponentController, IComponentOptions } from "angular";
import type { NgbDate } from "@/datepicker/ngb-date"

export class NgbDatepickerDayView implements IComponentController {
    protected currentMonth?: number
    protected date?: NgbDate
    protected disabled?: number
    protected focused?: number
    protected selected?: number

    constructor(
        private $element: IAugmentedJQuery
    ) { }

    $postLink(): void {
        this.$element.addClass("btn-light")
    }

    $onChanges(): void {
        this.$element.toggleClass("bg-primary", Boolean(this.selected))
        this.$element.toggleClass("text-white", Boolean(this.selected))
        this.$element.toggleClass("text-muted", this.isMuted())
        this.$element.toggleClass("outside", this.isMuted())
        this.$element.toggleClass("active", Boolean(this.focused))
    }

    public isMuted() {
        return Boolean(
            !this.selected && (this.date?.month !== this.currentMonth || this.disabled)
        )
    }

    static get $name() {
        return "ngbDatepickerDayView"
    }

    static get $factory(): IComponentOptions {
        return {
            controller: NgbDatepickerDayView,
            controllerAs: "$",
            require: {
                currentMonth: "<?",
                date: "<?",
                disabled: "<?",
                focused: "<?",
                selected: "<?"
            }
        }
    }

    static get $inject() {
        return ["$element"]
    }
}