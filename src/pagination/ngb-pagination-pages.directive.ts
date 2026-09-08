import { Directive, type TemplateRef } from "ngjs-core";
import type { NgbPaginationPagesContext } from "@ngb/pagination/ngb-pagination.component";

@Directive({ selector: "ng-template[ngbPaginationPages]" })
export class NgbPaginationPages {
  // WORKAROUND (Gap B, ver CORE_GAPS): `inject(TemplateRef)` desde una `@Directive`
  // sobre `<ng-template>` no resuelve en ngjs-core. `NgbPagination` lo lee con
  // `@ContentChild(NgbPaginationPages, { read: TemplateRef })` y lo asigna acá.
  templateRef?: TemplateRef<NgbPaginationPagesContext>;
}
