import { WorkflowsService } from './workflows.service';
import { AIWorkflowService } from './ai-workflow.service';
export declare class WorkflowsController {
    private readonly workflowsService;
    private readonly aiWorkflowService;
    constructor(workflowsService: WorkflowsService, aiWorkflowService: AIWorkflowService);
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
    publish(id: string, metadata: any): Promise<{
        id: string;
        createdAt: Date;
        workflowId: string;
        version: number;
        graph: import("@prisma/client/runtime/library").JsonValue;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    execute(id: string, context: any): Promise<{
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
    getExecution(id: string): Promise<({
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
    resumeExecution(id: string, body: {
        action: 'approve' | 'reject';
    }): Promise<{
        message: string;
    }>;
    generateAI(body: {
        prompt: string;
    }): Promise<any>;
    testNode(body: {
        node: any;
        context: any;
    }): Promise<import("./runtime/node-handler.interface").NodeResult>;
}
