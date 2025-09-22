import {
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  forwardRef,
  HostBinding,
  Input,
  OnInit,
} from '@angular/core';
import { DropdownPosition } from './models/dropdown-position';
import { DropdownMenuHandler } from './models/dropdown-menu-handler';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { DropdownButtonDirective } from './dropdown-button.directive';
import { DropdownMenuDirective } from './dropdown-menu.directive';

export const DROPDOWN_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => DropdownComponent),
  multi: true,
};

@Component({
  selector: 'app-dropdown',
  standalone: true,
  imports: [CommonModule, DropdownButtonDirective, DropdownMenuDirective],
  templateUrl: `./dropdown.component.html`,
  styleUrls: ['./dropdown.component.scss'],
  providers: [DROPDOWN_VALUE_ACCESSOR],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DropdownComponent implements OnInit {
  @Input() dropdownMenuHandler: DropdownMenuHandler = new DropdownMenuHandler();
  @Input() offset: string = '5px';
  @Input() position: DropdownPosition = DropdownPosition.BOTTOM_CENTER;
  @Input() disabled: boolean = false;
  @Input() maxHeight: string = '600px';
  @Input() overflowY: string = 'visible';

  @HostBinding('class.full-width') @Input() fullWidth!: boolean;

  @ContentChild('dropdownToggle', { static: false }) dropdownToggle: any;
  @ContentChild('dropdownContent', { static: false }) dropdownContent: any;

  readyToAnimate$!: Observable<boolean>;

  ngOnInit(): void {
    this.readyToAnimate$ = this.dropdownMenuHandler.readyToAnimate$;
  }
}
