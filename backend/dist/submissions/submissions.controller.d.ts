import { SubmissionsService } from './submissions.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';
export declare class SubmissionsController {
    private readonly submissionsService;
    constructor(submissionsService: SubmissionsService);
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
            name: string;
            schema: import("@prisma/client/runtime/library").JsonValue;
            id: string;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        data: import("@prisma/client/runtime/library").JsonValue;
        id: string;
        createdAt: Date;
        formId: string;
    }>;
}
