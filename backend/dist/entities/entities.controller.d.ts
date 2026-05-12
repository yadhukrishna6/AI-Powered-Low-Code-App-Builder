import { EntitiesService } from './entities.service';
export declare class EntitiesController {
    private readonly entitiesService;
    constructor(entitiesService: EntitiesService);
    findAll(projectId: string): Promise<({
        fields: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            type: string;
            isRequired: boolean;
            isUnique: boolean;
            defaultValue: string | null;
            relationTo: string | null;
            relationType: string | null;
            entityId: string;
        }[];
    } & {
        name: string;
        projectId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
    })[]>;
    findOne(id: string): Promise<{
        fields: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            type: string;
            isRequired: boolean;
            isUnique: boolean;
            defaultValue: string | null;
            relationTo: string | null;
            relationType: string | null;
            entityId: string;
        }[];
    } & {
        name: string;
        projectId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    create(data: {
        projectId: string;
        name: string;
        description?: string;
        fields?: any[];
    }): Promise<{
        fields: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            type: string;
            isRequired: boolean;
            isUnique: boolean;
            defaultValue: string | null;
            relationTo: string | null;
            relationType: string | null;
            entityId: string;
        }[];
    } & {
        name: string;
        projectId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    update(id: string, data: any): Promise<{
        fields: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            type: string;
            isRequired: boolean;
            isUnique: boolean;
            defaultValue: string | null;
            relationTo: string | null;
            relationType: string | null;
            entityId: string;
        }[];
    } & {
        name: string;
        projectId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    remove(id: string): Promise<{
        name: string;
        projectId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
}
