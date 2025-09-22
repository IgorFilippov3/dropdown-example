import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  HostBinding,
  HostListener,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import {
  animate,
  AnimationTriggerMetadata,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { DropdownPosition } from '../dropdown/models/dropdown-position';
import { DropdownSelectItem, DropdownSelectItemGroup } from './models/dropdown-select';
import { DropdownMenuHandler } from '../dropdown/models/dropdown-menu-handler';
import { DropdownComponent } from '../dropdown/dropdown.component';
import { CommonModule } from '@angular/common';
import { DropdownPanelComponent } from '../dropdown/components/dropdown-panel.component';
import { DropdownItemComponent } from '../dropdown/components/dropdown-item.component';

interface DropdownCaretRotationConfig {
  initial: { translateY: string; rotate: string };
  rotated: { translateY: string; rotate: string };
}

function createCaretRotationAnimation({
  initial,
  rotated,
}: DropdownCaretRotationConfig): AnimationTriggerMetadata {
  return trigger('caretRotation', [
    state(
      'default',
      style({ transform: `translateY(${initial.translateY}) rotate(${initial.rotate})` })
    ),
    state(
      'rotated',
      style({ transform: `translateY(${rotated.translateY}) rotate(${rotated.rotate})` })
    ),
    transition('rotated => default', animate('225ms ease-out')),
    transition('default => rotated', animate('225ms ease-in')),
  ]);
}

const DROPDOWN_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => DropdownSelectComponent),
  multi: true,
};

@Component({
  selector: 'app-dropdown-select',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DropdownComponent,
    DropdownPanelComponent,
    DropdownItemComponent,
  ],
  templateUrl: './dropdown-select.component.html',
  styleUrls: ['./dropdown-select.component.scss'],
  animations: [
    createCaretRotationAnimation({
      initial: { translateY: '-50%', rotate: '0' },
      rotated: { translateY: '-50%', rotate: '180deg' },
    }),
  ],
  providers: [DROPDOWN_VALUE_ACCESSOR],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DropdownSelectComponent implements ControlValueAccessor, OnInit {
  @ViewChild('trigger', { static: false }) trigger: ElementRef;

  @Output() onChange: EventEmitter<any> = new EventEmitter();

  @Input() options: DropdownSelectItem[];
  @Input() optionsGroup: DropdownSelectItemGroup[];

  @Input() maxHeight: string;
  @Input() maxWidth: string;
  @Input() position: DropdownPosition = DropdownPosition.BOTTOM_CENTER;

  @Input() editable: boolean;
  @Input() showAsInput: boolean;
  @Input() disabled: boolean;
  @Input() placeholder: string = 'Select value';

  @HostBinding('style.--dropdown-item-font-size')
  get fontSize(): string | null {
    return this.showAsInput ? '13px' : null;
  }

  @HostBinding('attr.tabindex')
  get tabIndex(): number {
    return this.disabled ? -1 : 0;
  }

  dropdownMenuHandler: DropdownMenuHandler = new DropdownMenuHandler();

  selectedItem: DropdownSelectItem | null;
  label: string;
  arrowShown: boolean;
  focusedIndex: number = -1;

  ngOnInit(): void {
    this.arrowShown = !this.disabled;
  }

  get allSelectableItems(): DropdownSelectItem[] {
    if (this.options?.length) {
      return this.options;
    }
    if (this.optionsGroup?.length) {
      return this.optionsGroup.flatMap(group => group.items);
    }
    return [];
  }

  getGroupItemFocusIndex(groupItems: DropdownSelectItem[], itemIndex: number): number {
    if (!this.optionsGroup?.length) {
      return -1;
    }

    let globalIndex = 0;
    for (const group of this.optionsGroup) {
      if (group.items === groupItems) {
        return globalIndex + itemIndex;
      }
      globalIndex += group.items.length;
    }
    return -1;
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    const selectableItems = this.allSelectableItems;
    if (!selectableItems.length) {
      return;
    }

    let isMenuShown = false;
    this.dropdownMenuHandler.isMenuShown$.subscribe((value) => (isMenuShown = value)).unsubscribe();

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (!isMenuShown) {
          this.dropdownMenuHandler.showMenu();
          this.focusedIndex = 0;
        } else {
          this.focusedIndex = Math.min(this.focusedIndex + 1, selectableItems.length - 1);
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (!isMenuShown) {
          this.dropdownMenuHandler.showMenu();
          this.focusedIndex = selectableItems.length - 1;
        } else {
          this.focusedIndex = Math.max(this.focusedIndex - 1, 0);
        }
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (!isMenuShown) {
          this.dropdownMenuHandler.showMenu();
          this.focusedIndex = this.selectedItem
            ? selectableItems.findIndex((item) => item.value === this.selectedItem!.value)
            : 0;
        } else if (this.focusedIndex >= 0 && this.focusedIndex < selectableItems.length) {
          this.onItemClick(selectableItems[this.focusedIndex]);
        }
        break;
      case 'Escape':
        event.preventDefault();
        this.dropdownMenuHandler.hideMenu();
        this.focusedIndex = -1;
        break;
    }
  }

  onItemClick(item: DropdownSelectItem): void {
    this.selectedItem = item;
    this.label = this.selectedItem.label;
    this.propagateChange(item.value);
    this.onChange.emit();
    this.dropdownMenuHandler.hideMenu();
    this.focusedIndex = -1;
  }

  onInputBlur(event: Event): void {
    this.propagateChange((event.target as HTMLInputElement).value);
    this.onChange.emit();
  }

  writeValue(value: any): void {
    if (this.editable) {
      this.label = value;
      return;
    }

    if (value === null || value === undefined) {
      this.selectedItem = null;
      this.label = '';
    } else {
      const searchItems = this.options || this.allSelectableItems;
      this.selectedItem = this.findSelectedItem(searchItems, value);
      if (this.selectedItem) {
        this.label = this.selectedItem.label;
      }
    }
  }

  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: any): void {}

  private propagateChange = (_: any) => {};

  private compareWithTypeCheck(inputValue: string | number, optionValue: number): boolean {
    if (typeof inputValue === 'string') {
      return inputValue === optionValue.toString();
    }

    if (typeof inputValue === 'number') {
      return inputValue === optionValue;
    }

    return false;
  }

  private findSelectedItem(options: any[], value: string | number) {
    return options.find((opt: DropdownSelectItem | DropdownSelectItemGroup) => {
      if (opt.value !== null && this.compareWithTypeCheck(value, opt.value)) return opt;
      return undefined;
    });
  }
}
