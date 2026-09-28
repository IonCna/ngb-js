import { Component, HostBinding, HostListener, Input } from "ngjs-core";

@Component({
  selector: "ngb-tooltip-window",
  template: `<style>
  /* Compiled from ng-bootstrap tooltip.scss (ViewEncapsulation.None) — inline porque
     ngjs-core no soporta \`styleUrl\` (no auto-inyecta CSS de componente). */
  ngb-tooltip-window {
    pointer-events: none;
    position: absolute;
  }

  ngb-tooltip-window .tooltip-inner {
    pointer-events: none;
  }

  ngb-tooltip-window.show .tooltip-inner {
    pointer-events: auto;
  }

  ngb-tooltip-window.bs-tooltip-top,
  ngb-tooltip-window.bs-tooltip-bottom {
    padding-left: 0;
    padding-right: 0;
  }

  ngb-tooltip-window.bs-tooltip-start,
  ngb-tooltip-window.bs-tooltip-end {
    padding-top: 0;
    padding-bottom: 0;
  }
</style>

<div class="tooltip-arrow" data-popper-arrow></div>
<div class="tooltip-inner"><ng-content></ng-content></div>`,
})
export class NgbTooltipWindow {
  @Input() animation?: boolean;
  @Input() id?: string;
  @Input() tooltipClass?: string;
  @Input() onMouseEnter?: () => void;
  @Input() onMouseLeave?: () => void;

  @HostBinding("attr.role") readonly role = "tooltip";
  @HostBinding("id") get hostId() {
    return this.id;
  }
  @HostBinding("class") get hostClass() {
    return `tooltip${this.tooltipClass ? ` ${this.tooltipClass}` : ""}`;
  }
  @HostBinding("class.fade") get hostFade() {
    return this.animation;
  }

  @HostListener("mouseenter")
  handleMouseEnter() {
    this.onMouseEnter?.();
  }

  @HostListener("mouseleave")
  handleMouseLeave() {
    this.onMouseLeave?.();
  }
}
