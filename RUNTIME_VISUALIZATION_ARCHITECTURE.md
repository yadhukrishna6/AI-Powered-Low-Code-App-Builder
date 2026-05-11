# FlowForge Runtime Visualization Architecture

## Executive Summary

This document outlines a comprehensive enterprise-grade runtime visualization system for FlowForge Workflow Automation Engine, transforming static workflow graphs into dynamic, cinematic execution experiences similar to n8n, Temporal UI, and Camunda Operate.

## 1. Runtime State Architecture

### Core State Management System

```typescript
// Runtime State Hierarchy
WorkflowExecutionSnapshot (Top Level)
├── Execution Metadata (status, progress, timing)
├── NodeExecutionMetadata[] (per-node states)
├── EdgeExecutionMetadata[] (per-edge states)
└── ExecutionEvent Stream (real-time updates)
```

### State Persistence Strategy

- **Database Layer**: Execution states stored in PostgreSQL with Prisma ORM
- **Memory Layer**: Real-time state management with Angular signals
- **Cache Layer**: IndexedDB for offline replay capabilities
- **Sync Layer**: WebSocket-based real-time synchronization

## 2. Node Execution State System

### Node States & Visual Mapping

```typescript
type NodeExecutionState =
  | 'idle'       // Neutral glassmorphism appearance
  | 'queued'     // Yellow pulse animation
  | 'running'    // Blue glow + spinning icon
  | 'success'    // Green border + check icon
  | 'failed'     // Red border + error icon + shake
  | 'skipped'    // Grayed out + dashed border
  | 'waiting'    // Orange pulse + clock icon
  | 'cancelled'  // Gray + cancel icon
```

### Visual State Transitions

```css
/* Running State Animation */
.node-running {
  border: 3px solid #3b82f6;
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.6);
  animation: glow-pulse 1.5s infinite alternate;
}

/* Success State Animation */
.node-success {
  animation: success-bounce 0.6s ease-out;
}

/* Failed State Animation */
.node-failed {
  animation: shake 0.5s ease-in-out;
}
```

## 3. Edge Execution State System

### Edge States & Flow Visualization

```typescript
type EdgeExecutionState =
  | 'inactive'       // Default gray styling
  | 'active'         // Blue with flow animation
  | 'success-path'   // Green with success indicators
  | 'failed-path'    // Red with error indicators
  | 'skipped-path'   // Dashed gray styling
```

### Flow Animation System

```css
/* Flow Animation */
.flow-animation::before {
  content: '';
  position: absolute;
  animation: flow-shimmer 2s infinite;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent);
}

/* Particle Effects */
.flow-particle {
  animation: flow-particle 2s linear infinite;
}
```

## 4. jsPlumb Runtime Styling Strategy

### Dynamic Connection Management

```typescript
class EnhancedGraphEngineService {
  private connections = new Map<string, Connection>();

  updateConnectionStyling(edgeId: string) {
    const connection = this.connections.get(edgeId);
    const edgeState = this.runtimeState.getEdgeState(edgeId);

    // Update paint style
    connection.setPaintStyle(this.getPaintStyleForState(edgeState.state));

    // Add runtime overlays
    this.updateConnectionOverlays(connection, edgeState);
  }

  private updateConnectionOverlays(connection: Connection, edgeState: any) {
    // Clear existing overlays
    connection.removeAllOverlays();

    // Add directional arrow
    connection.addOverlay(['Arrow', { location: 1, width: 10, length: 10 }]);

    // Add branch labels for conditions
    if (edgeState.branchType) {
      connection.addOverlay(['Label', {
        label: edgeState.branchType.toUpperCase(),
        cssClass: `branch-label branch-${edgeState.branchType}`
      }]);
    }
  }
}
```

## 5. Angular Runtime State Management

### Reactive State Architecture

