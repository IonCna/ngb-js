import type { ModalRef } from "@/modal/ngb-modal.service"

export class NgbActiveModal {
    constructor(private currentModalRef: ModalRef) { }

    public close(result: any) {
        this.currentModalRef.close(result)
    }

    public dismiss(reason?: any) {
        this.currentModalRef.dismiss(reason)
    }
}

export class NgbActiveModalFactory {
    public create(modalRef: ModalRef) {
        return new NgbActiveModal(modalRef)
    }

    static get $name() {
        return "ngbActiveModalFactory"
    }
}
