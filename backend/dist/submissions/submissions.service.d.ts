import { PrismaService } from '../prisma/prisma.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';
export declare class SubmissionsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createSubmissionDto: CreateSubmissionDto): Promise<{
        data: import("@prisma/client/runtime/library").JsonValue;
        id: string;
        createdAt: Date;
        formId: string;
    }>;
    findByForm(formId: string): Promise<{
        data: import("@prisma/client/runtime/library").JsonValue;
        id: string;
        createdAt: Date;
        formId: string;
    }[]>;
    findAll(): Promise<({
        form: {
            id: string;
            createdAt: Date;
            name: string;
            projectId: string | null;
            schema: import("@prisma/client/runtime/library").JsonValue;
            updatedAt: Date;
        };
    } & {
        data: import("@prisma/client/runtime/library").JsonValue;
        id: string;
        createdAt: Date;
        formId: string;
    })[]>;
    findOne(id: string): Promise<{
        form: {
            id: string;
            createdAt: Date;
            name: string;
            projectId: string | null;
            schema: import("@prisma/client/runtime/library").JsonValue;
            updatedAt: Date;
        };
    } & {
        data: import("@prisma/client/runtime/library").JsonValue;
        id: string;
        createdAt: Date;
        formId: string;
    }>;
}
