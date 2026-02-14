import type { IAugmentedJQuery, IController, IDirective } from "angular";
import { NgbAccordionConfig } from "@/accordion/ngb-accordion-config.service"

export class NgbAccordion implements IController {
    protected animation?: boolean
    protected closeOthers?: boolean
    protected destroyOnHide?: boolean
    protected hidden?: () => void
    protected hide?: () => void
    protected show?: () => void
    protected shown?: () => void

    constructor(
        private $element: IAugmentedJQuery,
        private accordionConfig: NgbAccordionConfig
    ) { }

    $onInit(): void {
        this.animation = this.animation ?? this.accordionConfig.animation
        this.closeOthers = this.closeOthers ?? this.accordionConfig.closeOthers
        this.destroyOnHide = this.destroyOnHide ?? this.accordionConfig.destroyOnHide
    }

    $postLink(): void {
        this.$element.addClass("accordion")
    }

    static get $name() {
        return "ngbAccordion"
    }

    static get $factory(): () => IDirective {
        return () => ({
            bindToController: true,
            controller: NgbAccordion,
            restrict: "A",
            scope: {
                animation: "<?",
                closeOthers: "<?",
                destroyOnHide: "<?",
                hidden: "&?",
                hide: "&?",
                show: "&?",
                shown: "&?"
            }
        })
    }

    static get $inject() {
        return ["$element", NgbAccordionConfig.$name]
    }
}
