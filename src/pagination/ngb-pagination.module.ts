import { NgbPagination } from "@ngb/pagination/ngb-pagination.component";
import { NgbPaginationEllipsis } from "@ngb/pagination/ngb-pagination-ellipsis.directive";
import { NgbPaginationFirst } from "@ngb/pagination/ngb-pagination-first.directive";
import { NgbPaginationLast } from "@ngb/pagination/ngb-pagination-last.directive";
import { NgbPaginationNext } from "@ngb/pagination/ngb-pagination-next.directive";
import { NgbPaginationNumber } from "@ngb/pagination/ngb-pagination-number.directive";
import { NgbPaginationPages } from "@ngb/pagination/ngb-pagination-pages.directive";
import { NgbPaginationPrevious } from "@ngb/pagination/ngb-pagination-previous.directive";
import { CommonModule } from "ngjs-core/common";
import { NgModule } from "ngjs-core";

const NGB_PAGINATION_DIRECTIVES = [
  NgbPagination,
  NgbPaginationEllipsis,
  NgbPaginationFirst,
  NgbPaginationLast,
  NgbPaginationNext,
  NgbPaginationNumber,
  NgbPaginationPrevious,
  NgbPaginationPages,
];

@NgModule({
  id: "ngb-pagination",
  imports: [CommonModule],
  declarations: NGB_PAGINATION_DIRECTIVES,
})
export class NgbPaginationModule {}
