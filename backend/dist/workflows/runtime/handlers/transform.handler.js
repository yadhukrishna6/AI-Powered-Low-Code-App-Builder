"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransformHandler = void 0;
const common_1 = require("@nestjs/common");
let TransformHandler = class TransformHandler {
    async execute(node, context) {
        const { transformType, script } = node.data || {};
        if (transformType === 'script') {
            try {
                const fn = new Function('input', 'context', script);
                const result = fn(context.variables, context);
                return { status: 'success', output: result };
            }
            catch (error) {
                return { status: 'failed', error: `Script error: ${error.message}` };
            }
        }
        return { status: 'success', output: { transformed: true } };
    }
};
exports.TransformHandler = TransformHandler;
exports.TransformHandler = TransformHandler = __decorate([
    (0, common_1.Injectable)()
], TransformHandler);
//# sourceMappingURL=transform.handler.js.map