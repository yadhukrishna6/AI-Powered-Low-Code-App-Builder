"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiRequestHandler = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
let ApiRequestHandler = class ApiRequestHandler {
    async execute(node, context) {
        const { method, url, headers, body, retryConfig } = node.data;
        const resolvedUrl = this.interpolate(url, context.variables);
        const resolvedBody = typeof body === 'string' ? this.interpolate(body, context.variables) : body;
        try {
            const response = await (0, axios_1.default)({
                method: method || 'GET',
                url: resolvedUrl,
                headers: headers || {},
                data: resolvedBody,
                timeout: node.data.timeout || 10000,
            });
            return {
                status: 'success',
                output: {
                    response: response.data,
                    status: response.status,
                },
                nextPath: 'success',
            };
        }
        catch (error) {
            const retryCount = context.variables[`__retry_${node.id}`] || 0;
            const maxRetries = retryConfig?.maxRetries || 3;
            if (retryCount < maxRetries) {
                return {
                    status: 'retry',
                    output: {
                        [`__retry_${node.id}`]: retryCount + 1,
                    },
                    retryDelay: retryConfig?.delay || 2000,
                };
            }
            return {
                status: 'failed',
                error: error.message,
                nextPath: 'failure',
                output: {
                    error: error.message,
                    [`__retry_${node.id}`]: 0,
                }
            };
        }
    }
    interpolate(str, variables) {
        if (!str)
            return '';
        return str.replace(/\{\{(.+?)\}\}/g, (_, path) => {
            return path.split('.').reduce((obj, key) => obj?.[key.trim()], variables) || '';
        });
    }
};
exports.ApiRequestHandler = ApiRequestHandler;
exports.ApiRequestHandler = ApiRequestHandler = __decorate([
    (0, common_1.Injectable)()
], ApiRequestHandler);
//# sourceMappingURL=api-request.handler.js.map