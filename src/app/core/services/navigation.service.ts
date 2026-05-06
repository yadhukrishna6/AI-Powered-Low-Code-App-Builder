import { Injectable, signal } from '@angular/core';

export type AppView = 'designer' | 'workflow' | 'rules' | 'forms' | 'submissions' | 'settings';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  activeView = signal<AppView>('designer');

  setView(view: AppView) {
    this.activeView.set(view);
  }
}
