import { Type } from '@angular/core';
import { WorkflowNodeType } from '../models/workflow.model';

export interface NodeProperty {
  key: string;
  label: string;
  type: 'text' | 'select' | 'textarea' | 'number' | 'cron' | 'variable-picker' | 'switch-cases' | 'form-picker';
  options?: any[];
  placeholder?: string;
  helpText?: string;
}

export interface NodeRegistryEntry {
  subType: string;
  type: WorkflowNodeType;
  label: string;
  icon: string;
  color: string;
  description: string;
  defaultData: any;
  properties?: NodeProperty[];
}

export const NODE_REGISTRY: Record<string, NodeRegistryEntry> = {
  // TRIGGERS
  'start': {
    subType: 'start',
    type: 'trigger',
    label: 'Start Trigger',
    icon: 'play_arrow',
    color: '#10b981',
    description: 'Manual entry point for the workflow',
    defaultData: { workflowName: '', autoStart: true },
    properties: [
      { key: 'workflowName', label: 'Workflow Name', type: 'text' },
      { key: 'description', label: 'Description', type: 'textarea' }
    ]
  },
  'webhook': {
    subType: 'webhook',
    type: 'trigger',
    label: 'Webhook',
    icon: 'api',
    color: '#10b981',
    description: 'Trigger flow via HTTP POST request',
    defaultData: { method: 'POST', authType: 'none' },
    properties: [
      { key: 'webhookUrl', label: 'Webhook URL', type: 'text', placeholder: 'Generated after save', helpText: 'Send POST requests to this URL' },
      { key: 'method', label: 'Method', type: 'select', options: ['POST', 'GET'] },
      { key: 'authType', label: 'Auth Type', type: 'select', options: ['none', 'apiKey', 'bearer'] }
    ]
  },
  'form-submitted': {
    subType: 'form-submitted',
    type: 'trigger',
    label: 'Form Submitted',
    icon: 'assignment',
    color: '#10b981',
    description: 'Triggers when a specific form is submitted',
    defaultData: { formId: '' },
    properties: [
      { key: 'formId', label: 'Select Form', type: 'form-picker' }
    ]
  },
  'schedule': {
    subType: 'schedule',
    type: 'trigger',
    label: 'Schedule',
    icon: 'schedule',
    color: '#10b981',
    description: 'Run workflow on a recurring schedule',
    defaultData: { cron: '0 0 * * *' },
    properties: [
      { key: 'cron', label: 'Cron Expression', type: 'cron', placeholder: '0 0 * * *' },
      { key: 'timezone', label: 'Timezone', type: 'select', options: ['UTC', 'EST', 'PST'] }
    ]
  },

  // LOGIC
  'condition': {
    subType: 'condition',
    type: 'logic',
    label: 'Condition',
    icon: 'call_split',
    color: '#f59e0b',
    description: 'Branch the workflow based on variables',
    defaultData: { field: '', operator: '==', value: '' },
    properties: [
      { key: 'field', label: 'Field to Check', type: 'variable-picker' },
      { key: 'operator', label: 'Operator', type: 'select', options: ['==', '!=', '>', '<', 'contains'] },
      { key: 'value', label: 'Value', type: 'text' }
    ]
  },
  'switch': {
    subType: 'switch',
    type: 'logic',
    label: 'Switch',
    icon: 'alt_route',
    color: '#f59e0b',
    description: 'Route flow based on multiple cases',
    defaultData: { variable: '', cases: [] },
    properties: [
      { key: 'variable', label: 'Input Variable', type: 'variable-picker' },
      { key: 'cases', label: 'Path Cases', type: 'switch-cases' }
    ]
  },
  'loop': {
    subType: 'loop',
    type: 'logic',
    label: 'Loop',
    icon: 'reiterate',
    color: '#f59e0b',
    description: 'Iterate over a collection of items',
    defaultData: { sourceArray: '', concurrency: 1 },
    properties: [
      { key: 'sourceArray', label: 'Source Array', type: 'variable-picker' },
      { key: 'concurrency', label: 'Concurrency', type: 'number' }
    ]
  },
  'delay': {
    subType: 'delay',
    type: 'logic',
    label: 'Delay',
    icon: 'timer',
    color: '#f59e0b',
    description: 'Wait for a specific duration',
    defaultData: { duration: 60, unit: 'seconds' },
    properties: [
      { key: 'duration', label: 'Duration', type: 'number' },
      { key: 'unit', label: 'Unit', type: 'select', options: ['seconds', 'minutes', 'hours', 'days'] }
    ]
  },

  // ACTIONS
  'approval': {
    subType: 'approval',
    type: 'action',
    label: 'Approval',
    icon: 'how_to_reg',
    color: '#3b82f6',
    description: 'Request manual approval from a user',
    defaultData: { approverRole: 'admin', timeout: 24 },
    properties: [
      { key: 'approverRole', label: 'Approver Role', type: 'select', options: ['admin', 'manager', 'hr'] },
      { key: 'timeout', label: 'Timeout (hours)', type: 'number' }
    ]
  },
  'send-notification': {
    subType: 'send-notification',
    type: 'action',
    label: 'Notification',
    icon: 'notifications',
    color: '#3b82f6',
    description: 'Send an email or push notification',
    defaultData: { channel: 'email', message: '' },
    properties: [
      { key: 'channel', label: 'Channel', type: 'select', options: ['email', 'slack', 'push'] },
      { key: 'recipients', label: 'Recipients', type: 'text' },
      { key: 'message', label: 'Message Body', type: 'textarea' }
    ]
  },
  'api-request': {
    subType: 'api-request',
    type: 'action',
    label: 'API Request',
    icon: 'http',
    color: '#3b82f6',
    description: 'Make an external HTTP request',
    defaultData: { method: 'GET', url: '', headers: {}, body: '' },
    properties: [
      { key: 'method', label: 'Method', type: 'select', options: ['GET', 'POST', 'PUT', 'DELETE'] },
      { key: 'url', label: 'URL', type: 'text' },
      { key: 'body', label: 'JSON Body', type: 'textarea' }
    ]
  },
  'save-data': {
    subType: 'save-data',
    type: 'action',
    label: 'Save Data',
    icon: 'save',
    color: '#3b82f6',
    description: 'Persist data to the database',
    defaultData: { table: '', operation: 'insert' },
    properties: [
      { key: 'table', label: 'Target Table', type: 'select', options: ['submissions', 'users', 'logs'] },
      { key: 'operation', label: 'Operation', type: 'select', options: ['insert', 'update', 'upsert'] }
    ]
  },
  'transform': {
    subType: 'transform',
    type: 'action',
    label: 'Transform',
    icon: 'auto_fix_high',
    color: '#a855f7', // Purple
    description: 'Transform data using scripts or AI',
    defaultData: { transformType: 'script', script: '' },
    properties: [
      { key: 'transformType', label: 'Type', type: 'select', options: ['script', 'ai-prompt'] },
      { key: 'script', label: 'JavaScript', type: 'textarea' }
    ]
  },
  'end': {
    subType: 'end',
    type: 'action',
    label: 'End Workflow',
    icon: 'stop',
    color: '#ef4444',
    description: 'Terminates the workflow execution',
    defaultData: { status: 'success' },
    properties: [
      { key: 'status', label: 'Final Status', type: 'select', options: ['success', 'failed'] },
      { key: 'message', label: 'Output Message', type: 'text' }
    ]
  }
};

export const NODE_GROUPS = [
  { id: 'trigger', label: 'Triggers', color: '#10b981' },
  { id: 'logic', label: 'Logic', color: '#f59e0b' },
  { id: 'action', label: 'Actions', color: '#3b82f6' }
];
