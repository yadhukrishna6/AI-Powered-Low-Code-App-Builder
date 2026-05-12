import { Routes } from '@angular/router';
import { ShellLayoutComponent } from './layouts/shell/shell-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: ShellLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      // Project-scoped routes
      {
        path: 'project/:id/designer',
        loadComponent: () => import('./features/builder/builder-container.component').then(m => m.BuilderContainerComponent)
      },
      {
        path: 'project/:id/workflow',
        loadComponent: () => import('./features/workflow/workflow-builder/workflow-builder.component').then(m => m.WorkflowBuilderComponent)
      },
      {
        path: 'project/:id/rules',
        loadComponent: () => import('./features/rule-engine/rule-engine.component').then(m => m.RuleEngineComponent)
      },
      {
        path: 'project/:id/submissions',
        loadComponent: () => import('./features/submissions/submissions.component').then(m => m.SubmissionsComponent)
      },
      {
        path: 'project/:id/data',
        loadComponent: () => import('./features/data-designer/data-designer.component').then(m => m.DataDesignerComponent)
      },
      {
        path: 'project/:id/app',
        loadComponent: () => import('./features/app-designer/app-designer.component').then(m => m.AppDesignerComponent)
      },
      {
        path: 'templates',
        loadComponent: () => import('./features/templates/templates.component').then(m => m.TemplatesComponent)
      },
      // Global module routes (no project context)
      {
        path: 'designer',
        loadComponent: () => import('./features/builder/builder-container.component').then(m => m.BuilderContainerComponent)
      },
      {
        path: 'workflow',
        loadComponent: () => import('./features/workflow/workflow-builder/workflow-builder.component').then(m => m.WorkflowBuilderComponent)
      },
      {
        path: 'rules',
        loadComponent: () => import('./features/rule-engine/rule-engine.component').then(m => m.RuleEngineComponent)
      },
      {
        path: 'submissions',
        loadComponent: () => import('./features/submissions/submissions.component').then(m => m.SubmissionsComponent)
      },
      {
        path: 'settings',
        loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent)
      },
      {
        path: 'runtime/app/:id',
        loadComponent: () => import('./features/runtime/runtime-app.component').then(m => m.RuntimeAppComponent)
      },
      {
        path: 'project/:id/logs',
        loadComponent: () => import('./features/workflow/execution/execution-logs.component').then(m => m.ExecutionLogsComponent)
      }
    ]
  }
];
