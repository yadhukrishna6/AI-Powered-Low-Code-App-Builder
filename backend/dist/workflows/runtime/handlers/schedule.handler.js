"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScheduleHandler = void 0;
const common_1 = require("@nestjs/common");
let ScheduleHandler = class ScheduleHandler {
    async execute(node, context) {
        const delay = node.data.delayMs || 0;
        if (context.variables[`__waited_${node.id}`]) {
            return {
                status: 'success',
                nextPath: 'next',
                output: {
                    [`__waited_${node.id}`]: false
                }
            };
        }
        return {
            status: 'retry',
            retryDelay: delay,
            output: {
                [`__waited_${node.id}`]: true
            }
        };
    }
};
exports.ScheduleHandler = ScheduleHandler;
exports.ScheduleHandler = ScheduleHandler = __decorate([
    (0, common_1.Injectable)()
], ScheduleHandler);
//# sourceMappingURL=schedule.handler.js.map