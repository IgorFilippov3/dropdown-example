import { Component, OnInit, signal } from '@angular/core';
import { DropdownPosition } from '../components/dropdown/models/dropdown-position';
import { CommonModule } from '@angular/common';
import { DropdownSelectComponent } from '../components/dropdown-select/dropdown-select.component';
import {
  DropdownSelectItem,
  DropdownSelectItemGroup,
} from '../components/dropdown-select/models/dropdown-select';
import {
  PlaceholderInputComponent,
  TokenConfig,
} from '../components/placeholder-input/placeholder-input.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule, DropdownSelectComponent, PlaceholderInputComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  currentDropdownPosition = signal(DropdownPosition.BOTTOM_RIGHT);

  DropdownPosition = DropdownPosition;

  items: DropdownSelectItem[];
  countryGroups: DropdownSelectItemGroup[];

  ngOnInit(): void {
    this.items = Object.values(DropdownPosition).map((v: string) => {
      return {
        value: v,
        label: v,
      };
    });

    this.countryGroups = [
      {
        label: 'Europe',
        items: [
          { value: 'DE', label: 'Germany' },
          { value: 'FR', label: 'France' },
          { value: 'IT', label: 'Italy' },
          { value: 'ES', label: 'Spain' },
        ],
      },
      {
        label: 'Asia',
        items: [
          { value: 'JP', label: 'Japan' },
          { value: 'CN', label: 'China' },
          { value: 'KR', label: 'South Korea' },
          { value: 'IN', label: 'India' },
        ],
      },
      {
        label: 'North America',
        items: [
          { value: 'US', label: 'United States' },
          { value: 'CA', label: 'Canada' },
          { value: 'MX', label: 'Mexico' },
        ],
      },
    ];
  }

  templateText = '';

  logTemplateText(): void {
    console.log(this.templateText);
  }

  onClick(value: DropdownPosition) {
    this.currentDropdownPosition.set(value);
  }
}