```typescript
@Injectable({ providedIn: 'root' })
export class RuntimeStateService {
  // Signal-based state management
  private _executionSnapshot = signal<WorkflowExecutionSnapshot | null>(null);
  private _nodeStates = signal<Map<string, NodeExecutionMetadata>>(new Map());
  private _edgeStates = signal<Map<string, EdgeExecutionMetadata>>(new Map());

  // Computed selectors for reactive UI updates
  executionSnapshot = computed(() => this._executionSnapshot());
  nodeStates = computed(() => this._nodeStates());
  edgeStates = computed(() => this._edgeStates());

  // Event-driven updates
  executionEvents$ = this._executionEvents.asObservable();
}
```

### Component Integration

```typescript
@Component({...})
export class WorkflowCanvasComponent {
  runtimeState = inject(RuntimeStateService);

  // Reactive UI updates
  executionSnapshot = computed(() => this.runtimeState.executionSnapshot());

  constructor() {
    // Subscribe to execution events
    effect(() => {
      const snapshot = this.executionSnapshot();
      if (snapshot) {
        this.updateVisualStates(snapshot);
      }
    });
  }
}
```

## 6. Execution Playback Architecture

### Playback State Management

```typescript
interface PlaybackState {
  isPlaying: boolean;
  currentStep: number;
  totalSteps: number;
  speed: number; // 0.25x to 4x
  mode: 'realtime' | 'step-by-step' | 'instant';
}

class ExecutionPlaybackService {
  private playbackState = signal<PlaybackState>({
    isPlaying: false,
    currentStep: 0,
    totalSteps: 0,
    speed: 1,
    mode: 'realtime'
  });

  async startPlayback(executionId: string) {
    const snapshot = await this.loadExecutionSnapshot(executionId);
    this.playbackState.update(state => ({
      ...state,
      totalSteps: snapshot.nodeStates.length,
      isPlaying: true
    }));

    await this.playExecution(snapshot);
  }

  private async playExecution(snapshot: WorkflowExecutionSnapshot) {
    for (const [index, nodeState] of snapshot.nodeStates.entries()) {
      if (!this.playbackState().isPlaying) break;

      // Update visual state
      this.runtimeState.setNodeState(nodeState.nodeId, nodeState.state, nodeState);

      // Wait based on playback speed and timing
      const delay = this.calculateDelay(nodeState, index);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}
```

## 7. Workflow Replay Strategy

### Multi-Level Replay System

```typescript
type ReplayMode =
  | 'instant'        // Show final state immediately
  | 'realtime'       // Replay at original speed
  | 'step-by-step'   // Manual step control
  | 'debug'          // Enhanced debugging mode

interface ReplayConfiguration {
  mode: ReplayMode;
  speed: number;
  breakpoints: string[]; // Node IDs to pause at
  variableTracking: boolean;
  edgeHighlighting: boolean;
}

class WorkflowReplayService {
  async replayExecution(executionId: string, config: ReplayConfiguration) {
    const snapshot = await this.loadExecutionSnapshot(executionId);

    switch (config.mode) {
      case 'instant':
        return this.instantReplay(snapshot);
      case 'realtime':
        return this.realtimeReplay(snapshot, config.speed);
      case 'step-by-step':
        return this.stepByStepReplay(snapshot);
      case 'debug':
        return this.debugReplay(snapshot, config);
    }
  }
}
```

## 8. Backend Execution API Contracts

### REST API Endpoints

```typescript
// Start execution
POST /api/v1/workflows/:workflowId/execute
Body: { variables?: Record<string, any>, triggerSource?: string }
Response: { executionId: string }

// Get execution state
GET /api/v1/workflows/executions/:executionId
Response: WorkflowExecutionSnapshot

// Resume execution
POST /api/v1/workflows/executions/:executionId/resume
Body: { action: 'approve' | 'reject' }

// Pause execution
POST /api/v1/workflows/executions/:executionId/pause

// Stop execution
POST /api/v1/workflows/executions/:executionId/stop

// Get execution history
GET /api/v1/workflows/executions/:executionId/history
Response: ExecutionEvent[]
```

### WebSocket Real-time Updates

