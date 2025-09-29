import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  Input,
  Output,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface TokenConfig {
  key: string;
  label: string;
  cssClass?: string;
}

export interface CustomClasses {
  root?: string;
  editor?: string;
  toolbar?: string;
  placeholder?: string;
}

@Component({
  selector: 'app-placeholder-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './placeholder-input.component.html',
  styleUrls: ['./placeholder-input.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PlaceholderInputComponent),
      multi: true,
    },
  ],
})
export class PlaceholderInputComponent implements ControlValueAccessor {
  @ViewChild('editor', { static: true }) editorRef!: ElementRef<HTMLDivElement>;

  @Input() set value(v: string) {
    const incoming = v ?? '';
    this._value = incoming;

    if (!this.editorRef) return;

    const current = this.htmlToText(this.editorRef.nativeElement);

    if (this.hasFocus && incoming === current) {
      return;
    }

    this.editorRef.nativeElement.innerHTML = this.textToHtml(incoming);
    this.updatePlaceholderVisibility();
  }

  get value() {
    return this._value;
  }

  @Input() placeholder: string | undefined;
  @Input() tokens: TokenConfig[] = [];
  @Input() showToolbar: boolean = true;
  @Input() customButtons?: TemplateRef<any>;
  @Input() customClasses?: CustomClasses;

  @Output() valueChange = new EventEmitter<string>();

  isPlaceholderVisible: boolean = false;

  private readonly HAIR_SPACE = '\u200A';
  private _value = '';
  private hasFocus = false;
  private onChange = (value: string) => {};
  private onTouched = () => {};
  private tokensMap = new Map<string, Node>();

  ngOnInit(): void {
    this.editorRef.nativeElement.innerHTML = this.textToHtml(this._value || '');
    this.updatePlaceholderVisibility();

    const config = { attributes: true, childList: true, subtree: true };
    const callback = (mutationList: MutationRecord[], observer: any) => {
      for (const mutation of mutationList) {
        if (mutation.type === 'childList') {
          const removedNodes: NodeList = mutation.removedNodes;

          for (const node of removedNodes.values()) {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const tokenName: string | null = (node as HTMLElement).getAttribute(
                'data-placeholder'
              );
              if (tokenName) {
                this.tokensMap.delete(tokenName);
              }
            }
          }
        }
      }
    };

    const observer = new MutationObserver(callback);

