import { toNativeElement } from "@ngb/utils";
import type { IController, IDirective } from "angular";
import { NgDisabled } from "ngjs-core";

export class NgbDropdownItem implements IController {
  public ngDisabled?: NgDisabled;
  private removeDisabledListener?: () => void;

  public nativeElement!: HTMLElement;
  public tabindex: string | number = 0;

  constructor(public $element: JQLite) {}

  isDisabled(): boolean {
    return this.ngDisabled?.disabled ?? false;
  }

  onDisabledChange(callback: (disabled: boolean) => void): () => void {
    return this.ngDisabled?.onChange(callback) ?? (() => undefined);
  }

  $postLink(): void {
    this.nativeElement = toNativeElement(this.$element);
    this.$element.addClass("dropdown-item");
    this._applyHostBindings();

    this.removeDisabledListener = this.onDisabledChange(() => this._applyHostBindings());
  }

  $onChanges(): void {
    this._applyHostBindings();
  }

  $onDestroy(): void {
    this.removeDisabledListener?.();
  }

  private _applyHostBindings() {
    this.$element.toggleClass("disabled", this.isDisabled());
    this.$element.attr("tabIndex", this.isDisabled() ? -1 : this.tabindex);
  }

  //#region $angular

  static get $name() {
    return "ngbDropdownItem";
  }

  static get $factory(): () => IDirective {
    return () => ({
      bindToController: {
        tabindex: "<?",
      },
      controller: NgbDropdownItem,
      require: {
        ngDisabled: "?ngDisabled",
      },
      scope: true,
      restrict: "A",
    });
  }

  static get $inject() {
    return ["$element"];
  }

  //#endregion
}
