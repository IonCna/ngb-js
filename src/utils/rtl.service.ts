export class NgbRTL {
  private readonly _element: HTMLElement;

  constructor() {
    this._element = document.documentElement;
  }

  isRTL() {
    const dir = this._element.getAttribute("dir") || "";
    return dir.toLowerCase() === "rtl";
  }

  static get $inject() {
    return [];
  }

  static get $name() {
    return "ngb.rtl.service";
  }
}
