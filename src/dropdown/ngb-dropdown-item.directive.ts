import type { NgbDropdownMenu } from "@ngb/dropdown/ngb-dropdown-menu.directive";
import { toNativeElement } from "@ngb/utils";
import type { IController, IDirective, IScope } from "angular";

export class NgbDropdownItem implements IController {
  static readonly ngAcceptInputType_disabled: boolean | "";
  private _disabled = false;
  private unwatchDisabled?: () => void;

  public nativeElement!: HTMLElement;
  public ngbDropdownMenu!: NgbDropdownMenu;
  public tabindex: string | number = 0;

  constructor(
    public $element: JQLite,
    private readonly $scope: IScope,
  ) {}

  set disabled(value: boolean) {
    this._disabled = <any>value === "" || value === true;
  }

  get disabled() {
    return this._disabled;
  }

  $postLink(): void {
    this.nativeElement = toNativeElement(this.$element);
    this.$element.addClass("dropdown-item");
    this.ngbDropdownMenu.register(this);
    this._applyHostBindings();

    if (this.nativeElement instanceof HTMLButtonElement) {
      this.unwatchDisabled = this.$scope.$watch(
        () => this.disabled,
        () => this.$element.attr("disabled", this.disabled ? "disabled" : null),
      );
    }
  }

  $onChanges(): void {
    this._applyHostBindings();
  }

  $doCheck(): void {
    const disabled = this.$element.attr("disabled");
    const needChange = Boolean(disabled) !== this._disabled;

    if (!needChange) return;

    this._disabled = Boolean(disabled);
    this._applyHostBindings();
  }

  $onDestroy(): void {
    this.unwatchDisabled?.();
    this.ngbDropdownMenu.unregister(this);
  }

  private _applyHostBindings() {
    this.$element.toggleClass("disabled", this.disabled);
    this.$element.attr("tabIndex", this.disabled ? -1 : this.tabindex);
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
      require: {
        ngbDropdownMenu: "^ngbDropdownMenu",
      },
      controller: NgbDropdownItem,
      scope: true,
      restrict: "A",
    });
  }

  static get $inject() {
    return ["$element", "$scope"];
  }

  //#endregion
}
