"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpressionResolverService = void 0;
const common_1 = require("@nestjs/common");
let ExpressionResolverService = class ExpressionResolverService {
    resolve(target, context) {
        if (!target)
            return target;
        if (typeof target === 'string') {
            return this.resolveString(target, context);
        }
        if (Array.isArray(target)) {
            return target.map(item => this.resolve(item, context));
        }
        if (typeof target === 'object') {
            const result = {};
            for (const key in target) {
                result[key] = this.resolve(target[key], context);
            }
            return result;
        }
        return target;
    }
    resolveString(str, context) {
        const pureMatch = str.match(/^{{ (.*) }}$/);
        if (pureMatch) {
            return this.evaluateExpression(pureMatch[1], context);
        }
        return str.replace(/{{ (.*?) }}/g, (match, expression) => {
            const value = this.evaluateExpression(expression, context);
            return value !== undefined ? String(value) : '';
        });
    }
    evaluateExpression(expression, context) {
        try {
            const sandbox = {
                $json: context.lastOutput || {},
                $vars: context.variables || {},
                $node: (name) => context.nodeOutputs?.[name] || {},
                ...context.variables,
            };
            const parts = expression.split('.');
            let current = sandbox;
            for (const part of parts) {
                if (current === undefined || current === null)
                    return undefined;
                const funcMatch = part.match(/(\$\w+)\("([^"]+)"\)/);
                if (funcMatch) {
                    const funcName = funcMatch[1];
                    const arg = funcMatch[2];
                    if (typeof sandbox[funcName] === 'function') {
                        current = sandbox[funcName](arg);
                    }
                    else {
                        return undefined;
                    }
                }
                else {
                    current = current[part];
                }
            }
            return current;
        }
        catch (e) {
            console.error('Expression evaluation failed:', expression, e);
            return undefined;
        }
    }
};
exports.ExpressionResolverService = ExpressionResolverService;
exports.ExpressionResolverService = ExpressionResolverService = __decorate([
    (0, common_1.Injectable)()
], ExpressionResolverService);
//# sourceMappingURL=expression-resolver.service.js.map