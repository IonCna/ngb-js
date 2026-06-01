export interface ResultTemplateContext {
  formatter: (result: any) => string;
  result: any;
  term: string;
}
