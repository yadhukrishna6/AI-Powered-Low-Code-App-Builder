import { Injectable, Logger } from '@nestjs/common';
import { NodeHandler, NodeResult, ExecutionContext } from '../node-handler.interface';

@Injectable()
export class NotificationHandler implements NodeHandler {
  private readonly logger = new Logger(NotificationHandler.name);

  async execute(node: any, context: ExecutionContext): Promise<NodeResult> {
    const { channel, message, recipients } = node.data || {};
    
    this.logger.log(`Sending ${channel} notification to ${recipients}: ${message}`);
    
    // Simulate notification sending
    return {
      status: 'success',
      output: { notificationSent: true, timestamp: new Date().toISOString() }
    };
  }
}
