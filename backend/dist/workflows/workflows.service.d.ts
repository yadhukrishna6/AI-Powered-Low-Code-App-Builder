import { PrismaService } from '../prisma/prisma.service';
import { WorkflowRuntimeService } from './runtime/workflow-runtime.service';
import { WorkflowOrchestrator } from './runtime/workflow-orchestrator.service';
import { ExpressionResolverService } from './runtime/expression-resolver.service';
export declare class WorkflowsService {
    private prisma;
    private runtime;
    private orchestrator;
    private expressionResolver;
    constructor(prisma: PrismaService, runtime: WorkflowRuntimeService, orchestrator: WorkflowOrchestrator, expressionResolver: ExpressionResolverService);
    testNode(node: any, context: any): Promise<import("./runtime/node-handler.interface").NodeResult>;
    create(data: any): Promise<{
        name: string;
        projectId: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        status: string;
        draftGraph: import("@prisma/client/runtime/library").JsonValue | null;
        activeVersionId: string | null;
    }>;
    findAll(projectId?: string): Promise<{
        name: string;
        projectId: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        status: string;
        draftGraph: import("@prisma/client/runtime/library").JsonValue | null;
        activeVersionId: string | null;
    }[]>;
    findOne(id: string): Promise<{
        executions: {
            id: string;
            result: import("@prisma/client/runtime/library").JsonValue | null;
            status: string;
            workflowId: string;
            versionId: string | null;
            triggerSource: string | null;
            context: import("@prisma/client/runtime/library").JsonValue;
            startTime: Date;
            endTime: Date | null;
        }[];
        versions: {
            id: string;
            createdAt: Date;
            workflowId: string;
            version: number;
            graph: import("@prisma/client/runtime/library").JsonValue;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
        }[];
    } & {
        name: string;
        projectId: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        status: string;
        draftGraph: import("@prisma/client/runtime/library").JsonValue | null;
        activeVersionId: string | null;
    }>;
    update(id: string, data: any): Promise<{
        name: string;
        projectId: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        status: string;
        draftGraph: import("@prisma/client/runtime/library").JsonValue | null;
        activeVersionId: string | null;
    }>;
    publish(id: string, metadata?: any): Promise<{
        id: string;
        createdAt: Date;
        workflowId: string;
        version: number;
        graph: import("@prisma/client/runtime/library").JsonValue;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    remove(id: string): Promise<{
        name: string;
        projectId: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        status: string;
        draftGraph: import("@prisma/client/runtime/library").JsonValue | null;
        activeVersionId: string | null;
    }>;
    createExecution(workflowId: string, triggerSource: string, context: any): Promise<{
        id: string;
        result: import("@prisma/client/runtime/library").JsonValue | null;
        status: string;
        workflowId: string;
        versionId: string | null;
        triggerSource: string | null;
        context: import("@prisma/client/runtime/library").JsonValue;
        startTime: Date;
        endTime: Date | null;
    }>;
    getExecution(executionId: string): Promise<({
        version: {
            graph: import("@prisma/client/runtime/library").JsonValue;
        } | null;
        logs: {
            error: string | null;
            id: string;
            status: string;
            nodeId: string;
            nodeType: string;
            input: import("@prisma/client/runtime/library").JsonValue | null;
            output: import("@prisma/client/runtime/library").JsonValue | null;
            timestamp: Date;
            executionId: string;
        }[];
    } & {
        id: string;
        result: import("@prisma/client/runtime/library").JsonValue | null;
        status: string;
        workflowId: string;
        versionId: string | null;
        triggerSource: string | null;
        context: import("@prisma/client/runtime/library").JsonValue;
        startTime: Date;
        endTime: Date | null;
    }) | null>;
    resumeExecution(executionId: string, action: 'approve' | 'reject'): Promise<{
        message: string;
    }>;
}
