import { Injectable } from '@angular/core';
import { WorkflowNodeType } from '../models/workflow.model';
import { NODE_REGISTRY, NODE_GROUPS, NodeRegistryEntry } from './node-registry';

@Injectable({
  providedIn: 'root'
})
export class NodeRegistryService {
  readonly NODE_GROUPS = NODE_GROUPS;
  private dynamicRegistry = new Map<string, NodeRegistryEntry>();

  registerNode(entry: NodeRegistryEntry) {
    this.dynamicRegistry.set(entry.subType, entry);
  }

  getEntry(subType: string): NodeRegistryEntry {
    return this.dynamicRegistry.get(subType) || NODE_REGISTRY[subType];
  }

  getEntriesByType(type: WorkflowNodeType): NodeRegistryEntry[] {
    const staticEntries = Object.values(NODE_REGISTRY).filter(e => e.type === type);
    const dynamicEntries = Array.from(this.dynamicRegistry.values()).filter(e => e.type === type);
    return [...staticEntries, ...dynamicEntries];
  }
}
