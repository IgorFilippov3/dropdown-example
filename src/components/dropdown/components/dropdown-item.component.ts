import { ChangeDetectionStrategy, Component, HostBinding, Input } from '@angular/core';

@Component({
  selector: 'app-dropdown-item',
  standalone: true,
  template: ` <ng-content></ng-content> `,
  styleUrls: ['./dropdown-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DropdownItemComponent {
  @HostBinding('attr.tabindex') tabindex = 0;
  @HostBinding('class.selected') @Input() selected: boolean;
  @HostBinding('class.no-border') @Input() noBorder: boolean;
  @HostBinding('class.sub') @Input() subItem: boolean;
}
