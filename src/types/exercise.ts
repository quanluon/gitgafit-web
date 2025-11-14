import { MuscleGroup } from './enums';
import { Translatable } from './common';

export interface ExerciseCatalogItem {
  _id: string;
  name: Translatable;
  videoUrl: string;
  muscleGroups: MuscleGroup[];
  thumbnailUrl?: string;
  metadata?: {
    description?: string;
    duration?: number;
    title?: string;
  };
}

export interface ExerciseSearchParams {
  search?: string;
  muscleGroup?: MuscleGroup;
  limit?: number;
}


