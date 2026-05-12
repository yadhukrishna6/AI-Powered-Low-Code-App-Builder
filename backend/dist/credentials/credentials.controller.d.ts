import { CredentialsService } from './credentials.service';
export declare class CredentialsController {
    private readonly credentialsService;
    constructor(credentialsService: CredentialsService);
    create(orgId: string, body: {
        name: string;
        type: string;
        data: any;
    }): Promise<{
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
