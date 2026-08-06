import type { NgbModalBackdrop } from "@ngb/modal/ngb-modal-backdrop.component";
import type { NgbModalUpdatableOptions } from "@ngb/modal/ngb-modal-config.service";
import type { NgbModalWindow } from "@ngb/modal/ngb-modal-window.component";
import type { ContentRef } from "@ngb/utils/popup.service";
import type { IPromise, IQService } from "angular";
import angular from "angular";
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
    private windowRef: ContentRef<NgbModalWindow>,
    private contentRef: ContentRef<T>,
    private backdropRef?: ContentRef<NgbModalBackdrop>,
    private readonly _beforeDismiss?: () => boolean | Promise<boolean>,
  ) {
    const deferred = this.$q.defer();

    this.result = deferred.promise;
    this._reject = deferred.reject;
    this._resolve = deferred.resolve;

    deferred.promise.then(angular.noop, angular.noop);

    windowRef.componentInstance?.onDismiss((reason: any) => {
      this.dismiss(reason);
    });
  }

  update(options: NgbModalUpdatableOptions): void {
    this.windowRef.componentInstance?.updateOptions(options);
    if (this.backdropRef?.componentInstance) {
      this.backdropRef.componentInstance.updateOptions(options);
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
    return this.windowRef.componentInstance?.shown.asObservable();
  }

  get componentInstance() {
    return this.contentRef.componentInstance;
  }

  private _removeModalElements() {
    const windowTransition = this.windowRef.componentInstance?.hide();
    const backdropTransition = this.backdropRef?.componentInstance?.hide() ?? of(undefined);

    windowTransition?.subscribe(() => {
      this.windowRef.$element.remove();
      this.windowRef.destroy();

      this.contentRef.destroy();
      this.windowRef = <any>null;
      this.contentRef = <any>null;
    });

    backdropTransition.subscribe(() => {
      if (!this.backdropRef) return;
      this.backdropRef.$element.remove();
      this.backdropRef.destroy();
      this.backdropRef = <any>null;
    });

    zip(windowTransition ?? of(undefined), backdropTransition).subscribe(() => {
      this._hidden.next();
      this._hidden.complete();
    });
  }
}
