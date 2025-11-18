import { Translatable } from './common';

// Re-export Translatable for convenience
export type { Translatable };

export enum InbodyStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}
export interface SegmentMeasurement {
  label?: string;
  value?: number;
  percentage?: number;
}
export interface InbodyMetricsSummary {
  weight?: number;
  skeletalMuscleMass?: number;
  bodyFatMass?: number;
  bodyFatPercent?: number;
  bmi?: number;
  visceralFatLevel?: number;
  basalMetabolicRate?: number;
  totalBodyWater?: number;
  protein?: number;
  minerals?: number;
  segmentalLean?: SegmentMeasurement[];
  segmentalFat?: SegmentMeasurement[];
}
/**
 * InBody analysis structure per language
 */
export interface InbodyAnalysisPerLanguage {
  body_composition_summary: string;
  recommendations: string[];
  training_nutrition_advice: string;
}
/**
 * Bilingual InBody analysis with structured fields
 */
export interface InbodyAnalysis {
  en: InbodyAnalysisPerLanguage;
  vi: InbodyAnalysisPerLanguage;
}
export interface InbodyResult {
  _id: string;
  userId: string;
  status: InbodyStatus;
  s3Url: string;
  sourceFilePath?: string;
  originalFilename: string;
  ocrText?: string;
  metrics?: InbodyMetricsSummary;
  aiAnalysis?: Translatable | InbodyAnalysis;
  takenAt?: string;
  createdAt: string;
  updatedAt: string;
  errorMessage?: string;
}
