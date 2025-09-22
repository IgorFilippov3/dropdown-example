import { ChangeDetectionStrategy, Component, HostBinding, Input } from '@angular/core';

@Component({
  selector: 'app-dropdown-panel',
  standalone: true,
  template: ` <ng-content></ng-content> `,
  styleUrls: ['./dropdown-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DropdownPanelComponent {
  @HostBinding('style.max-height') @Input() maxHeight: string;
  @HostBinding('style.max-width') @Input() maxWidth: string;
}
