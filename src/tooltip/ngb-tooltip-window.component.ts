import template from "@ngb/tooltip/ngb-tooltip-window.component.html";
import { Component, HostBinding, HostListener, Input } from "ngjs-core";

@Component({
  selector: "ngb-tooltip-window",
  template,
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
