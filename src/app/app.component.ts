import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ModalComponent } from './shared/components/modal/modal.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ModalComponent],
  template: `
    <router-outlet></router-outlet>
    <app-modal></app-modal>
  `,
  styles: [`
    :host {
      display: block;
      margin: 0;
      padding: 0;
    }
  `]
})
export class AppComponent {}
