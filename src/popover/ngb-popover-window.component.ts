import template from "@ngb/popover/ngb-popover-window.component.html";
import { Component, HostBinding, HostListener, Input, TemplateRef } from "ngjs-core";

@Component({
  selector: "ngb-popover-window",
  template,
})
export class NgbPopoverWindow {
  @Input() animation?: boolean;
  @Input() title?: string | TemplateRef<any> | null;
  @Input() id?: string;
  @Input() popoverClass?: string;
  @Input() context?: any;
  @Input() onMouseEnter?: () => void;
  @Input() onMouseLeave?: () => void;

  @HostBinding("attr.role") readonly role = "tooltip";
  @HostBinding("style.position") readonly position = "absolute";

  @HostBinding("id") get hostId() {
    return this.id;
  }

  @HostBinding("class") get hostClass() {
    return `popover${this.popoverClass ? ` ${this.popoverClass}` : ""}`;
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

  isTitleTemplate(): boolean {
    return this.title instanceof TemplateRef;
  }
}
