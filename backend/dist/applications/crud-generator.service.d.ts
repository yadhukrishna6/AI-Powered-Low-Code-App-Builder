import { PrismaService } from '../prisma/prisma.service';
export declare class CrudGeneratorService {
    private prisma;
    constructor(prisma: PrismaService);
    generateCrudPages(projectId: string, entityId: string): Promise<{
        success: boolean;
        baseRoute: string;
    }>;
}
