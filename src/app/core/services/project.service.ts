import { Injectable, signal, computed } from '@angular/core';

export interface Project {
  id: string;
  name: string;
  description: string;
  lastModified: Date;
  status: 'Published' | 'Draft';
  thumbnailColor: string;
  // Workspace Components
  schema?: any;
  workflows?: any[];
  rules?: any[];
  submissions?: any[];
}

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private projectsSignal = signal<Project[]>([]);
  private activeProjectIdSignal = signal<string | null>(null);

  readonly projects = computed(() => this.projectsSignal());
  readonly activeProject = computed(() => {
    const id = this.activeProjectIdSignal();
    return id ? this.projectsSignal().find(p => p.id === id) ?? null : null;
  });

  constructor() {
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

  setActiveProject(id: string | null) {
    this.activeProjectIdSignal.set(id);
  }

  getProject(id: string): Project | undefined {
    return this.projectsSignal().find(p => p.id === id);
  }

  addProject(name: string, description: string = ''): Project {
    const colors = ['#6366f1', '#a855f7', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const newProject: Project = {
      id: crypto.randomUUID(),
      name,
      description,
      lastModified: new Date(),
      status: 'Draft',
      thumbnailColor: randomColor,
      schema: { fields: [] },
      workflows: [],
      rules: [],
      submissions: []
    };

    this.projectsSignal.update(p => {
      const updated = [...p, newProject];
      this.saveToStorage(updated);
      return updated;
    });

    return newProject;
  }

  updateProjectSchema(id: string, schema: any) {
    this.projectsSignal.update(projects =>
      projects.map(p => p.id === id ? { ...p, schema, lastModified: new Date() } : p)
    );
    this.saveToStorage(this.projectsSignal());
  }

  updateProjectWorkflows(id: string, workflows: any[]) {
    this.projectsSignal.update(projects =>
      projects.map(p => p.id === id ? { ...p, workflows, lastModified: new Date() } : p)
    );
    this.saveToStorage(this.projectsSignal());
  }

  addSubmission(projectId: string, submission: any) {
    this.projectsSignal.update(projects =>
      projects.map(p => {
        if (p.id === projectId) {
          const submissions = [...(p.submissions || []), { ...submission, id: crypto.randomUUID(), timestamp: new Date() }];
          return { ...p, submissions, lastModified: new Date() };
        }
        return p;
      })
    );
    this.saveToStorage(this.projectsSignal());
  }

  updateProjectRules(id: string, rules: any[]) {
    this.projectsSignal.update(projects =>
      projects.map(p => p.id === id ? { ...p, rules, lastModified: new Date() } : p)
    );
    this.saveToStorage(this.projectsSignal());
  }

  updateProjectName(id: string, name: string) {
    this.projectsSignal.update(projects =>
      projects.map(p => p.id === id ? { ...p, name, lastModified: new Date() } : p)
    );
    this.saveToStorage(this.projectsSignal());
  }

  deleteProject(id: string) {
    this.projectsSignal.update(p => {
      const updated = p.filter(project => project.id !== id);
      this.saveToStorage(updated);
      return updated;
    });
    if (this.activeProjectIdSignal() === id) {
      this.activeProjectIdSignal.set(null);
    }
  }

  private saveToStorage(projects: Project[]) {
    localStorage.setItem('flowforge_projects', JSON.stringify(projects));
  }
}
