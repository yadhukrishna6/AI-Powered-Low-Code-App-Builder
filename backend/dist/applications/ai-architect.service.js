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
var AIArchitectService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIArchitectService = void 0;
const common_1 = require("@nestjs/common");
const generative_ai_1 = require("@google/generative-ai");
let AIArchitectService = AIArchitectService_1 = class AIArchitectService {
    logger = new common_1.Logger(AIArchitectService_1.name);
    genAI;
    constructor() {
        const apiKey = process.env.GEMINI_API_KEY;
        if (apiKey) {
            this.genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
        }
    }
    async generateApplication(prompt) {
        if (!this.genAI) {
            throw new Error('GEMINI_API_KEY not configured');
        }
        const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const systemPrompt = `
      You are an expert full-stack application architect for "FlowForge Enterprise App OS".
      Generate a complete application schema including entities, layout, and pages based on user requirements.

      RESPONSE SCHEMA:
      {
        "name": "App Name",
        "entities": [
          {
            "name": "EntityName",
            "fields": [
              { "name": "fieldName", "type": "String|Int|Boolean|DateTime", "isRequired": true }
            ]
          }
        ],
        "layout": {
          "sidebar": [
             { "label": "Label", "icon": "material_icon_name", "route": "/route" }
          ]
        },
        "pages": [
          { "name": "Page Name", "route": "/route", "type": "crud|dashboard|form", "entityName": "OptionalEntity" }
        ]
      }

      USER REQUIREMENT: "${prompt}"

      Return ONLY the JSON object. Ensure all entities mentioned are created and linked to pages.
    `;
        try {
            const result = await model.generateContent(systemPrompt);
            const text = (await result.response).text();
            const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(jsonStr);
        }
        catch (error) {
            this.logger.error(`AI App Generation failed: ${error.message}`);
            throw error;
        }
    }
};
exports.AIArchitectService = AIArchitectService;
exports.AIArchitectService = AIArchitectService = AIArchitectService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], AIArchitectService);
//# sourceMappingURL=ai-architect.service.js.map