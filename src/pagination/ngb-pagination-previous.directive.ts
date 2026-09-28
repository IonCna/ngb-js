import { Directive, inject, TemplateRef } from "ngjs-core";
import type { NgbPaginationLinkContext } from "@ngb/pagination/ngb-pagination.component";

@Directive({ selector: "ng-template[ngbPaginationPrevious]" })
export class NgbPaginationPrevious {
  templateRef = inject(TemplateRef<NgbPaginationLinkContext>);
}
