import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WorkflowStateService } from '../services/workflow-state.service';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-ai-assistant',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="ai-assistant-container" [class.expanded]="isExpanded()">
      <div class="assistant-bar glass" (click)="!isExpanded() && isExpanded.set(true)">
        <span class="material-icons ai-icon">auto_awesome</span>
        
        <div class="input-wrapper" *ngIf="isExpanded()">
          <input 
            #promptInput
            type="text" 
            [(ngModel)]="prompt" 
            placeholder="Describe the workflow you want to build..."
            (keyup.enter)="generate()"
            [disabled]="isGenerating()"
          >
          <div class="actions">
            <button class="btn-cancel" (click)="close($event)">Cancel</button>
            <button class="btn-generate" (click)="generate()" [disabled]="!prompt() || isGenerating()">
              <span class="material-icons" *ngIf="!isGenerating()">send</span>
              <span class="material-icons spinning" *ngIf="isGenerating()">sync</span>
              {{ isGenerating() ? 'Generating...' : 'Build' }}
            </button>
          </div>
        </div>

        <div class="collapsed-label" *ngIf="!isExpanded()">
          AI Workflow Assistant
          <span class="shortcut">⌘ + K</span>
        </div>
      </div>

      <div class="ai-status" *ngIf="statusMessage()">
        <span class="material-icons">info</span>
        {{ statusMessage() }}
      </div>
    </div>
  `,
  styles: [`
    .ai-assistant-container {
      position: fixed;
      bottom: 120px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 1000;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .assistant-bar {
      height: 48px;
      padding: 0 16px;
      display: flex;
      align-items: center;
      gap: 12px;
      border-radius: 24px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.4);
      cursor: pointer;
      width: 240px;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      border: 1px solid rgba(255,255,255,0.1);
      background: rgba(15, 23, 42, 0.8);
      backdrop-filter: blur(20px);
    }

    .ai-assistant-container.expanded .assistant-bar {
      width: 600px;
      height: 64px;
      padding: 0 8px 0 20px;
      border-radius: 16px;
      cursor: default;
    }

    .ai-icon { color: #a78bfa; font-size: 1.2rem; }

    .collapsed-label {
      font-size: 0.85rem; font-weight: 600; color: #f8fafc;
      display: flex; align-items: center; gap: 8px; flex: 1;
    }
    .shortcut { font-size: 0.65rem; padding: 2px 6px; background: rgba(255,255,255,0.1); border-radius: 4px; opacity: 0.6; }

    .input-wrapper { flex: 1; display: flex; align-items: center; gap: 12px; }
    input {
      flex: 1; background: none; border: none; color: white;
      font-size: 0.95rem; font-weight: 500; outline: none;
    }
    input::placeholder { color: #64748b; }

    .actions { display: flex; gap: 8px; }
    .btn-generate {
      background: var(--accent); color: var(--bg-primary);
      padding: 8px 16px; border-radius: 10px; font-weight: 700;
      display: flex; align-items: center; gap: 8px; font-size: 0.8rem;
    }
    .btn-cancel {
      color: #94a3b8; font-size: 0.8rem; font-weight: 600;
      padding: 8px 12px;
    }

    .ai-status {
      background: rgba(0,0,0,0.6); color: #94a3b8;
      padding: 6px 16px; border-radius: 20px; font-size: 0.75rem;
      display: flex; align-items: center; gap: 8px;
      border: 1px solid rgba(255,255,255,0.05);
      animation: fadeIn 0.3s ease-out;
    }

    .spinning { animation: spin 1s linear infinite; }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  `]
})
export class AIAssistantComponent {
  private state = inject(WorkflowStateService);
  private http = inject(HttpClient);

  isExpanded = signal(false);
  isGenerating = signal(false);
  prompt = signal('');
  statusMessage = signal<string | null>(null);

  close(event: MouseEvent) {
    event.stopPropagation();
    this.isExpanded.set(false);
    this.prompt.set('');
    this.statusMessage.set(null);
  }

  async generate() {
    if (!this.prompt() || this.isGenerating()) return;

    this.isGenerating.set(true);
    this.statusMessage.set('AI is analyzing requirements...');

    try {
      const response = await firstValueFrom(
        this.http.post<any>('http://localhost:3000/api/v1/workflows/ai/generate', {
          prompt: this.prompt()
        })
      );

      this.statusMessage.set('Constructing workflow graph...');
      
      // Load the generated graph into state
      // Ensure we preserve the ID if we are editing an existing one
      const currentWorkflow = this.state.workflow();
      const newGraph = {
        ...response,
        id: currentWorkflow.id,
        name: currentWorkflow.name || 'AI Generated Workflow'
      };

      this.state.loadWorkflow(newGraph);
      this.isExpanded.set(false);
      this.prompt.set('');
      this.statusMessage.set(null);
    } catch (e: any) {
      this.statusMessage.set('Generation failed: ' + (e.message || 'Unknown error'));
      setTimeout(() => this.statusMessage.set(null), 5000);
    } finally {
      this.isGenerating.set(false);
    }
  }
}
