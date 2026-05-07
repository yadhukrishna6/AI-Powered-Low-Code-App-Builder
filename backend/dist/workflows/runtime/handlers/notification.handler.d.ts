import { NodeHandler, NodeResult, ExecutionContext } from '../node-handler.interface';
export declare class NotificationHandler implements NodeHandler {
    private readonly logger;
    execute(node: any, context: ExecutionContext): Promise<NodeResult>;
}
