import { Injectable } from "ngjs-core";

@Injectable({ providedIn: "root" })
export class NgbProgressbarConfig {
  max = 100;
  animated = false;
  ariaLabel = "progress bar";
  striped = false;
  textType?: string;
  type?: string;
  showValue = false;
  height?: string;
}
