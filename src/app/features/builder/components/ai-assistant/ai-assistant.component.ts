import { Component, EventEmitter, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormBuilderService } from '../../../../core/services/form-builder.service';

@Component({
  selector: 'app-ai-assistant',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="ai-assistant-overlay" (click)="close.emit()">
      <div class="ai-assistant-content" (click)="$event.stopPropagation()">
        <header class="ai-header">
          <div class="ai-badge">
            <span class="material-icons">auto_awesome</span>
            AI GENERATOR
          </div>
          <button class="close-btn" (click)="close.emit()">
            <span class="material-icons">close</span>
          </button>
        </header>

        <div class="ai-body">
          <div class="prompt-section" *ngIf="!isGenerating()">
            <h2>What should this application do?</h2>
            <p>Describe your app or form, and FlowForge AI will build it for you in seconds.</p>
            
            <textarea 
              [(ngModel)]="prompt" 
              placeholder="e.g. Create a customer feedback form for a coffee shop with name, rating, and suggestions..."
              rows="4">
            </textarea>

            <div class="prompt-suggestions">
              <button (click)="prompt = 'Create a new hire onboarding form for Engineering department'">
                <span class="material-icons">person_add</span> Onboarding
              </button>
              <button (click)="prompt = 'Create a simple contact us form for a portfolio website'">
                <span class="material-icons">mail</span> Contact Us
              </button>
            </div>
          </div>

          <div class="loading-section" *ngIf="isGenerating()">
            <div class="ai-spinner">
              <div class="dot"></div>
              <div class="dot"></div>
              <div class="dot"></div>
            </div>
            <h3>Generating your application...</h3>
            <p>Our AI is placing components and setting up logic.</p>
          </div>
        </div>

        <footer class="ai-footer" *ngIf="!isGenerating()">
          <button class="btn-cancel" (click)="close.emit()">Cancel</button>
          <button class="btn-generate" [disabled]="!prompt.trim()" (click)="generate()">
            <span class="material-icons">auto_awesome</span>
            Generate Application
          </button>
        </footer>
      </div>
    </div>
  `,
  styles: [`
    .ai-assistant-overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.6);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .ai-assistant-content {
      background: var(--bg-secondary);
      width: 100%;
      max-width: 600px;
      border-radius: 24px;
      border: 1px solid var(--border);
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
      overflow: hidden;
      animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    @keyframes slideUp {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }

    .ai-header {
      padding: 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: var(--bg-primary);
      border-bottom: 1px solid var(--border);
    }

    .ai-badge {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
      color: white;
      padding: 0.4rem 0.8rem;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 800;
      letter-spacing: 0.05em;
    }

    .ai-badge .material-icons { font-size: 0.9rem; }

    .ai-body { padding: 2rem; }
    .ai-body h2 { font-size: 1.5rem; font-weight: 800; margin-bottom: 0.5rem; color: var(--text-primary); }
    .ai-body p { color: var(--text-secondary); margin-bottom: 1.5rem; font-size: 0.95rem; }

    textarea {
      width: 100%;
      background: var(--bg-primary);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 1rem;
      color: var(--text-primary);
      font-size: 1rem;
      resize: none;
      transition: all 0.2s;
    }
    textarea:focus { border-color: var(--accent); outline: none; box-shadow: 0 0 0 4px rgba(var(--accent-rgb), 0.1); }

    .prompt-suggestions {
      display: flex;
      gap: 0.75rem;
      margin-top: 1rem;
    }
    .prompt-suggestions button {
      background: var(--bg-primary);
      border: 1px solid var(--border);
      padding: 0.5rem 0.75rem;
      border-radius: 10px;
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--text-secondary);
      display: flex;
      align-items: center;
      gap: 0.4rem;
      transition: all 0.2s;
    }
    .prompt-suggestions button:hover { border-color: var(--accent); color: var(--accent); }

    .loading-section {
      text-align: center;
      padding: 3rem 0;
    }
    .ai-spinner {
      display: flex;
      justify-content: center;
      gap: 0.5rem;
      margin-bottom: 2rem;
    }
    .dot {
      width: 12px;
      height: 12px;
      background: var(--accent);
      border-radius: 50%;
      animation: bounce 0.6s infinite alternate;
    }
    .dot:nth-child(2) { animation-delay: 0.2s; }
    .dot:nth-child(3) { animation-delay: 0.4s; }

    @keyframes bounce {
      to { transform: translateY(-10px); opacity: 0.5; }
    }

    .ai-footer {
      padding: 1.5rem;
      background: var(--bg-primary);
      border-top: 1px solid var(--border);
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
    }

    .btn-cancel { color: var(--text-secondary); font-weight: 600; padding: 0.75rem 1.5rem; }
    .btn-generate {
      background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
      color: white;
      padding: 0.8rem 1.5rem;
      border-radius: 12px;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 0.6rem;
      box-shadow: 0 4px 15px rgba(var(--accent-rgb), 0.2);
    }
    .btn-generate:disabled { opacity: 0.5; cursor: not-allowed; }
  `]
})
export class AIAssistantComponent {
  @Output() close = new EventEmitter<void>();
  
  service = inject(FormBuilderService);
  prompt = '';
  isGenerating = signal(false);

  async generate() {
    if (!this.prompt.trim()) return;
    
    this.isGenerating.set(true);
    await this.service.generateFromPrompt(this.prompt);
    this.isGenerating.set(false);
    this.close.emit();
  }
}
