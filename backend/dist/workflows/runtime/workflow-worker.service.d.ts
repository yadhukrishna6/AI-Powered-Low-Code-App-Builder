import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../../prisma/prisma.service';
import { WorkflowRuntimeService } from './workflow-runtime.service';
import { WorkflowOrchestrator } from './workflow-orchestrator.service';
import { WorkflowGateway } from './workflow.gateway';
import { ExpressionResolverService } from './expression-resolver.service';
export declare class WorkflowWorker extends WorkerHost {
    private prisma;
    private runtime;
    private orchestrator;
    private gateway;
    private expressionResolver;
    private readonly logger;
    constructor(prisma: PrismaService, runtime: WorkflowRuntimeService, orchestrator: WorkflowOrchestrator, gateway: WorkflowGateway, expressionResolver: ExpressionResolverService);
    process(job: Job<any, any, string>): Promise<any>;
}
