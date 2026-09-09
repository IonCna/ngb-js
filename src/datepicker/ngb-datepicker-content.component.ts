import { Directive } from "ngjs-core";

/**
 * A directive that marks the content template that customizes the way datepicker months are displayed
 *
 * @since 5.3.0
 *
 * ngjs-core (Gap B): upstream hace `templateRef = inject(TemplateRef)`. Acá una
 * `@Directive` sobre `<ng-template>` no puede inyectar su `TemplateRef`, así que
 * `NgbDatepicker` lo lee con `@ContentChild(NgbDatepickerContent, { read: TemplateRef })`.
 */
@Directive({ selector: "ng-template[ngbDatepickerContent]" })
export class NgbDatepickerContent {}
