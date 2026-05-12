import { Injectable } from '@nestjs/common';

@Injectable()
export class ExpressionResolverService {
  resolve(target: any, context: any): any {
    if (!target) return target;

    if (typeof target === 'string') {
      return this.resolveString(target, context);
    }

    if (Array.isArray(target)) {
      return target.map(item => this.resolve(item, context));
    }

    if (typeof target === 'object') {
      const result = {};
      for (const key in target) {
        result[key] = this.resolve(target[key], context);
      }
      return result;
    }

    return target;
  }

  private resolveString(str: string, context: any): any {
    // Check if it's a pure expression: "{{ ... }}"
    const pureMatch = str.match(/^{{ (.*) }}$/);
    if (pureMatch) {
      return this.evaluateExpression(pureMatch[1], context);
    }

    // Otherwise, it's a string with embedded expressions
    return str.replace(/{{ (.*?) }}/g, (match, expression) => {
      const value = this.evaluateExpression(expression, context);
      return value !== undefined ? String(value) : '';
    });
  }

  private evaluateExpression(expression: string, context: any): any {
    try {
      // Create a safe execution sandbox
      // n8n style syntax: $json, $node, $vars
      const sandbox = {
        $json: context.lastOutput || {},
        $vars: context.variables || {},
        $node: (name: string) => context.nodeOutputs?.[name] || {},
        ...context.variables, // Also allow direct variable access
      };

      // Simple property access resolution: "$json.email" -> sandbox.$json.email
      // For a real n8n feel, we'd use a real JS evaluator like 'vm2' or a parser
      // Here we implement a basic recursive resolver
      
      const parts = expression.split('.');
      let current = sandbox;
      
      for (const part of parts) {
        if (current === undefined || current === null) return undefined;
        
        // Handle function calls like $node("HTTP")
        const funcMatch = part.match(/(\$\w+)\("([^"]+)"\)/);
        if (funcMatch) {
          const funcName = funcMatch[1];
          const arg = funcMatch[2];
          if (typeof sandbox[funcName] === 'function') {
            current = sandbox[funcName](arg);
          } else {
            return undefined;
          }
        } else {
          current = current[part];
        }
      }
      
      return current;
    } catch (e) {
      console.error('Expression evaluation failed:', expression, e);
      return undefined;
    }
  }
}
