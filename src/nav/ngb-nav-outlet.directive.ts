import type { NgbNav } from "@ngb/nav/ngb-nav.directive";
import type { NgbNavItem } from "@ngb/nav/ngb-nav-item.directive";
import type { NgbNavPane } from "@ngb/nav/ngb-nav-pane.directive";
import type { IController, IDirective } from "angular";

export class NgbNavOutlet implements IController {
  private _activePane?: NgbNavPane;
  private _panes: NgbNavPane[] = [];
  private nav!: NgbNav;
  //#region $angular

  public register(pane: NgbNavPane) {
    this._panes.push(pane);
  }

  public isPanelTransitioning(item: NgbNavItem) {
    this._activePane = this._getActivePane();
  }

  $postLink(): void {
    this._updateActivePane();
  }

  private _updateActivePane() {
    this._activePane = this._getActivePane();
    this._activePane?.$element.addClass("show");
    this._activePane?.$element.addClass("active");
  }

  private _getPaneForItem(item: NgbNavItem | undefined) {
    return (this._panes && this._panes.find((pane) => pane.item === item)) || undefined;
  }

  private _getActivePane(): NgbNavPane | undefined {
    return (this._panes && this._panes.find((pane) => pane.item.active)) || undefined;
  }

  static get $name() {
    return "ngbNavOutlet";
  }

  static get $inject() {
    return ["$element", "$compile"];
  }

  static get $factory(): () => IDirective {
    return () => ({
      controller: NgbNavOutlet,
      bindToController: {
        paneRole: "<?",
        nav: "<ngbNavOutlet",
      },
      restrict: "A",
      scope: true,
    });
  }

  //#endregion
}
