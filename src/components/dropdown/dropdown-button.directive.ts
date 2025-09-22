import {
  Directive,
  ElementRef,
  HostListener,
  inject,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { DropdownMenuHandler } from './models/dropdown-menu-handler';
import { DropdownMenuToggleBehaviour } from './models/dropdown-menu-toggle-behavior';

@Directive({
  selector: '[dropdownButton]',
  standalone: true,
})
export class DropdownButtonDirective implements OnInit, OnDestroy {
  @Input('dropdownButton') dropdownMenuHandler: DropdownMenuHandler;
  @Input() disabled: boolean;

  @HostListener('click', ['$event'])
  buttonClick(event: Event): void {
    if (this.disabled) return;
    if ((event.target as HTMLElement).localName === 'dropdown-item') event.stopPropagation();
    if (this.dropdownMenuHandler.toggleBehaviour === DropdownMenuToggleBehaviour.AUTO) {
      this.dropdownMenuHandler.toggleMenu(event);
    }
  }

  @HostListener('document:click', ['$event'])
  closeMenu(event: Event) {
    if (
      event.target !== this.dropdownMenuHandler.targetElement &&
      this.dropdownMenuHandler.isMenuShown()
    ) {
      this.dropdownMenuHandler.hideMenu();
    }
  }

  @HostListener('document:contextmenu', ['$event'])
  closeContextMenu(event: Event) {
    this.closeMenu(event);
  }

  private elementRef = inject(ElementRef);

  ngOnInit(): void {
    this.dropdownMenuHandler.buttonElement = this.elementRef.nativeElement;
  }

  ngOnDestroy(): void {
    if (this.dropdownMenuHandler) this.dropdownMenuHandler.destroy();
  }
}
