import { SubmissionsService } from './submissions.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';
export declare class SubmissionsController {
    private readonly submissionsService;
    constructor(submissionsService: SubmissionsService);
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
