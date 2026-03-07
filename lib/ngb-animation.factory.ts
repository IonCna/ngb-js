import type { IAugmentedJQuery, IQService, ITimeoutService } from "angular";

export type AnimationFunction = ($element: IAugmentedJQuery, startFn: () => void) => angular.IPromise<void>

export class NgbAnimationFactory {
    constructor(private $q: IQService, private $timeout: ITimeoutService) { }

    private parseCssTime(time: string) {
        return time
            .split(",")
            .map(time => time.trim())
            .map(time => time.endsWith("ms") ? parseFloat(time) : parseFloat(time) * 1000)
            .reduce((prev, current) => Math.max(prev, current), 0)
    }

    $create = () => ($element: IAugmentedJQuery, startFn: () => void) => {
        const [el] = Array.from($element)
        const { transitionDelay, transitionDuration } = getComputedStyle(el)

        const delay = this.parseCssTime(transitionDelay)
        const duration = this.parseCssTime(transitionDuration)
        const total = delay + duration + 5

        const defer = this.$q.defer<void>()

        el.getBoundingClientRect()
        startFn()

        if (total == 0) {
            defer.resolve()
            return defer.promise
        }

        let finished = false

        const done = () => {
            if (finished) return
            finished = true

            clean()
            defer.resolve()
        }

        const handler = (event: JQueryEventObject) => {
            if (event.target != el) return
            done()
        }

        const clean = () => {
            $element.off("transitionend", handler)
            this.$timeout.cancel(timer)
        }

        $element.on("transitionend", handler)
        const timer = this.$timeout(done, total)

        return defer.promise
    }

    static get $inject() {
        return ["$q", "$timeout"]
    }

    static get $name() {
        return "ngb.animation.factory"
    }
}