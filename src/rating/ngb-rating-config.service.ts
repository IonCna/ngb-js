import { Service } from "ngjs-core";

@Service()
export class NgbRatingConfig {
  max = 10;
  readonly = false;
  resettable = false;
  tabindex: number | string = 0;
}
