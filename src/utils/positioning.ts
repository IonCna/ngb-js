import type { Options, Placement as PopperPlacement } from "@popperjs/core";
import { createPopperLite, type Instance, type Modifier, flip, preventOverflow, arrow } from "@popperjs/core";
import type { NgbRTL } from "@/utils/rtl.service";

const placementSeparator = /\s+/;
const spacesRegExp = /  +/gi;

const bootstrapPopperMatches: Record<Placement, [PopperPlacement, PopperPlacement?]> = {
    auto: ['auto'],
    top: ['top'],
    bottom: ['bottom'],
    start: ['left', 'right'],
    left: ['left'],
    end: ['right', 'left'],
    right: ['right'],
    'top-start': ['top-start', 'top-end'],
    'top-left': ['top-start'],
    'top-end': ['top-end', 'top-start'],
    'top-right': ['top-end'],
    'bottom-start': ['bottom-start', 'bottom-end'],
    'bottom-left': ['bottom-start'],
    'bottom-end': ['bottom-end', 'bottom-start'],
    'bottom-right': ['bottom-end'],
    'start-top': ['left-start', 'right-start'],
    'left-top': ['left-start'],
    'start-bottom': ['left-end', 'right-end'],
    'left-bottom': ['left-end'],
    'end-top': ['right-start', 'left-start'],
    'right-top': ['right-start'],
    'end-bottom': ['right-end', 'left-end'],
    'right-bottom': ['right-end'],
};

export function getPopperClassPlacement(placement: Placement, isRTL: boolean): PopperPlacement {
    const [leftClass, rightClass] = bootstrapPopperMatches[placement];
    return isRTL ? rightClass || leftClass : leftClass;
}

const popperStartPrimaryPlacement = /^left/;
const popperEndPrimaryPlacement = /^right/;
const popperStartSecondaryPlacement = /^start/;
const popperEndSecondaryPlacement = /^end/;

function noMod(args: Partial<Options>) {
    return args
}

export function getBootstrapBaseClassPlacement(baseClass: string, placement: PopperPlacement): string {
    const [primary, secondary] = placement.split('-');
    const newPrimary = primary.replace(popperStartPrimaryPlacement, 'start').replace(popperEndPrimaryPlacement, 'end');
    let classnames = [newPrimary];

    if (baseClass) {
        return classnames.map((classname) => `${baseClass}-${classname}`).join(' ')
    }

    if (!secondary) {
        return classnames.join(' ')
    }

    let newSecondary = secondary;
    if (primary === 'left' || primary === 'right') {
        newSecondary = newSecondary
            .replace(popperStartSecondaryPlacement, 'top')
            .replace(popperEndSecondaryPlacement, 'bottom');
    }

    classnames.push(`${newPrimary}-${newSecondary}` as Placement);
    return classnames.join(' ');
}

export function getPopperOptions({ placement, baseClass }: PositioningOptions, rtl: NgbRTL): Partial<Options> {
    const placementIsArray = Array.isArray(placement)
    let placementVals: Array<Placement> = placementIsArray ? placement : placement.split(placementSeparator) as Array<Placement>

    const allowedPlacements = [
        'top',
        'bottom',
        'start',
        'end',
        'top-start',
        'top-end',
        'bottom-start',
        'bottom-end',
        'start-top',
        'start-bottom',
        'end-top',
        'end-bottom',
    ];

    let hasAuto = placementVals.findIndex((val) => val === 'auto');

    if (hasAuto >= 0) allowedPlacements.forEach(function (obj) {
        if (placementVals.find((val) => val.search('^' + obj) !== -1) == null) {
            placementVals.splice(hasAuto++, 1, obj as Placement);
        }
    });

    const popperPlacements = placementVals.map((_placement) => {
        return getPopperClassPlacement(_placement, rtl.isRTL());
    });

    let mainPlacement = popperPlacements.shift();

    const bsModifier: Partial<Modifier<any, any>> = {
        name: "bootstrapClasses",
        enabled: !!baseClass,
        phase: 'write',
        fn({ state }) {
            const bsClassRegExp = new RegExp(baseClass + '(-[a-z]+)*', 'gi');

            const popperElement: HTMLElement = state.elements.popper as HTMLElement;
            const popperPlacement = state.placement;

            let className = popperElement.className;
            className = className.replace(bsClassRegExp, '');

            className += ` ${getBootstrapBaseClassPlacement(baseClass!, popperPlacement)}`;
            className = className.trim().replace(spacesRegExp, ' ');
            popperElement.className = className;
        }
    }

    return {
        placement: mainPlacement,
        modifiers: [
            bsModifier,
            flip,
            preventOverflow,
            arrow,
            {
                enabled: true,
                name: 'flip',
                options: {
                    fallbackPlacements: popperPlacements,
                },
            },
        ],
    };
}

export type Placement =
    | 'auto'
    | 'top'
    | 'bottom'
    | 'start'
    | 'left'
    | 'end'
    | 'right'
    | 'top-start'
    | 'top-left'
    | 'top-end'
    | 'top-right'
    | 'bottom-start'
    | 'bottom-left'
    | 'bottom-end'
    | 'bottom-right'
    | 'start-top'
    | 'left-top'
    | 'start-bottom'
    | 'left-bottom'
    | 'end-top'
    | 'right-top'
    | 'end-bottom'
    | 'right-bottom';


export type PlacementArray = Placement | Array<Placement> | string;

interface PositioningOptions {
    hostElement: HTMLElement;
    targetElement: HTMLElement;
    placement: string | Placement | PlacementArray;
    baseClass?: string;
    updatePopperOptions?: (options: Partial<Options>) => Partial<Options>;
}

export type NgbPositioning = {
    createPopper(positioningOption: PositioningOptions): void
    update(): void
    setOptions(positioningOption: PositioningOptions): void
    destroy(): void
}

export function ngbPositioning(ngbRTL: NgbRTL): NgbPositioning {
    let popperInstance: Instance | null = null

    return {
        createPopper(positioningOption: PositioningOptions) {
            const updatePopperOptions = positioningOption.updatePopperOptions || noMod
            const popperOptions = updatePopperOptions(
                getPopperOptions(positioningOption, ngbRTL)
            )

            popperInstance = createPopperLite(
                positioningOption.hostElement,
                positioningOption.targetElement,
                popperOptions
            )
        },
        update() {
            if (popperInstance) {
                popperInstance.update()
            }
        },
        setOptions(positioningOption: PositioningOptions) {
            if (popperInstance) {
                const updatePopperOptions = positioningOption.updatePopperOptions || noMod;
                let popperOptions = updatePopperOptions(getPopperOptions(positioningOption, ngbRTL));
                popperInstance.setOptions(popperOptions);
            }
        },
        destroy() {
            if (popperInstance) {
                popperInstance.destroy();
                popperInstance = null;
            }
        }
    }
}
