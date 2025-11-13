import { apiClient } from './api';
import { GenerationType } from '@store/generationStore';

export interface ActiveJob {
  jobId: string;
  type: string; // 'workout-generation' or 'meal-generation'
  status: string;
  progress: number;
  message?: string;
}

export interface ActiveJobResponse {
  jobId: string;
  type: GenerationType;
  status: string;
  progress: number;
  message?: string;
}

/**
 * Queue Service
 * Handles job-related API calls
 */
class QueueService {
  /**
   * Get all active jobs for the current user
   */
  async getActiveJobs(): Promise<ActiveJobResponse[]> {
    const response = await apiClient.get<{ data: ActiveJob[] }>('/workout/plan/generate/jobs');
    
    // Map backend queue names to frontend generation types
    return response.data.data.map((job) => ({
      jobId: job.jobId,
      type: job.type === 'workout-generation' ? GenerationType.WORKOUT : GenerationType.MEAL,
      status: job.status,
      progress: job.progress,
      message: job.message,
    }));
  }
}

export const queueService = new QueueService();

