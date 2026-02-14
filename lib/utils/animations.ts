import type { IAugmentedJQuery } from "angular";

export async function ngbRunTransition($element: IAugmentedJQuery, startFn: () => void) {
    const [el] = Array.from($element)
    const $injector = $element.injector()

    const $timeout = $injector.get("$timeout")
    const $q = $injector.get("$q")

    const { transitionDelay, transitionDuration } = getComputedStyle(el)

    const delay = parseCssTime(transitionDelay)
    const duration = parseCssTime(transitionDuration)
    const total = delay + duration + 5

    const defer = $q.defer<void>()

    el.getBoundingClientRect()
    startFn()

    if(total == 0) {
        defer.resolve()
        return
    }

    let finished = false

    const done = () => {
        if(finished) return
        finished = true

        clean()
        defer.resolve()
    }

    const handler = (event: JQueryEventObject) => {
        if(event.target != el) return
        done()
    }

    const clean = () => {
        $element.off("transitionend", handler)
        $timeout.cancel(timer)
    }

    $element.on("transitionend", handler)
    const timer = $timeout(done, total)

    return defer.promise
}

function parseCssTime(time: string) {
    return time
        .split(",")
        .map(time => time.trim())
        .map(time => time.endsWith("ms") ? parseFloat(time) : parseFloat(time) * 1000)
        .reduce((prev, current) => Math.max(prev, current), 0)
}