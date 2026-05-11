import { PrismaService } from '../prisma/prisma.service';
import { WorkflowRuntimeService } from './runtime/workflow-runtime.service';
export declare class WorkflowsService {
    private prisma;
    private runtime;
    constructor(prisma: PrismaService, runtime: WorkflowRuntimeService);
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
    createExecution(workflowId: string, triggerSource: string, context: any): Promise<{
        id: string;
        result: import("@prisma/client/runtime/library").JsonValue | null;
        status: string;
        workflowId: string;
        triggerSource: string | null;
        context: import("@prisma/client/runtime/library").JsonValue;
        startTime: Date;
        endTime: Date | null;
    }>;
    getExecution(executionId: string): Promise<({
        workflow: {
            graph: import("@prisma/client/runtime/library").JsonValue;
        };
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
    resumeExecution(executionId: string, action: 'approve' | 'reject'): Promise<{
        message: string;
    }>;
}
