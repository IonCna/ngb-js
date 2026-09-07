import { NgbCollapseConfig } from "@ngb/collapse/ngb-collapse-config.service";
import { ngbCollapsingTransition, ngbRunTransition } from "@ngb/utils";
import {
  Directive,
  ElementRef,
  EventEmitter,
  HostBinding,
  inject,
  Input,
  NgZone,
  type OnInit,
  Output,
} from "ngjs-core";
import type { Observable } from "rxjs";

export interface INgbCollapse {
  toggle(open?: boolean): void;
}

@Directive({
  selector: "[ngbCollapse]",
  exportAs: "ngbCollapse",
})
export class NgbCollapse implements OnInit, INgbCollapse {
  private _config = inject(NgbCollapseConfig);
  private _element = inject<ElementRef<HTMLElement>>(ElementRef);
  private _zone = inject(NgZone);
  private _afterInit = false;
  private _isCollapsed = false;

  @Input() animation = this._config.animation;

  @Input("ngbCollapse")
  set collapsed(isCollapsed: boolean) {
    if (this._isCollapsed !== isCollapsed) {
      this._isCollapsed = isCollapsed;
      if (this._afterInit) {
        this._runTransitionWithEvents(isCollapsed, this.animation);
      }
    }
  }

  @Output() ngbCollapseChange = new EventEmitter<boolean>();
  @Input() horizontal = this._config.horizontal;
  @Output() shown = new EventEmitter<void>();
  @Output() hidden = new EventEmitter<void>();

  @HostBinding("class.collapse-horizontal")
  get _collapseHorizontal(): boolean {
    return this.horizontal;
  }

  ngOnInit() {
    this._runTransition(this._isCollapsed, false);
    this._afterInit = true;
  }

  toggle(open: boolean = this._isCollapsed): void {
    this.collapsed = !open;
    this.ngbCollapseChange.next(this._isCollapsed);
  }

  private _runTransition(collapsed: boolean, animation: boolean): Observable<void> {
    return ngbRunTransition(this._zone, this._element.nativeElement, ngbCollapsingTransition, {
      animation,
      runningTransition: "stop",
      context: { direction: collapsed ? "hide" : "show", dimension: this.horizontal ? "width" : "height" },
    });
  }

  private _runTransitionWithEvents(collapsed: boolean, animation: boolean): void {
    this._runTransition(collapsed, animation).subscribe(() => {
      if (collapsed) {
        this.hidden.emit();
      } else {
        this.shown.emit();
      }
    });
  }
}
