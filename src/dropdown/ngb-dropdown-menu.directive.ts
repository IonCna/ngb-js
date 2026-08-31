import type { NgbDropdown } from "@ngb/dropdown/ngb-dropdown.directive";
import { NgbDropdownItem } from "@ngb/dropdown/ngb-dropdown-item.directive";
import { toNativeElement } from "@ngb/utils";
import type { IController, IDirective, IScope } from "angular";
import { ContentChildren, type QueryList } from "ngjs-core";

const ALLOWED_KEYS = new Set(["ArrowUp", "ArrowDown", "Home", "End", "Enter", " ", "Tab"]);

export class NgbDropdownMenu implements IController {
  public dropdown!: NgbDropdown;
  public nativeElement!: HTMLElement;

  @ContentChildren(NgbDropdownItem)
  public menuItems!: QueryList<NgbDropdownItem>;

  private keydownListener?: (event: JQueryEventObject) => void;
  private unwatchOpenState?: () => void;

  constructor(
    public $element: JQLite,
    private readonly $scope: IScope,
  ) {}

  $postLink(): void {
    this.$element.addClass("dropdown-menu");
    this.nativeElement = toNativeElement(this.$element);

    this.unwatchOpenState = this.$scope.$watch(
      () => this.dropdown.isOpen(),
      (isOpen) => this.$element.toggleClass("show", isOpen),
    );

    this.keydownListener = (event) => {
      if (!ALLOWED_KEYS.has(event.key)) return;

      this.dropdown.onKeyDown(event);
    };

    this.$element.on("keydown", this.keydownListener);
  }

  $onDestroy(): void {
    if (this.keydownListener) this.$element.off("keydown", this.keydownListener);
    this.unwatchOpenState?.();
  }

  //#region $angular
  static get $name() {
    return "ngbDropdownMenu";
  }

  static get $factory(): () => IDirective {
    return () => ({
      bindToController: true,
      controller: NgbDropdownMenu,
      require: {
        dropdown: "^ngbDropdown",
      },
      scope: true,
      restrict: "A",
      transclude: true,
      template: "<ng-content></ng-content>",
    });
  }

  static get $inject() {
    return ["$element", "$scope"];
  }
  //#endregion
}
