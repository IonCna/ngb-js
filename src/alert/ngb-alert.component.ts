import { NgbAlertConfig } from "@ngb/alert/ngb-alert-config.service";
import { ngbAlertFadingTransition } from "@ngb/alert/ngb-alert-transition";
import { ngbRunTransition } from "@ngb/utils/transition/ngb-transition";
import { Component, ElementRef, EventEmitter, HostBinding, inject, Input, NgZone, Output } from "ngjs-core";
import type { Observable } from "rxjs";

export interface INgbAlert {
  close(): Observable<void>;
}

@Component({
  selector: "ngb-alert",
  exportAs: "ngbAlert",
  styleUrl: "./ngb-alert.css",
  template: `<ng-content></ng-content>

<button ng-if="$.dismissible" ng-click="$.close()" type="button" class="btn-close" aria-label="Close">
</button>`,
})
export class NgbAlert implements INgbAlert {
  // NgbAlertConfig es @Service: no lo resuelve el $injector nativo de
  // AngularJS por constructor, solo inject() (cae al RootSingletonRegistry).
  private readonly _config = inject(NgbAlertConfig);
  private readonly _elementRef = inject(ElementRef<HTMLElement>);
  private readonly _zone = inject(NgZone);

  @Input() animation = this._config.animation;
  @Input() dismissible = this._config.dismissible;
  /** String literal como en Angular (`type="success"`); dinámico con interpolación (`type="{{ $.tipo }}"`). */
  @Input({ binding: "@" }) type = this._config.type;
  @Output() closed = new EventEmitter<void>();

  @HostBinding("attr.role") readonly _role = "alert";

  @HostBinding("class")
  get _hostClass(): string {
    return `alert show${this.type ? ` alert-${this.type}` : ""}`;
  }

  @HostBinding("class.fade")
  get _fade(): boolean {
    return this.animation;
  }

  @HostBinding("class.alert-dismissible")
  get _dismissibleClass(): boolean {
    return this.dismissible;
  }

  close(): Observable<void> {
    const transition = ngbRunTransition(this._zone, this._elementRef.nativeElement, ngbAlertFadingTransition, {
      animation: this.animation,
      runningTransition: "continue",
    });

    transition.subscribe(() => {
      this.closed.emit();
    });

    return transition;
  }
}
