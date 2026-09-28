import { Directive, inject, TemplateRef } from "ngjs-core";
import type { NgbPaginationLinkContext } from "@ngb/pagination/ngb-pagination.component";

@Directive({ selector: "ng-template[ngbPaginationLast]" })
export class NgbPaginationLast {
  templateRef = inject(TemplateRef<NgbPaginationLinkContext>);
}
