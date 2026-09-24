import { Injectable } from "ngjs-core";

@Injectable({ providedIn: "root" })
export class NgbRatingConfig {
  max = 10;
  readonly = false;
  resettable = false;
  tabindex: number | string = 0;
}
