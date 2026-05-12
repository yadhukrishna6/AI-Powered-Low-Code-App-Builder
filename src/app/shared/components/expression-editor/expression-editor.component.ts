import { Component, Input, Output, EventEmitter, OnInit, ViewChild, ElementRef, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WorkflowStateService } from '../../../features/workflow/services/workflow-state.service';

declare const monaco: any;

@Component({
  selector: 'app-expression-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="expression-editor-container glass">
      <div class="editor-header">
        <span class="label">Expression Editor</span>
        <div class="header-actions">
           <button class="btn-sm" (click)="togglePicker()">
             <span class="material-icons">variable_add</span>
             Variables
           </button>
        </div>
      </div>

      <div class="editor-wrapper">
        <div #monacoContainer class="monaco-host"></div>
        
        <!-- Loading Overlay -->
        <div *ngIf="isLoading" class="loading-overlay">
          <span class="material-icons spinning">sync</span>
          Initializing Editor...
        </div>

        <!-- Variable Picker Sidebar (n8n style) -->
        <div *ngIf="showPicker" class="variable-picker glass-heavy">
          <div class="picker-header">
            <span>Available Data</span>
            <button (click)="showPicker = false"><span class="material-icons">close</span></button>
          </div>
          <div class="picker-body">
            <div *ngFor="let node of availableNodes()" class="node-group">
              <div class="node-name">
                <span class="material-icons">settings_ethernet</span>
                {{ node.label }}
              </div>
              <div class="node-vars">
                <div 
                  *ngFor="let v of node.vars" 
                  class="var-item"
                  (click)="insertVariable(node.id, v.path)"
                >
                  {{ v.label }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="editor-footer">
        <div class="preview-group">
          <span class="preview-label">Live Preview:</span>
          <span class="preview-value">{{ previewValue }}</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .expression-editor-container {
      display: flex;
      flex-direction: column;
      border-radius: 12px;
      border: 1px solid var(--border);
      overflow: hidden;
      background: var(--bg-secondary);
      position: relative;
    }
    .editor-header {
      padding: 8px 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: rgba(0,0,0,0.2);
      border-bottom: 1px solid var(--border);
    }
    .label { font-size: 0.7rem; font-weight: 800; text-transform: uppercase; color: var(--text-secondary); }
    .editor-wrapper { position: relative; height: 120px; }
    .monaco-host { width: 100%; height: 100%; }

    .loading-overlay {
      position: absolute; inset: 0; background: rgba(15,23,42,0.8);
      display: flex; align-items: center; justify-content: center;
      gap: 8px; font-size: 0.75rem; color: var(--text-secondary);
      z-index: 50;
    }

    .variable-picker {
      position: absolute;
      top: 0; right: 0; bottom: 0;
      width: 200px;
      z-index: 100;
      border-left: 1px solid var(--border);
      display: flex;
      flex-direction: column;
    }
    .picker-header { padding: 8px; font-size: 0.75rem; font-weight: 700; display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.3); }
    .picker-body { flex: 1; overflow-y: auto; padding: 8px; }
    .node-group { margin-bottom: 12px; }
    .node-name { font-size: 0.7rem; font-weight: 800; color: var(--accent); display: flex; align-items: center; gap: 4px; margin-bottom: 4px; }
    .var-item { font-size: 0.65rem; padding: 4px 8px; border-radius: 4px; cursor: pointer; transition: all 0.2s; color: var(--text-secondary); }
    .var-item:hover { background: var(--accent); color: white; }

    .editor-footer { padding: 8px 12px; background: rgba(0,0,0,0.1); border-top: 1px solid var(--border); }
    .preview-group { display: flex; align-items: center; gap: 8px; font-size: 0.7rem; }
    .preview-label { color: var(--text-secondary); font-weight: 600; }
    .preview-value { color: #10b981; font-family: monospace; }

    .btn-sm { background: none; border: 1px solid var(--border); color: var(--text-primary); padding: 4px 8px; border-radius: 4px; font-size: 0.65rem; cursor: pointer; display: flex; align-items: center; gap: 4px; }
    .btn-sm:hover { border-color: var(--accent); }
    .btn-sm .material-icons { font-size: 0.9rem; }
    .spinning { animation: spin 1s linear infinite; }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  `]
})
export class ExpressionEditorComponent implements OnInit, OnDestroy {
  @Input() value: string = '';
  @Output() valueChange = new EventEmitter<string>();

  @ViewChild('monacoContainer', { static: true }) monacoContainer!: ElementRef;

  private editor?: any;
  private state = inject(WorkflowStateService);
  
  showPicker = false;
  isLoading = true;
  previewValue = '...';

  availableNodes = computed(() => {
    return this.state.nodes().map(node => ({
      id: node.id,
      label: node.label,
      vars: [
        { label: 'JSON Data', path: '$json' },
        { label: 'Status', path: '$status' },
      ]
    }));
  });

  ngOnInit() {
    this.loadMonaco();
  }

  private loadMonaco() {
    if ((window as any).monaco) {
      this.initMonaco();
      return;
    }

    const onGotAmdLoader = () => {
      (window as any).require.config({ paths: { vs: '/assets/vs' } });
      (window as any).require(['vs/editor/editor.main'], () => {
        this.initMonaco();
      });
    };

    if (!(window as any).require) {
      const loaderScript = document.createElement('script');
      loaderScript.type = 'text/javascript';
      loaderScript.src = '/assets/vs/loader.js';
      loaderScript.addEventListener('load', onGotAmdLoader);
      document.body.appendChild(loaderScript);
    } else {
      onGotAmdLoader();
    }
  }

  private initMonaco() {
    this.isLoading = false;
    this.editor = monaco.editor.create(this.monacoContainer.nativeElement, {
      value: this.value,
      language: 'javascript',
      theme: 'vs-dark',
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      fontSize: 12,
      lineNumbers: 'off',
      glyphMargin: false,
      folding: false,
      lineDecorationsWidth: 0,
      lineNumbersMinChars: 0,
      scrollbar: {
        vertical: 'hidden',
        horizontal: 'hidden'
      },
    });

    this.editor.onDidChangeModelContent(() => {
      const newValue = this.editor?.getValue() || '';
      this.value = newValue;
      this.valueChange.emit(newValue);
      this.updatePreview();
    });
  }

  insertVariable(nodeId: string, path: string) {
    const expression = `{{ $node("${nodeId}").${path} }}`;
    const selection = this.editor?.getSelection();
    if (selection) {
      this.editor?.executeEdits('picker', [{
        range: selection,
        text: expression,
        forceMoveMarkers: true
      }]);
    }
  }

  togglePicker() {
    this.showPicker = !this.showPicker;
  }

  private updatePreview() {
    this.previewValue = this.value.replace(/{{ (.*?) }}/g, '[Object]');
  }

  ngOnDestroy() {
    this.editor?.dispose();
  }
}
