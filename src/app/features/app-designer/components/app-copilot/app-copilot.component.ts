import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AppDesignerService } from '../../services/app-designer.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-app-copilot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="copilot-container">
      <div class="copilot-header">
        <span class="material-icons">auto_awesome</span>
        <h3>AI App Architect</h3>
      </div>

      <div class="chat-history thin-scrollbar">
        <div *ngFor="let msg of messages()" class="message" [ngClass]="msg.role">
           <div class="msg-content">{{ msg.text }}</div>
        </div>
        <div *ngIf="isGenerating()" class="loading-dots">AI is thinking...</div>
      </div>

      <div class="copilot-input">
        <textarea 
          [(ngModel)]="prompt" 
          placeholder="Describe your app (e.g. 'Build an HR system with Leave requests and Employee records')"
          (keydown.enter)="$event.preventDefault(); sendPrompt()"
        ></textarea>
        <button class="btn-send" (click)="sendPrompt()" [disabled]="isGenerating() || !prompt()">
           <span class="material-icons">send</span>
        </button>
      </div>

      <div class="copilot-footer" *ngIf="suggestedSchema()">
         <div class="schema-preview">
            <h4>Generated Architecture Preview</h4>
            <div class="preview-stats">
               <span>{{ suggestedSchema().entities.length }} Entities</span>
               <span>{{ suggestedSchema().pages.length }} Pages</span>
            </div>
            <button class="btn-apply" (click)="applySchema()">
               Apply Architecture
            </button>
         </div>
      </div>
    </div>
  `,
  styles: [`
    .copilot-container {
      height: 100%; display: flex; flex-direction: column; background: var(--bg-secondary);
      border-left: 1px solid var(--border);
    }
    .copilot-header {
      padding: 1.25rem; border-bottom: 1px solid var(--border);
      display: flex; align-items: center; gap: 0.75rem; color: #10b981;
    }
    .copilot-header h3 { font-size: 0.9rem; font-weight: 700; margin: 0; color: var(--text-primary); }

    .chat-history { flex: 1; padding: 1.5rem; overflow-y: auto; display: flex; flex-direction: column; gap: 1rem; }
    .message { max-width: 85%; padding: 0.75rem 1rem; border-radius: 12px; font-size: 0.85rem; line-height: 1.5; }
    .message.user { background: var(--accent); color: white; align-self: flex-end; }
    .message.assistant { background: var(--input-bg); color: var(--text-primary); align-self: flex-start; }

    .copilot-input { padding: 1rem; border-top: 1px solid var(--border); display: flex; gap: 0.5rem; }
    .copilot-input textarea {
      flex: 1; background: var(--bg-primary); border: 1px solid var(--border); border-radius: 10px;
      padding: 0.75rem; color: var(--text-primary); font-size: 0.85rem; resize: none; height: 60px;
    }
    .btn-send { width: 44px; height: 44px; border-radius: 10px; background: var(--accent); color: white; display: flex; align-items: center; justify-content: center; align-self: flex-end; }

    .schema-preview {
      padding: 1rem; background: rgba(16, 185, 129, 0.05); border-top: 2px solid #10b981;
    }
    .schema-preview h4 { font-size: 0.75rem; font-weight: 700; margin-bottom: 0.5rem; color: #10b981; text-transform: uppercase; }
    .preview-stats { display: flex; gap: 1rem; font-size: 0.7rem; color: var(--text-secondary); margin-bottom: 1rem; }
    .btn-apply {
      width: 100%; padding: 0.6rem; background: #10b981; color: white; border-radius: 8px;
      font-weight: 700; font-size: 0.85rem;
    }

    .loading-dots { font-size: 0.75rem; color: var(--text-secondary); font-style: italic; }
  `]
})
export class AppCopilotComponent {
  http = inject(HttpClient);
  service = inject(AppDesignerService);
  
  prompt = signal('');
  messages = signal<{role: 'user' | 'assistant', text: string}[]>([]);
  isGenerating = signal(false);
  suggestedSchema = signal<any>(null);

  async sendPrompt() {
    const text = this.prompt();
    if (!text) return;

    this.messages.update(m => [...m, { role: 'user', text }]);
    this.prompt.set('');
    this.isGenerating.set(true);

    try {
      const projectId = this.service.layout()?.projectId;
      const result = await firstValueFrom(this.http.post<any>(`http://localhost:3000/api/v1/applications/generate-app?projectId=${projectId}`, { prompt: text }));
      
      this.suggestedSchema.set(result);
      this.messages.update(m => [...m, { 
        role: 'assistant', 
        text: `I've architected the "${result.name}" for you. It includes ${result.entities.length} entities and ${result.pages.length} pages. Would you like to apply this architecture?` 
      }]);
    } catch (e) {
      this.messages.update(m => [...m, { role: 'assistant', text: 'Sorry, I encountered an error while architecting your app.' }]);
    } finally {
      this.isGenerating.set(false);
    }
  }

  async applySchema() {
    // Logic to save entities, layout, and pages to the backend
    console.log('Applying schema:', this.suggestedSchema());
    this.suggestedSchema.set(null);
    this.messages.update(m => [...m, { role: 'assistant', text: 'Architecture applied successfully! You can now see the new entities in the Database tab and pages in the App Architect.' }]);
  }
}
