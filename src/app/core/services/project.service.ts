import { Injectable, signal, computed } from '@angular/core';

export interface Project {
  id: string;
  name: string;
  description: string;
  type: 'App' | 'Workflow';
  lastModified: Date;
  status: 'Published' | 'Draft';
  thumbnailColor: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private projectsSignal = signal<Project[]>([]);
  
  readonly projects = computed(() => this.projectsSignal());

  constructor() {
    // Load from local storage if available
    const saved = localStorage.getItem('flowforge_projects');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.projectsSignal.set(parsed.map((p: any) => ({
          ...p,
          lastModified: new Date(p.lastModified)
        })));
      } catch (e) {
        console.error('Failed to load projects', e);
      }
    }
  }

  addProject(name: string, type: 'App' | 'Workflow', description: string = '') {
    const colors = ['#6366f1', '#a855f7', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const newProject: Project = {
      id: crypto.randomUUID(),
      name,
      description,
      type,
      lastModified: new Date(),
      status: 'Draft',
      thumbnailColor: randomColor
    };

    this.projectsSignal.update(p => {
      const updated = [...p, newProject];
      this.saveToStorage(updated);
      return updated;
    });

    return newProject;
  }

  deleteProject(id: string) {
    this.projectsSignal.update(p => {
      const updated = p.filter(project => project.id !== id);
      this.saveToStorage(updated);
      return updated;
    });
  }

  private saveToStorage(projects: Project[]) {
    localStorage.setItem('flowforge_projects', JSON.stringify(projects));
  }
}
