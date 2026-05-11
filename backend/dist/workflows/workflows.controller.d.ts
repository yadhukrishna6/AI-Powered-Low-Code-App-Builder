import { WorkflowsService } from './workflows.service';
export declare class WorkflowsController {
    private readonly workflowsService;
    constructor(workflowsService: WorkflowsService);
    create(data: any): Promise<{
        name: string;
        projectId: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        status: string;
        graph: import("@prisma/client/runtime/library").JsonValue;
        version: number;
    }>;
    findAll(projectId?: string): Promise<{
        name: string;
        projectId: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        status: string;
        graph: import("@prisma/client/runtime/library").JsonValue;
        version: number;
    }[]>;
    findOne(id: string): Promise<{
        executions: {
            id: string;
            result: import("@prisma/client/runtime/library").JsonValue | null;
            status: string;
            workflowId: string;
            triggerSource: string | null;
            context: import("@prisma/client/runtime/library").JsonValue;
            startTime: Date;
            endTime: Date | null;
        }[];
    } & {
        name: string;
        projectId: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        status: string;
        graph: import("@prisma/client/runtime/library").JsonValue;
        version: number;
    }>;
    update(id: string, data: any): Promise<{
        name: string;
        projectId: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        status: string;
        graph: import("@prisma/client/runtime/library").JsonValue;
        version: number;
    }>;
    remove(id: string): Promise<{
        name: string;
        projectId: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        status: string;
        graph: import("@prisma/client/runtime/library").JsonValue;
        version: number;
    }>;
    execute(id: string, context: any): Promise<{
        id: string;
        result: import("@prisma/client/runtime/library").JsonValue | null;
        status: string;
        workflowId: string;
        triggerSource: string | null;
        context: import("@prisma/client/runtime/library").JsonValue;
        startTime: Date;
        endTime: Date | null;
    }>;
    getExecution(id: string): Promise<({
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
}
