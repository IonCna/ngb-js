export interface NgbTypeaheadSelectItemEvent<T = any> {
  item: T;
  preventDefault: () => void;
}
