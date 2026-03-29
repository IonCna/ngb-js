import type { IComponentOptions } from "angular"

export class NavDemoComponent {
    public activeId = 0
    public lastChange = 0

    public onActiveIdChange(id: number) {
        this.lastChange = id
    }

    static get $name() {
        return "ngbNavDemo"
    }

    static get $factory(): IComponentOptions {
        return {
            controllerAs: "$",
            controller: NavDemoComponent,
            template: `
                <div>
                    <ul ngb-nav active-id="$.activeId" active-id-change="$.onActiveIdChange($event)" animation="false">
                        <li ngb-nav-item="0">
                            <button ngb-nav-link>Home</button>
                            <div ngb-nav-content>Contenido Home</div>
                        </li>
                        <li ngb-nav-item="1">
                            <button ngb-nav-link>Profile</button>
                            <div ngb-nav-content>Contenido Profile</div>
                        </li>
                        <li ngb-nav-item="2">
                            <button ngb-nav-link>Contact</button>
                            <div ngb-nav-content>Contenido Contact</div>
                        </li>
                    </ul>
                    <div ngb-nav-outlet class="mt-2"></div>
                    <p class="small text-muted mb-0 mt-2">ultimo cambio: {{ $.lastChange }}</p>
                </div>
            `
        }
    }
}
