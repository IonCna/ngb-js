import type { IAugmentedJQuery, IController, IDeferred, IDirective, IDocumentService, IQService, ITimeoutService } from "angular"
import { NgbDropdownConfig } from "./ngb-dropdown-config.service"
import type { Placement } from "@floating-ui/dom"

import { ngbPositioning, type NgbPositioning } from "@/utils/positioning"
import { NgbRTL } from "@/utils/rtl.service"
import type { Options } from "@popperjs/core"
import { toNativeElement, type INgbEvent } from "@/utils"
import type { NgbDropdownMenu } from "./ngb-dropdown-menu.directive"
import type { NgbDropdownAnchor } from "./ngb-dropdown-anchor.directive"

export class NgbDropdown implements IController {
    static ngAcceptInputType_autoClose: boolean | string;
    static ngAcceptInputType_display: string;

    private _positioning!: NgbPositioning

    public autoClose?: boolean
    public animation?: boolean
    public container?: string
    public display?: 'dynamic' | 'static'
    public dropdownClass?: string
    private _open = false
    public popperOptions?: Options
    public openChange?: ({ $event }: INgbEvent<unknown>) => void
    public placement?: Placement

    private _menu?: NgbDropdownMenu
    private _anchor?: NgbDropdownAnchor
    private _destroyCloseHandlers?: IDeferred<void>

    constructor(
        private $ngbDropdownConfig: NgbDropdownConfig,
        private $element: IAugmentedJQuery,
        private $document: IDocumentService,
        private $rtl: NgbRTL,
        private $timeout: ITimeoutService,
        private $q: IQService
    ) { }

    $onInit(): void {
        this._positioning = ngbPositioning(this.$rtl)
    }

    $postLink(): void {
        if(!this.display) {
            const isClosestNavbar = toNativeElement(this.$element).closest("navbar")
            this.display = isClosestNavbar ? 'static' : 'dynamic'
        }

        this.$timeout(() => {
            this._applyPlacementClasses()
            if(this._open) {

            }
        }, 0)
    }

    public registerMenu(menu: NgbDropdownMenu) {
        this._menu = menu
    }
    
    public registerAnchor(anchor: NgbDropdownAnchor) {
        this._anchor = anchor
    }

    private _applyPlacementClasses(placement?: Placement | null) {

    }

    private _setCloseHandlers() {}

    //#region $angular

    static get $name() {
        return "ngbDropdown"
    }

    static get $factory(): () => IDirective {
        return () => ({
            restrict: "A",
            scope: true,
            bindToController: {
                autoClose: "<?",
                animation: "<?",
                container: "@?",
                display: "<?",
                dropdownClass: "<?",
                _open: "<?open",
                popperOptions: "<?",
                openChange: "&?",
                placement: "@?"
            },
            controller: NgbDropdown,
        })
    }

    static get $inject() {
        return [
            NgbDropdownConfig.$name,
            '$element',
            '$scope',
            NgbRTL.$name,
            "$timeout",
            "$q"
        ]
    }

    //#endregion
}
