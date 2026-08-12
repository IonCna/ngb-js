import { DemoPaginationComponent } from "@demo/features/demo-pagination/demo-pagination.component";
import angular from "angular";

export const DemoPaginationModule = angular.module("ngb.demo.pagination", []);

DemoPaginationModule.component(DemoPaginationComponent.$name, DemoPaginationComponent.$factory);
