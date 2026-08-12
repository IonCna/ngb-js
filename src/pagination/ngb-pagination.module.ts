import angular from "angular";
import {CoreModule} from "ngjs-core";

import { NgbPagination } from "@ngb/pagination/ngb-pagination.component"
import { NgbPaginationConfig } from "@ngb/pagination/ngb-pagination-config.service"
import { NgbPaginationEllipsis } from "@ngb/pagination/ngb-pagination-ellipsis.directive"
import { NgbPaginationFirst } from "@ngb/pagination/ngb-pagination-first.directive"
import { NgbPaginationLast } from "@ngb/pagination/ngb-pagination-last.directive"
import { NgbPaginationNext } from "@ngb/pagination/ngb-pagination-next.directive"
import { NgbPaginationNumber } from "@ngb/pagination/ngb-pagination-number.directive"
import { NgbPaginationPages } from "@ngb/pagination/ngb-pagination-pages.directive"
import { NgbPaginationPrevious } from "@ngb/pagination/ngb-pagination-previous.directive.ts"

export const NgbPaginationModule = angular.module("ngb-pagination", [
    CoreModule.name,
]);

NgbPaginationModule.component(NgbPagination.$name, NgbPagination.$factory)
NgbPaginationModule.service(NgbPaginationConfig.$name, NgbPaginationConfig)

NgbPaginationModule.directive(NgbPaginationEllipsis.$name, NgbPaginationEllipsis.$factory)
NgbPaginationModule.directive(NgbPaginationFirst.$name, NgbPaginationFirst.$factory)
NgbPaginationModule.directive(NgbPaginationLast.$name, NgbPaginationLast.$factory)
NgbPaginationModule.directive(NgbPaginationNext.$name, NgbPaginationNext.$factory)
NgbPaginationModule.directive(NgbPaginationNumber.$name, NgbPaginationNumber.$factory)
NgbPaginationModule.directive(NgbPaginationNext.$name, NgbPaginationNext.$factory)
NgbPaginationModule.directive(NgbPaginationPages.$name, NgbPaginationPages.$factory)
NgbPaginationModule.directive(NgbPaginationPrevious.$name, NgbPaginationPrevious.$factory)
