import { NodeHandler, NodeResult, ExecutionContext } from '../node-handler.interface';
export declare class ScheduleHandler implements NodeHandler {
    execute(node: any, context: ExecutionContext): Promise<NodeResult>;
}
