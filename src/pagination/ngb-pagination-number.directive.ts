import { Directive, inject, TemplateRef } from "ngjs-core";
import type { NgbPaginationNumberContext } from "@ngb/pagination/ngb-pagination.component";

@Directive({ selector: "ng-template[ngbPaginationNumber]" })
export class NgbPaginationNumber {
  templateRef = inject(TemplateRef<NgbPaginationNumberContext>);
}
