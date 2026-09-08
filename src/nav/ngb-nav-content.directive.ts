import { Directive, inject, TemplateRef } from "ngjs-core";

@Directive({ selector: "ng-template[ngbNavContent]" })
export class NgbNavContent {
  templateRef = inject(TemplateRef);
}
