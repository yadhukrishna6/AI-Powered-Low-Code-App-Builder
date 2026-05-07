"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var NotificationHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationHandler = void 0;
const common_1 = require("@nestjs/common");
let NotificationHandler = NotificationHandler_1 = class NotificationHandler {
    logger = new common_1.Logger(NotificationHandler_1.name);
    async execute(node, context) {
        const { channel, message, recipients } = node.data || {};
        this.logger.log(`Sending ${channel} notification to ${recipients}: ${message}`);
        return {
            status: 'success',
            output: { notificationSent: true, timestamp: new Date().toISOString() }
        };
    }
};
exports.NotificationHandler = NotificationHandler;
exports.NotificationHandler = NotificationHandler = NotificationHandler_1 = __decorate([
    (0, common_1.Injectable)()
], NotificationHandler);
//# sourceMappingURL=notification.handler.js.map