import { Component, HostBinding, HostListener, Input } from "ngjs-core";

@Component({
  selector: "ngb-tooltip-window",
  styleUrl: "./tooltip.css",
  template: `<div class="tooltip-arrow" data-popper-arrow></div>
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
