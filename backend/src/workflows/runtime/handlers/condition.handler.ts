import { Injectable } from '@nestjs/common';
import { NodeHandler, NodeResult, ExecutionContext } from '../node-handler.interface';

@Injectable()
export class ConditionHandler implements NodeHandler {
  async execute(node: any, context: ExecutionContext): Promise<NodeResult> {
    const { conditions, matchType, field, operator, value } = node.data || {};
    
    // Convert single condition to array for uniform processing if needed
    const rules = conditions || (field ? [{ field, operator, value }] : []);

    if (rules.length === 0) {
      throw new Error('No conditions defined for evaluation');
    }

    const results = rules.map((rule: any) => {
      const { field: f, operator: op, value: v } = rule;
      
      // Parse template if field is wrapped in {{ }}
      let fieldKey = f;
      if (f && f.startsWith('{{') && f.endsWith('}}')) {
        fieldKey = f.slice(2, -2).trim();
      }
      
      const actualValue = context.variables[fieldKey];
      if (actualValue === undefined) return false;

      switch (op) {
        case '==': return actualValue == v;
        case '!=': return actualValue != v;
        case '>': return Number(actualValue) > Number(v);
        case '<': return Number(actualValue) < Number(v);
        case 'contains': return String(actualValue).includes(String(v));
        default: return false;
      }
    });

    let isTrue = false;
    if (matchType === 'OR') {
      isTrue = results.some(r => r === true);
    } else {
      // Default is AND
      isTrue = results.every(r => r === true);
    }

    return {
      status: 'success',
      nextPath: isTrue ? 'true' : 'false',
      output: { conditionResult: isTrue }
    };
  }
}
