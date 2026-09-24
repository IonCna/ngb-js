import { DOCUMENT, Injectable, inject } from "ngjs-core";

@Injectable({ providedIn: "root" })
export class NgbRTL {
  private _element = inject(DOCUMENT).documentElement;

  isRTL() {
    return (this._element.getAttribute("dir") || "").toLowerCase() === "rtl";
  }
}
