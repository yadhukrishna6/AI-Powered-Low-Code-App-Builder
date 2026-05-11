import { Injectable } from '@nestjs/common';
import { NodeHandler, NodeResult, ExecutionContext } from '../node-handler.interface';

@Injectable()
export class ApprovalHandler implements NodeHandler {
  async execute(node: any, context: ExecutionContext): Promise<NodeResult> {
    const { approverRole, timeout } = node.data || {};

    // For now, simulate approval by returning 'waiting' status
    // In a real implementation, this would trigger an approval workflow
    // and wait for user input via the UI

    return {
      status: 'waiting',
      output: {
        approvalRequested: true,
        approverRole,
        timeout: timeout || 24, // hours
        message: `Approval requested from ${approverRole} role`
      }
    };
  }
}