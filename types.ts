export enum CEFRLevel {
  A1_1 = 'A1.1',
  A1_2 = 'A1.2',
  A2_1 = 'A2.1',
  A2_2 = 'A2.2',
  B1_1 = 'B1.1',
  B1_2 = 'B1.2',
  B2_1 = 'B2.1',
  B2_2 = 'B2.2',
  C1 = 'C1',
  C2 = 'C2',
}

export const CEFR_DESCRIPTIONS: Record<CEFRLevel, string> = {
  [CEFRLevel.A1_1]: 'A1.1 - Absolute Beginner',
  [CEFRLevel.A1_2]: 'A1.2 - Beginner',
  [CEFRLevel.A2_1]: 'A2.1 - Elementary',
  [CEFRLevel.A2_2]: 'A2.2 - Upper Elementary',
  [CEFRLevel.B1_1]: 'B1.1 - Intermediate',
  [CEFRLevel.B1_2]: 'B1.2 - Intermediate',
  [CEFRLevel.B2_1]: 'B2.1 - Upper Intermediate',
  [CEFRLevel.B2_2]: 'B2.2 - Upper Intermediate',
  [CEFRLevel.C1]: 'C1 - Advanced',
  [CEFRLevel.C2]: 'C2 - Proficiency',
};

export interface Language {
  code: string;
  name: string;
}

export interface TranslationState {
  sourceText: string;
  targetText: string;
  isTranslating: boolean;
  error: string | null;
}