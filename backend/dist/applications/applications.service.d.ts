import { PrismaService } from '../prisma/prisma.service';
export declare class ApplicationsService {
    private prisma;
    constructor(prisma: PrismaService);
    getAppLayout(projectId: string): Promise<{
        projectId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        navigation: import("@prisma/client/runtime/library").JsonValue;
        theme: import("@prisma/client/runtime/library").JsonValue | null;
        config: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    updateAppLayout(projectId: string, data: any): Promise<{
        projectId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        navigation: import("@prisma/client/runtime/library").JsonValue;
        theme: import("@prisma/client/runtime/library").JsonValue | null;
        config: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    getPages(projectId: string): Promise<{
        name: string;
        projectId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        config: import("@prisma/client/runtime/library").JsonValue | null;
        route: string;
        content: import("@prisma/client/runtime/library").JsonValue | null;
    }[]>;
    createPage(projectId: string, data: any): Promise<{
        name: string;
        projectId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        config: import("@prisma/client/runtime/library").JsonValue | null;
        route: string;
        content: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    updatePage(id: string, data: any): Promise<{
        name: string;
        projectId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        config: import("@prisma/client/runtime/library").JsonValue | null;
        route: string;
        content: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    removePage(id: string): Promise<{
        name: string;
        projectId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        config: import("@prisma/client/runtime/library").JsonValue | null;
        route: string;
        content: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
}
