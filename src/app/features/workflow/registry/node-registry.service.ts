import { Injectable } from '@angular/core';
import { WorkflowNodeType } from '../models/workflow.model';

export interface NodeRegistryEntry {
  subType: string;
  type: WorkflowNodeType;
  label: string;
  icon: string;
  color: string;
  description: string;
  defaultData: any;
  endpoints: {
    source: number; // number of output ports
    target: number; // number of input ports
  };
}

@Injectable({
  providedIn: 'root'
})
export class NodeRegistryService {
  readonly NODE_GROUPS = [
    { id: 'trigger', label: 'Triggers', color: '#10b981' },
    { id: 'logic', label: 'Logic', color: '#f59e0b' },
    { id: 'action', label: 'Actions', color: '#3b82f6' }
  ];

  readonly REGISTRY: Record<string, NodeRegistryEntry> = {
    // TRIGGERS
    'start': {
      subType: 'start',
      type: 'trigger',
      label: 'Start Workflow',
      icon: 'play_arrow',
      color: '#10b981',
      description: 'The starting point of your automation.',
      defaultData: {},
      endpoints: { source: 1, target: 0 }
    },
    'webhook': {
      subType: 'webhook',
      type: 'trigger',
      label: 'Webhook',
      icon: 'webhook',
      color: '#10b981',
      description: 'Trigger workflow via an external HTTP request.',
      defaultData: { method: 'POST', path: '/webhook-123' },
      endpoints: { source: 1, target: 0 }
    },
    'form-submitted': {
      subType: 'form-submitted',
      type: 'trigger',
      label: 'Form Submitted',
      icon: 'assignment',
      color: '#10b981',
      description: 'Trigger when a specific form is submitted.',
      defaultData: { formId: '' },
      endpoints: { source: 1, target: 0 }
    },
    'schedule': {
      subType: 'schedule',
      type: 'trigger',
      label: 'Schedule',
      icon: 'schedule',
      color: '#10b981',
      description: 'Run on a recurring interval.',
      defaultData: { cron: '0 0 * * *' },
      endpoints: { source: 1, target: 0 }
    },

    // LOGIC
    'condition': {
      subType: 'condition',
      type: 'logic',
      label: 'Condition',
      icon: 'call_split',
      color: '#f59e0b',
      description: 'Branch the workflow based on data.',
      defaultData: { conditions: [] },
      endpoints: { source: 2, target: 1 } // True / False branches
    },
    'switch': {
      subType: 'switch',
      type: 'logic',
      label: 'Switch',
      icon: 'alt_route',
      color: '#f59e0b',
      description: 'Route to different paths based on a value.',
      defaultData: { cases: [] },
      endpoints: { source: 3, target: 1 }
    },
    'loop': {
      subType: 'loop',
      type: 'logic',
      label: 'Loop',
      icon: 'loop',
      color: '#f59e0b',
      description: 'Iterate over a list of items.',
      defaultData: { collection: '' },
      endpoints: { source: 2, target: 1 } // Body / Finished branches
    },
    'delay': {
      subType: 'delay',
      type: 'logic',
      label: 'Delay',
      icon: 'timer',
      color: '#f59e0b',
      description: 'Wait for a duration before continuing.',
      defaultData: { duration: 60, unit: 'seconds' },
      endpoints: { source: 1, target: 1 }
    },

    // ACTIONS
    'approval': {
      subType: 'approval',
      type: 'action',
      label: 'Approval',
      icon: 'how_to_reg',
      color: '#3b82f6',
      description: 'Request manual approval from a user.',
      defaultData: { approverRole: 'admin' },
      endpoints: { source: 2, target: 1 } // Approved / Rejected branches
    },
    'send-notification': {
      subType: 'send-notification',
      type: 'action',
      label: 'Notification',
      icon: 'notifications',
      color: '#3b82f6',
      description: 'Send an email or push notification.',
      defaultData: { channel: 'email', message: '' },
      endpoints: { source: 1, target: 1 }
    },
    'api-request': {
      subType: 'api-request',
      type: 'action',
      label: 'API Request',
      icon: 'http',
      color: '#3b82f6',
      description: 'Make an external HTTP request.',
      defaultData: { method: 'GET', url: '' },
      endpoints: { source: 1, target: 1 }
    },
    'save-data': {
      subType: 'save-data',
      type: 'action',
      label: 'Save Data',
      icon: 'storage',
      color: '#3b82f6',
      description: 'Store data in the platform database.',
      defaultData: { table: '', data: {} },
      endpoints: { source: 1, target: 1 }
    },
    'transform-data': {
      subType: 'transform-data',
      type: 'action',
      label: 'Transform',
      icon: 'auto_fix_high',
      color: '#3b82f6',
      description: 'Format or modify data using AI or scripts.',
      defaultData: { script: '' },
      endpoints: { source: 1, target: 1 }
    },
    'end': {
      subType: 'end',
      type: 'action',
      label: 'End Workflow',
      icon: 'stop',
      color: '#ef4444',
      description: 'Successfully terminates the workflow.',
      defaultData: {},
      endpoints: { source: 0, target: 1 }
    }
  };

  getEntry(subType: string): NodeRegistryEntry {
    return this.REGISTRY[subType];
  }

  getEntriesByType(type: WorkflowNodeType): NodeRegistryEntry[] {
    return Object.values(this.REGISTRY).filter(e => e.type === type);
  }
}
