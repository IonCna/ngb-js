import type { IComponentOptions } from "angular"

export class AlertDemoComponent {
    public closedCount = 0

    public onClosed() {
        this.closedCount += 1
    }

    static get $name() {
        return "ngbAlertDemo"
    }

    static get $factory(): IComponentOptions {
        return {
            controllerAs: "$",
            controller: AlertDemoComponent,
            template: `
                <div class="vstack gap-2">
                    <ngb-alert type="success" dismissible="true" animation="true" closed="$.onClosed()">
                        Alerta success con callback.
                    </ngb-alert>

                    <ngb-alert type="warning" dismissible="false" animation="false">
                        Alerta warning sin boton de cierre.
                    </ngb-alert>

                    <ngb-alert type="danger" dismissible="true" animation="false">
                        Alerta danger con dismiss.
                    </ngb-alert>

                    <p class="small text-muted mb-0">closed callbacks: {{ $.closedCount }}</p>
                </div>
            `
        }
    }
}
