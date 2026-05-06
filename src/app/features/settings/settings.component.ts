import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="settings-container">
      <header class="settings-header">
        <h2>System Settings</h2>
        <p>Manage your platform preferences and configurations.</p>
      </header>

      <div class="settings-grid">
        <section class="settings-section">
          <h3>Workspace</h3>
          <div class="setting-row">
            <div class="setting-info">
              <span class="setting-name">Workspace Name</span>
              <span class="setting-desc">The name displayed across the platform.</span>
            </div>
            <input type="text" value="My FlowForge Workspace">
          </div>
          <div class="setting-row">
            <div class="setting-info">
              <span class="setting-name">Default Project Type</span>
              <span class="setting-desc">What type to default to when creating a project.</span>
            </div>
            <select>
              <option>Application</option>
              <option>Workflow</option>
            </select>
          </div>
        </section>

        <section class="settings-section">
          <h3>Appearance</h3>
          <div class="setting-row">
            <div class="setting-info">
              <span class="setting-name">Language</span>
              <span class="setting-desc">Platform display language.</span>
            </div>
            <select>
              <option>English (US)</option>
              <option>English (UK)</option>
            </select>
          </div>
        </section>

        <section class="settings-section danger-zone">
          <h3>Danger Zone</h3>
          <div class="setting-row">
            <div class="setting-info">
              <span class="setting-name">Clear All Projects</span>
              <span class="setting-desc">This will permanently delete all projects from local storage.</span>
            </div>
            <button class="btn-danger" (click)="clearAll()">Clear All</button>
          </div>
        </section>
      </div>
    </div>
  `,
  styles: [`
    .settings-container {
      padding: 2.5rem;
      height: 100%;
      overflow-y: auto;
      background: var(--bg-primary);
    }
    .settings-header { margin-bottom: 3rem; }
    .settings-header h2 { font-size: 1.75rem; font-weight: 800; color: var(--text-primary); margin-bottom: 0.5rem; }
    .settings-header p { color: var(--text-secondary); }

    .settings-grid { display: flex; flex-direction: column; gap: 2rem; max-width: 760px; }

    .settings-section {
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      border-radius: 20px;
      overflow: hidden;
    }
    .settings-section h3 {
      padding: 1.25rem 1.5rem;
      font-size: 0.85rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--text-secondary);
      border-bottom: 1px solid var(--border);
      background: var(--bg-primary);
    }
    .danger-zone h3 { color: #ef4444; }

    .setting-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid var(--border);
      gap: 2rem;
    }
    .setting-row:last-child { border-bottom: none; }

    .setting-info { display: flex; flex-direction: column; gap: 0.25rem; }
    .setting-name { font-weight: 600; font-size: 0.9rem; color: var(--text-primary); }
    .setting-desc { font-size: 0.8rem; color: var(--text-secondary); }

    input, select {
      padding: 0.6rem 1rem;
      background: var(--bg-primary);
      border: 1px solid var(--border);
      border-radius: 10px;
      color: var(--text-primary);
      font-size: 0.85rem;
      min-width: 220px;
    }
    input:focus, select:focus { border-color: var(--accent); outline: none; }

    .btn-danger {
      padding: 0.6rem 1.25rem;
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
      border: 1px solid rgba(239, 68, 68, 0.3);
      border-radius: 10px;
      font-weight: 700;
      font-size: 0.85rem;
      transition: all 0.2s;
      white-space: nowrap;
    }
    .btn-danger:hover { background: rgba(239, 68, 68, 0.2); }
  `]
})
export class SettingsComponent {
  clearAll() {
    if (confirm('This will permanently delete ALL projects. Are you sure?')) {
      localStorage.removeItem('flowforge_projects');
      window.location.reload();
    }
  }
}
