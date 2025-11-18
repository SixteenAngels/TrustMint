import axios from 'axios';

export class BaseService {
  private client: any;

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      timeout: 10000, // 10 seconds timeout
    });
  }

  protected async get<T>(url: string, config?: any): Promise<T> {
    return this.request<T>('GET', url, undefined, config);
  }

  protected async post<T>(url: string, data?: any, config?: any): Promise<T> {
    return this.request<T>('POST', url, data, config);
  }

  protected async put<T>(url: string, data?: any, config?: any): Promise<T> {
    return this.request<T>('PUT', url, data, config);
  }

  protected async delete<T>(url: string, config?: any): Promise<T> {
    return this.request<T>('DELETE', url, undefined, config);
  }

  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    url: string,
    data?: any,
    config?: any
  ): Promise<T> {
    try {
      const response: any = await this.client.request({
        method,
        url,
        data,
        ...config,
      });
      return response.data;
    } catch (error: any) {
      this.handleError(error);
      throw error;
    }
  }

  private handleError(error: any): void {
    // Centralized error handling logic
    if (error.response) {
      console.error('API Error:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error setting up request:', error.message);
    }
  }
}