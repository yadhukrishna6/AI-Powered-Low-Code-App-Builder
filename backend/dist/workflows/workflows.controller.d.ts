import { PrismaService } from '../prisma/prisma.service';
export declare class WorkflowsController {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: any): import("@prisma/client").Prisma.Prisma__WorkflowClient<{
        name: string;
        projectId: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        graph: import("@prisma/client/runtime/library").JsonValue;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    findAll(): import("@prisma/client").Prisma.PrismaPromise<{
        name: string;
        projectId: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        graph: import("@prisma/client/runtime/library").JsonValue;
    }[]>;
    findOne(id: string): import("@prisma/client").Prisma.Prisma__WorkflowClient<{
        name: string;
        projectId: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        graph: import("@prisma/client/runtime/library").JsonValue;
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    update(id: string, data: any): import("@prisma/client").Prisma.Prisma__WorkflowClient<{
        name: string;
        projectId: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        graph: import("@prisma/client/runtime/library").JsonValue;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    remove(id: string): import("@prisma/client").Prisma.Prisma__WorkflowClient<{
        name: string;
        projectId: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        graph: import("@prisma/client/runtime/library").JsonValue;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
}
