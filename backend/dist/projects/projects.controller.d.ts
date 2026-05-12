import { PrismaService } from '../prisma/prisma.service';
export declare class ProjectsController {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: any): import("@prisma/client").Prisma.Prisma__ProjectClient<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        thumbnailColor: string | null;
        status: string;
        orgId: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    findAll(): import("@prisma/client").Prisma.PrismaPromise<({
        _count: {
            forms: number;
            workflows: number;
        };
        forms: {
            name: string;
            schema: import("@prisma/client/runtime/library").JsonValue;
            projectId: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
        }[];
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        thumbnailColor: string | null;
        status: string;
        orgId: string | null;
    })[]>;
    findOne(id: string): import("@prisma/client").Prisma.Prisma__ProjectClient<({
        forms: {
            name: string;
            schema: import("@prisma/client/runtime/library").JsonValue;
            projectId: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
        }[];
        workflows: {
            name: string;
            projectId: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            status: string;
            draftGraph: import("@prisma/client/runtime/library").JsonValue | null;
            activeVersionId: string | null;
        }[];
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        thumbnailColor: string | null;
        status: string;
        orgId: string | null;
    }) | null, null, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    update(id: string, data: any): import("@prisma/client").Prisma.Prisma__ProjectClient<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        thumbnailColor: string | null;
        status: string;
        orgId: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    remove(id: string): import("@prisma/client").Prisma.Prisma__ProjectClient<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        thumbnailColor: string | null;
        status: string;
        orgId: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
}
