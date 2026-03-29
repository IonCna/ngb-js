import type { IComponentOptions } from "angular"

export class CollapseDemoComponent {
    public isCollapsed = false
    public isHorizontalCollapsed = true
    public changed = 0
    public hidden = 0
    public shown = 0

    public toggleVertical() {
        this.isCollapsed = !this.isCollapsed
    }

    public toggleHorizontal() {
        this.isHorizontalCollapsed = !this.isHorizontalCollapsed
    }

    public onHidden() {
        this.hidden += 1
    }

    public onShown() {
        this.shown += 1
    }

    public onChange() {
        this.changed += 1
    }

    static get $name() {
        return "ngbCollapseDemo"
    }

    static get $factory(): IComponentOptions {
        return {
            controllerAs: "$",
            controller: CollapseDemoComponent,
            template: `
                <div class="vstack gap-3">
                    <div class="d-flex gap-2 align-items-center flex-wrap">
                        <button type="button" class="btn btn-outline-secondary btn-sm" ng-click="$.toggleVertical()">Toggle vertical</button>
                        <button type="button" class="btn btn-outline-secondary btn-sm" ng-click="$.toggleHorizontal()">Toggle horizontal</button>
                        <span class="small text-muted">shown: {{ $.shown }} | hidden: {{ $.hidden }} | changed: {{ $.changed }}</span>
                    </div>

                    <div ngb-collapse="$.isCollapsed" ngb-hidden="$.onHidden()" shown="$.onShown()" ngb-collapse-change="$.onChange()">
                        <div class="card card-body">Contenido vertical.</div>
                    </div>

                    <div style="min-height: 96px;">
                        <div ngb-collapse="$.isHorizontalCollapsed" horizontal="true" style="width: 260px;">
                            <div class="card card-body">Contenido horizontal.</div>
                        </div>
                    </div>
                </div>
            `
        }
    }
}
