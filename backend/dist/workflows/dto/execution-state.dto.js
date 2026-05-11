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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResumeExecutionDto = exports.StartExecutionDto = exports.ExecutionEventDto = exports.WorkflowExecutionSnapshotDto = exports.EdgeExecutionStateDto = exports.NodeExecutionStateDto = void 0;
const class_validator_1 = require("class-validator");
class NodeExecutionStateDto {
    nodeId;
    state;
    startedAt;
    completedAt;
    duration;
    error;
    retryCount;
    output;
    input;
    branchTaken;
}
exports.NodeExecutionStateDto = NodeExecutionStateDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], NodeExecutionStateDto.prototype, "nodeId", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(['idle', 'queued', 'running', 'success', 'failed', 'skipped', 'waiting', 'cancelled']),
    __metadata("design:type", String)
], NodeExecutionStateDto.prototype, "state", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], NodeExecutionStateDto.prototype, "startedAt", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], NodeExecutionStateDto.prototype, "completedAt", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], NodeExecutionStateDto.prototype, "duration", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], NodeExecutionStateDto.prototype, "error", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], NodeExecutionStateDto.prototype, "retryCount", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], NodeExecutionStateDto.prototype, "output", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], NodeExecutionStateDto.prototype, "input", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], NodeExecutionStateDto.prototype, "branchTaken", void 0);
class EdgeExecutionStateDto {
    edgeId;
    state;
    executedAt;
    executionCount;
    branchType;
}
exports.EdgeExecutionStateDto = EdgeExecutionStateDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EdgeExecutionStateDto.prototype, "edgeId", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(['inactive', 'active', 'success-path', 'failed-path', 'skipped-path']),
    __metadata("design:type", String)
], EdgeExecutionStateDto.prototype, "state", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], EdgeExecutionStateDto.prototype, "executedAt", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], EdgeExecutionStateDto.prototype, "executionCount", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EdgeExecutionStateDto.prototype, "branchType", void 0);
class WorkflowExecutionSnapshotDto {
    executionId;
    workflowId;
    status;
    startedAt;
    completedAt;
    currentNodeId;
    nodeStates;
    edgeStates;
    variables;
    progress;
}
exports.WorkflowExecutionSnapshotDto = WorkflowExecutionSnapshotDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], WorkflowExecutionSnapshotDto.prototype, "executionId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], WorkflowExecutionSnapshotDto.prototype, "workflowId", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(['idle', 'running', 'completed', 'failed', 'cancelled']),
    __metadata("design:type", String)
], WorkflowExecutionSnapshotDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], WorkflowExecutionSnapshotDto.prototype, "startedAt", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], WorkflowExecutionSnapshotDto.prototype, "completedAt", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], WorkflowExecutionSnapshotDto.prototype, "currentNodeId", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], WorkflowExecutionSnapshotDto.prototype, "variables", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], WorkflowExecutionSnapshotDto.prototype, "progress", void 0);
class ExecutionEventDto {
    type;
    timestamp;
    nodeId;
    edgeId;
    data;
}
exports.ExecutionEventDto = ExecutionEventDto;
__decorate([
    (0, class_validator_1.IsEnum)(['node_started', 'node_completed', 'node_failed', 'edge_activated', 'execution_completed']),
    __metadata("design:type", String)
], ExecutionEventDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], ExecutionEventDto.prototype, "timestamp", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ExecutionEventDto.prototype, "nodeId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ExecutionEventDto.prototype, "edgeId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], ExecutionEventDto.prototype, "data", void 0);
class StartExecutionDto {
    variables;
    triggerSource;
}
exports.StartExecutionDto = StartExecutionDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], StartExecutionDto.prototype, "variables", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], StartExecutionDto.prototype, "triggerSource", void 0);
class ResumeExecutionDto {
    action;
    data;
}
exports.ResumeExecutionDto = ResumeExecutionDto;
__decorate([
    (0, class_validator_1.IsEnum)(['approve', 'reject']),
    __metadata("design:type", String)
], ResumeExecutionDto.prototype, "action", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], ResumeExecutionDto.prototype, "data", void 0);
//# sourceMappingURL=execution-state.dto.js.map