import { NodeHandler, NodeResult, ExecutionContext } from '../node-handler.interface';
export declare class SwitchHandler implements NodeHandler {
    execute(node: any, context: ExecutionContext): Promise<NodeResult>;
    private resolveVariable;
}
