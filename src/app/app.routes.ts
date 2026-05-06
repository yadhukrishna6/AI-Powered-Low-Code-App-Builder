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
        path: 'forms',
        loadComponent: () => import('./features/builder/builder-container.component').then(m => m.BuilderContainerComponent) // Placeholder
      },
      {
        path: 'submissions',
        loadComponent: () => import('./features/submissions/submissions.component').then(m => m.SubmissionsComponent)
      },
      {
        path: 'settings',
        loadComponent: () => import('./features/builder/builder-container.component').then(m => m.BuilderContainerComponent) // Placeholder
      }
    ]
  }
];
