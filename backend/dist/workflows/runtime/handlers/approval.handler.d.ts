import { NodeHandler, NodeResult, ExecutionContext } from '../node-handler.interface';
import { PrismaService } from '../../../prisma/prisma.service';
export declare class ApprovalHandler implements NodeHandler {
    private prisma;
    constructor(prisma: PrismaService);
    execute(node: any, context: ExecutionContext): Promise<NodeResult>;
}
