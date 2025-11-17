import { apiClient, retryRequest } from './axiosConfig';
import { APIResponse } from '../../types';

/**
 * Base API Service with common HTTP methods
 * Provides a wrapper around axios with error handling and retry logic
 */
export class BaseApiService {
  /**
   * Make a GET request
   */
  static async get<T>(url: string, params?: Record<string, any>): Promise<APIResponse<T>> {
    try {
      const response = await apiClient.get<T>(url, { params });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Make a POST request
   */
  static async post<T>(url: string, data?: any): Promise<APIResponse<T>> {
    try {
      const response = await apiClient.post<T>(url, data);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Make a PUT request
   */
  static async put<T>(url: string, data?: any): Promise<APIResponse<T>> {
    try {
      const response = await apiClient.put<T>(url, data);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Make a DELETE request
   */
  static async delete<T>(url: string): Promise<APIResponse<T>> {
    try {
      const response = await apiClient.delete<T>(url);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Make a POST request with retry logic
   */
  static async postWithRetry<T>(
    url: string,
    data?: any,
    maxRetries: number = 3
  ): Promise<APIResponse<T>> {
    try {
      const response = await retryRequest(
        () => apiClient.post<T>(url, data),
        maxRetries
      );
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Handle errors and return standardized error response
   */
  private static handleError<T>(error: any): APIResponse<T> {
    let errorMessage = 'An unknown error occurred';

    if (error.response) {
      // Server responded with error status
      errorMessage = error.response.data?.message || error.response.statusText;
    } else if (error.request) {
      // Request made but no response
      errorMessage = 'Network error - no response from server';
    } else {
      // Other errors
      errorMessage = error.message;
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
}

export default BaseApiService;
