import { Injectable } from '@nestjs/common';
import { NodeHandler, NodeResult, ExecutionContext } from '../node-handler.interface';

@Injectable()
export class ApiRequestHandler implements NodeHandler {
  async execute(node: any, context: ExecutionContext): Promise<NodeResult> {
    const { method, url, body, headers } = node.data || {};
    
    if (!url) {
      return { status: 'failed', error: 'URL is required' };
    }

    try {
      const response = await fetch(url, {
        method: method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: method !== 'GET' ? JSON.stringify(body) : undefined,
      });

      const data = await response.json();

      return {
        status: response.ok ? 'success' : 'failed',
        output: { apiResponse: data },
        error: response.ok ? undefined : `API returned ${response.status}`,
      };
    } catch (error) {
      return {
        status: 'failed',
        error: `Fetch failed: ${error.message}`,
      };
    }
  }
}
