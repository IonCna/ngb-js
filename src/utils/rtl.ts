import { DOCUMENT, inject, Service } from "ngjs-core";

@Service()
export class NgbRTL {
  private _element = inject(DOCUMENT).documentElement;

  isRTL() {
    return (this._element.getAttribute("dir") || "").toLowerCase() === "rtl";
  }
}
