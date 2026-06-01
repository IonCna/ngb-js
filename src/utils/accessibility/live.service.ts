import { ARIA_LIVE_DELAY } from "@ngb/utils/accessibility/live.constant";
import type { IAugmentedJQuery, IDocumentService, ITimeoutService } from "angular";
import angular from "angular";

function getLiveElement($document: IDocumentService, lazyCreate = false): IAugmentedJQuery | null {
  const [body]: HTMLBodyElement[] = Array.from($document.find("body"));

  let element = angular.element(body.querySelector("#ngb-live")!);

  if (element == null && lazyCreate) {
    element = angular.element("<div></div>");

    element.attr("id", "ngb-live");
    element.attr("aria-live", "polite");
    element.attr("aria-atomic", "true");

    element.addClass("visually-hidden");

    angular.element(body).append(element);
  }

  return element;
}

interface ILiveService {
  onDestroy(): void;
}

export class LiveService implements ILiveService {
  constructor(
    private readonly ariaLiveDelay: number,
    private $document: IDocumentService,
    private $timeout: ITimeoutService,
  ) {}

  public onDestroy(): void {
    const element = getLiveElement(this.$document);
    if (!element) return;

    element.remove();
  }

  public say(message: string) {
    const element = getLiveElement(this.$document, true);
    const delay = this.ariaLiveDelay;
    if (!element) return;

    element.empty();
    const setText = () => element.append(message);

    if (!delay) {
      setText();
      return;
    }

    this.$timeout(setText, this.ariaLiveDelay);
  }

  static get $name() {
    return "ngb.live.service";
  }

  static get $inject() {
    return [ARIA_LIVE_DELAY.$name, "$document", "$timeout"];
  }
}
