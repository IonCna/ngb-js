import template from "@demo/features/demo-offcanvas/demo-offcanvas-content.component.html";
import type { NgbActiveOffcanvas } from "@ngb";
import type { IComponentController, IComponentOptions } from "angular";

export class DemoOffcanvasContentComponent implements IComponentController {
    public name = "";
    public ngbActiveOffcanvas!: NgbActiveOffcanvas;

    static get $name() {
        return "ngbDemoOffcanvasContent";
    }

    static get $inject() {
        return [];
    }

    static get $factory(): IComponentOptions {
        return {
            controller: DemoOffcanvasContentComponent,
            controllerAs: "$",
            template,
            bindings: {
                ngbActiveOffcanvas: "<",
            },
        };
    }
}
