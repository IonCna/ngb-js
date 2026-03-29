import type { IAugmentedJQuery, IScope } from "angular"

type SyncHostManager = Record<string, () => any>

type SyncHostCreateObj = {
    classNames?: SyncHostManager
    attributes?: SyncHostManager
    style?: SyncHostManager
}

type SyncHostSnapshot = {
    classNames: Record<string, any>
    attributes: Record<string, any>
    style: Record<string, any>
}

export interface IHostSynchronizer {
    $destroy: () => void
}

class HostSynchronizer {
    private watcher?: () => void

    constructor(
        private $element: IAugmentedJQuery,
        private $scope: IScope,
        private createObj: SyncHostCreateObj
    ) {
        this.watcher = this.$scope.$watch(() => this.eval(), (current, next) => {
            this.apply(current, next)
        }, true)

        const current = this.eval()
        this.apply(current)
    }

    public $destroy() {
        this.watcher?.()
    }

    private apply(current: SyncHostSnapshot, next?: SyncHostSnapshot) {
        for (const [name, value] of Object.entries(current.classNames)) {
            const isChange = current.classNames[name] != next?.classNames[name]
            if (!isChange) continue

            this.$element.toggleClass(name, value)
        }

        for (const [name, value] of Object.entries(current.attributes)) {
            const isChange = current.attributes[name] != next?.attributes[name]
            if (!isChange) continue

            this.$element.attr(name, value)
        }

        for (const [name, value] of Object.entries(current.style)) {
            const isChange = current.style[name] != next?.style[name]
            if (!isChange) continue

            this.$element.css(name, value)
        }
    }

    private eval() {
        const snapshot: SyncHostSnapshot = {
            attributes: {},
            classNames: {},
            style: {}
        }

        // classes
        for (const [name, value] of Object.entries(this.createObj.classNames ?? {})) {
            snapshot.classNames[name] = value()
        }

        // attrs
        for (const [name, value] of Object.entries(this.createObj.attributes ?? {})) {
            snapshot.attributes[name] = value()
        }

        // css

        // for (const [name, value] of Object.entries(this.createObj.classNames)) {
        //     snapshot[name] = value()
        // }

        // style

        for (const [name, value] of Object.entries(this.createObj.style ?? {})) {
            snapshot.style[name] = value()
        }

        return snapshot
    }
}

export class NgbHostSynchronizerFactory {
    public $create($element: IAugmentedJQuery, $scope: IScope, createObj: SyncHostCreateObj) {
        return new HostSynchronizer($element, $scope, createObj)
    }

    static get $name() {
        return "ngb.sync.host.factory"
    }
}
