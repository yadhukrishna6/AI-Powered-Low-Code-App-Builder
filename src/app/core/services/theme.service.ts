import { Injectable, signal, effect } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  theme = signal<'light' | 'dark'>(
    (localStorage.getItem('theme') as 'light' | 'dark') || 'dark'
  );

  constructor() {
    effect(() => {
      const currentTheme = this.theme();
      localStorage.setItem('theme', currentTheme);
      document.body.classList.remove('light-theme', 'dark-theme');
      document.body.classList.add(`${currentTheme}-theme`);
    });
  }

  setTheme(theme: 'light' | 'dark') {
    this.theme.set(theme);
  }

  toggleTheme() {
    this.theme.update(t => t === 'light' ? 'dark' : 'light');
  }
}
