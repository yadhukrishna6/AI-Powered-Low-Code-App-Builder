"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConditionHandler = void 0;
const common_1 = require("@nestjs/common");
let ConditionHandler = class ConditionHandler {
    async execute(node, context) {
        const { conditions, matchType } = node.data;
        if (!conditions || !Array.isArray(conditions) || conditions.length === 0) {
            return { status: 'success', nextPath: 'true' };
        }
        const results = conditions.map(cond => {
            const actualValue = this.resolveValue(cond.field, context.variables);
            const expectedValue = cond.value;
            switch (cond.operator) {
                case '==': return actualValue == expectedValue;
                case '!=': return actualValue != expectedValue;
                case '>': return Number(actualValue) > Number(expectedValue);
                case '<': return Number(actualValue) < Number(expectedValue);
                case 'contains': return String(actualValue).includes(String(expectedValue));
                default: return false;
            }
        });
        const isMatch = matchType === 'OR'
            ? results.some(r => r)
            : results.every(r => r);
        return {
            status: 'success',
            nextPath: isMatch ? 'true' : 'false'
        };
    }
    resolveValue(path, variables) {
        if (!path)
            return undefined;
        return path.split('.').reduce((obj, key) => obj?.[key], variables);
    }
};
exports.ConditionHandler = ConditionHandler;
exports.ConditionHandler = ConditionHandler = __decorate([
    (0, common_1.Injectable)()
], ConditionHandler);
//# sourceMappingURL=condition.handler.js.map