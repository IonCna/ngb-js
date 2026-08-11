import template from "@demo/features/demo-popover/demo-popover.component.html";
import type { NgbPopover } from "@ngb/popover";
import type { IComponentOptions } from "angular";
import type { TemplateRef } from "ngjs-core";

export class DemoPopoverComponent {
  public contentTemplate?: TemplateRef<unknown>;
  public titleTemplate?: TemplateRef<unknown>;
  public manualPopover?: NgbPopover;
  public templateContext = { name: "Ada" };
  public lastEvent = "Ninguno";

  public onShown(): void {
    this.lastEvent = "shown";
  }

  public onHidden(): void {
    this.lastEvent = "hidden";
  }

  static get $name() {
    return "ngbDemoPopover";
  }

  static get $factory(): IComponentOptions {
    return {
      controller: DemoPopoverComponent,
      controllerAs: "$",
      template,
    };
  }
}
