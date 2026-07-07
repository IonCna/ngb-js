import { NgbOffcanvasConfig, type NgbOffcanvasOptions } from "@ngb/offcanvas/ngb-offcanvas-config.service";
import { NgbOffcanvasStack } from "@ngb/offcanvas/ngb-offcanvas-stack.service";

export class NgbOffcanvas {
    constructor(
        private ngbOffcanvasStack: NgbOffcanvasStack,
        private ngbOffcanvasConfig: NgbOffcanvasConfig,
    ) {}

    open(content: any, options: NgbOffcanvasOptions = {}) {
        const combinedOptions = {
            ...this.ngbOffcanvasConfig,
            animation: this.ngbOffcanvasConfig.animation,
            ...options,
        };

        return this.ngbOffcanvasStack.open(content, combinedOptions);
    }

    get activeInstance() {
        return this.ngbOffcanvasStack.activeInstance;
    }

    dismiss(reason?: any) {
        this.ngbOffcanvasStack.dismiss(reason);
    }

    hasOpenOffcanvas(): boolean {
        return this.ngbOffcanvasStack.hasOpenOffcanvas();
    }

    static get $name() {
        return "ngb.offcanvas.service";
    }

    static get $inject() {
        return [NgbOffcanvasStack.$name, NgbOffcanvasConfig.$name];
    }
}
