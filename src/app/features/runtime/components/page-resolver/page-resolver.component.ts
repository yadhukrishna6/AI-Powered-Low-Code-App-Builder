import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { AppDesignerService } from '../../../app-designer/services/app-designer.service';
import { DataGridComponent } from '../data-grid/data-grid.component';
import { DynamicRendererComponent } from '../../../builder/components/canvas/dynamic-renderer.component';

@Component({
  selector: 'app-page-resolver',
  standalone: true,
  imports: [CommonModule, DataGridComponent],
  template: `
    <div class="page-resolver-container" *ngIf="activePage() as page">
      <!-- CRUD List View -->
      <app-data-grid 
        *ngIf="page.type === 'crud'" 
        [entityId]="page.content?.entityId"
        [columns]="page.content?.columns"
      ></app-data-grid>

      <!-- Form View -->
      <div *ngIf="page.type === 'form'" class="form-page-wrapper">
         <div class="form-card">
           <div class="form-header">
             <h2>{{ page.name }}</h2>
           </div>
           <div class="form-body">
              <!-- Reusing existing renderer for form fields -->
              <p>Dynamic Form Engine Loading...</p>
           </div>
         </div>
      </div>

      <!-- Dashboard View -->
      <div *ngIf="page.type === 'dashboard'" class="dashboard-wrapper">
        <div class="dashboard-grid">
           <div class="stat-card">
              <span class="label">Total Records</span>
              <span class="value">1,284</span>
           </div>
        </div>
      </div>
    </div>

    <div *ngIf="!activePage()" class="not-found">
       <span class="material-icons">search_off</span>
       <h3>Page Not Found</h3>
       <p>The requested route does not exist in this application schema.</p>
    </div>
  `,
  styles: [`
    .page-resolver-container { height: 100%; width: 100%; }
    .not-found {
      height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center;
      color: var(--text-secondary); opacity: 0.5;
    }
    .not-found .material-icons { font-size: 4rem; margin-bottom: 1rem; }

    .form-card { background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 20px; overflow: hidden; }
    .form-header { padding: 2rem; border-bottom: 1px solid var(--border); }
    .form-body { padding: 2rem; }

    .stat-card { background: var(--bg-secondary); border: 1px solid var(--border); padding: 2rem; border-radius: 16px; width: 200px; }
    .stat-card .label { font-size: 0.75rem; color: var(--text-secondary); display: block; }
    .stat-card .value { font-size: 2rem; font-weight: 800; color: var(--accent); }
  `]
})
export class PageResolverComponent {
  service = inject(AppDesignerService);
  route = inject(ActivatedRoute);

  activePage = computed(() => {
    const routeParam = this.route.snapshot.queryParamMap.get('route');
    if (!routeParam) return this.service.pages()[0] ?? null;
    return this.service.pages().find(p => p.route === routeParam) ?? null;
  });
}
