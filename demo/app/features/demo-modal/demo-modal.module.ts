import angular from "angular"
import { DemoModalComponent } from "@demo/features/demo-modal/demo-modal.component"
import { DemoModalContentComponent } from "@demo/features/demo-modal/demo-modal-content.component"
import { DemoModalScrollableContentComponent } from "@demo/features/demo-modal/demo-modal-scrollable-content.component"
import { DemoModalUpdateOptionsContentComponent } from "@demo/features/demo-modal/demo-modal-update-options-content.component"

export const DemoModalModule = angular.module("ngb.demo.modal", [])
DemoModalModule.component(DemoModalComponent.$name, DemoModalComponent.$factory)
DemoModalModule.component(DemoModalContentComponent.$name, DemoModalContentComponent.$factory)
DemoModalModule.component(DemoModalScrollableContentComponent.$name, DemoModalScrollableContentComponent.$factory)
DemoModalModule.component(DemoModalUpdateOptionsContentComponent.$name, DemoModalUpdateOptionsContentComponent.$factory)
