import { Type } from '@angular/core';
import { WorkflowNodeType } from '../models/workflow.model';

export interface NodeRegistryEntry {
  subType: string;
  type: WorkflowNodeType;
  label: string;
  icon: string;
  color: string;
  description: string;
  defaultData: any;
  // component?: Type<any>; // Future: specialized renderer
}

export const NODE_REGISTRY: Record<string, NodeRegistryEntry> = {
  // TRIGGERS
  'start': {
    subType: 'start',
    type: 'trigger',
    label: 'Start Trigger',
    icon: 'play_arrow',
    color: '#10b981', // Emerald
    description: 'Entry point for the workflow',
    defaultData: {}
  },
  'form-submitted': {
    subType: 'form-submitted',
    type: 'trigger',
    label: 'Form Submitted',
    icon: 'assignment',
    color: '#10b981',
    description: 'Triggers when a specific form is submitted',
    defaultData: { formId: '' }
  },
  'schedule': {
    subType: 'schedule',
    type: 'trigger',
    label: 'Schedule',
    icon: 'schedule',
    color: '#10b981',
    description: 'Run workflow on a recurring schedule',
    defaultData: { cron: '0 0 * * *' }
  },

  // LOGIC
  'condition': {
    subType: 'condition',
    type: 'logic',
    label: 'Condition',
    icon: 'call_split',
    color: '#f59e0b', // Amber
    description: 'Branch the workflow based on variables',
    defaultData: { conditions: [] }
  },
  'delay': {
    subType: 'delay',
    type: 'logic',
    label: 'Delay',
    icon: 'timer',
    color: '#f59e0b',
    description: 'Wait for a specific duration',
    defaultData: { duration: 60, unit: 'seconds' }
  },

  // ACTIONS
  'approval': {
    subType: 'approval',
    type: 'action',
    label: 'Approval',
    icon: 'how_to_reg',
    color: '#3b82f6', // Blue
    description: 'Request manual approval from a user',
    defaultData: { approverRole: 'admin', timeout: 24 }
  },
  'send-notification': {
    subType: 'send-notification',
    type: 'action',
    label: 'Notification',
    icon: 'notifications',
    color: '#3b82f6',
    description: 'Send an email or push notification',
    defaultData: { channel: 'email', message: '' }
  },
  'api-request': {
    subType: 'api-request',
    type: 'action',
    label: 'API Request',
    icon: 'http',
    color: '#3b82f6',
    description: 'Make an external HTTP request',
    defaultData: { method: 'GET', url: '', headers: {}, body: '' }
  },
  'end': {
    subType: 'end',
    type: 'action',
    label: 'End Workflow',
    icon: 'stop',
    color: '#ef4444', // Red
    description: 'Terminates the workflow execution',
    defaultData: {}
  }
};

export const NODE_GROUPS = [
  { id: 'trigger', label: 'Triggers', color: '#10b981' },
  { id: 'logic', label: 'Logic', color: '#f59e0b' },
  { id: 'action', label: 'Actions', color: '#3b82f6' }
];
