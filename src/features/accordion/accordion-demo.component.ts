import type { IComponentOptions } from "angular"

export class AccordionDemoComponent {
    public firstCollapsed = false
    public secondCollapsed = true

    static get $name() {
        return "ngbAccordionDemo"
    }

    static get $factory(): IComponentOptions {
        return {
            controllerAs: "$",
            controller: AccordionDemoComponent,
            template: `
                <div ngb-accordion close-others="true" animation="false">
                    <div ngb-accordion-item="'first'" collapsed="$.firstCollapsed">
                        <h2 ngb-accordion-header>
                            <button ngb-accordion-button>Primer item</button>
                        </h2>
                        <div ngb-accordion-collapse>
                            <div ngb-accordion-body>
                                Body del primer item.
                            </div>
                        </div>
                    </div>

                    <div ngb-accordion-item="'second'" collapsed="$.secondCollapsed">
                        <h2 ngb-accordion-header>
                            <button ngb-accordion-button>Segundo item</button>
                        </h2>
                        <div ngb-accordion-collapse>
                            <div ngb-accordion-body>
                                Body del segundo item.
                            </div>
                        </div>
                    </div>
                </div>
            `
        }
    }
}
