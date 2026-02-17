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
    let finished = false
    let timer: ReturnType<typeof $timeout> | undefined

    const done = () => {
        if (finished) return
        finished = true

        clean()
        defer.resolve()
    }

    const handler = (event: JQueryEventObject) => {
        if (event.target !== el) return
        done()
    }

    const clean = () => {
        $element.off("transitionend transitioncancel", handler)
        if (timer) {
            $timeout.cancel(timer)
        }
    }

    try {
        el.getBoundingClientRect()
        startFn()
    } catch (error) {
        clean()
        defer.reject(error)
        return defer.promise
    }

    if (total === 0) {
        done()
        return defer.promise
    }

    $element.on("transitionend transitioncancel", handler)
    timer = $timeout(done, total)

    return defer.promise
}

function parseCssTime(time: string) {
    const values = time
        .split(",")
        .map(value => value.trim())
        .map(value => {
            const numericValue = parseFloat(value)
            if (!Number.isFinite(numericValue)) return 0
            return value.endsWith("ms") ? numericValue : numericValue * 1000
        })

    return values.reduce((prev, current) => Math.max(prev, current), 0)
}
