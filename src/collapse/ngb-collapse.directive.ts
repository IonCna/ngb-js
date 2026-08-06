import { NgbCollapseConfig } from "@ngb/collapse/ngb-collapse-config.service";
import { type INgbEvent, ngbCollapsingTransition, ngbRunTransition } from "@ngb/utils";
import { DigestService } from "@ngb/utils/digest.service";
import type { IAugmentedJQuery, IController, IDirective, ILogService } from "angular";
import { Subject } from "rxjs";

export interface INgbCollapse {
  toggle(open?: boolean): void;
}

export class NgbCollapse implements IController, INgbCollapse {
  public animation!: boolean;
  public horizontal!: boolean;
  public readonly hidden = new Subject<void>();
  public readonly shown = new Subject<void>();

  protected hiddenCallback?: () => void;
  protected ngbCollapseChange?: ({ $event }: INgbEvent<boolean>) => void;
  protected shownCallback?: () => void;

  private _afterInit = false;
  private _isCollapsed = false;

  constructor(
    private readonly $element: IAugmentedJQuery,
    private readonly ngbCollapseConfig: NgbCollapseConfig,
    private readonly $log: ILogService,
    private readonly $digestService: DigestService,
  ) {}

  $onInit(): void {
    this.animation = this.animation ?? this.ngbCollapseConfig.animation;
    this.horizontal = this.horizontal ?? this.ngbCollapseConfig.horizontal;
    this.$element.toggleClass("collapse-horizontal", this.horizontal);

    this._runTransition(this._isCollapsed, false);
    this._afterInit = true;
  }

  $onChanges(): void {
    this.$element.toggleClass("collapse-horizontal", !!this.horizontal);
  }

  $onDestroy(): void {
    this.hidden.complete();
    this.shown.complete();
  }

  set collapsed(isCollapsed: boolean) {
    if (isCollapsed === undefined) return;
    if (isCollapsed === this._isCollapsed) return;
    this._isCollapsed = isCollapsed;

    if (this._afterInit) {
      this._runTransitionWithEvents(isCollapsed, this.animation ?? this.ngbCollapseConfig.animation);
    }
  }

  public toggle(open: boolean = this._isCollapsed): void {
    this.collapsed = !open;
    this.ngbCollapseChange?.({ $event: this._isCollapsed });
  }

  private _runTransitionWithEvents(collapsed: boolean, animation: boolean) {
    this._runTransition(collapsed, animation).subscribe(() => {
      if (collapsed) {
        this.hiddenCallback?.();
        this.hidden.next();
        this.$log.log("[ngb.collapse]: collapse was hidden");
        return;
      }

      this.shownCallback?.();
      this.shown.next();
      this.$log.log("[ngb.collapse]: collapse was shown");
    });
  }

  private _runTransition(collapsed: boolean, animation: boolean) {
    return ngbRunTransition(this.$digestService, this.$element, ngbCollapsingTransition, {
      animation,
      runningTransition: "stop",
      context: {
        direction: collapsed ? "hide" : "show",
        dimension: this.horizontal ? "width" : "height",
      },
    });
  }

  static get $inject() {
    return ["$element", NgbCollapseConfig.$name, "$log", DigestService.$name];
  }

  static get $factory(): () => IDirective {
    return () => ({
      controller: NgbCollapse,
      restrict: "A",
      scope: {
        animation: "<?",
        horizontal: "<?",
        collapsed: "<ngbCollapse",
        hiddenCallback: "&?ngbHidden",
        ngbCollapseChange: "&?",
        shownCallback: "&?shown",
      },
      bindToController: true,
    });
  }

  static get $name() {
    return "ngbCollapse";
  }
}
