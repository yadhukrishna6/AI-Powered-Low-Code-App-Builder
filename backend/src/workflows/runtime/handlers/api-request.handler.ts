import { Injectable } from '@nestjs/common';
import { NodeHandler, NodeResult, ExecutionContext } from '../node-handler.interface';
import axios from 'axios';

@Injectable()
export class ApiRequestHandler implements NodeHandler {
  async execute(node: any, context: ExecutionContext): Promise<NodeResult> {
    const { method, url, headers, body, retryConfig } = node.data;
    
    // Simple interpolation for URL and body
    const resolvedUrl = this.interpolate(url, context.variables);
    const resolvedBody = typeof body === 'string' ? this.interpolate(body, context.variables) : body;

    try {
      const response = await axios({
        method: method || 'GET',
        url: resolvedUrl,
        headers: headers || {},
        data: resolvedBody,
        timeout: node.data.timeout || 10000,
      });

      return {
        status: 'success',
        output: {
          response: response.data,
          status: response.status,
        },
        nextPath: 'success',
      };
    } catch (error) {
      const retryCount = context.variables[`__retry_${node.id}`] || 0;
      const maxRetries = retryConfig?.maxRetries || 3;

      if (retryCount < maxRetries) {
        return {
          status: 'retry',
          output: {
            [`__retry_${node.id}`]: retryCount + 1,
          },
          retryDelay: retryConfig?.delay || 2000,
        };
      }

      return {
        status: 'failed',
        error: error.message,
        nextPath: 'failure',
        output: {
          error: error.message,
          [`__retry_${node.id}`]: 0, // Reset
        }
      };
    }
  }

  private interpolate(str: string, variables: any): string {
    if (!str) return '';
    return str.replace(/\{\{(.+?)\}\}/g, (_, path) => {
      return path.split('.').reduce((obj, key) => obj?.[key.trim()], variables) || '';
    });
  }
}
