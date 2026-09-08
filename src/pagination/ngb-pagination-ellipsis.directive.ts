import { Directive, type TemplateRef } from "ngjs-core";
import type { NgbPaginationLinkContext } from "@ngb/pagination/ngb-pagination.component";

@Directive({ selector: "ng-template[ngbPaginationEllipsis]" })
export class NgbPaginationEllipsis {
  // WORKAROUND (Gap B, ver CORE_GAPS): `inject(TemplateRef)` desde una `@Directive`
  // sobre `<ng-template>` no resuelve en ngjs-core. `NgbPagination` lo lee con
  // `@ContentChild(NgbPaginationEllipsis, { read: TemplateRef })` y lo asigna acá.
  templateRef?: TemplateRef<NgbPaginationLinkContext>;
}
