import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server } from 'socket.io';
export declare class WorkflowGateway implements OnGatewayConnection, OnGatewayDisconnect {
    server: Server;
    private readonly logger;
    handleConnection(client: any): void;
    handleDisconnect(client: any): void;
    sendNodeExecutionUpdate(executionId: string, nodeId: string, status: string, output?: any): void;
    sendExecutionStatusUpdate(executionId: string, status: string): void;
}
