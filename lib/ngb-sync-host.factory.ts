import type { IAugmentedJQuery, IScope } from "angular"

// type SyncHostManager = Record<string, () => boolean>

// @Host({
//     role: 'alert',
//     class: {
//         "$": '"alert show d-block" + ($.type ? " alert-" + $.type : ""  )',
//         "fade": '$.animation',
//         "alert-dismissible": '$.dismissible'
//     }
// })

type Statics = AttrObj

type AttrObj = {
    classNames?: Record<string, () => boolean>
    attributes?: Record<string, () => any>,
    css?: Record<string, () => string>
}

export interface IHostSynchronizer {
    apply(obj: AttrObj): void
}

class HostSynchronizer implements IHostSynchronizer {
    constructor(private $element: IAugmentedJQuery, $scope: IScope, statics: Statics) {
        this.apply(statics)
    }

    apply(obj: AttrObj) {
        const classNames = obj?.classNames ?? {}
        const attributes = obj?.attributes ?? {}

        for (const [name, value] of Object.entries(classNames)) {
            this.$element.toggleClass(name, value())
        }

        for (const [name, value] of Object.entries(attributes)) {
            this.$element.attr(name, value())
        }
    }
}

export class NgbHostSynchronizerFactory {
    public $create($element: IAugmentedJQuery, $scope: IScope, statics: Statics) {
        return new HostSynchronizer($element, $scope, statics)
    }

    static get $name() {
        return "ngb.sync.host.factory"
    }
}