// Central service for global modal dialogs
import { Injectable, signal } from '@angular/core';

export interface ModalConfig {
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'danger' | 'prompt' | 'select';
  confirmText?: string;
  cancelText?: string;
  placeholder?: string;
  initialValue?: string;
  options?: { label: string, value: any }[];
}

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  isOpen = signal(false);
  config = signal<ModalConfig | null>(null);
  private resolveFn: ((value: any) => void) | null = null;

  show(config: ModalConfig): Promise<any> {
    this.config.set(config);
    this.isOpen.set(true);
    return new Promise((resolve) => {
      this.resolveFn = resolve;
    });
  }

  confirm(value: any = true) {
    this.isOpen.set(false);
    if (this.resolveFn) this.resolveFn(value);
  }

  cancel() {
    this.isOpen.set(false);
    if (this.resolveFn) this.resolveFn(null);
  }
}
