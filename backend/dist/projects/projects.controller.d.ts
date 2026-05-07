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
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    findAll(): import("@prisma/client").Prisma.PrismaPromise<({
        _count: {
            forms: number;
            workflows: number;
        };
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        thumbnailColor: string | null;
        status: string;
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
            status: string;
            graph: import("@prisma/client/runtime/library").JsonValue;
        }[];
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        thumbnailColor: string | null;
        status: string;
    }) | null, null, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    update(id: string, data: any): import("@prisma/client").Prisma.Prisma__ProjectClient<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        thumbnailColor: string | null;
        status: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    remove(id: string): import("@prisma/client").Prisma.Prisma__ProjectClient<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        thumbnailColor: string | null;
        status: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
}
