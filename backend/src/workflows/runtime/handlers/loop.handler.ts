import { Injectable } from '@nestjs/common';
import { NodeHandler, NodeResult, ExecutionContext } from '../node-handler.interface';

@Injectable()
export class LoopHandler implements NodeHandler {
  async execute(node: any, context: ExecutionContext): Promise<NodeResult> {
    const { collectionKey, iteratorName } = node.data;
    
    // Resolve collection from variables
    const collection = collectionKey.split('.').reduce((obj, key) => obj?.[key], context.variables);
    
    if (!Array.isArray(collection)) {
      return { 
        status: 'failed', 
        error: `Variable ${collectionKey} is not an array` 
      };
    }

    // Use a unique key for this loop instance to track progress
    const indexKey = `__loop_${node.id}_index`;
    const currentIndex = context.variables[indexKey] || 0;

    if (currentIndex >= collection.length) {
      // Loop finished
      return {
        status: 'success',
        nextPath: 'done',
        output: {
          [indexKey]: 0, // Reset for potential re-entry
        }
      };
    }

    const currentItem = collection[currentIndex];

    return {
      status: 'success',
      nextPath: 'next',
      output: {
        [iteratorName || 'item']: currentItem,
        [indexKey]: currentIndex + 1,
      }
    };
  }
}
