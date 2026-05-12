"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AIWorkflowService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIWorkflowService = void 0;
const common_1 = require("@nestjs/common");
const generative_ai_1 = require("@google/generative-ai");
let AIWorkflowService = AIWorkflowService_1 = class AIWorkflowService {
    logger = new common_1.Logger(AIWorkflowService_1.name);
    genAI;
    constructor() {
        const apiKey = process.env.GEMINI_API_KEY;
        if (apiKey) {
            this.genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
        }
    }
    async generateWorkflow(prompt) {
        if (!this.genAI) {
            throw new Error('GEMINI_API_KEY not configured');
        }
        const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const systemPrompt = `
      You are an expert system architect for "FlowForge", an enterprise low-code platform.
      Your task is to generate a valid workflow JSON graph based on the user's requirements.
      
      GRAPH SCHEMA:
      {
        "nodes": [
          { 
            "id": "unique_string", 
            "type": "trigger|logic|action", 
            "subType": "start|condition|approval|api-request|send-notification|save-data|transform|end",
            "label": "Human Readable Name",
            "data": { ...node_specific_data... },
            "position": { "x": number, "y": number }
          }
        ],
        "edges": [
          { 
            "id": "e_source_target", 
            "source": "node_id", 
            "target": "node_id", 
            "sourceHandle": "optional_branch_id (e.g., 'true', 'false', 'approved', 'rejected')" 
          }
        ]
      }

      GUIDELINES:
      - Always start with a 'start' node.
      - Use 'condition' for IF/ELSE logic (branches: 'true', 'false').
      - Use 'approval' for human steps (branches: 'approved', 'rejected').
      - Use 'api-request' for external integrations.
      - Ensure all nodes are connected logically.
      - Space nodes out in the 'position' coordinates (e.g., x increments by 250).

      USER REQUIREMENT: "${prompt}"
      
      Return ONLY the JSON object. No markdown, no explanations.
    `;
        try {
            const result = await model.generateContent(systemPrompt);
            const response = await result.response;
            const text = response.text();
            const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(jsonStr);
        }
        catch (error) {
            this.logger.error(`AI Workflow Generation failed: ${error.message}`);
            throw new Error(`Failed to generate workflow: ${error.message}`);
        }
    }
};
exports.AIWorkflowService = AIWorkflowService;
exports.AIWorkflowService = AIWorkflowService = AIWorkflowService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], AIWorkflowService);
//# sourceMappingURL=ai-workflow.service.js.map