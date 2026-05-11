import { Injectable } from '@nestjs/common';
import { NodeHandler, NodeResult, ExecutionContext } from '../node-handler.interface';

@Injectable()
export class ApprovalHandler implements NodeHandler {
  async execute(node: any, context: ExecutionContext): Promise<NodeResult> {
    const { approverRole, timeout } = node.data || {};

    // Check if we are resuming from a user action
    const resumeAction = context.variables?.resumeAction;

    if (resumeAction === 'approve') {
      return {
        status: 'success',
        nextPath: 'approved',
        output: { approvalStatus: 'approved', approvedBy: 'manual-ui' }
      };
    }

    if (resumeAction === 'reject') {
      return {
        status: 'success',
        nextPath: 'rejected',
        output: { approvalStatus: 'rejected', rejectedBy: 'manual-ui' }
      };
    }

    // Default: Pause and wait for user input
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