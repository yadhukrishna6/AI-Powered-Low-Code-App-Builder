import { PrismaService } from '../prisma/prisma.service';
export declare class RulesController {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: any): import("@prisma/client").Prisma.Prisma__BusinessRuleClient<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        targetField: string;
        triggerFields: import("@prisma/client/runtime/library").JsonValue;
        formula: string | null;
        validation: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    findAll(): import("@prisma/client").Prisma.PrismaPromise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        targetField: string;
        triggerFields: import("@prisma/client/runtime/library").JsonValue;
        formula: string | null;
        validation: string | null;
    }[]>;
    findOne(id: string): import("@prisma/client").Prisma.Prisma__BusinessRuleClient<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        targetField: string;
        triggerFields: import("@prisma/client/runtime/library").JsonValue;
        formula: string | null;
        validation: string | null;
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    update(id: string, data: any): import("@prisma/client").Prisma.Prisma__BusinessRuleClient<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        targetField: string;
        triggerFields: import("@prisma/client/runtime/library").JsonValue;
        formula: string | null;
        validation: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    remove(id: string): import("@prisma/client").Prisma.Prisma__BusinessRuleClient<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        targetField: string;
        triggerFields: import("@prisma/client/runtime/library").JsonValue;
        formula: string | null;
        validation: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
}
