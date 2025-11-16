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

export interface Translatable {
  en: string;
  vi: string;
}

export interface InbodyResult {
  _id: string;
  userId: string;
  status: InbodyStatus;
  url: string;
  sourceFilePath?: string;
  originalFilename: string;
  ocrText?: string;
  metrics?: InbodyMetricsSummary;
  aiAnalysis?: Translatable;
  takenAt?: string;
  createdAt: string;
  updatedAt: string;
  errorMessage?: string;
}

