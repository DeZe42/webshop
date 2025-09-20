import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-button',
  standalone: true,
  template: `<button class="btn">{{ label }}</button>`,
  styles: [`.btn { padding: 8px 16px; border-radius: 6px; }`]
})
export class ButtonComponent {
  @Input() label = 'Click';
}
