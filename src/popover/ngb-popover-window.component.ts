import { Component, HostBinding, HostListener, Input, TemplateRef } from "ngjs-core";

@Component({
  selector: "ngb-popover-window",
  template: `<div class="popover-arrow" data-popper-arrow></div>

<h3 ng-if="$.title" class="popover-header">
    <ng-template ng-ref="simpleTitle">{{ $.title }}</ng-template>
    <ng-container
        ng-template-outlet="$.isTitleTemplate() ? $.title : simpleTitle"
        ng-template-outlet-context="$.context"
    ></ng-container>
</h3>

<div class="popover-body"><ng-content></ng-content></div>`,
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
