export interface DropdownSelectItem {
  value: any;
  label: string;
  icon?: any;
}

export interface DropdownSelectItemGroup {
  label: string;
  value?: any;
  items: DropdownSelectItem[];
}
