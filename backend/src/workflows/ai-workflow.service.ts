import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class AIWorkflowService {
  private readonly logger = new Logger(AIWorkflowService.name);
  private genAI: GoogleGenerativeAI;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
  }

  async generateWorkflow(prompt: string): Promise<any> {
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
      
      // Clean up potential markdown formatting
      const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(jsonStr);
    } catch (error) {
      this.logger.error(`AI Workflow Generation failed: ${error.message}`);
      throw new Error(`Failed to generate workflow: ${error.message}`);
    }
  }
}
