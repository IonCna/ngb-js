import template from "@ngb/typeahead/ngb-highlight.component.html";
import { type IComponentController, type IComponentOptions } from "angular";
import { regExpEscape, removeAccents, toString } from "@ngb/utils";

export class NgbHighlight implements IComponentController {
  public parts: string[] = [];
  public highlightClass!: string;
  public accentSensitive!: boolean;

  public result!: string;
  term!: string | readonly string[];

  $onChanges() {
    this.highlightClass = this.highlightClass ?? "ngb-highlight";
    this.accentSensitive = this.accentSensitive ?? true;

    if (!this.accentSensitive && !String.prototype.normalize) {
      console.warn(
        "The `accentSensitive` input in `ngb-highlight` cannot be set to `false` in a browser " +
          "that does not implement the `String.normalize` function. " +
          "You will have to include a polyfill in your application to use this feature in the current browser.",
      );

      this.accentSensitive = true;
    }

    const result = toString(this.result);
    const terms = Array.isArray(this.term) ? this.term : [this.term];
    const prepareTerm = (term: string) => (this.accentSensitive ? term : removeAccents(term));
    const escapedTerms = terms.map((term) => regExpEscape(prepareTerm(toString(term)))).filter((term) => term);
    const toSplit = this.accentSensitive ? result : removeAccents(result);

    const parts = escapedTerms.length ? toSplit.split(new RegExp(`(${escapedTerms.join("|")})`, "gmi")) : [result];

    if (this.accentSensitive) {
      this.parts = parts;
      return parts;
    }

    let offset = 0;
    this.parts = parts.map((part) => result.substring(offset, (offset += part.length)));
  }

  static get $name() {
    return "ngbHighlight";
  }

  static get $factory(): IComponentOptions {
    return {
      controller: NgbHighlight,
      controllerAs: "$",
      bindings: {
        term: "<",
        result: "<",
        highlightClass: "<?",
        accentSensitive: "<?",
      },
      template: template.trim(),
    };
  }
}
