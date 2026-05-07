"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiRequestHandler = void 0;
const common_1 = require("@nestjs/common");
let ApiRequestHandler = class ApiRequestHandler {
    async execute(node, context) {
        const { method, url, body, headers } = node.data || {};
        if (!url) {
            return { status: 'failed', error: 'URL is required' };
        }
        try {
            const response = await fetch(url, {
                method: method || 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...headers,
                },
                body: method !== 'GET' ? JSON.stringify(body) : undefined,
            });
            const data = await response.json();
            return {
                status: response.ok ? 'success' : 'failed',
                output: { apiResponse: data },
                error: response.ok ? undefined : `API returned ${response.status}`,
            };
        }
        catch (error) {
            return {
                status: 'failed',
                error: `Fetch failed: ${error.message}`,
            };
        }
    }
};
exports.ApiRequestHandler = ApiRequestHandler;
exports.ApiRequestHandler = ApiRequestHandler = __decorate([
    (0, common_1.Injectable)()
], ApiRequestHandler);
//# sourceMappingURL=api-request.handler.js.map