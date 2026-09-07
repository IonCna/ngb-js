import { Component, HostBinding } from "ngjs-core";

@Component({
  selector: "ngb-progressbar-stacked",
  template: "<ng-content></ng-content>",
})
export class NgbProgressbarStacked {
  @HostBinding("class.progress-stacked") readonly _progressStacked = true;
}
