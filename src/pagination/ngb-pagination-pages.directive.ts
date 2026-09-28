import { Directive, inject, TemplateRef } from "ngjs-core";
import type { NgbPaginationPagesContext } from "@ngb/pagination/ngb-pagination.component";

@Directive({ selector: "ng-template[ngbPaginationPages]" })
export class NgbPaginationPages {
  templateRef = inject(TemplateRef<NgbPaginationPagesContext>);
}