    observer.observe(this.editorRef.nativeElement, config);
  }

  getText(): string {
    return this.htmlToText(this.editorRef.nativeElement);
  }

  toggleToken(placeholder: string, cssClass?: string): void {
    const node: Node | undefined = this.tokensMap.get(placeholder);

    if (node) {
      node.parentNode?.removeChild(node);
      this.tokensMap.delete(placeholder);
      this.editorRef.nativeElement.focus();
    } else {
      const newNode: Node | undefined = this.insertPlaceholder(placeholder, cssClass);
      if (newNode) {
        this.tokensMap.set(placeholder, newNode);
        this.isPlaceholderVisible = false;
      }
    }

    this.emitValue();
  }

  insertPlaceholder(placeholder: string, cssClass?: string): Node | undefined {
    this.editorRef.nativeElement.focus();

    const sel = window.getSelection();
    if (!sel) return;

    if (!sel.rangeCount || !this.editorRef.nativeElement.contains(sel.focusNode)) {
      this.placeCaretAtEnd();
    }

    this.deleteSelectionIfAny(sel);

    const token = this.createTokenSpan(placeholder, cssClass ? cssClass : 'placeholder-token');
    const node: Node | undefined = this.insertNodeAtSelection(token);

    const trailingSpace = document.createTextNode(this.HAIR_SPACE);
    this.insertNodeAfter(token, trailingSpace);

    this.setCaretAfterNode(trailingSpace);

    this.emitValue();

    return node;
  }

  keepEditorFocus(ev: Event) {
    ev.preventDefault();
    this.editorRef.nativeElement.focus();
  }

  onBlur() {
    this.hasFocus = false;
    this.onTouched();
    this.normalizeEditor();
  }

  onFocus() {
    this.hasFocus = true;
    this.updatePlaceholderVisibility();
  }

  onInput() {
    this.updatePlaceholderVisibility();
    this.emitValue();
  }

  onKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      return;
    }
  }

  onPaste(e: ClipboardEvent) {
    e.preventDefault();
    const text = e.clipboardData?.getData('text/plain') ?? '';
    this.insertTextAtSelection(text);
    this.emitValue();
  }

  setText(text: string) {
    this.value = text;
    this.emitValue();
  }

  writeValue(value: string): void {
    this.value = value ?? '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    if (this.editorRef?.nativeElement) {
      this.editorRef.nativeElement.contentEditable = (!isDisabled).toString();
    }
  }

  private updatePlaceholderVisibility() {
    if (this.placeholder) {
      this.isPlaceholderVisible = this.isEmpty();
    }
  }

  private isEmpty(): boolean {
    if (!this.editorRef?.nativeElement) return true;

    const text = this.htmlToText(this.editorRef.nativeElement).trim();
    return text.length === 0;
  }

  private createTokenSpan(placeholder: string, cssClass?: string): HTMLSpanElement {
    const span = document.createElement('span');
    span.className = `${cssClass}`;
    span.textContent = placeholder;
    span.setAttribute('data-placeholder', placeholder);
    span.setAttribute('contenteditable', 'false');
    span.setAttribute('role', 'button');
    span.setAttribute('aria-label', `placeholder ${placeholder}`);
    return span;
  }

  private deleteSelectionIfAny(sel: Selection) {
    if (!sel.rangeCount) return;
    const range = sel.getRangeAt(0);
    if (!range.collapsed) {
      range.deleteContents();
    }
  }

  private emitValue() {
    this._value = this.htmlToText(this.editorRef.nativeElement);
    this.valueChange.emit(this._value);
    this.onChange(this._value);
  }

  private htmlToText(root: HTMLElement): string {
    const out: string[] = [];

    const walk = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        out.push((node as Text).data);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;

        if (el.classList.contains('placeholder-token')) {
          out.push(el.dataset['placeholder'] || el.innerText || '');
          return;
        }

        if (el.classList.contains('ce-gap')) {
          return;
        }

        if (el.tagName === 'BR') {
          out.push('\n');
          return;
        }

        el.childNodes.forEach(walk);

        if (['DIV', 'P'].includes(el.tagName)) {
          out.push('\n');
        }
      }
    };

    root.childNodes.forEach(walk);

    return out
      .join('')
      .replace(/\u200A/g, '')
      .replace(/\u200B/g, '')
      .replace(/\s+\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trimEnd();
  }

  private insertNodeAfter(refNode: Node, newNode: Node) {
    if (refNode.parentNode) {
      if (refNode.nextSibling) {
        refNode.parentNode.insertBefore(newNode, refNode.nextSibling);
      } else {
        refNode.parentNode.appendChild(newNode);
      }
    }
  }

  private insertNodeAtSelection(node: Node): Node | undefined {
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) {
      this.editorRef.nativeElement.appendChild(node);
      return;
    }
    const range = sel.getRangeAt(0);
    range.insertNode(node);
    return node;
  }

  private insertTextAtSelection(text: string) {
    const sel = window.getSelection();
    if (!sel) return;

    this.deleteSelectionIfAny(sel);

    const range = sel.getRangeAt(0);
    const textNode = document.createTextNode(text);
    range.insertNode(textNode);
    this.setCaretAfterNode(textNode);
  }

  private normalizeEditor() {}

  private placeCaretAtEnd() {
    const el = this.editorRef.nativeElement;
    el.focus();
    const sel = window.getSelection();
    if (!sel) return;
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
  }

  private setCaretAfterNode(node: Node) {
    const sel = window.getSelection();
    if (!sel) return;
    const range = document.createRange();
    range.setStartAfter(node);
    range.setEndAfter(node);
    sel.removeAllRanges();
    sel.addRange(range);
  }

  private textToHtml(text: string): string {
    const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    const withSpans = esc(text).replace(/(%[a-zA-Z0-9_]+%)/g, (_m, g1) => {
      const tokenConfig = this.tokens.find((t) => t.key === g1);
      const cssClass = tokenConfig?.cssClass || '';
      const classAttr = cssClass ? ` ${cssClass}` : '';
      return `<span class="placeholder-token${classAttr}" contenteditable="false" data-placeholder="${g1}">${g1}</span>${this.HAIR_SPACE}`;
    });

    return withSpans.replace(/\r?\n/g, '<br>');
  }
}
