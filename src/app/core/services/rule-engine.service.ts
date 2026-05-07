import { Injectable, signal } from '@angular/core';

export interface BusinessRule {
  id: string;
  targetField: string;
  triggerFields: string[];
  formula?: (data: any) => any;
  validation?: (data: any) => string | null; // Returns error message or null
}

@Injectable({
  providedIn: 'root'
})
export class RuleEngineService {
  private rules = signal<BusinessRule[]>([
    {
      id: 'calc-total-days',
      targetField: 'totalDays',
      triggerFields: ['startDate', 'endDate'],
      formula: (data) => {
        if (!data.startDate || !data.endDate) return 0;
        const start = new Date(data.startDate);
        const end = new Date(data.endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
      }
    },
    {
      id: 'validate-sick-leave',
      targetField: 'medicalCertificate',
      triggerFields: ['leaveType', 'totalDays'],
      validation: (data) => {
        if (data.leaveType === 'Sick Leave' && data.totalDays > 3 && !data.medicalCertificate) {
          return 'Medical certificate is required for sick leave greater than 3 days.';
        }
        return null;
      }
    }
  ]);

  evaluateRules(data: any): any {
    const updatedData = { ...data };
    const errors: Record<string, string> = {};

    this.rules().forEach(rule => {
      // Apply formula
      if (rule.formula) {
        updatedData[rule.targetField] = rule.formula(updatedData);
      }

      // Apply validation
      if (rule.validation) {
        const error = rule.validation(updatedData);
        if (error) errors[rule.targetField] = error;
      }
    });

    return { data: updatedData, errors };
  }
}
