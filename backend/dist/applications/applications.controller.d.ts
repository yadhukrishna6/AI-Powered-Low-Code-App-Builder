import { ApplicationsService } from './applications.service';
import { CrudGeneratorService } from './crud-generator.service';
import { AIArchitectService } from './ai-architect.service';
export declare class ApplicationsController {
    private readonly applicationsService;
    private readonly crudGenerator;
    private readonly aiArchitect;
    constructor(applicationsService: ApplicationsService, crudGenerator: CrudGeneratorService, aiArchitect: AIArchitectService);
    generateApp(projectId: string, data: {
        prompt: string;
    }): Promise<any>;
    generateCrud(projectId: string, data: {
        entityId: string;
    }): Promise<{
        success: boolean;
        baseRoute: string;
    }>;
    getLayout(projectId: string): Promise<{
        projectId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        navigation: import("@prisma/client/runtime/library").JsonValue;
        theme: import("@prisma/client/runtime/library").JsonValue | null;
        config: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    updateLayout(projectId: string, data: any): Promise<{
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
