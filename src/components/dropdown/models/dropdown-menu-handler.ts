import { BehaviorSubject, Observable } from 'rxjs';
import { DropdownMenuToggleBehaviour } from './dropdown-menu-toggle-behavior';

export class DropdownMenuHandler {
  targetElement: any;
  buttonElement: any;

  toggleBehaviour: DropdownMenuToggleBehaviour = DropdownMenuToggleBehaviour.AUTO;

  private isMenuShownSource: BehaviorSubject<boolean> = new BehaviorSubject(false);
  isMenuShown$: Observable<boolean> = this.isMenuShownSource.asObservable();

  private readyToAnimateSource: BehaviorSubject<boolean> = new BehaviorSubject(false);
  readyToAnimate$: Observable<boolean> = this.readyToAnimateSource.asObservable();

  constructor(toggleBehaviour?: DropdownMenuToggleBehaviour) {
    if (toggleBehaviour) {
      this.toggleBehaviour = toggleBehaviour;
    }
  }

  toggleMenu(event: Event): void {
    this.targetElement = event.target;

    if (this.isMenuShown()) {
      this.hideMenu();
    } else {
      this.showMenu();
    }
  }

  enableAnimation(): void {
    this.readyToAnimateSource.next(true);
  }

  disableAnimation(): void {
    this.readyToAnimateSource.next(false);
  }

  showMenu(): void {
    this.isMenuShownSource.next(true);
  }

  hideMenu(): void {
    this.isMenuShownSource.next(false);
  }

  isMenuShown(): boolean {
    return this.isMenuShownSource.getValue();
  }

  destroy() {
    this.isMenuShownSource.complete();
    this.readyToAnimateSource.complete();
  }
}
