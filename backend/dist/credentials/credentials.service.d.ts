import { PrismaService } from '../prisma/prisma.service';
import { EncryptionService } from './encryption.service';
export declare class CredentialsService {
    private prisma;
    private encryption;
    constructor(prisma: PrismaService, encryption: EncryptionService);
    create(orgId: string, name: string, type: string, rawData: any): Promise<{
        name: string;
        data: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        orgId: string;
        type: string;
    }>;
    findAll(orgId: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: string;
    }[]>;
    findOne(id: string): Promise<{
        name: string;
        data: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        orgId: string;
        type: string;
    }>;
    getDecrypted(id: string): Promise<any>;
    remove(id: string): Promise<{
        name: string;
        data: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        orgId: string;
        type: string;
    }>;
}
