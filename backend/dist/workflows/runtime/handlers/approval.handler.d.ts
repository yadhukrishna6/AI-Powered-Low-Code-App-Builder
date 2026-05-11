import { NodeHandler, NodeResult, ExecutionContext } from '../node-handler.interface';
export declare class ApprovalHandler implements NodeHandler {
    execute(node: any, context: ExecutionContext): Promise<NodeResult>;
}
