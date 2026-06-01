import { toNativeElement } from "@ngb/utils";
import type { IDocumentService, IWindowService } from "angular";

export type ScrollbarReverter = () => void;

export class NgbScrollbar {
  _document: Document;

  constructor(
    private readonly $document: IDocumentService,
    private readonly $window: IWindowService,
  ) {
    this._document = toNativeElement(this.$document);
  }

  hide(): ScrollbarReverter {
    const scrollbarWidth = Math.abs(this.$window.innerWidth - this._document.documentElement.clientWidth);
    const body = toNativeElement<HTMLBodyElement>(this.$document.find("body"));

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
    return ["$document", "$window"];
  }
}
