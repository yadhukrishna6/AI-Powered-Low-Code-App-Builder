import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Submission {
  id: string;
  formName: string;
  user: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  data: any;
}

@Component({
  selector: 'app-submissions',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="submissions-container">
      <header class="view-header">
        <div class="header-info">
          <h2>Submissions</h2>
          <p>Review and manage data collected from your published applications.</p>
        </div>
        <div class="header-actions">
          <button class="btn-outline">
            <span class="material-icons">filter_list</span>
            Filter
          </button>
          <button class="btn-primary">
            <span class="material-icons">download</span>
            Export CSV
          </button>
        </div>
      </header>

      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th><input type="checkbox"></th>
              <th>Form Name</th>
              <th>Submitted By</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of submissions()">
              <td><input type="checkbox"></td>
              <td>
                <div class="form-info">
                  <span class="material-icons">description</span>
                  {{ item.formName }}
                </div>
              </td>
              <td>{{ item.user }}</td>
              <td>{{ item.date }}</td>
              <td>
                <span class="status-badge" [class]="item.status">
                  {{ item.status }}
                </span>
              </td>
              <td>
                <button class="icon-btn" title="View Details">
                  <span class="material-icons">visibility</span>
                </button>
                <button class="icon-btn" title="Delete">
                  <span class="material-icons">delete</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <div *ngIf="submissions().length === 0" class="empty-state">
          <span class="material-icons">inbox</span>
          <p>No submissions found for this period.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .submissions-container {
      padding: 2rem;
      height: 100%;
      display: flex;
      flex-direction: column;
      background: var(--bg-primary);
    }

    .view-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }
    .header-info h2 { font-size: 1.5rem; font-weight: 800; color: var(--text-primary); margin-bottom: 0.5rem; }
    .header-info p { color: var(--text-secondary); font-size: 0.9rem; }
    .header-actions { display: flex; gap: 1rem; }

    .btn-primary {
      background: var(--accent);
      color: var(--bg-primary);
      padding: 0.75rem 1.25rem;
      border-radius: 12px;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .btn-outline {
      border: 1px solid var(--border);
      padding: 0.75rem 1.25rem;
      border-radius: 12px;
      font-weight: 700;
      color: var(--text-primary);
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .table-container {
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      border-radius: 16px;
      overflow: hidden;
      box-shadow: var(--card-shadow);
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }
    .data-table th {
      padding: 1.25rem;
      background: var(--bg-primary);
      font-size: 0.75rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-secondary);
      border-bottom: 1px solid var(--border);
    }
    .data-table td {
      padding: 1.25rem;
      border-bottom: 1px solid var(--border);
      font-size: 0.9rem;
      color: var(--text-primary);
    }
    .data-table tr:last-child td { border-bottom: none; }
    .data-table tr:hover td { background: rgba(var(--accent-rgb), 0.02); }

    .form-info { display: flex; align-items: center; gap: 0.75rem; font-weight: 600; }
    .form-info .material-icons { color: var(--accent); font-size: 1.2rem; opacity: 0.7; }

    .status-badge {
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: capitalize;
    }
    .status-badge.pending { background: rgba(245, 158, 11, 0.15); color: #f59e0b; }
    .status-badge.approved { background: rgba(16, 185, 129, 0.15); color: #10b981; }
    .status-badge.rejected { background: rgba(239, 68, 68, 0.15); color: #ef4444; }

    .icon-btn {
      color: var(--text-secondary);
      padding: 6px;
      border-radius: 8px;
      transition: all 0.2s;
    }
    .icon-btn:hover { color: var(--accent); background: var(--input-bg); }

    .empty-state {
      padding: 5rem;
      text-align: center;
      color: var(--text-secondary);
    }
    .empty-state .material-icons { font-size: 3rem; opacity: 0.2; margin-bottom: 1rem; }
  `]
})
export class SubmissionsComponent {
  submissions = signal<Submission[]>([
    {
      id: 'sub_1',
      formName: 'Customer Feedback',
      user: 'John Doe',
      date: 'May 6, 2026',
      status: 'approved',
      data: {}
    },
    {
      id: 'sub_2',
      formName: 'Internal Expense Claim',
      user: 'Sarah Smith',
      date: 'May 5, 2026',
      status: 'pending',
      data: {}
    },
    {
      id: 'sub_3',
      formName: 'IT Support Ticket',
      user: 'Mike Johnson',
      date: 'May 4, 2026',
      status: 'rejected',
      data: {}
    }
  ]);
}
