import { Directive, inject, TemplateRef } from "ngjs-core";
import type { NgbPaginationLinkContext } from "@ngb/pagination/ngb-pagination.component";

@Directive({ selector: "ng-template[ngbPaginationNext]" })
export class NgbPaginationNext {
  templateRef = inject(TemplateRef<NgbPaginationLinkContext>);
}
