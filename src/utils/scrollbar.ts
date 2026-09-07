import { DOCUMENT, inject, Service } from "ngjs-core";

export type ScrollbarReverter = () => void;

@Service()
export class ScrollBar {
  private _document = inject(DOCUMENT);

  hide(): ScrollbarReverter {
    const scrollbarWidth = Math.abs(window.innerWidth - this._document.documentElement.clientWidth);
    const body = this._document.body;
    const bodyStyle = body.style;
    const { overflow, paddingRight } = bodyStyle;

    if (scrollbarWidth > 0) {
      const actualPadding = parseFloat(window.getComputedStyle(body).paddingRight);
      bodyStyle.paddingRight = `${actualPadding + scrollbarWidth}px`;
    }

    bodyStyle.overflow = "hidden";
    return () => {
      if (scrollbarWidth > 0) {
        bodyStyle.paddingRight = paddingRight;
      }
      bodyStyle.overflow = overflow;
    };
  }
}
