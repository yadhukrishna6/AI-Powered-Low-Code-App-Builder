import { Injectable } from '@nestjs/common';
import { NodeHandler, NodeResult, ExecutionContext } from '../node-handler.interface';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class ApprovalHandler implements NodeHandler {
  constructor(private prisma: PrismaService) {}

  async execute(node: any, context: ExecutionContext): Promise<NodeResult> {
    // Check if we are resuming from a previous wait
    const lastLog = await this.prisma.workflowLog.findFirst({
      where: { 
        executionId: context.executionId,
        nodeId: node.id,
        status: 'waiting'
      },
      orderBy: { timestamp: 'desc' }
    });

    // If there's an action in the context (passed during resume), use it
    if (context.variables.__resume_action) {
      const action = context.variables.__resume_action;
      
      // Clear the resume action from context to avoid loops
      delete context.variables.__resume_action;
      
      return {
        status: 'success',
        nextPath: action === 'approve' ? 'approved' : 'rejected',
        output: {
          lastApprovalStatus: action,
          approvedBy: context.variables.__resume_user || 'system'
        }
      };
    }

    // Otherwise, create an approval task and wait
    await this.prisma.approvalTask.create({
      data: {
        executionId: context.executionId,
        nodeId: node.id,
        approverRole: node.data.approverRole || 'admin',
        status: 'pending'
      }
    });

    return {
      status: 'waiting'
    };
  }
}