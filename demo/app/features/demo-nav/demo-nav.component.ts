import template from "@demo/features/demo-nav/demo-nav.component.html";
import type { NgbNavChangeEvent } from "@ngb/nav/ngb-nav-config.service";
import type { IComponentController, IComponentOptions } from "angular";

export class DemoNavComponent implements IComponentController {
  public activeId: string = "home";
  public animation = false;
  public destroyOnHide = true;
  public orientation: "horizontal" | "vertical" = "horizontal";
  public settingsDisabled = false;
  public preventChange = false;
  public lastChange: string | null = null;

  public toggleAnimation() {
    this.animation = !this.animation;
  }

  public toggleDestroyOnHide() {
    this.destroyOnHide = !this.destroyOnHide;
  }

  public toggleOrientation() {
    this.orientation = this.orientation === "horizontal" ? "vertical" : "horizontal";
  }

  public toggleSettingsDisabled() {
    this.settingsDisabled = !this.settingsDisabled;
  }

  public togglePreventChange() {
    this.preventChange = !this.preventChange;
  }

  public onNavChange(event: NgbNavChangeEvent) {
    this.lastChange = `${String(event.activeId)} → ${String(event.nextId)}`;
    if (this.preventChange) {
      event.preventDefault();
    }
  }

  static get $name() {
    return "ngbDemoNav";
  }

  static get $factory(): IComponentOptions {
    return {
      controller: DemoNavComponent,
      controllerAs: "$",
      template,
    };
  }
}
