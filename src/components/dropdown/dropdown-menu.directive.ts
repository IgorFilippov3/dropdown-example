import {
  Directive,
  ElementRef,
  HostBinding,
  inject,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { DropdownMenuHandler } from './models/dropdown-menu-handler';
import { DropdownPosition } from './models/dropdown-position';
import { filter, Subject, takeUntil, tap } from 'rxjs';

@Directive({
  selector: '[dropdownMenu]',
  standalone: true,
})
export class DropdownMenuDirective implements OnInit, OnDestroy {
  @Input('dropdownMenu') dropdownMenuHandler!: DropdownMenuHandler;
  @Input('position') menuPosition: DropdownPosition = DropdownPosition.BOTTOM_LEFT;
  @Input('offset') menuOffset = '5px';

  @HostBinding('style.max-height')
  @Input('maxHeight')
  maxHeight = '600px';

  @HostBinding('style.max-width')
  @Input('maxWidth')
  maxWidth = 'none';

  @HostBinding('style.overflow-y')
  @Input('overflowY')
  overflowY = 'visible';

  /* Permanent style attr */
  @HostBinding('style.display') display = 'block';
  @HostBinding('style.height') height = 'auto';
  @HostBinding('style.width') width = '100%';
  @HostBinding('style.z-index') zIndex = '1000';

  /* Initial menu attr to hide menu and calculate its width */
  @HostBinding('style.position') position = 'absolute';
  @HostBinding('style.left') left = 'auto';
  @HostBinding('style.right') right = 'auto';
  @HostBinding('style.top') top = '100%';
  @HostBinding('style.bottom') bottom = 'auto';
  @HostBinding('style.marginLeft') offsetLeft = '0';
  @HostBinding('style.marginRight') offsetRight = '0';
  @HostBinding('style.marginTop') offsetTop = '5px';
  @HostBinding('style.marginBottom') offsetBottom = '0';
  @HostBinding('style.transform') transform = 'translate(-100vw, -100vh)';

  isMenuShown: boolean = false;

  private isDestroyed$: Subject<void> = new Subject();

  ngOnInit(): void {
    this.offsetTop = this.menuOffset;
    this.dropdownMenuHandler.isMenuShown$
      .pipe(
        tap((isShown: boolean) => {
          this.isMenuShown = isShown;
          if (!isShown) this.dropdownMenuHandler.disableAnimation();
        }),
        filter((isShown: boolean) => isShown),
        takeUntil(this.isDestroyed$)
      )
      .subscribe((isShown) => {
        this.resetStyles();
        switch (this.menuPosition) {
          case DropdownPosition.TOP_LEFT:
            this.onTopLeft();
            break;
          case DropdownPosition.TOP_RIGHT:
            this.onTopRight();
            break;
          case DropdownPosition.TOP_CENTER:
            this.onTopCenter();
            break;
          case DropdownPosition.BOTTOM_LEFT:
            this.onBottomLeft();
            break;
          case DropdownPosition.BOTTOM_RIGHT:
            this.onBottomRight();
            break;
          case DropdownPosition.BOTTOM_CENTER:
            this.onBottomCenter();
            break;
          case DropdownPosition.LEFT_TOP:
            this.onLeftTop();
            break;
          case DropdownPosition.LEFT_BOTTOM:
            this.onLeftBottom();
            break;
          case DropdownPosition.RIGHT_TOP:
            this.onRightTop();
            break;
          case DropdownPosition.RIGHT_BOTTOM:
            this.onRightBottom();
            break;
          default:
            this.onBottomCenter();
        }
        this.transform = '';
        this.dropdownMenuHandler.enableAnimation();
      });
  }

  private isSmallScreen(): boolean {
    return document.documentElement.scrollWidth < 576;
  }

  private onBottomRight(): void {
    this.right = '0';
    this.left = 'auto';
    this.top = '100%';
    this.bottom = 'auto';
    this.offsetTop = this.menuOffset;
  }

  private onBottomLeft(): void {
    this.left = '0';
    this.right = 'auto';
    this.top = '100%';
    this.bottom = 'auto';
    this.offsetTop = this.menuOffset;
  }

  private onBottomCenter(): void {
    this.left = 'auto';
    this.right = 'auto';
    this.top = '100%';
    this.bottom = 'auto';
    this.width = '100%';
    this.offsetTop = this.menuOffset;
  }

  private onTopRight(): void {
    this.right = '0';
    this.left = 'auto';
    this.top = 'auto';
    this.bottom = '100%';
    this.offsetBottom = this.menuOffset;
  }

  private onTopLeft(): void {
    this.left = '0';
    this.right = 'auto';
    this.top = 'auto';
    this.bottom = '100%';
    this.offsetBottom = this.menuOffset;
  }

  private onTopCenter(): void {
    this.left = 'auto';
    this.right = 'auto';
    this.bottom = '100%';
    this.top = 'auto';
    this.offsetBottom = this.menuOffset;
  }

  private onLeftTop(): void {
    this.left = 'auto';
    this.right = '100%';
    this.top = '0';
    this.bottom = 'auto';
    this.offsetRight = this.menuOffset;
  }

  private onLeftBottom(): void {
    this.left = 'auto';
    this.right = '100%';
    this.top = 'auto';
    this.bottom = '0';
    this.offsetRight = this.menuOffset;
  }

  private onRightTop(): void {
    this.left = '100%';
    this.right = 'auto';
    this.top = '0';
    this.bottom = 'auto';
    this.offsetLeft = this.menuOffset;
  }

  private onRightBottom(): void {
    this.left = '100%';
    this.right = 'auto';
    this.top = 'auto';
    this.bottom = '0';
    this.offsetRight = this.menuOffset;
  }

  private resetStyles(): void {
    this.left = 'auto';
    this.right = 'auto';
    this.top = 'auto';
    this.bottom = 'auto';
    this.offsetTop = '0';
    this.offsetBottom = '0';
    this.offsetLeft = '0';
    this.offsetRight = '0';
  }

  ngOnDestroy(): void {
    this.isDestroyed$.next();
    this.isDestroyed$.complete();
  }
}
