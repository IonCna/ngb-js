import type { NgbModalBackdrop } from "@ngb/modal/ngb-modal-backdrop.component";
import type { NgbModalUpdatableOptions } from "@ngb/modal/ngb-modal-config.service";
import type { NgbModalWindow } from "@ngb/modal/ngb-modal-window.component";
import type { ContentRef } from "@ngb/utils/popup.service";
import type { IPromise, IQService } from "angular";
import angular from "angular";
import type { ComponentRef } from "ngjs-core";
import { of, Subject, takeUntil, zip } from "rxjs";

export class NgbActiveModal {
  update(_options: NgbModalUpdatableOptions): void {}
  close(_result?: any): void {}
  dismiss(_reason?: any): void {}
}

export class NgbModalRef<T = any> {
  private readonly _resolve?: (result?: any) => void;
  private readonly _reject?: (reason?: any) => void;

  public result?: IPromise<any>;

  private readonly _hidden = new Subject<void>();
  private readonly _dismissed = new Subject<any>();
  private readonly _closed = new Subject<any>();

  constructor(
    private readonly $q: IQService,
    private windowRef: ComponentRef<NgbModalWindow>,
    private contentRef: ContentRef<T>,
    private backdropRef?: ComponentRef<NgbModalBackdrop>,
    private readonly _beforeDismiss?: () => boolean | Promise<boolean>,
  ) {
    const deferred = this.$q.defer();

    this.result = deferred.promise;
    this._reject = deferred.reject;
    this._resolve = deferred.resolve;

    deferred.promise.then(angular.noop, angular.noop);

    windowRef.instance?.onDismiss((reason: any) => {
      this.dismiss(reason);
    });
  }

  update(options: NgbModalUpdatableOptions): void {
    this.windowRef.instance?.updateOptions(options);
    if (this.backdropRef?.instance) {
      this.backdropRef.instance.updateOptions(options);
    }
  }

  dismiss(reason: any) {
    if (!this.windowRef) return;
    if (!this._beforeDismiss) {
      this._dismiss(reason);
      return;
    }

    const dismiss = this._beforeDismiss();

    this.$q.when(dismiss).then((result) => {
      if (result !== false) this._dismiss(reason);
    }, angular.noop);
  }

  close(result?: any) {
    if (!this.windowRef) return;
    this._closed.next(result);
    this._resolve?.(result);
    this._removeModalElements();
  }

  private _dismiss(reason?: any) {
    this._dismissed.next(reason);
    this._reject?.(reason);
    this._removeModalElements();
  }

  get closed() {
    return this._closed.asObservable().pipe(takeUntil(this._hidden));
  }

  get dismissed() {
    return this._dismissed.asObservable().pipe(takeUntil(this._hidden));
  }

  get hidden() {
    return this._hidden.asObservable();
  }

  get shown() {
    return this.windowRef.instance?.shown.asObservable();
  }

  get componentInstance() {
    return this.contentRef.componentRef?.instance;
  }

  private _removeModalElements() {
    const windowTransition = this.windowRef.instance?.hide();
    const backdropTransition = this.backdropRef?.instance?.hide() ?? of(undefined);

    windowTransition?.subscribe(() => {
      angular.element(this.windowRef.location.nativeElement).remove();
      this.windowRef.destroy();

      this.contentRef.componentRef?.destroy();
      this.contentRef.viewRef?.destroy();
      this.windowRef = <any>null;
      this.contentRef = <any>null;
    });

    backdropTransition.subscribe(() => {
      if (!this.backdropRef) return;
      angular.element(this.backdropRef.location.nativeElement).remove();
      this.backdropRef.destroy();
      this.backdropRef = <any>null;
    });

    zip(windowTransition ?? of(undefined), backdropTransition).subscribe(() => {
      this._hidden.next();
      this._hidden.complete();
    });
  }
}
