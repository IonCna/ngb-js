import type { IComponentOptions } from "angular"

export class DropdownDemoComponent {
    public isOpen = false
    public lastAction = "ninguna"

    public onOpenChange(state: boolean) {
        this.isOpen = state
    }

    public selectAction(action: string) {
        this.lastAction = action
    }

    static get $name() {
        return "ngbDropdownDemo"
    }

    static get $factory(): IComponentOptions {
        return {
            controllerAs: "$",
            controller: DropdownDemoComponent,
            template: `
                <div class="vstack gap-2">
                    <div ngb-dropdown open="$.isOpen" open-change="$.onOpenChange(state)" auto-close="'inside'" animation="false">
                        <button type="button" class="btn btn-outline-secondary btn-sm" ngb-dropdown-toggle>
                            {{ $.isOpen ? 'Cerrar' : 'Abrir' }} menu
                        </button>

                        <div ngb-dropdown-menu>
                            <button type="button" ngb-dropdown-button-item ng-click="$.selectAction('action')">Action</button>
                            <button type="button" ngb-dropdown-button-item ng-click="$.selectAction('another')">Another action</button>
                            <button type="button" ngb-dropdown-button-item ngb-disabled="true">Disabled</button>
                        </div>
                    </div>

                    <p class="small text-muted mb-0">last action: {{ $.lastAction }}</p>
                </div>
            `
        }
    }
}
