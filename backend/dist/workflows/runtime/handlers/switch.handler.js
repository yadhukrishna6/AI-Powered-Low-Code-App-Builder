"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SwitchHandler = void 0;
const common_1 = require("@nestjs/common");
let SwitchHandler = class SwitchHandler {
    async execute(node, context) {
        const { variable, cases, defaultPath } = node.data;
        const value = this.resolveVariable(variable, context.variables);
        const match = cases.find((c) => c.value === value);
        if (match) {
            return {
                status: 'success',
                nextPath: match.pathId || match.id,
            };
        }
        return {
            status: 'success',
            nextPath: defaultPath || 'default',
        };
    }
    resolveVariable(path, variables) {
        if (!path)
            return undefined;
        return path.split('.').reduce((obj, key) => obj?.[key], variables);
    }
};
exports.SwitchHandler = SwitchHandler;
exports.SwitchHandler = SwitchHandler = __decorate([
    (0, common_1.Injectable)()
], SwitchHandler);
//# sourceMappingURL=switch.handler.js.map