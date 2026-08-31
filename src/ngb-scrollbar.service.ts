import type { IWindowService } from "angular";

export type ScrollbarReverter = () => void;

export class NgbScrollbar {
  constructor(private readonly $window: IWindowService) {}

  hide(): ScrollbarReverter {
    const scrollbarWidth = Math.abs(this.$window.innerWidth - document.documentElement.clientWidth);
    const body = document.body as HTMLBodyElement;

    const style = body.style;
    const { overflow, paddingRight } = style;

    if (scrollbarWidth > 0) {
      const actualPadding = Number.parseFloat(this.$window.getComputedStyle(body).paddingRight);
      style.paddingRight = `${actualPadding + scrollbarWidth}px`;
    }

    style.overflow = "hidden";

    return () => {
      if (scrollbarWidth > 0) {
        style.paddingRight = paddingRight;
      }

      style.overflow = overflow;
    };
  }

  static get $name() {
    return "ngb.scrollbar.service";
  }

  static get $inject() {
    return ["$window"];
  }
}
