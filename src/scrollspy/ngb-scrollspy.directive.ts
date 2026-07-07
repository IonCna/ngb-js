import { NgbScrollSpyConfig } from "@ngb/scrollspy/ngb-scrollspy-config.service";
import type { NgbScrollSpyFragment } from "@ngb/scrollspy/ngb-scrollspy-fragment.directive";
import {
    NgbScrollSpyService,
    type NgbScrollSpyProcessChanges,
    type NgbScrollToOptions,
} from "@ngb/scrollspy/scrollspy.service";
import { DigestService } from "@ngb/utils/digest.service";
import type { IAugmentedJQuery, IController, IDirective, IOnChangesObject } from "angular";
import type { Observable, Subscription } from "rxjs";

export class NgbScrollSpy implements IController {
    static ngAcceptInputType_scrollBehavior: string;

    private _initialFragment: string | null = null;
    private _activeChangeSubscription?: Subscription;
    private _service: NgbScrollSpyService;

    public processChanges?: NgbScrollSpyProcessChanges;
    public rootMargin?: string;
    public scrollBehavior?: "auto" | "smooth";
    public threshold?: number | number[];
    public activeChange?: ({ $event }: { $event: string }) => void;

    constructor(
        private $element: IAugmentedJQuery,
        $config: NgbScrollSpyConfig,
        $digestService: DigestService,
    ) {
        this._service = new NgbScrollSpyService($config, $digestService);
    }

    set active(fragment: string) {
        this._initialFragment = fragment;

        if (fragment) {
            this.scrollTo(fragment);
        }
    }

    /**
     * Getter/setter for the currently active fragment id.
     */
    get active(): string {
        return this._service.active;
    }

    /**
     * Returns an observable that emits currently active section id.
     */
    get active$(): Observable<string> {
        return this._service.active$;
    }

    $postLink(): void {
        this.$element.attr("tabindex", "0");
        this.$element.css("overflow-y", "auto");

        this._service.start({
            processChanges: this.processChanges,
            root: this.$element,
            rootMargin: this.rootMargin,
            threshold: this.threshold,
            scrollBehavior: this.scrollBehavior,
            ...(this._initialFragment && { initialFragment: this._initialFragment }),
        });

        this._activeChangeSubscription = this._service.active$.subscribe((active) => {
            this.activeChange?.({ $event: active });
        });
    }

    $onChanges(changes: IOnChangesObject): void {
        if (changes.active && !changes.active.isFirstChange()) {
            this.active = changes.active.currentValue;
        }
    }

    $onDestroy(): void {
        this._activeChangeSubscription?.unsubscribe();
        this._service.$onDestroy();
    }

    /**
     * @internal
     */
    _registerFragment(fragment: NgbScrollSpyFragment): void {
        this._service.observe(fragment.id);
    }

    /**
     * @internal
     */
    _unregisterFragment(fragment: NgbScrollSpyFragment): void {
        this._service.unobserve(fragment.id);
    }

    /**
     * Scrolls to a fragment that is identified by the `ngbScrollSpyFragment` directive.
     * An id or an element reference can be passed.
     */
    scrollTo(fragment: string | HTMLElement | IAugmentedJQuery, options?: NgbScrollToOptions): void {
        this._service.scrollTo(fragment, {
            ...(this.scrollBehavior && { behavior: this.scrollBehavior }),
            ...options,
        });
    }

    //#region $angular

    static get $name() {
        return "ngbScrollSpy";
    }

    static get $factory(): () => IDirective {
        return () => ({
            bindToController: {
                active: "@?",
                activeChange: "&?",
                processChanges: "<?",
                rootMargin: "@?",
                scrollBehavior: "@?",
                threshold: "<?",
            },
            controller: NgbScrollSpy,
            scope: true,
            restrict: "A",
        });
    }

    static get $inject() {
        return ["$element", NgbScrollSpyConfig.$name, DigestService.$name];
    }

    //#endregion
}
