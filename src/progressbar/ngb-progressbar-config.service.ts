import { Service } from "ngjs-core";

@Service({ id: "ngb.progressbar.config.service" })
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
