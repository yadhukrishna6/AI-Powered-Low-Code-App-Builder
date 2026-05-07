import { Injectable } from '@nestjs/common';
import { NodeHandler, NodeResult, ExecutionContext } from '../node-handler.interface';

@Injectable()
export class ConditionHandler implements NodeHandler {
  async execute(node: any, context: ExecutionContext): Promise<NodeResult> {
    const { field, operator, value } = node.data || {};
    
    // Get actual value from context
    const actualValue = context.variables[field];
    
    let isTrue = false;
    switch (operator) {
      case '==': isTrue = actualValue == value; break;
      case '>': isTrue = Number(actualValue) > Number(value); break;
      case '<': isTrue = Number(actualValue) < Number(value); break;
      case 'contains': isTrue = String(actualValue).includes(String(value)); break;
      default: isTrue = false;
    }

    return {
      status: 'success',
      nextPath: isTrue ? 'true' : 'false',
      output: { conditionResult: isTrue }
    };
  }
}
