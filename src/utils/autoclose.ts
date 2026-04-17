import angular, { type IAugmentedJQuery, type IDocumentService, type IPromise, type ITimeoutService } from "angular";
import { closest, toNativeElement } from "@/utils";

export const enum SOURCE {
    ESCAPE,
    CLICK
}

const isContainedIn = (element: IAugmentedJQuery, array?: IAugmentedJQuery[]) => {
    if (!array) return false
    const nativeTarget = toNativeElement(element)

    return array.some(item => {
        const native = toNativeElement(item)
        return native.contains(nativeTarget)
    })
}

const matchesSelectorIfAny = (element: IAugmentedJQuery, selector?: string) => {
    return !selector || closest(element, selector) != null
}

const isMobile = (() => {
    const isIOS = () => {
        const isIOSMobile = /iPad|iPhone|iPod/.test(navigator.userAgent)
        const hasTouch = navigator.maxTouchPoints != null && navigator.maxTouchPoints > 2
        const isMacintosh = /Macintosh/.test(navigator.userAgent)

        return isIOSMobile || (isMacintosh && hasTouch)
    }

    const isAndroid = () => /Android/.test(navigator.userAgent)

    return typeof navigator !== "undefined" ? !!navigator.userAgent && (isIOS() || isAndroid()) : false
})()

const wrapAsyncForMobile = ($timeout: ITimeoutService, fn: () => void): (() => void) => {
    if (isMobile) return () => { void $timeout(fn, 100, false) }
    return fn
}

export function ngbAutoClose(
    $timeout: ITimeoutService,
    $document: IDocumentService,
    type: boolean | 'inside' | 'outside',
    closed: IPromise<void>,
    close: (source: SOURCE) => void,
    insideElements: IAugmentedJQuery[],
    ignoreElements?: IAugmentedJQuery[],
    insideSelector?: string
) {
    if (!type) return

    let isClosed = false
    let shouldCloseOnMouseUp = false

    const cleanup = () => {
        $document.off("keydown", onKeydown)
        $document.off("mousedown", onMouseDown)
        $document.off("mouseup", onMouseUp)
    }

    const closeOnce = (source: SOURCE) => {
        if (isClosed) return

        isClosed = true
        cleanup()
        close(source)
    }

    const shouldCloseOnClick = (event: JQueryEventObject) => {
        const target = event.target as Element | null
        if (!target) return false

        const $element = angular.element(target)

        if (event.button === 2 || isContainedIn($element, ignoreElements)) {
            return false
        }

        if (type === "inside") {
            return isContainedIn($element, insideElements) && matchesSelectorIfAny($element, insideSelector)
        }

        if (type === "outside") {
            return !isContainedIn($element, insideElements)
        }

        return matchesSelectorIfAny($element, insideSelector) || !isContainedIn($element, insideElements)
    }

    const onKeydown = (event: JQueryEventObject) => {
        if (event.key !== "Escape") return

        event.preventDefault()
        void $timeout(() => closeOnce(SOURCE.ESCAPE))
    }

    const onMouseDown = (event: JQueryEventObject) => {
        shouldCloseOnMouseUp = shouldCloseOnClick(event)
    }

    const onMouseUp = () => {
        if (!shouldCloseOnMouseUp) return

        shouldCloseOnMouseUp = false
        void $timeout(() => closeOnce(SOURCE.CLICK), 0, false)
    }

    wrapAsyncForMobile($timeout, () => {
        if (isClosed) return

        $document.on("keydown", onKeydown)
        $document.on("mousedown", onMouseDown)
        $document.on("mouseup", onMouseUp)
    })()

    closed.finally(() => {
        isClosed = true
        cleanup()
    })
}
