import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'monitoring',
})
export class WorkflowGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(WorkflowGateway.name);

  handleConnection(client: any) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: any) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  sendNodeExecutionUpdate(executionId: string, nodeId: string, status: string, output?: any) {
    this.server.emit(`execution:${executionId}:node`, {
      nodeId,
      status,
      output,
      timestamp: new Date(),
    });
  }

  sendExecutionStatusUpdate(executionId: string, status: string) {
    this.server.emit(`execution:${executionId}:status`, {
      status,
      timestamp: new Date(),
    });
  }
}
