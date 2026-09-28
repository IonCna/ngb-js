import { Directive, inject, TemplateRef } from "ngjs-core";
import type { NgbPaginationLinkContext } from "@ngb/pagination/ngb-pagination.component";

@Directive({ selector: "ng-template[ngbPaginationEllipsis]" })
export class NgbPaginationEllipsis {
  templateRef = inject(TemplateRef<NgbPaginationLinkContext>);
}
