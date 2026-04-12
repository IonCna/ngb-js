import type { IAugmentedJQuery, IComponentController, IComponentOptions } from "angular";
import template from "@/modal/ngb-modal-window.component.html?raw"
import {
    type NgbModalUpdatableOptions
} from "@/modal/ngb-modal-config.service"
import angular from "angular";

const WINDOW_ATTRIBUTES: string[] = [
    'animation',
    'ariaLabelledBy',
    'ariaDescribedBy',
    'backdrop',
    'centered',
    'fullscreen',
    'keyboard',
    'role',
    'scrollable',
    'size',
    'windowClass',
    'modalDialogClass',
] as const;

export class NgbModalWindow implements IComponentController {
    public animation?: boolean;
    public ariaLabelledBy?: string;
    public ariaDescribedBy?: string;
    public backdrop: boolean | string = true;
    public centered?: string;
    public fullscreen?: string | boolean;
    public keyboard = true;
    public role: string = 'dialog';
    public scrollable?: string;
    public size?: string;
    public windowClass?: string;
    public modalDialogClass?: string;

    private _elWithFocus?: IAugmentedJQuery;

    $onInit(): void { }
    $onDestroy(): void { }

    get $fullscreenClass(): string {
        const isStr = angular.isString(this.fullscreen)
        const staticStr = isStr ? `modal-fullscreen-${this.fullscreen}-down` : ''

        return this.fullscreen === true ? 'modal-fullscreen' : staticStr
    }

    get $modalSizeClass() {
        return this.size ? `modal-${this.size}` : ''
    }

    get $modalCentredClass() {
        return this.centered ? 'modal-dialog-centered' : ''
    }

    get $modalScrollableClass() {
        return this.scrollable ? 'modal-dialog-scrollable' : ''
    }

    get $modalDialogClass() {
        return this.modalDialogClass ? this.modalDialogClass : ''
    }

    public dismiss() { }

    public hide() { }

    public updateOptions(options: NgbModalUpdatableOptions) { }

    private _show() { }

    private _enableEventHandling() { }

    private _disableEventHandling() { }

    private _setFocus() { }

    private _restoreFocus() { }

    private _bumpBackdrop() { }

    static get $name() {
        return "ngbModalWindow"
    }

    static get $factory(): IComponentOptions {
        return {
            controller: NgbModalWindow,
            controllerAs: "$",
            template,
            bindings: {
                animation: "<?",
                ariaLabelledBy: "<?",
                ariaDescribedBy: "<?",
                backdrop: "<?",
                centered: "<?",
                fullscreen: "<?",
                keyboard: "<?",
                role: "<?",
                scrollable: "<?",
                size: "<?",
                windowClass: "<?",
                modalDialogClass: "<?",
                dismiss: "&?"
            },
            transclude: true
        }
    }
}
