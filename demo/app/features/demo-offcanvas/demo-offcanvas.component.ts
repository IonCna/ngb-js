import template from "@demo/features/demo-offcanvas/demo-offcanvas.component.html";
import type { NgbOffcanvas, NgbOffcanvasRef } from "@ngb";
import type { IComponentController, IComponentOptions } from "angular";
import type { TemplateRef } from "ngjs-core";

const POSITIONS: Array<"start" | "end" | "top" | "bottom"> = ["start", "end", "top", "bottom"];
const BACKDROPS: Array<boolean | "static"> = [true, false, "static"];

export class DemoOffcanvasComponent implements IComponentController {
  public lastResult = "—";
  public lastDismissed = "—";
  public templateMessage = "This panel was rendered from an ngjs-core TemplateRef.";
  public template?: TemplateRef<unknown>;
  public animation = true;
  public backdrop: boolean | "static" = true;
  public keyboard = true;
  public scroll = false;
  public position: "start" | "end" | "top" | "bottom" = "start";

  constructor(private ngbOffcanvas: NgbOffcanvas) {}

  private buildOptions() {
    return {
      animation: this.animation,
      backdrop: this.backdrop,
      keyboard: this.keyboard,
      scroll: this.scroll,
      position: this.position,
    };
  }

  public async open() {
    const offcanvasRef = await this.ngbOffcanvas.open("ngbDemoOffcanvasContent", this.buildOptions());
    this.observe(offcanvasRef);
  }

  public async openTemplate() {
    if (!this.template) return;
    const offcanvasRef = await this.ngbOffcanvas.open(this.template, this.buildOptions());
    this.observe(offcanvasRef);
  }

  private observe(offcanvasRef: NgbOffcanvasRef) {
    offcanvasRef.result?.then(
      (result: unknown) => {
        this.lastResult = String(result);
      },
      (reason: unknown) => {
        this.lastDismissed = String(reason);
      },
    );
  }

  public dismiss() {
    this.ngbOffcanvas.dismiss("dismiss() called");
  }

  public hasOpenOffcanvas(): boolean {
    return this.ngbOffcanvas.hasOpenOffcanvas();
  }

  public toggleAnimation() {
    this.animation = !this.animation;
  }

  public toggleKeyboard() {
    this.keyboard = !this.keyboard;
  }

  public toggleScroll() {
    this.scroll = !this.scroll;
  }

  public cyclePosition() {
    const idx = POSITIONS.indexOf(this.position);
    this.position = POSITIONS[(idx + 1) % POSITIONS.length];
  }

  public cycleBackdrop() {
    const idx = BACKDROPS.indexOf(this.backdrop);
    this.backdrop = BACKDROPS[(idx + 1) % BACKDROPS.length];
  }

  static get $name() {
    return "ngbDemoOffcanvas";
  }

  static get $inject() {
    return ["ngb.offcanvas.service"];
  }

  static get $factory(): IComponentOptions {
    return {
      controller: DemoOffcanvasComponent,
      controllerAs: "$",
      template,
    };
  }
}
