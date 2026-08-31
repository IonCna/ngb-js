import template from "@demo/features/demo-typeahead/demo-typeahead.component.html";
import type { NgbTypeaheadSelectItemEvent } from "@ngb/typeahead";
import type { IComponentOptions } from "angular";
import type { TemplateRef } from "ngjs-core";
import { debounceTime, distinctUntilChanged, map, type OperatorFunction } from "rxjs";

interface Country {
  code: string;
  name: string;
}

const STATES = [
  "Aguascalientes",
  "Baja California",
  "Baja California Sur",
  "Campeche",
  "Chiapas",
  "Chihuahua",
  "Ciudad de México",
  "Coahuila",
  "Colima",
  "Durango",
  "Estado de México",
  "Guanajuato",
  "Guerrero",
  "Hidalgo",
  "Jalisco",
  "Michoacán",
  "Morelos",
  "Nayarit",
  "Nuevo León",
  "Oaxaca",
  "Puebla",
  "Querétaro",
  "Quintana Roo",
  "San Luis Potosí",
  "Sinaloa",
  "Sonora",
  "Tabasco",
  "Tamaulipas",
  "Tlaxcala",
  "Veracruz",
  "Yucatán",
  "Zacatecas",
] as const;

const COUNTRIES: readonly Country[] = [
  { code: "AR", name: "Argentina" },
  { code: "BR", name: "Brasil" },
  { code: "CA", name: "Canadá" },
  { code: "CL", name: "Chile" },
  { code: "CO", name: "Colombia" },
  { code: "CR", name: "Costa Rica" },
  { code: "EC", name: "Ecuador" },
  { code: "ES", name: "España" },
  { code: "MX", name: "México" },
  { code: "PE", name: "Perú" },
  { code: "US", name: "Estados Unidos" },
  { code: "UY", name: "Uruguay" },
];

const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

export class DemoTypeaheadComponent {
  public state = "";
  public country: Country | null = null;
  public lastSelection = "Ninguna";
  public countryTemplate?: TemplateRef<unknown>;

  public readonly searchStates: OperatorFunction<string, readonly string[]> = (text$) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map((term) => {
        const normalizedTerm = normalize(term.trim());
        return normalizedTerm.length < 2
          ? []
          : STATES.filter((state) => normalize(state).includes(normalizedTerm)).slice(0, 8);
      }),
    );

  public readonly searchCountries: OperatorFunction<string, readonly Country[]> = (text$) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map((term) => {
        const normalizedTerm = normalize(term.trim());
        return normalizedTerm.length < 1
          ? []
          : COUNTRIES.filter((country) => normalize(country.name).includes(normalizedTerm)).slice(0, 8);
      }),
    );

  public readonly formatCountry = (country: Country): string => country?.name ?? "";

  public onStateSelected(event: NgbTypeaheadSelectItemEvent<string>): void {
    this.lastSelection = event.item;
  }

  public onCountrySelected(event: NgbTypeaheadSelectItemEvent<Country>): void {
    this.lastSelection = `${event.item.name} (${event.item.code})`;
  }

  static get $name() {
    return "ngbDemoTypeahead";
  }

  static get $factory(): IComponentOptions {
    return {
      controller: DemoTypeaheadComponent,
      controllerAs: "$",
      template,
    };
  }
}
