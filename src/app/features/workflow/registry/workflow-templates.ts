import { Workflow, WorkflowNode, WorkflowEdge } from '../models/workflow.model';

export const WORKFLOW_TEMPLATES: Record<string, Partial<Workflow>> = {
  'lead-enrichment': {
    name: 'Lead Enrichment Flow',
    nodes: [
      {
        id: 'node_trigger',
        type: 'trigger',
        subType: 'webhook',
        label: 'Lead Received',
        position: { x: 100, y: 200 },
        data: { path: '/new-lead', method: 'POST' },
        status: 'idle'
      },
      {
        id: 'node_enrich',
        type: 'action',
        subType: 'api-request',
        label: 'Enrich Data (Clearbit)',
        position: { x: 400, y: 200 },
        data: { url: 'https://api.clearbit.com/v2/combined', method: 'GET' },
        status: 'idle'
      },
      {
        id: 'node_save',
        type: 'action',
        subType: 'save-data',
        label: 'Store Lead',
        position: { x: 700, y: 200 },
        data: { table: 'users' },
        status: 'idle'
      }
    ],
    edges: [
      { id: 'edge_1', source: 'node_trigger', target: 'node_enrich', type: 'default' },
      { id: 'edge_2', source: 'node_enrich', target: 'node_save', type: 'default' }
    ]
  },
  'automated-alerts': {
    name: 'Daily System Health',
    nodes: [
      {
        id: 'node_sched',
        type: 'trigger',
        subType: 'schedule',
        label: 'Daily Check',
        position: { x: 100, y: 150 },
        data: { cron: '0 9 * * *' },
        status: 'idle'
      },
      {
        id: 'node_check',
        type: 'action',
        subType: 'api-request',
        label: 'Health Check',
        position: { x: 400, y: 150 },
        data: { url: 'https://api.myapp.com/health', method: 'GET' },
        status: 'idle'
      },
      {
        id: 'node_notify',
        type: 'action',
        subType: 'send-notification',
        label: 'Alert Team',
        position: { x: 700, y: 150 },
        data: { channel: 'slack', message: 'System health check complete.' },
        status: 'idle'
      }
    ],
    edges: [
      { id: 'edge_1', source: 'node_sched', target: 'node_check', type: 'default' },
      { id: 'edge_2', source: 'node_check', target: 'node_notify', type: 'default' }
    ]
  },
  'leave-approval': {
    name: 'Employee Leave Approval',
    nodes: [
      {
        id: 'trigger_submit',
        type: 'trigger',
        subType: 'webhook',
        label: 'Form Submitted',
        position: { x: 50, y: 200 },
        data: { path: '/leave-request' },
        status: 'idle'
      },
      {
        id: 'logic_check_days',
        type: 'logic',
        subType: 'condition',
        label: 'Is Leave > 5 Days?',
        position: { x: 300, y: 200 },
        data: { variable: 'totalDays', operator: 'gt', value: 5 },
        status: 'idle'
      },
      {
        id: 'action_hr_approval',
        type: 'logic',
        subType: 'approval',
        label: 'HR Approval',
        position: { x: 550, y: 100 },
        data: { role: 'HR' },
        status: 'idle'
      },
      {
        id: 'action_mgr_approval',
        type: 'logic',
        subType: 'approval',
        label: 'Manager Approval',
        position: { x: 550, y: 300 },
        data: { role: 'Manager' },
        status: 'idle'
      },
      {
        id: 'action_notify',
        type: 'action',
        subType: 'send-notification',
        label: 'Notify Employee',
        position: { x: 850, y: 200 },
        data: { channel: 'email', message: 'Your leave status has been updated.' },
        status: 'idle'
      }
    ],
    edges: [
      { id: 'e1', source: 'trigger_submit', target: 'logic_check_days' },
      { id: 'e2', source: 'logic_check_days', target: 'action_hr_approval', targetAnchor: 'true' },
      { id: 'e3', source: 'logic_check_days', target: 'action_mgr_approval', targetAnchor: 'false' },
      { id: 'e4', source: 'action_hr_approval', target: 'action_notify' },
      { id: 'e5', source: 'action_mgr_approval', target: 'action_notify' }
    ]
  }
};
