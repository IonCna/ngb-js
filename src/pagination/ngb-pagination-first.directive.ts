import { Directive, inject, TemplateRef } from "ngjs-core";
import type { NgbPaginationLinkContext } from "@ngb/pagination/ngb-pagination.component";

@Directive({ selector: "ng-template[ngbPaginationFirst]" })
export class NgbPaginationFirst {
  templateRef = inject(TemplateRef<NgbPaginationLinkContext>);
}
