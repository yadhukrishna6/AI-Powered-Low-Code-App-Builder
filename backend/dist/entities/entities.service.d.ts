import { PrismaService } from '../prisma/prisma.service';
export declare class EntitiesService {
    private prisma;
    constructor(prisma: PrismaService);
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
    create(projectId: string, data: any): Promise<{
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
