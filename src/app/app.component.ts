import { Component } from '@angular/core';
import { BuilderContainerComponent } from './features/builder/builder-container.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [BuilderContainerComponent],
  template: `
    <app-builder-container></app-builder-container>
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
