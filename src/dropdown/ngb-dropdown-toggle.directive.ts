import { NgbDropdownAnchor } from "@ngb/dropdown/ngb-dropdown-anchor.directive";
import type { IDirective } from "angular";

const ALLOWED_KEYS = new Set(["ArrowUp", "ArrowDown", "Home", "End", "Tab"]);

export class NgbDropdownToggle extends NgbDropdownAnchor {
  private clickListener?: (event: JQueryEventObject) => void;
  private keydownListener?: (event: JQueryEventObject) => void;

  override $postLink(): void {
    super.$postLink();

    this.clickListener = () => {
      this.$scope.$evalAsync(() => this.dropdown.toggle());
    };

    this.keydownListener = (event) => {
      if (ALLOWED_KEYS.has(event.key)) this.dropdown.onKeyDown(event);
    };

    this.$element.on("click", this.clickListener);
    this.$element.on("keydown", this.keydownListener);
  }

  override $onDestroy(): void {
    if (this.clickListener) this.$element.off("click", this.clickListener);
    if (this.keydownListener) this.$element.off("keydown", this.keydownListener);
    super.$onDestroy();
  }

  //#region $angular

  static get $name() {
    return "ngbDropdownToggle";
  }

  static get $factory(): () => IDirective {
    return () => ({
      bindToController: true,
      scope: true,
      require: {
        dropdown: "^ngbDropdown",
      },
      controller: NgbDropdownToggle,
      restrict: "A",
    });
  }

  //#endregion
}
