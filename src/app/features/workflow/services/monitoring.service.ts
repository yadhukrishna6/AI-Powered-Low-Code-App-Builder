import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Subject, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface ExecutionNodeUpdate {
  nodeId: string;
  status: string;
  output?: any;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class MonitoringService {
  private socket: Socket;
  private nodeUpdates$ = new Subject<ExecutionNodeUpdate>();
  private statusUpdates$ = new Subject<{ status: string; executionId: string }>();

  constructor() {
    this.socket = io(`${environment.apiUrl}/monitoring`, {
      transports: ['websocket']
    });

    this.socket.on('connect', () => {
      console.log('Connected to monitoring gateway');
    });
  }

  listenToExecution(executionId: string): void {
    // Clean up previous listeners if any
    this.socket.off(`execution:${executionId}:node`);
    this.socket.off(`execution:${executionId}:status`);

    this.socket.on(`execution:${executionId}:node`, (update: ExecutionNodeUpdate) => {
      this.nodeUpdates$.next(update);
    });

    this.socket.on(`execution:${executionId}:status`, (update: { status: string }) => {
      this.statusUpdates$.next({ ...update, executionId });
    });
  }

  getNodeUpdates(): Observable<ExecutionNodeUpdate> {
    return this.nodeUpdates$.asObservable();
  }

  getStatusUpdates(): Observable<{ status: string; executionId: string }> {
    return this.statusUpdates$.asObservable();
  }

  disconnect(): void {
    this.socket.disconnect();
  }
}
