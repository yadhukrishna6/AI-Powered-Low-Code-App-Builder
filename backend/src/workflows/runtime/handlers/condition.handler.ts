import { Injectable } from '@nestjs/common';
import { NodeHandler, NodeResult, ExecutionContext } from '../node-handler.interface';

@Injectable()
export class ConditionHandler implements NodeHandler {
  async execute(node: any, context: ExecutionContext): Promise<NodeResult> {
    const { conditions, matchType } = node.data;
    
    if (!conditions || !Array.isArray(conditions) || conditions.length === 0) {
      return { status: 'success', nextPath: 'true' };
    }

    const results = conditions.map(cond => {
      const actualValue = this.resolveValue(cond.field, context.variables);
      const expectedValue = cond.value;
      
      switch (cond.operator) {
        case '==': return actualValue == expectedValue;
        case '!=': return actualValue != expectedValue;
        case '>': return Number(actualValue) > Number(expectedValue);
        case '<': return Number(actualValue) < Number(expectedValue);
        case 'contains': return String(actualValue).includes(String(expectedValue));
        default: return false;
      }
    });

    const isMatch = matchType === 'OR' 
      ? results.some(r => r) 
      : results.every(r => r);

    return {
      status: 'success',
      nextPath: isMatch ? 'true' : 'false'
    };
  }

  private resolveValue(path: string, variables: any): any {
    if (!path) return undefined;
    return path.split('.').reduce((obj, key) => obj?.[key], variables);
  }
}
