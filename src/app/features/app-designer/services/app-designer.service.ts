import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface NavItem {
  label: string;
  route: string;
  icon: string;
  children?: NavItem[];
}

export interface AppLayoutMetadata {
  id: string;
  projectId: string;
  navigation: {
    sidebar: NavItem[];
    topbar: NavItem[];
  };
  theme?: any;
}

export interface AppPage {
  id: string;
  name: string;
  route: string;
  type: 'crud' | 'dashboard' | 'custom' | 'form';
  content?: any;
}

@Injectable({
  providedIn: 'root'
})
export class AppDesignerService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/v1/applications';

  layout = signal<AppLayoutMetadata | null>(null);
  pages = signal<AppPage[]>([]);

  async loadAppMetadata(projectId: string) {
    try {
      const [layout, pages] = await Promise.all([
        firstValueFrom(this.http.get<AppLayoutMetadata>(`${this.apiUrl}/layout?projectId=${projectId}`)),
        firstValueFrom(this.http.get<AppPage[]>(`${this.apiUrl}/pages?projectId=${projectId}`))
      ]);
      this.layout.set(layout);
      this.pages.set(pages);
    } catch (e) {
      console.error('Failed to load app metadata:', e);
    }
  }

  async saveLayout(projectId: string, layout: any) {
    const updated = await firstValueFrom(this.http.put<AppLayoutMetadata>(`${this.apiUrl}/layout?projectId=${projectId}`, layout));
    this.layout.set(updated);
  }

  async createPage(projectId: string, page: Partial<AppPage>) {
    const created = await firstValueFrom(this.http.post<AppPage>(`${this.apiUrl}/pages?projectId=${projectId}`, page));
    this.pages.update(list => [...list, created]);
    return created;
  }

  async deletePage(id: string) {
    await firstValueFrom(this.http.delete(`${this.apiUrl}/pages/${id}`));
    this.pages.update(list => list.filter(p => p.id !== id));
  }
}