```typescript
// Client subscribes to execution updates
ws.send(JSON.stringify({
  type: 'subscribe',
  executionId: 'exec-123'
}));

// Server sends real-time events
{
  type: 'node_started',
  executionId: 'exec-123',
  nodeId: 'node-456',
  timestamp: '2024-01-01T10:00:00Z'
}
```

## 9. CSS Animation Strategy

### Performance-Optimized Animations

```css
/* GPU-accelerated animations */
.workflow-node {
  transform: translateZ(0); /* Force hardware acceleration */
  will-change: transform, opacity, box-shadow;
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .workflow-node,
  .jsplumb-connector {
    animation: none !important;
    transition: none !important;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .node-idle {
    background: rgba(100, 116, 139, 0.1);
  }
}
```

### Animation Performance Best Practices

- Use `transform` and `opacity` for GPU acceleration
- Limit animated elements to viewport
- Use `will-change` sparingly
- Implement `requestAnimationFrame` for custom animations
- Debounce rapid state changes

## 10. UI/UX Best Practices

### Visual Hierarchy

1. **Execution Progress**: Large, prominent progress indicator
2. **Current Node**: Highlighted with glow and animation
3. **Error States**: Red with clear error messages and actions
4. **Success Path**: Green with satisfying completion animations
5. **Waiting States**: Clear call-to-action buttons

### Information Architecture

```typescript
interface ExecutionUILayout {
  header: {
    status: ExecutionStatusBadge;
    progress: ProgressBar;
    controls: ExecutionControls;
  };
  timeline: {
    current: CurrentNodeIndicator;
    history: ExecutionHistoryList;
    upcoming: UpcomingNodesPreview;
  };
  details: {
    currentNode: NodeExecutionDetails;
    variables: VariableInspector;
    logs: ExecutionLogsPanel;
  };
}
```

### Accessibility Features

- Screen reader support for execution states
- Keyboard navigation for controls
- High contrast mode support
- Reduced motion preferences
- Focus management during execution

## 11. Example Runtime JSON

```json
{
  "executionId": "exec-12345",
  "workflowId": "wf-67890",
  "status": "running",
  "startedAt": "2024-01-01T10:00:00Z",
  "currentNodeId": "node-456",
  "progress": 65,
  "nodeStates": [
    {
      "nodeId": "trigger-1",
      "state": "success",
      "startedAt": "2024-01-01T10:00:00Z",
      "completedAt": "2024-01-01T10:00:05Z",
      "duration": 5000,
      "output": { "formData": { "name": "John Doe" } }
    },
    {
      "nodeId": "condition-1",
      "state": "success",
      "startedAt": "2024-01-01T10:00:05Z",
      "completedAt": "2024-01-01T10:00:10Z",
      "duration": 5000,
      "branchTaken": "true",
      "output": { "conditionResult": true }
    }
  ],
  "edgeStates": [
    {
      "edgeId": "edge-1",
      "state": "success-path",
      "executedAt": "2024-01-01T10:00:05Z",
      "executionCount": 1,
      "branchType": "main"
    }
  ],
  "variables": {
    "userName": "John Doe",
    "isApproved": true
  }
}
```

## 12. Example Node Execution Flow

```typescript
// Node execution lifecycle
async executeNode(nodeId: string): Promise<void> {
  // 1. Pre-execution state
  this.runtimeState.setNodeState(nodeId, 'queued');

  // 2. Execution starts
  this.runtimeState.setNodeState(nodeId, 'running');

  try {
    // 3. Execute node logic
    const result = await this.nodeExecutor.execute(nodeId);

    // 4. Handle result
    if (result.status === 'success') {
      this.runtimeState.setNodeState(nodeId, 'success', {
        output: result.output,
        branchTaken: result.nextPath
      });

      // 5. Activate next edges
      this.activateNextEdges(nodeId, result.nextPath);

    } else if (result.status === 'waiting') {
      this.runtimeState.setNodeState(nodeId, 'waiting');

    } else if (result.status === 'failed') {
      this.runtimeState.setNodeState(nodeId, 'failed', {
        error: result.error
      });
    }

  } catch (error) {
    // 6. Handle execution errors
    this.runtimeState.setNodeState(nodeId, 'failed', {
      error: error.message
    });
  }
}
```

