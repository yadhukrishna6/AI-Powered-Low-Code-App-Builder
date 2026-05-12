import { Component, Input, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface GridColumn {
  header: string;
  field: string;
  type?: string;
}

@Component({
  selector: 'app-data-grid',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="grid-container">
      <div class="grid-toolbar">
        <div class="search-box">
          <span class="material-icons">search</span>
          <input type="text" placeholder="Search records...">
        </div>
        <div class="grid-actions">
           <button class="btn-icon"><span class="material-icons">filter_list</span></button>
           <button class="btn-icon"><span class="material-icons">download</span></button>
           <button class="btn-create" (click)="onCreate()">
             <span class="material-icons">add</span>
             Add New
           </button>
        </div>
      </div>

      <div class="table-wrapper thin-scrollbar">
        <table>
          <thead>
            <tr>
              <th class="check-col"><input type="checkbox"></th>
              <th *ngFor="let col of columns" [style.width]="col.width || 'auto'">
                {{ col.header }}
              </th>
              <th class="actions-col">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let row of data()">
              <td><input type="checkbox"></td>
              <td *ngFor="let col of columns">
                 <ng-container [ngSwitch]="col.type">
                   <span *ngSwitchCase="'date'">{{ row[col.field] | date }}</span>
                   <span *ngSwitchDefault>{{ row[col.field] }}</span>
                 </ng-container>
              </td>
              <td class="actions-col">
                <button class="btn-icon-sm" (click)="onView(row)"><span class="material-icons">visibility</span></button>
                <button class="btn-icon-sm" (click)="onEdit(row)"><span class="material-icons">edit</span></button>
                <button class="btn-icon-sm danger" (click)="onDelete(row)"><span class="material-icons">delete</span></button>
              </td>
            </tr>
            <tr *ngIf="data().length === 0">
               <td [attr.colspan]="columns.length + 2" class="empty-row">
                 No records found for this entity.
               </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="grid-pagination">
         <span class="count-label">Showing {{ data().length }} records</span>
         <div class="page-controls">
           <button disabled><span class="material-icons">chevron_left</span></button>
           <span class="active-page">1</span>
           <button disabled><span class="material-icons">chevron_right</span></button>
         </div>
      </div>
    </div>
  `,
  styles: [`
    .grid-container {
      background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 16px;
      overflow: hidden; display: flex; flex-direction: column;
    }
    
    .grid-toolbar {
      padding: 1rem 1.5rem; display: flex; justify-content: space-between; align-items: center;
      border-bottom: 1px solid var(--border);
    }
    .search-box {
      display: flex; align-items: center; gap: 0.75rem; background: var(--bg-primary);
      border: 1px solid var(--border); border-radius: 8px; padding: 0.4rem 0.8rem; width: 300px;
    }
    .search-box input { background: transparent; border: none; font-size: 0.85rem; color: var(--text-primary); flex: 1; }
    .search-box .material-icons { color: var(--text-secondary); font-size: 1.1rem; }

    .grid-actions { display: flex; gap: 0.75rem; align-items: center; }
    .btn-create {
      display: flex; align-items: center; gap: 0.4rem; padding: 0.5rem 1rem;
      background: var(--accent); color: white; border-radius: 8px; font-weight: 700; font-size: 0.8rem;
    }

    .table-wrapper { flex: 1; overflow: auto; min-height: 400px; }
    table { width: 100%; border-collapse: collapse; }
    th {
      position: sticky; top: 0; background: var(--input-bg); padding: 1rem; text-align: left;
      font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase;
      letter-spacing: 0.05em; border-bottom: 1px solid var(--border); z-index: 5;
    }
    td { padding: 1rem; border-bottom: 1px solid var(--border); font-size: 0.85rem; color: var(--text-primary); }
    tr:hover td { background: rgba(var(--accent-rgb), 0.02); }

    .check-col { width: 40px; }
    .actions-col { width: 120px; text-align: center; }
    .btn-icon-sm { padding: 4px; color: var(--text-secondary); border-radius: 6px; }
    .btn-icon-sm:hover { background: var(--input-bg); color: var(--text-primary); }
    .btn-icon-sm.danger:hover { color: #ef4444; }

    .empty-row { padding: 4rem; text-align: center; color: var(--text-secondary); font-style: italic; }

    .grid-pagination {
      padding: 1rem 1.5rem; background: var(--input-bg); border-top: 1px solid var(--border);
      display: flex; justify-content: space-between; align-items: center;
    }
    .count-label { font-size: 0.75rem; color: var(--text-secondary); }
    .page-controls { display: flex; align-items: center; gap: 1rem; }
    .active-page { font-weight: 700; color: var(--accent); font-size: 0.85rem; }
  `]
})
export class DataGridComponent implements OnInit {
  @Input() entityId?: string;
  @Input() columns: any[] = [];
  
  http = inject(HttpClient);
  data = signal<any[]>([]);

  async ngOnInit() {
    if (this.entityId) {
      // In a real app, this would hit a generic CRUD endpoint like /api/v1/data/:entityId
      // For now, we'll return mock data or an empty list
      this.data.set([]);
    }
  }

  onCreate() { console.log('Create new record'); }
  onView(row: any) { console.log('View', row); }
  onEdit(row: any) { console.log('Edit', row); }
  onDelete(row: any) { console.log('Delete', row); }
}
