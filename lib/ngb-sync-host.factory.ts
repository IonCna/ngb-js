import type { IAugmentedJQuery } from "angular"

// type SyncHostManager = Record<string, () => boolean>

// @Host({
//     role: 'alert',
//     class: {
//         "$": '"alert show d-block" + ($.type ? " alert-" + $.type : ""  )',
//         "fade": '$.animation',
//         "alert-dismissible": '$.dismissible'
//     }
// })

export type HostSynchronizer = SyncHost

type Statics = {
    classNames?: string[]
    attributes?: Record<string, string>
}

class SyncHost {
    constructor(private $element: IAugmentedJQuery, statics?: Statics) {
        if(!statics) return

        statics.classNames?.forEach(className => this.$element.addClass(className))
        const attributes = statics.attributes ?? {}

        for (const [name, value] of Object.entries(attributes)) {
            this.$element.attr(name, value)
        }
    }

    syncClasses(dynamics: Record<string, () => boolean>) {
        for (const [name, value] of Object.entries(dynamics)) {
            this.$element.toggleClass(name, value())
        }
    }
}

export class NgbSyncHostFactory {
    public $create($element: IAugmentedJQuery, statics?: Statics) {
        return new SyncHost($element, statics)
    }

    static get $name() {
        return "ngb.sync.host.factory"
    }
}