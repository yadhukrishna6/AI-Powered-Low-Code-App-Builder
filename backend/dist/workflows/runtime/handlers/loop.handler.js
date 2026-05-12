"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoopHandler = void 0;
const common_1 = require("@nestjs/common");
let LoopHandler = class LoopHandler {
    async execute(node, context) {
        const { collectionKey, iteratorName } = node.data;
        const collection = collectionKey.split('.').reduce((obj, key) => obj?.[key], context.variables);
        if (!Array.isArray(collection)) {
            return {
                status: 'failed',
                error: `Variable ${collectionKey} is not an array`
            };
        }
        const indexKey = `__loop_${node.id}_index`;
        const currentIndex = context.variables[indexKey] || 0;
        if (currentIndex >= collection.length) {
            return {
                status: 'success',
                nextPath: 'done',
                output: {
                    [indexKey]: 0,
                }
            };
        }
        const currentItem = collection[currentIndex];
        return {
            status: 'success',
            nextPath: 'next',
            output: {
                [iteratorName || 'item']: currentItem,
                [indexKey]: currentIndex + 1,
            }
        };
    }
};
exports.LoopHandler = LoopHandler;
exports.LoopHandler = LoopHandler = __decorate([
    (0, common_1.Injectable)()
], LoopHandler);
//# sourceMappingURL=loop.handler.js.map