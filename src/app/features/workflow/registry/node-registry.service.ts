import { Injectable } from '@angular/core';
import { WorkflowNodeType } from '../models/workflow.model';
import { NODE_REGISTRY, NODE_GROUPS, NodeRegistryEntry } from './node-registry';

@Injectable({
  providedIn: 'root'
})
export class NodeRegistryService {
  readonly NODE_GROUPS = NODE_GROUPS;
  readonly REGISTRY = NODE_REGISTRY;

  getEntry(subType: string): NodeRegistryEntry {
    return this.REGISTRY[subType];
  }

  getEntriesByType(type: WorkflowNodeType): NodeRegistryEntry[] {
    return Object.values(this.REGISTRY).filter(e => e.type === type);
  }
}
