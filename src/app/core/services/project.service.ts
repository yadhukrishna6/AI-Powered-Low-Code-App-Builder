import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface Project {
  id: string;
  name: string;
  description: string;
  lastModified: Date;
  status: 'Published' | 'Draft';
  thumbnailColor: string;
  forms?: any[];
}

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/v1/projects';

  private projectsSignal = signal<Project[]>([]);
  private activeProjectIdSignal = signal<string | null>(null);

  readonly projects = computed(() => this.projectsSignal());
  readonly activeProject = computed(() => {
    const id = this.activeProjectIdSignal();
    return id ? this.projectsSignal().find(p => p.id === id) ?? null : null;
  });

  async loadProjects() {
    try {
      const projects = await firstValueFrom(this.http.get<any[]>(this.apiUrl));
      this.projectsSignal.set(projects.map(p => ({
        ...p,
        lastModified: new Date(p.updatedAt || p.createdAt)
      })));
    } catch (e) {
      console.error('Failed to load projects:', e);
    }
  }

  async getProject(id: string): Promise<any> {
    return firstValueFrom(this.http.get<any>(`${this.apiUrl}/${id}`));
  }

  setActiveProject(id: string | null) {
    this.activeProjectIdSignal.set(id);
  }

  async addProject(name: string, description: string = ''): Promise<Project> {
    const colors = ['#6366f1', '#a855f7', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const payload = {
      name,
      description,
      thumbnailColor: randomColor,
      status: 'Draft'
    };

    const newProject = await firstValueFrom(this.http.post<any>(this.apiUrl, payload));
    const formattedProject: Project = {
      ...newProject,
      lastModified: new Date(newProject.createdAt)
    };

    this.projectsSignal.update(p => [...p, formattedProject]);
    return formattedProject;
  }

  async updateProject(id: string, updates: Partial<Project>) {
    try {
      const updated = await firstValueFrom(this.http.put<any>(`${this.apiUrl}/${id}`, updates));
      this.projectsSignal.update(projects =>
        projects.map(p => p.id === id ? { ...p, ...updates, lastModified: new Date(updated.updatedAt) } : p)
      );
    } catch (e) {
      console.error('Failed to update project:', e);
    }
  }

  async deleteProject(id: string) {
    try {
      await firstValueFrom(this.http.delete(`${this.apiUrl}/${id}`));
      this.projectsSignal.update(p => p.filter(project => project.id !== id));
      if (this.activeProjectIdSignal() === id) {
        this.activeProjectIdSignal.set(null);
      }
    } catch (e) {
      console.error('Failed to delete project:', e);
    }
  }
}
