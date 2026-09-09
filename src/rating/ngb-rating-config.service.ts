import { Service } from "ngjs-core";

@Service({ id: "ngb.rating.config.service" })
export class NgbRatingConfig {
  max = 10;
  readonly = false;
  resettable = false;
  tabindex: number | string = 0;
}
