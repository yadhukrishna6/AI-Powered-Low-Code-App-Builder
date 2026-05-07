import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface BusinessRule {
  id: string;
  targetField: string;
  triggerFields: string[];
  formula?: string; // Stored as string in DB
  validation?: string; // Stored as string in DB
}

@Injectable({
  providedIn: 'root'
})
export class RuleEngineService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/v1/rules';

  // No more hardcoded rules!
  rules = signal<BusinessRule[]>([]);

  async loadRules() {
    try {
      const rules = await firstValueFrom(this.http.get<BusinessRule[]>(this.apiUrl));
      this.rules.set(rules);
    } catch (error) {
      console.error('Failed to load rules from API:', error);
    }
  }

  evaluateRules(data: any): any {
    const updatedData = { ...data };
    const errors: Record<string, string> = {};

    this.rules().forEach(rule => {
      // Evaluate Formula if exists
      if (rule.formula) {
        try {
          // Safe evaluation of the formula string
          // Expects formula like: "return (new Date(data.endDate) - new Date(data.startDate)) / (1000*60*60*24)"
          const fn = new Function('data', rule.formula);
          updatedData[rule.targetField] = fn(updatedData);
        } catch (e) {
          console.warn('Error evaluating rule formula:', rule.id, e);
        }
      }

      // Evaluate Validation if exists
      if (rule.validation) {
        try {
          // Expects validation like: "if (data.leaveType === 'Sick Leave' && data.totalDays > 3) return 'Medical certificate required'"
          const fn = new Function('data', rule.validation);
          const error = fn(updatedData);
          if (error) errors[rule.targetField] = error;
        } catch (e) {
          console.warn('Error evaluating rule validation:', rule.id, e);
        }
      }
    });

    return { data: updatedData, errors };
  }

  // Admin methods to save rules to DB
  async saveRule(rule: Partial<BusinessRule>) {
    return firstValueFrom(this.http.post(this.apiUrl, rule));
  }
}
