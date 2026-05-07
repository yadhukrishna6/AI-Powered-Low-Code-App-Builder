import { Injectable } from '@nestjs/common';
import { NodeHandler, NodeResult, ExecutionContext } from '../node-handler.interface';

@Injectable()
export class TransformHandler implements NodeHandler {
  async execute(node: any, context: ExecutionContext): Promise<NodeResult> {
    const { transformType, script } = node.data || {};
    
    if (transformType === 'script') {
      try {
        // Warning: Using eval or Function is dangerous in production
        // In a real system, use an isolated VM like 'vm2'
        const fn = new Function('input', 'context', script);
        const result = fn(context.variables, context);
        return { status: 'success', output: result };
      } catch (error) {
        return { status: 'failed', error: `Script error: ${error.message}` };
      }
    }

    return { status: 'success', output: { transformed: true } };
  }
}
