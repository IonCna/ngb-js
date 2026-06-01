import template from "@demo/features/demo-dropdown/demo-dropdown.component.html";
import type { IComponentController, IComponentOptions } from "angular";

type AutoClose = boolean | "inside" | "outside";
type Display = "dynamic" | "static";
type Container = null | "body";

export class DemoDropdownComponent implements IComponentController {
  public open = false;
  public disabled = false;
  public autoClose: AutoClose = true;
  public display: Display = "dynamic";
  public container: Container = null;
  public placement = ["bottom-start", "bottom-end", "top-start", "top-end"];
  public lastEvent = "none";

  public toggleDisabled() {
    this.disabled = !this.disabled;
  }

  public cycleAutoClose() {
    const values: AutoClose[] = [true, "inside", "outside", false];
    this.autoClose = values[(values.indexOf(this.autoClose) + 1) % values.length];
  }

  public cycleDisplay() {
    this.display = this.display === "dynamic" ? "static" : "dynamic";
  }

  public cycleContainer() {
    this.container = this.container === "body" ? null : "body";
  }

  public onOpenChange(value: boolean) {
    this.open = value;
    this.lastEvent = value ? "opened" : "closed";
  }

  static get $name() {
    return "ngbDemoDropdown";
  }

  static get $factory(): IComponentOptions {
    return {
      controller: DemoDropdownComponent,
      controllerAs: "$",
      template,
    };
  }
}
