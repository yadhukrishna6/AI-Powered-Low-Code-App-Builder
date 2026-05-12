"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var WorkflowGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
let WorkflowGateway = WorkflowGateway_1 = class WorkflowGateway {
    server;
    logger = new common_1.Logger(WorkflowGateway_1.name);
    handleConnection(client) {
        this.logger.log(`Client connected: ${client.id}`);
    }
    handleDisconnect(client) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }
    sendNodeExecutionUpdate(executionId, nodeId, status, output) {
        this.server.emit(`execution:${executionId}:node`, {
            nodeId,
            status,
            output,
            timestamp: new Date(),
        });
    }
    sendExecutionStatusUpdate(executionId, status) {
        this.server.emit(`execution:${executionId}:status`, {
            status,
            timestamp: new Date(),
        });
    }
};
exports.WorkflowGateway = WorkflowGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], WorkflowGateway.prototype, "server", void 0);
exports.WorkflowGateway = WorkflowGateway = WorkflowGateway_1 = __decorate([
    (0, common_1.Injectable)(),
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
        },
        namespace: 'monitoring',
    })
], WorkflowGateway);
//# sourceMappingURL=workflow.gateway.js.map