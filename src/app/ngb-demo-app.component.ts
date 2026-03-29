import type { IComponentOptions } from "angular"

export class NgbDemoAppComponent {
    static get $name() {
        return "ngbDemoApp"
    }

    static get $factory(): IComponentOptions {
        return {
            template: `
                <main class="container py-4">
                    <header class="mb-4">
                        <h1 class="h3 mb-1">ngb-js demos</h1>
                        <p class="text-muted mb-0">Una demo por componente, organizada por features.</p>
                    </header>

                    <div class="row g-3">
                        <div class="col-12 col-lg-6">
                            <section class="card h-100">
                                <div class="card-body">
                                    <h2 class="h5 card-title">Alert</h2>
                                    <ngb-alert-demo></ngb-alert-demo>
                                </div>
                            </section>
                        </div>

                        <div class="col-12 col-lg-6">
                            <section class="card h-100">
                                <div class="card-body">
                                    <h2 class="h5 card-title">Progressbar</h2>
                                    <ngb-progressbar-demo></ngb-progressbar-demo>
                                </div>
                            </section>
                        </div>

                        <div class="col-12 col-lg-6">
                            <section class="card h-100">
                                <div class="card-body">
                                    <h2 class="h5 card-title">Collapse</h2>
                                    <ngb-collapse-demo></ngb-collapse-demo>
                                </div>
                            </section>
                        </div>

                        <div class="col-12 col-lg-6">
                            <section class="card h-100">
                                <div class="card-body">
                                    <h2 class="h5 card-title">Accordion</h2>
                                    <ngb-accordion-demo></ngb-accordion-demo>
                                </div>
                            </section>
                        </div>

                        <div class="col-12 col-lg-6">
                            <section class="card h-100">
                                <div class="card-body">
                                    <h2 class="h5 card-title">Toast</h2>
                                    <ngb-toast-demo></ngb-toast-demo>
                                </div>
                            </section>
                        </div>

                        <div class="col-12 col-lg-6">
                            <section class="card h-100">
                                <div class="card-body">
                                    <h2 class="h5 card-title">Modal</h2>
                                    <ngb-modal-demo></ngb-modal-demo>
                                </div>
                            </section>
                        </div>

                        <div class="col-12 col-lg-6">
                            <section class="card h-100">
                                <div class="card-body">
                                    <h2 class="h5 card-title">Dropdown</h2>
                                    <ngb-dropdown-demo></ngb-dropdown-demo>
                                </div>
                            </section>
                        </div>

                        <div class="col-12 col-lg-6">
                            <section class="card h-100">
                                <div class="card-body">
                                    <h2 class="h5 card-title">Nav</h2>
                                    <ngb-nav-demo></ngb-nav-demo>
                                </div>
                            </section>
                        </div>

                        <div class="col-12 col-lg-6">
                            <section class="card h-100">
                                <div class="card-body">
                                    <h2 class="h5 card-title">Tooltip</h2>
                                    <ngb-tooltip-demo></ngb-tooltip-demo>
                                </div>
                            </section>
                        </div>

                        <div class="col-12 col-lg-6">
                            <section class="card h-100">
                                <div class="card-body">
                                    <h2 class="h5 card-title">Carousel</h2>
                                    <ngb-carousel-demo></ngb-carousel-demo>
                                </div>
                            </section>
                        </div>
                    </div>
                </main>
            `
        }
    }
}
