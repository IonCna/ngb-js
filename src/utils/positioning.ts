import {
  arrow,
  createPopperLite,
  flip,
  type Instance,
  type Modifier,
  type Options,
  type Placement as PopperPlacement,
  preventOverflow,
} from "@popperjs/core";
import { inject } from "ngjs-core";
import { NgbRTL } from "@ngb/utils/rtl";

const placementSeparator = /\s+/;
const spacesRegExp = /  +/gi;

const bootstrapPopperMatches: Record<Exclude<Placement, "auto">, [PopperPlacement, PopperPlacement?]> = {
  top: ["top"],
  bottom: ["bottom"],
  start: ["left", "right"],
  left: ["left"],
  end: ["right", "left"],
  right: ["right"],
  "top-start": ["top-start", "top-end"],
  "top-left": ["top-start"],
  "top-end": ["top-end", "top-start"],
  "top-right": ["top-end"],
  "bottom-start": ["bottom-start", "bottom-end"],
  "bottom-left": ["bottom-start"],
  "bottom-end": ["bottom-end", "bottom-start"],
  "bottom-right": ["bottom-end"],
  "start-top": ["left-start", "right-start"],
  "left-top": ["left-start"],
  "start-bottom": ["left-end", "right-end"],
  "left-bottom": ["left-end"],
  "end-top": ["right-start", "left-start"],
  "right-top": ["right-start"],
  "end-bottom": ["right-end", "left-end"],
  "right-bottom": ["right-end"],
};

export function getPopperClassPlacement(placement: Placement, isRTL: boolean): PopperPlacement {
  const [leftClass, rightClass] = bootstrapPopperMatches[placement as Exclude<Placement, "auto">];
  return isRTL ? rightClass || leftClass : leftClass;
}

const popperStartPrimaryPlacement = /^left/;
const popperEndPrimaryPlacement = /^right/;
const popperStartSecondaryPlacement = /^start/;
const popperEndSecondaryPlacement = /^end/;

export function getBootstrapBaseClassPlacement(baseClass: string, placement: PopperPlacement): string {
  const [primary, secondary] = placement.split("-");
  const newPrimary = primary.replace(popperStartPrimaryPlacement, "start").replace(popperEndPrimaryPlacement, "end");
  let classnames = [newPrimary];
  if (secondary) {
    let newSecondary = secondary;
    if (primary === "left" || primary === "right") {
      newSecondary = newSecondary
        .replace(popperStartSecondaryPlacement, "top")
        .replace(popperEndSecondaryPlacement, "bottom");
    }
    classnames.push(`${newPrimary}-${newSecondary}` as Placement);
  }
  if (baseClass) {
    classnames = classnames.map((classname) => `${baseClass}-${classname}`);
  }
  return classnames.join(" ");
}

export function getPopperOptions({ placement, baseClass }: PositioningOptions, rtl: NgbRTL): Partial<Options> {
  const placementVals: Array<Placement> = Array.isArray(placement)
    ? placement
    : (placement.split(placementSeparator) as Array<Placement>);

  const allowedPlacements = [
    "top",
    "bottom",
    "start",
    "end",
    "top-start",
    "top-end",
    "bottom-start",
    "bottom-end",
    "start-top",
    "start-bottom",
    "end-top",
    "end-bottom",
  ];

  let hasAuto = placementVals.findIndex((value) => value === "auto");
  if (hasAuto >= 0) {
    allowedPlacements.forEach((placementValue) => {
      if (placementVals.find((value) => value.search(`^${placementValue}`) !== -1) == null) {
        placementVals.splice(hasAuto++, 1, placementValue as Placement);
      }
    });
  }

  const popperPlacements = placementVals.map((placementValue) => getPopperClassPlacement(placementValue, rtl.isRTL()));

  const mainPlacement = popperPlacements.shift();

  const bsModifier: Partial<Modifier<any, any>> = {
    name: "bootstrapClasses",
    enabled: !!baseClass,
    phase: "write",
    fn({ state }) {
      const bsClassRegExp = new RegExp(`${baseClass}(-[a-z]+)*`, "gi");
      const popperElement = state.elements.popper as HTMLElement;
      const popperPlacement = state.placement;
      let className = popperElement.className;
      className = className.replace(bsClassRegExp, "");
      className += ` ${getBootstrapBaseClassPlacement(baseClass!, popperPlacement)}`;
      className = className.trim().replace(spacesRegExp, " ");
      popperElement.className = className;
    },
  };

  return {
    placement: mainPlacement,
    modifiers: [
      bsModifier,
      flip,
      preventOverflow,
      arrow,
      {
        enabled: true,
        name: "flip",
        options: {
          fallbackPlacements: popperPlacements,
        },
      },
    ],
  };
}

export type Placement =
  | "auto"
  | "top"
  | "bottom"
  | "start"
  | "left"
  | "end"
  | "right"
  | "top-start"
  | "top-left"
  | "top-end"
  | "top-right"
  | "bottom-start"
  | "bottom-left"
  | "bottom-end"
  | "bottom-right"
  | "start-top"
  | "left-top"
  | "start-bottom"
  | "left-bottom"
  | "end-top"
  | "right-top"
  | "end-bottom"
  | "right-bottom";

export type PlacementArray = Placement | Array<Placement> | string;

interface PositioningOptions {
  hostElement: HTMLElement;
  targetElement: HTMLElement;
  placement: string | Placement | PlacementArray;
  baseClass?: string;
  updatePopperOptions?: (options: Partial<Options>) => Partial<Options>;
}

function noop(argument: Partial<Options>) {
  return argument;
}

export function ngbPositioning() {
  const rtl = inject(NgbRTL);
  let popperInstance: Instance | null = null;

  return {
    createPopper(positioningOption: PositioningOptions) {
      if (!popperInstance) {
        const updatePopperOptions = positioningOption.updatePopperOptions || noop;
        const popperOptions = updatePopperOptions(getPopperOptions(positioningOption, rtl));
        popperInstance = createPopperLite(
          positioningOption.hostElement,
          positioningOption.targetElement,
          popperOptions,
        );
      }
    },
    update() {
      if (popperInstance) {
        popperInstance.update();
      }
    },
    setOptions(positioningOption: PositioningOptions) {
      if (popperInstance) {
        const updatePopperOptions = positioningOption.updatePopperOptions || noop;
        const popperOptions = updatePopperOptions(getPopperOptions(positioningOption, rtl));
        popperInstance.setOptions(popperOptions);
      }
    },
    destroy() {
      if (popperInstance) {
        popperInstance.destroy();
        popperInstance = null;
      }
    },
  };
}
