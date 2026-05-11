import { Injectable } from '@nestjs/common';
import { NodeHandler, NodeResult, ExecutionContext } from '../node-handler.interface';

@Injectable()
export class ConditionHandler implements NodeHandler {
  async execute(node: any, context: ExecutionContext): Promise<NodeResult> {
    const { field, operator, value } = node.data || {};
    
    if (!field?.trim()) {
      throw new Error('Field is required for condition evaluation');
    }
    
    if (!operator) {
      throw new Error('Operator is required for condition evaluation');
    }
    
    if (value === undefined || value === '') {
      throw new Error('Value is required for condition evaluation');
    }
    
    // Parse template if field is wrapped in {{ }}
    let fieldKey = field;
    if (field && field.startsWith('{{') && field.endsWith('}}')) {
      fieldKey = field.slice(2, -2).trim();
    }
    
    // Get actual value from context
    const actualValue = context.variables[fieldKey];
    
    if (actualValue === undefined) {
      throw new Error(`Field '${fieldKey}' not found in workflow context`);
    }
    
    let isTrue = false;
    switch (operator) {
      case '==': isTrue = actualValue == value; break;
      case '!=': isTrue = actualValue != value; break;
      case '>': isTrue = Number(actualValue) > Number(value); break;
      case '<': isTrue = Number(actualValue) < Number(value); break;
      case 'contains': isTrue = String(actualValue).includes(String(value)); break;
      default: throw new Error(`Unknown operator: ${operator}`);
    }

    return {
      status: 'success',
      nextPath: isTrue ? 'true' : 'false',
      output: { conditionResult: isTrue }
    };
  }
}
