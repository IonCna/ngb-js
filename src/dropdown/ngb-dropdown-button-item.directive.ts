import type { NgbDropdownItem } from "@ngb/dropdown/ngb-dropdown-item.directive";
import type { IController, IDirective } from "angular";

export class NgbDropdownButtonItem implements IController {
  public item!: NgbDropdownItem;
  private unwatchDisabled?: () => void;

  constructor(private readonly $element: JQLite) {}

  $onChanges(): void {
    this._applyHostBindings();
  }

  $postLink(): void {
    this.unwatchDisabled = this.item.onDisabledChange(() => this._applyHostBindings());
    this._applyHostBindings();
  }

  $onDestroy(): void {
    this.unwatchDisabled?.();
  }

  private _applyHostBindings() {
    this.$element.attr("disabled", this.item.isDisabled() ? "disabled" : null);
  }

  static get $name() {
    return "ngbDropdownButtonItem";
  }

  static get $factory(): () => IDirective {
    return () => ({
      bindToController: true,
      controller: NgbDropdownButtonItem,
      require: {
        item: "ngbDropdownItem",
      },
      restrict: "A",
    });
  }

  static get $inject() {
    return ["$element"];
  }
}
