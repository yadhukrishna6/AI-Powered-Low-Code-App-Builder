import { PrismaService } from '../prisma/prisma.service';
export declare class SchemaEngineService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    generatePrismaSchema(projectId: string): Promise<string>;
    private capitalize;
    private mapToPrismaType;
    private formatDefaultValue;
}
