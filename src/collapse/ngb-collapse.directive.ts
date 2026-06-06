import type { NgbAccordionCollapse } from "@ngb/accordion/ngb-accordion-collapse.directive";
import { NgbCollapseConfig } from "@ngb/collapse/ngb-collapse-config.service";
import { type INgbEvent, ngbCollapsingTransition, ngbRunTransition } from "@ngb/utils";
import { DigestService } from "@ngb/utils/digest.service";
import type { IAugmentedJQuery, IController, IDirective, ILogService } from "angular";

export interface INgbCollapse {
  toggle(open: boolean): void;
}

export class NgbCollapse implements IController, INgbCollapse {
  public animation!: boolean;
  protected horizontal!: boolean;
  protected hidden?: () => void;
  protected ngbCollapseChange?: ({ $event }: INgbEvent<boolean>) => void;
  protected shown?: () => void;

  private _afterInit = false;
  private _isCollapsed = false;
  private readonly _accordionCollapse?: NgbAccordionCollapse;

  constructor(
    private readonly $element: IAugmentedJQuery,
    private readonly ngbCollapseConfig: NgbCollapseConfig,
    private readonly $log: ILogService,
    private readonly $digestService: DigestService,
  ) {}

  $onInit(): void {
    this.animation = this.animation ?? this.ngbCollapseConfig.animation;
    this.horizontal = this.horizontal ?? this.ngbCollapseConfig.horizontal;

    this._runTransition(this._isCollapsed, false);
    this._afterInit = true;
  }

  $postLink(): void {
    if (this._accordionCollapse) {
      this._accordionCollapse.register(this);
    }
  }

  $onChanges(): void {
    this.$element.toggleClass("collapse-horizontal", !!this.horizontal);
  }

  set collapsed(isCollapsed: boolean) {
    if (isCollapsed === this._isCollapsed) return;
    this._isCollapsed = isCollapsed;

    if (this._afterInit) {
      this._runTransitionWithEvents(isCollapsed, this.animation ?? this.ngbCollapseConfig.animation);
    }
  }

  public toggle(open: boolean = this._isCollapsed): void {
    this._isCollapsed = !open;
    this.ngbCollapseChange?.({ $event: this._isCollapsed });
  }

  private _runTransitionWithEvents(collapsed: boolean, animation: boolean) {
    this._runTransition(collapsed, animation).subscribe(() => {
      if (collapsed) {
        this.hidden?.();
        this.$log.log("[ngb.collapse]: collapse was hidden");
        return;
      }

      this.shown?.();
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
      require: {
        _accordionCollapse: "^?ngbAccordionCollapse",
      },
      scope: {
        animation: "<?",
        horizontal: "<?",
        collapsed: "<ngbCollapse",
        hidden: "&?",
        ngbCollapseChange: "&?",
        shown: "&?",
      },
      bindToController: true,
    });
  }

  static get $name() {
    return "ngbCollapse";
  }
}
