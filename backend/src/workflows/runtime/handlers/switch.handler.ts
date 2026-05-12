import { Injectable } from '@nestjs/common';
import { NodeHandler, NodeResult, ExecutionContext } from '../node-handler.interface';

@Injectable()
export class SwitchHandler implements NodeHandler {
  async execute(node: any, context: ExecutionContext): Promise<NodeResult> {
    const { variable, cases, defaultPath } = node.data;
    
    // Resolve variable from context
    const value = this.resolveVariable(variable, context.variables);
    
    // Find matching case
    const match = cases.find((c: any) => c.value === value);
    
    if (match) {
      return {
        status: 'success',
        nextPath: match.pathId || match.id,
      };
    }

    return {
      status: 'success',
      nextPath: defaultPath || 'default',
    };
  }

  private resolveVariable(path: string, variables: any): any {
    if (!path) return undefined;
    return path.split('.').reduce((obj, key) => obj?.[key], variables);
  }
}
