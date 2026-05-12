import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class AIArchitectService {
  private readonly logger = new Logger(AIArchitectService.name);
  private genAI: GoogleGenerativeAI;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
  }

  async generateApplication(prompt: string): Promise<any> {
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
    } catch (error) {
      this.logger.error(`AI App Generation failed: ${error.message}`);
      throw error;
    }
  }
}
