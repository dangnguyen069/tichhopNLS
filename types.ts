export interface NLSStandard {
  domain: string; // NLS
  component: string; // NLTP
  indicator: string; // CHỈ BÁO
  code: string; // MAHOA
  level: 'TC1' | 'TC2'; // Lớp 6-7 or 8-9
}

export interface IntegratedItem {
  originalContent: string;
  suggestion: string;
  nlsCode: string;
  nlsIndicator: string;
  reasoning: string;
}

export enum GradeLevel {
  G6_7 = 'TC1',
  G8_9 = 'TC2'
}

export interface AppState {
  subject: string;
  gradeLevel: GradeLevel;
  content: string;
  isLoading: boolean;
  result: IntegratedItem[] | null;
  error: string | null;
}