import { Injectable } from '@nestjs/common';
import { NodeHandler, NodeResult, ExecutionContext } from '../node-handler.interface';

@Injectable()
export class ScheduleHandler implements NodeHandler {
  async execute(node: any, context: ExecutionContext): Promise<NodeResult> {
    const delay = node.data.delayMs || 0;
    
    // If we've already waited, continue
    if (context.variables[`__waited_${node.id}`]) {
      return {
        status: 'success',
        nextPath: 'next',
        output: {
          [`__waited_${node.id}`]: false // Reset
        }
      };
    }

    // Otherwise, request a retry with the specified delay
    return {
      status: 'retry',
      retryDelay: delay,
      output: {
        [`__waited_${node.id}`]: true
      }
    };
  }
}
