export declare class AIWorkflowService {
    private readonly logger;
    private genAI;
    constructor();
    generateWorkflow(prompt: string): Promise<any>;
}
