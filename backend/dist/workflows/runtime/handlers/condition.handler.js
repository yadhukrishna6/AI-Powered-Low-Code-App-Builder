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
        const { field, operator, value } = node.data || {};
        if (!field?.trim()) {
            throw new Error('Field is required for condition evaluation');
        }
        if (!operator) {
            throw new Error('Operator is required for condition evaluation');
        }
        if (value === undefined || value === '') {
            throw new Error('Value is required for condition evaluation');
        }
        let fieldKey = field;
        if (field && field.startsWith('{{') && field.endsWith('}}')) {
            fieldKey = field.slice(2, -2).trim();
        }
        const actualValue = context.variables[fieldKey];
        if (actualValue === undefined) {
            throw new Error(`Field '${fieldKey}' not found in workflow context`);
        }
        let isTrue = false;
        switch (operator) {
            case '==':
                isTrue = actualValue == value;
                break;
            case '!=':
                isTrue = actualValue != value;
                break;
            case '>':
                isTrue = Number(actualValue) > Number(value);
                break;
            case '<':
                isTrue = Number(actualValue) < Number(value);
                break;
            case 'contains':
                isTrue = String(actualValue).includes(String(value));
                break;
            default: throw new Error(`Unknown operator: ${operator}`);
        }
        return {
            status: 'success',
            nextPath: isTrue ? 'true' : 'false',
            output: { conditionResult: isTrue }
        };
    }
};
exports.ConditionHandler = ConditionHandler;
exports.ConditionHandler = ConditionHandler = __decorate([
    (0, common_1.Injectable)()
], ConditionHandler);
//# sourceMappingURL=condition.handler.js.map