## 13. Example Edge State Rendering

```typescript
updateEdgeVisualState(edgeId: string, state: EdgeExecutionState): void {
  const connection = this.connections.get(edgeId);
  if (!connection) return;

  // Update connection styling
  connection.setPaintStyle(this.getEdgePaintStyle(state));

  // Add/remove animations
  this.updateEdgeAnimations(connection, state);

  // Update overlays
  this.updateEdgeOverlays(connection, state);

  // Trigger repaint
  connection.repaint();
}

private getEdgePaintStyle(state: EdgeExecutionState): any {
  const styles = {
    'inactive': { stroke: '#94a3b8', strokeWidth: 2 },
    'active': { stroke: '#3b82f6', strokeWidth: 3 },
    'success-path': { stroke: '#10b981', strokeWidth: 3 },
    'failed-path': { stroke: '#ef4444', strokeWidth: 3 },
    'skipped-path': { stroke: '#d1d5db', strokeWidth: 1, dashstyle: '2 2' }
  };

  return styles[state] || styles.inactive;
}
```

## 14. Suggested Runtime Color System

```css
:root {
  /* Node States */
  --node-idle: #64748b;
  --node-queued: #f59e0b;
  --node-running: #3b82f6;
  --node-success: #10b981;
  --node-failed: #ef4444;
  --node-skipped: #9ca3af;
  --node-waiting: #f59e0b;
  --node-cancelled: #6b7280;

  /* Edge States */
  --edge-inactive: #94a3b8;
  --edge-active: #3b82f6;
  --edge-success: #10b981;
  --edge-failed: #ef4444;
  --edge-skipped: #d1d5db;

  /* UI Elements */
  --progress-primary: linear-gradient(90deg, #3b82f6, #10b981);
  --glow-running: rgba(59, 130, 246, 0.6);
  --glow-success: rgba(16, 185, 129, 0.4);
  --glow-failed: rgba(239, 68, 68, 0.4);
}
```

## 15. Enterprise Workflow Visualization Best Practices

### Performance Optimization

1. **Virtual Scrolling**: For large execution histories
2. **Lazy Loading**: Load execution data on demand
3. **Debounced Updates**: Prevent excessive re-renders
4. **Memory Management**: Clean up old execution states

### Scalability Considerations

1. **Pagination**: For execution history
2. **Compression**: For large execution snapshots
3. **Indexing**: Database indexes on execution queries
4. **Caching**: Redis for frequently accessed executions

### Monitoring & Analytics

1. **Execution Metrics**: Track performance statistics
2. **Error Analytics**: Identify common failure patterns
3. **User Behavior**: Monitor feature usage
4. **Performance Monitoring**: Track animation performance

### Future Extensibility

1. **Plugin Architecture**: Allow custom node types
2. **Theme System**: Support custom color schemes
3. **Localization**: Multi-language support
4. **Mobile Optimization**: Responsive design improvements

---

## Implementation Roadmap

### Phase 1: Core Runtime State (Week 1-2)
- [ ] Implement RuntimeStateService
- [ ] Create execution state models
- [ ] Update Prisma schema
- [ ] Basic node state visualization

### Phase 2: Visual Enhancements (Week 3-4)
- [ ] CSS animation system
- [ ] Edge flow animations
- [ ] Status badges and indicators
- [ ] Enhanced execution logs

### Phase 3: Advanced Features (Week 5-6)
- [ ] Execution playback
- [ ] Workflow replay
- [ ] Real-time synchronization
- [ ] Performance optimization

### Phase 4: Enterprise Features (Week 7-8)
- [ ] State persistence
- [ ] Error recovery
- [ ] Analytics integration
- [ ] Documentation and testing

This architecture transforms FlowForge into a world-class workflow automation platform with professional-grade runtime visualization capabilities.