import { apiClient } from './api';
import { ApiResponse } from '@/types/common';
import { InbodyResult, InbodyMetricsSummary } from '@/types/inbody';

interface PresignedUrlResponse {
  uploadUrl: string;
  s3Url: string;
}
interface ProcessInbodyPayload {
  s3Url: string;
  originalFilename: string;
  ocrText: string;
  metrics?: InbodyMetricsSummary;
  takenAt?: string;
}
class InbodyService {
  async getPresignedUrl(filename: string): Promise<PresignedUrlResponse> {
    const response = await apiClient.post<ApiResponse<PresignedUrlResponse>>(
      '/inbody/presigned-url',
      { filename },
    );
    return response.data.data!;
  }
  async uploadToS3(uploadUrl: string, file: File): Promise<void> {
    await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type || 'image/*',
      },
    });
  }
  async scanImage(
    url: string,
    filename: string,
    takenAt?: string,
  ): Promise<{ metrics: InbodyMetricsSummary; ocrText?: string }> {
    const response = await apiClient.post<ApiResponse<{ metrics: InbodyMetricsSummary; ocrText?: string }>>(
      '/inbody/scan',
      {
        s3Url:url,
        originalFilename: filename,
        takenAt,
      },
    );
    return response.data.data!;
  }
  async processInbody(payload: ProcessInbodyPayload): Promise<InbodyResult> {
    const response = await apiClient.post<ApiResponse<InbodyResult>>('/inbody/process', payload);
    return response.data.data!;
  }
  async analyzeInBackground(payload: {
    s3Url: string;
    originalFilename: string;
    takenAt?: string;
  }): Promise<{ jobId: string }> {
    const response = await apiClient.post<ApiResponse<{ jobId: string }>>('/inbody/analyze', payload);
    return response.data.data!;
  }
  async list(limit = 20, offset = 0): Promise<InbodyResult[]> {
    const response = await apiClient.get<ApiResponse<InbodyResult[]>>(
      `/inbody?limit=${limit}&offset=${offset}`,
    );
    return response.data.data || [];
  }
  async getDetail(id: string): Promise<InbodyResult> {
    const response = await apiClient.get<ApiResponse<InbodyResult>>(`/inbody/${id}`);
    return response.data.data!;
  }
  async analyzeBodyPhoto(
    s3Url: string,
    originalFilename: string,
    takenAt?: string,
  ): Promise<InbodyResult> {
    const response = await apiClient.post<ApiResponse<InbodyResult>>('/inbody/body-photo', {
      s3Url,
      originalFilename,
      takenAt,
    });
    return response.data.data!;
  }
}
export const inbodyService = new InbodyService();

